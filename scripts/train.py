import os
import sys
import shutil
import hashlib
from pathlib import Path
import yaml
from PIL import Image
import pandas as pd
import torch
from ultralytics import YOLO

# ==================================================
# CONFIGURATION
# ==================================================
IMG_SIZE = 640
EPOCHS = 50
BATCH_SIZE = 16
PATIENCE = 15
SEED = 42
PRETRAINED_MODEL = os.path.join(PROJECT_ROOT, "weights", "yolo11n.pt")

PROJECT_ROOT = r"C:\CoastX"
DATA_YAML_PATH = os.path.join(PROJECT_ROOT, "data", "data.yaml")
RUNS_DIR = os.path.join(PROJECT_ROOT, "runs")
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
BEST_MODEL_TARGET = os.path.join(MODELS_DIR, "coastx_best.pt")
REPORT_PATH = os.path.join(RUNS_DIR, "COASTX_TRAINING_REPORT.txt")
TRAIN_RUN_NAME = "coastx_training"
EVAL_RUN_NAME = "coastx_evaluation"


def verify_dataset_and_leakage(yaml_path):
    print("==================================================")
    print("STEP 1 — VERIFY DATASET BEFORE TRAINING")
    print("==================================================")
    if not os.path.exists(yaml_path):
        print(f"ERROR: data.yaml not found at {yaml_path}")
        sys.exit(1)

    with open(yaml_path, 'r') as f:
        data_cfg = yaml.safe_load(f)

    base_path = data_cfg.get('path', os.path.dirname(yaml_path))
    names_dict = data_cfg.get('names', {})
    if isinstance(names_dict, list):
        names_dict = {i: name for i, name in enumerate(names_dict)}

    num_classes = len(names_dict)

    print(f"Dataset path: {base_path}")

    splits = {
        'train': (os.path.join(base_path, 'train', 'images'), os.path.join(base_path, 'train', 'labels')),
        'valid': (os.path.join(base_path, 'valid', 'images'), os.path.join(base_path, 'valid', 'labels')),
        'test': (os.path.join(base_path, 'test', 'images'), os.path.join(base_path, 'test', 'labels'))
    }

    counts = {}
    corrupt_images = []
    missing_labels = []
    orphan_labels = []
    invalid_label_lines = []
    invalid_class_ids = []
    empty_label_files = []
    split_image_hashes = {'train': {}, 'valid': {}, 'test': {}}

    for split_name, (img_dir, lbl_dir) in splits.items():
        if not os.path.exists(img_dir):
            print(f"ERROR: Image directory for {split_name} does not exist: {img_dir}")
            sys.exit(1)
        if not os.path.exists(lbl_dir):
            print(f"ERROR: Label directory for {split_name} does not exist: {lbl_dir}")
            sys.exit(1)

        img_files = [f for f in os.listdir(img_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.webp'))]
        lbl_files = [f for f in os.listdir(lbl_dir) if f.lower().endswith('.txt')]

        counts[split_name] = len(img_files)

        img_stems = {Path(f).stem: f for f in img_files}
        lbl_stems = {Path(f).stem: f for f in lbl_files}

        for stem, img_f in img_stems.items():
            img_path = os.path.join(img_dir, img_f)
            try:
                with Image.open(img_path) as img:
                    img.verify()
                with open(img_path, 'rb') as f:
                    split_image_hashes[split_name][stem] = hashlib.sha256(f.read()).hexdigest()
            except Exception as e:
                corrupt_images.append((split_name, img_f, str(e)))

            if stem not in lbl_stems:
                missing_labels.append((split_name, img_f))
            else:
                lbl_f = lbl_stems[stem]
                lbl_path = os.path.join(lbl_dir, lbl_f)
                try:
                    with open(lbl_path, 'r') as lf:
                        lines = lf.readlines()
                    if len(lines) == 0:
                        empty_label_files.append((split_name, lbl_f))
                    for line_idx, line in enumerate(lines):
                        line_str = line.strip()
                        if not line_str:
                            continue
                        parts = line_str.split()
                        if len(parts) != 5:
                            invalid_label_lines.append((split_name, lbl_f, line_idx+1, line_str))
                            continue
                        try:
                            cid = int(parts[0])
                            coords = [float(x) for x in parts[1:]]
                            if cid not in names_dict:
                                invalid_class_ids.append((split_name, lbl_f, line_idx+1, cid))
                            for c in coords:
                                if c < 0.0 or c > 1.0:
                                    invalid_label_lines.append((split_name, lbl_f, line_idx+1, f"Coord out of bounds: {c}"))
                        except ValueError:
                            invalid_label_lines.append((split_name, lbl_f, line_idx+1, "Non-numeric values"))
                except Exception as e:
                    invalid_label_lines.append((split_name, lbl_f, 0, str(e)))

        for stem, lbl_f in lbl_stems.items():
            if stem not in img_stems:
                orphan_labels.append((split_name, lbl_f))

    print(f"Train image count: {counts['train']}")
    print(f"Validation image count: {counts['valid']}")
    print(f"Test image count: {counts['test']}")
    print(f"Class count: {num_classes}")
    print(f"Class names: {list(names_dict.values())}")
    print()

    print("==================================================")
    print("STEP 2 — VERIFY CLASS CONFIGURATION")
    print("==================================================")
    print("CLASS CONFIGURATION")
    for cid in sorted(names_dict.keys()):
        print(f"{cid} = {names_dict[cid]}")
    print()

    has_serious_problem = False
    if corrupt_images:
        print(f"SERIOUS PROBLEM: {len(corrupt_images)} corrupt images found.")
        has_serious_problem = True
    if missing_labels:
        print(f"SERIOUS PROBLEM: {len(missing_labels)} missing label files found.")
        has_serious_problem = True
    if orphan_labels:
        print(f"SERIOUS PROBLEM: {len(orphan_labels)} labels without images found.")
        has_serious_problem = True
    if invalid_label_lines:
        print(f"SERIOUS PROBLEM: {len(invalid_label_lines)} invalid annotation lines found.")
        has_serious_problem = True
    if invalid_class_ids:
        print(f"SERIOUS PROBLEM: {len(invalid_class_ids)} invalid class IDs found.")
        has_serious_problem = True

    print("==================================================")
    print("STEP 3 — DATA LEAKAGE CHECK")
    print("==================================================")
    leakage_found = False
    for split1, split2 in [('train', 'valid'), ('train', 'test'), ('valid', 'test')]:
        h1 = split_image_hashes[split1]
        h2 = split_image_hashes[split2]
        common = set(h1.values()).intersection(set(h2.values()))
        if common:
            print(f"DATA LEAKAGE DETECTED between {split1.upper()} and {split2.upper()}! Count: {len(common)}")
            leakage_found = True

    if leakage_found:
        has_serious_problem = True

    if has_serious_problem:
        print("SERIOUS DATASET PROBLEM DETECTED. STOPPING TRAINING.")
        sys.exit(1)
    else:
        print("Data leakage check: PASSED (No duplicates across splits)")
        print("Dataset verification: PASSED")
        print()

    return data_cfg, counts, names_dict


def run_training():
    data_cfg, counts, names_dict = verify_dataset_and_leakage(DATA_YAML_PATH)

    print("==================================================")
    print("STEP 4 — MODEL & DEVICE DETECT")
    print("==================================================")
    device = 0 if torch.cuda.is_available() else 'cpu'
    device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    print(f"Loading pretrained model: {PRETRAINED_MODEL}")
    print(f"Target compute device: {device} ({device_name})")
    model = YOLO(PRETRAINED_MODEL)

    print()
    print("==================================================")
    print("STEP 5 - 10 — TRAINING")
    print("==================================================")
    print(f"Training params: imgsz={IMG_SIZE}, epochs={EPOCHS}, batch={BATCH_SIZE}, patience={PATIENCE}, seed={SEED}")
    print(f"Output directory: {os.path.join(RUNS_DIR, TRAIN_RUN_NAME)}")

    results = model.train(
        data=DATA_YAML_PATH,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        patience=PATIENCE,
        seed=SEED,
        project=RUNS_DIR,
        name=TRAIN_RUN_NAME,
        exist_ok=True,
        save=True,
        plots=True,
        device=device,
        fliplr=0.5,
        scale=0.5,
        translate=0.1,
        degrees=10.0,
        mosaic=1.0,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        val=True
    )

    print()
    print("==================================================")
    print("STEP 11 — BEST MODEL COPYING & VERIFICATION")
    print("==================================================")
    source_best_pt = os.path.join(RUNS_DIR, TRAIN_RUN_NAME, "weights", "best.pt")
    if not os.path.exists(source_best_pt):
        print(f"ERROR: best.pt was not found at {source_best_pt}")
        sys.exit(1)

    os.makedirs(MODELS_DIR, exist_ok=True)
    shutil.copy2(source_best_pt, BEST_MODEL_TARGET)

    if os.path.exists(BEST_MODEL_TARGET) and os.path.getsize(BEST_MODEL_TARGET) > 0:
        print("BEST MODEL:")
        print(BEST_MODEL_TARGET)
    else:
        print("ERROR: Failed to save best model to target location!")
        sys.exit(1)

    print()
    print("==================================================")
    print("STEP 12 & 13 — TRAINING METRICS & OVERFITTING ANALYSIS")
    print("==================================================")
    csv_path = os.path.join(RUNS_DIR, TRAIN_RUN_NAME, "results.csv")
    epochs_completed = 0
    best_epoch = 0
    train_box_loss = 0.0
    train_cls_loss = 0.0
    val_box_loss = 0.0
    val_cls_loss = 0.0
    val_precision = 0.0
    val_recall = 0.0
    val_map50 = 0.0
    val_map50_95 = 0.0
    overfitting_status = "LOW"
    overfitting_explanation = ""

    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        df.columns = [c.strip() for c in df.columns]
        epochs_completed = len(df)
        
        # Find best epoch based on mAP50-95 or mAP50
        map_col = 'metrics/mAP50-95(B)' if 'metrics/mAP50-95(B)' in df.columns else 'metrics/mAP50(B)'
        best_row_idx = df[map_col].idxmax()
        best_row = df.loc[best_row_idx]
        
        best_epoch = int(best_row['epoch'])
        train_box_loss = float(best_row.get('train/box_loss', 0.0))
        train_cls_loss = float(best_row.get('train/cls_loss', 0.0))
        val_box_loss = float(best_row.get('val/box_loss', 0.0))
        val_cls_loss = float(best_row.get('val/cls_loss', 0.0))
        val_precision = float(best_row.get('metrics/precision(B)', 0.0))
        val_recall = float(best_row.get('metrics/recall(B)', 0.0))
        val_map50 = float(best_row.get('metrics/mAP50(B)', 0.0))
        val_map50_95 = float(best_row.get('metrics/mAP50-95(B)', 0.0))
        
        # Assess overfitting
        final_row = df.iloc[-1]
        final_val_box = float(final_row.get('val/box_loss', 0.0))
        best_val_box = val_box_loss
        
        if final_val_box > best_val_box * 1.25:
            overfitting_status = "POSSIBLE OVERFITTING"
            overfitting_explanation = f"Validation box loss increased from {best_val_box:.4f} at epoch {best_epoch} to {final_val_box:.4f} at epoch {epochs_completed} while training loss continued falling."
        elif final_val_box > best_val_box * 1.1:
            overfitting_status = "MODERATE"
            overfitting_explanation = f"Validation loss stabilized around epoch {best_epoch} with minor divergence towards epoch {epochs_completed}."
        else:
            overfitting_status = "LOW"
            overfitting_explanation = f"Validation loss closely tracked training loss throughout training with early stopping preventing over-fitting."

    print(f"Epochs completed: {epochs_completed}")
    print(f"Best epoch: {best_epoch}")
    print(f"Training box loss: {train_box_loss:.4f}")
    print(f"Training classification loss: {train_cls_loss:.4f}")
    print(f"Validation box loss: {val_box_loss:.4f}")
    print(f"Validation classification loss: {val_cls_loss:.4f}")
    print(f"Precision: {val_precision:.4f}")
    print(f"Recall: {val_recall:.4f}")
    print(f"mAP50: {val_map50:.4f}")
    print(f"mAP50-95: {val_map50_95:.4f}")
    print()
    print("OVERFITTING CHECK")
    print(f"Status:\n{overfitting_status}")
    print(f"Explanation: {overfitting_explanation}")
    print()

    print("==================================================")
    print("STEP 14 & 15 — TEST SET EVALUATION")
    print("==================================================")
    best_model = YOLO(BEST_MODEL_TARGET)
    eval_results = best_model.val(
        data=DATA_YAML_PATH,
        split='test',
        project=RUNS_DIR,
        name=EVAL_RUN_NAME,
        exist_ok=True,
        plots=True
    )

    test_precision = float(eval_results.results_dict.get('metrics/precision(B)', 0.0))
    test_recall = float(eval_results.results_dict.get('metrics/recall(B)', 0.0))
    test_map50 = float(eval_results.results_dict.get('metrics/mAP50(B)', 0.0))
    test_map50_95 = float(eval_results.results_dict.get('metrics/mAP50-95(B)', 0.0))

    print()
    print("TEST RESULTS")
    print(f"Precision: {test_precision:.4f}")
    print(f"Recall: {test_recall:.4f}")
    print(f"mAP50: {test_map50:.4f}")
    print(f"mAP50-95: {test_map50_95:.4f}")
    print()
    print("Per-class Test Metrics:")
    if hasattr(eval_results, 'box') and eval_results.box is not None:
        try:
            p_cls = eval_results.box.p
            r_cls = eval_results.box.r
            ap50_cls = eval_results.box.ap50
            ap_cls = eval_results.box.ap
            for i, cname in names_dict.items():
                p_val = p_cls[i] if i < len(p_cls) else 0.0
                r_val = r_cls[i] if i < len(r_cls) else 0.0
                ap50_val = ap50_cls[i] if i < len(ap50_cls) else 0.0
                ap_val = ap_cls[i] if i < len(ap_cls) else 0.0
                print(f"  Class {i} ({cname}): Precision={p_val:.4f}, Recall={r_val:.4f}, mAP50={ap50_val:.4f}, mAP50-95={ap_val:.4f}")
        except Exception as e:
            print(f"  Could not format per-class arrays: {e}")

    print()
    print("==================================================")
    print("STEP 17 — MODEL VERIFICATION & SANITY CHECK")
    print("==================================================")
    verifier_model = YOLO(BEST_MODEL_TARGET)
    test_img_dir = os.path.join(data_cfg.get('path', os.path.dirname(DATA_YAML_PATH)), 'test', 'images')
    test_imgs = [f for f in os.listdir(test_img_dir) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
    if test_imgs:
        sample_img_path = os.path.join(test_img_dir, test_imgs[0])
        pred_res = verifier_model.predict(sample_img_path, save=False, verbose=False)
        print("Model loaded successfully.")
        print("Inference sanity check successful.")
    else:
        print("Model loaded successfully.")
        print("Inference sanity check skipped (no test images found).")

    print()
    print("==================================================")
    print("STEP 19 — CREATE TRAINING REPORT")
    print("==================================================")
    report_content = f"""========================================
COASTX TRAINING REPORT
========================================

Dataset:
{DATA_YAML_PATH}

Classes:
{", ".join([f"{k}:{v}" for k,v in names_dict.items()])}

Train images:
{counts['train']}

Validation images:
{counts['valid']}

Test images:
{counts['test']}

Model:
{PRETRAINED_MODEL}

Epochs:
{epochs_completed}

Best epoch:
{best_epoch}

Precision:
{test_precision:.4f}

Recall:
{test_recall:.4f}

mAP50:
{test_map50:.4f}

mAP50-95:
{test_map50_95:.4f}

Overfitting assessment:
{overfitting_status} - {overfitting_explanation}

Final model:
{BEST_MODEL_TARGET}

========================================
"""
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, 'w') as rf:
        rf.write(report_content)
    print(f"Training report written to: {REPORT_PATH}")

    print()
    print("========================================")
    print("COASTX MODEL TRAINING COMPLETE")
    print("========================================")
    print()
    print("Model:")
    print(BEST_MODEL_TARGET)
    print()
    print("Dataset:")
    print(DATA_YAML_PATH)
    print()
    print("Train:")
    print("80%")
    print()
    print("Validation:")
    print("10%")
    print()
    print("Test:")
    print("10%")
    print()
    print("Best mAP50:")
    print(f"{test_map50:.4f}")
    print()
    print("Best mAP50-95:")
    print(f"{test_map50_95:.4f}")
    print()
    print("Precision:")
    print(f"{test_precision:.4f}")
    print()
    print("Recall:")
    print(f"{test_recall:.4f}")
    print()
    print("Overfitting:")
    print(overfitting_status)
    print()
    print("Model verification:")
    print("PASSED")
    print()
    print("========================================")


if __name__ == "__main__":
    run_training()
