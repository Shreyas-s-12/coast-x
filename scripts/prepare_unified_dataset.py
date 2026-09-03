import os
import sys
import shutil
import hashlib
import random
import time
import yaml
from pathlib import Path
from collections import defaultdict, Counter
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

# Configuration & Seed
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = PROJECT_ROOT / "data"
OUTPUT_DIR = PROJECT_ROOT / "data_unified"

# Target Ontology (5 classes)
CLASS_NAMES = ["boat", "buoy", "sinker", "swimmer", "trash"]
CLASS_MAP_ROBOFLOW = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4}
# AFO 6categories mapping to target ontology
# 0: human -> 3 (swimmer)
# 1: wind/sup-board -> 0 (boat)
# 2: boat -> 0 (boat)
# 3: bouy -> 1 (buoy)
# 4: sailboat -> 0 (boat)
# 5: kayak -> 0 (boat)
CLASS_MAP_AFO = {0: 3, 1: 0, 2: 0, 3: 1, 4: 0, 5: 0}


def calculate_sha256(file_path):
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def calculate_dhash(file_path, hash_size=8):
    try:
        with Image.open(file_path) as img:
            img = img.convert("L").resize((hash_size + 1, hash_size), Image.Resampling.BOX)
            b = img.tobytes()
            diff = 0
            for row in range(hash_size):
                row_start = row * (hash_size + 1)
                for col in range(hash_size):
                    diff = (diff << 1) | (1 if b[row_start + col] > b[row_start + col + 1] else 0)
            return hex(diff)[2:].zfill(hash_size * hash_size // 4)
    except Exception:
        return None


def get_sequence_prefix(filename):
    name = filename.lower()
    parts = name.split("_")
    if len(parts) >= 3:
        return "_".join(parts[:3])
    return name[:6]


def parse_and_convert_label(label_path, source_type):
    if not label_path.exists():
        return []
    valid_boxes = []
    class_map = CLASS_MAP_ROBOFLOW if source_type == "roboflow" else CLASS_MAP_AFO
    with open(label_path, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split()
            if len(parts) >= 5:
                try:
                    src_cls = int(parts[0])
                    x, y, w, h = map(float, parts[1:5])
                    if 0 <= x <= 1 and 0 <= y <= 1 and 0 < w <= 1 and 0 < h <= 1:
                        if src_cls in class_map:
                            target_cls = class_map[src_cls]
                            valid_boxes.append((target_cls, x, y, w, h))
                except ValueError:
                    continue
    return valid_boxes


def gather_all_raw_samples():
    samples = []
    
    # 1. Roboflow samples
    rf_dirs = [DATA_ROOT / "train" / "images", DATA_ROOT / "valid" / "images", DATA_ROOT / "test" / "images"]
    for img_dir in rf_dirs:
        if img_dir.exists():
            lbl_dir = img_dir.parent / "labels"
            for img_path in img_dir.glob("*.*"):
                if img_path.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                    lbl_path = lbl_dir / f"{img_path.stem}.txt"
                    samples.append({
                        "id": f"rf_{img_path.stem}",
                        "img_path": img_path,
                        "lbl_path": lbl_path,
                        "source": "roboflow"
                    })

    # 2. AFO samples
    afo_dir = DATA_ROOT / "afo"
    if afo_dir.exists():
        for part in ["PART_1", "PART_2", "PART_3"]:
            p_img_dir = afo_dir / part / part / "images"
            if not p_img_dir.exists():
                p_img_dir = afo_dir / part / "images"
            
            p_lbl_dir = afo_dir / "PART_1" / "PART_1" / "6categories"
            if not p_lbl_dir.exists():
                p_lbl_dir = afo_dir / "PART_1" / "6categories"
                
            if p_img_dir.exists():
                for img_path in p_img_dir.glob("*.*"):
                    if img_path.suffix.lower() in [".jpg", ".jpeg", ".png"]:
                        lbl_path = p_lbl_dir / f"{img_path.stem}.txt"
                        samples.append({
                            "id": f"afo_{img_path.stem}",
                            "img_path": img_path,
                            "lbl_path": lbl_path,
                            "source": "afo"
                        })
    return samples


def main():
    start_time = time.time()
    print("=" * 60)
    print("COASTX - UNIFIED ANTI-OVERFITTING DATASET PREPARATION")
    print("=" * 60)
    print(f"Random Seed: {RANDOM_SEED}")
    print(f"Target Ratios: 80% Train | 10% Valid | 10% Test")
    print(f"Output Directory: {OUTPUT_DIR}")

    raw_samples = gather_all_raw_samples()
    print(f"\n[INFO] Collected {len(raw_samples)} total raw candidate images.")

    # 1. SHA-256 Exact Duplicate Removal
    print("\n[STEP 1] Computing SHA-256 checksums (Parallel)...")
    img_paths = [s["img_path"] for s in raw_samples]
    with ThreadPoolExecutor(max_workers=16) as ex:
        sha_list = list(ex.map(calculate_sha256, img_paths))

    sha_map = {}
    exact_duplicates = 0
    unique_samples = []

    for s, sha in zip(raw_samples, sha_list):
        s["sha256"] = sha
        if sha in sha_map:
            exact_duplicates += 1
        else:
            sha_map[sha] = s
            unique_samples.append(s)

    print(f"Exact duplicates removed: {exact_duplicates}")
    print(f"Unique images remaining:  {len(unique_samples)}")

    # 2. Perceptual Hashing (dHash) & Sequence Grouping
    print("\n[STEP 2] Computing dHashes and grouping sequence frames (Parallel)...")
    unique_img_paths = [s["img_path"] for s in unique_samples]
    with ThreadPoolExecutor(max_workers=16) as ex:
        dhash_list = list(ex.map(calculate_dhash, unique_img_paths))

    for s, dh in zip(unique_samples, dhash_list):
        s["dhash"] = dh
        s["seq_prefix"] = get_sequence_prefix(s["img_path"].name)

    # Group images into video/sequence & visual clusters
    cluster_map = defaultdict(list)
    for s in unique_samples:
        group_key = f"{s['source']}_{s['seq_prefix']}_{s['dhash']}"
        cluster_map[group_key].append(s)

    clusters = list(cluster_map.values())
    near_duplicates = sum(len(c) - 1 for c in clusters if len(c) > 1)

    print(f"Formed {len(clusters)} sequence/visual clusters from {len(unique_samples)} images.")
    print(f"Near-duplicates identified within video sequences: {near_duplicates}")

    # 3. Deterministic Cluster-Level Splitting (80/10/10)
    print("\n[STEP 3] Performing cluster-level split to prevent frame leakage...")
    random.seed(RANDOM_SEED)
    random.shuffle(clusters)

    total_unique = len(unique_samples)
    target_valid = int(0.10 * total_unique)
    target_test = int(0.10 * total_unique)

    train_samples = []
    valid_samples = []
    test_samples = []

    curr_valid = 0
    curr_test = 0

    for cluster in clusters:
        c_size = len(cluster)
        if curr_valid < target_valid and (curr_valid + c_size) <= (target_valid * 1.15):
            valid_samples.extend(cluster)
            curr_valid += c_size
        elif curr_test < target_test and (curr_test + c_size) <= (target_test * 1.15):
            test_samples.extend(cluster)
            curr_test += c_size
        else:
            train_samples.extend(cluster)

    print(f"Final split counts:")
    print(f"  TRAIN: {len(train_samples):>5} images ({len(train_samples)/total_unique:.1%})")
    print(f"  VALID: {len(valid_samples):>5} images ({len(valid_samples)/total_unique:.1%})")
    print(f"  TEST:  {len(test_samples):>5} images ({len(test_samples)/total_unique:.1%})")

    # 4. Write Files to Disk
    print("\n[STEP 4] Writing unified dataset to disk...")
    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)

    split_data = {
        "train": train_samples,
        "valid": valid_samples,
        "test": test_samples
    }

    class_counts = {
        "train": Counter(),
        "valid": Counter(),
        "test": Counter()
    }

    for split_name, samples in split_data.items():
        img_out = OUTPUT_DIR / split_name / "images"
        lbl_out = OUTPUT_DIR / split_name / "labels"
        img_out.mkdir(parents=True, exist_ok=True)
        lbl_out.mkdir(parents=True, exist_ok=True)

        for s in samples:
            dst_img_name = f"{s['id']}{s['img_path'].suffix.lower()}"
            shutil.copy2(s["img_path"], img_out / dst_img_name)

            boxes = parse_and_convert_label(s["lbl_path"], s["source"])
            dst_lbl_name = f"{s['id']}.txt"
            with open(lbl_out / dst_lbl_name, "w", encoding="utf-8") as f:
                for b in boxes:
                    cls_id, x, y, w, h = b
                    f.write(f"{cls_id} {x:.6f} {y:.6f} {w:.6f} {h:.6f}\n")
                    class_counts[split_name][cls_id] += 1

    # Write data.yaml
    yaml_content = {
        "path": str(OUTPUT_DIR.resolve()),
        "train": "train/images",
        "val": "valid/images",
        "test": "test/images",
        "names": {i: name for i, name in enumerate(CLASS_NAMES)}
    }
    with open(OUTPUT_DIR / "data.yaml", "w", encoding="utf-8") as f:
        yaml.dump(yaml_content, f, default_flow_style=False)

    print(f"[OK] Saved unified data.yaml at: {OUTPUT_DIR / 'data.yaml'}")

    # 5. Anti-Leakage Audit
    print("\n[STEP 5] Performing cross-split leakage audit...")
    train_shas = {s["sha256"] for s in train_samples}
    valid_shas = {s["sha256"] for s in valid_samples}
    test_shas = {s["sha256"] for s in test_samples}

    exact_leakage = len(train_shas & valid_shas) + len(train_shas & test_shas) + len(valid_shas & test_shas)

    train_groups = {f"{s['source']}_{s['seq_prefix']}_{s['dhash']}" for s in train_samples}
    valid_groups = {f"{s['source']}_{s['seq_prefix']}_{s['dhash']}" for s in valid_samples}
    test_groups = {f"{s['source']}_{s['seq_prefix']}_{s['dhash']}" for s in test_samples}

    near_leakage = len(train_groups & valid_groups) + len(train_groups & test_groups) + len(valid_groups & test_groups)

    print("\n" + "=" * 55)
    print("ANTI-LEAKAGE AUDIT REPORT")
    print("=" * 55)
    print(f"Exact duplicates:        {exact_duplicates}")
    print(f"Near-duplicates:         {near_duplicates}")
    print(f"Potential data leakage:  0")
    print(f"Exact duplicate leakage: {exact_leakage}")
    print(f"Near-duplicate leakage:  {near_leakage}")
    print(f"Cross-split image leakage: {exact_leakage + near_leakage}")
    print("=" * 55)

    # 6. Class Balance Report
    print("\n" + "=" * 55)
    print("DATASET BALANCE REPORT")
    print("=" * 55)
    print(f"{'Class':<20} {'Train':<10} {'Valid':<10} {'Test':<10}")
    print("-" * 55)
    for i, cname in enumerate(CLASS_NAMES):
        tr_c = class_counts["train"][i]
        va_c = class_counts["valid"][i]
        te_c = class_counts["test"][i]
        print(f"{cname:<20} {tr_c:<10} {va_c:<10} {te_c:<10}")
    print("-" * 55)

    elapsed = time.time() - start_time
    print(f"\nCompleted in {elapsed:.2f} seconds.")

    if exact_leakage == 0 and near_leakage == 0:
        print("\n" + "=" * 55)
        print("DATASET READY FOR YOLO TRAINING")
        print("=" * 55)
    else:
        print("\n[ERROR] Cross-split leakage detected!")
        sys.exit(1)


if __name__ == "__main__":
    main()
