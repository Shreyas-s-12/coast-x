from pathlib import Path
import os
import sys
import time
import yaml

from dotenv import load_dotenv
from roboflow import Roboflow


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(dotenv_path=ENV_FILE, override=True)

API_KEY = os.getenv("ROBOFLOW_API_KEY") or os.getenv("API_KEY")

PRIMARY_WORKSPACE = "shreyas-s-vysgk"
FALLBACK_WORKSPACE = "marine-object-detection"
PROJECT = "marine-no-background"

DOWNLOAD_LOCATION = PROJECT_ROOT / "data"


# ============================================================
# HEADER & VALIDATION
# ============================================================

print("=" * 55)
print("COASTX DATASET DOWNLOADER")
print("=" * 55)

print(f"Workspace: {PRIMARY_WORKSPACE}")
print(f"Project:   {PROJECT}")

env_found = ENV_FILE.exists()
api_key_loaded = bool(API_KEY and len(API_KEY.strip()) > 0)

print(f".env found: {'YES' if env_found else 'NO'}")
print(f"API key loaded: {'YES' if api_key_loaded else 'NO'}")
print(f".env path: {ENV_FILE}\n")

if not api_key_loaded:
    print("[ERROR] ROBOFLOW_API_KEY is missing.")
    print("Check C:\\CoastX\\.env")
    sys.exit(1)

print("[OK] API key loaded.")


# ============================================================
# HELPER FUNCTIONS FOR VERIFICATION
# ============================================================

def count_images(folder):
    if not folder.exists():
        return 0
    extensions = {".jpg", ".jpeg", ".png", ".webp"}
    return sum(
        1
        for p in folder.rglob("*")
        if p.is_file() and p.suffix.lower() in extensions
    )


def count_labels(folder):
    if not folder.exists():
        return 0
    return sum(
        1
        for p in folder.rglob("*.txt")
        if p.is_file() and p.name not in ("README.dataset.txt", "README.roboflow.txt")
    )


def inspect_dataset(location):
    train_imgs = count_images(location / "train" / "images") or count_images(location / "train")
    valid_imgs = count_images(location / "valid" / "images") or count_images(location / "valid") or count_images(location / "val" / "images") or count_images(location / "val")
    test_imgs = count_images(location / "test" / "images") or count_images(location / "test")

    train_lbls = count_labels(location / "train" / "labels") or count_labels(location / "train")
    valid_lbls = count_labels(location / "valid" / "labels") or count_labels(location / "valid") or count_labels(location / "val" / "labels") or count_labels(location / "val")
    test_lbls = count_labels(location / "test" / "labels") or count_labels(location / "test")

    total_imgs = train_imgs + valid_imgs + test_imgs
    total_lbls = train_lbls + valid_lbls + test_lbls

    yaml_path = location / "data.yaml"
    if not yaml_path.exists():
        candidates = list(location.rglob("data.yaml"))
        if candidates:
            yaml_path = candidates[0]

    classes = []
    if yaml_path.exists():
        try:
            with open(yaml_path, "r", encoding="utf-8") as f:
                content = yaml.safe_load(f)
                classes = content.get("names", [])
        except Exception:
            pass

    return {
        "train_images": train_imgs,
        "valid_images": valid_imgs,
        "test_images": test_imgs,
        "total_images": total_imgs,
        "train_labels": train_lbls,
        "valid_labels": valid_lbls,
        "test_labels": test_lbls,
        "total_labels": total_lbls,
        "yaml_found": yaml_path.exists(),
        "yaml_path": yaml_path,
        "classes": classes
    }


def cleanup_invalid_zips(directory):
    for z in directory.glob("*.zip"):
        try:
            z.unlink()
        except Exception:
            pass


# ============================================================
# CHECK EXISTING DATASET INTEGRITY BEFORE DOWNLOADING
# ============================================================

stats = inspect_dataset(DOWNLOAD_LOCATION)
if stats["total_images"] > 0 and stats["total_labels"] > 0 and stats["yaml_found"]:
    print("[INFO] Existing verified dataset detected locally.")
else:
    print("[INFO] Local dataset missing or incomplete. Proceeding to Roboflow download...")

    print("[INFO] Connecting to Roboflow...")
    rf = Roboflow(api_key=API_KEY)

    # Determine workspace to use
    workspaces_to_try = [PRIMARY_WORKSPACE, FALLBACK_WORKSPACE]
    target_project = None
    selected_ws = None

    for ws_name in workspaces_to_try:
        try:
            ws = rf.workspace(ws_name)
            p = ws.project(PROJECT)
            v_list = p.versions()
            if v_list:
                target_project = p
                selected_ws = ws_name
                print(f"[OK] Connected to workspace '{selected_ws}'.")
                break
        except Exception:
            continue

    if not target_project:
        print("[ERROR] Could not access project under configured workspaces.")
        sys.exit(1)

    versions = target_project.versions()
    version_numbers = [int(v.version) for v in versions if str(v.version).isdigit()]
    selected_version = max(version_numbers) if version_numbers else 2

    print(f"[INFO] Selected version: {selected_version}")
    print("[INFO] Downloading complete dataset in YOLOv8 format...")

    DOWNLOAD_LOCATION.mkdir(parents=True, exist_ok=True)
    cleanup_invalid_zips(DOWNLOAD_LOCATION)

    downloaded = False
    # Attempt download from selected workspace first, then fallback workspace if needed
    attempt_workspaces = [selected_ws]
    if FALLBACK_WORKSPACE not in attempt_workspaces:
        attempt_workspaces.append(FALLBACK_WORKSPACE)

    for ws_name in attempt_workspaces:
        try:
            cleanup_invalid_zips(DOWNLOAD_LOCATION)
            ws_obj = rf.workspace(ws_name)
            p_obj = ws_obj.project(PROJECT)
            v_obj = p_obj.version(selected_version)
            
            # Backoff before calling download to respect rate limits
            time.sleep(2)
            dataset_res = v_obj.download("yolov8", location=str(DOWNLOAD_LOCATION), overwrite=True)
            
            # Re-inspect to verify files were extracted
            check_stats = inspect_dataset(DOWNLOAD_LOCATION)
            if check_stats["total_images"] > 0 and check_stats["total_labels"] > 0:
                downloaded = True
                print(f"[OK] Successfully downloaded dataset from workspace '{ws_name}'.")
                break
        except Exception as e:
            print(f"[WARNING] Download attempt from workspace '{ws_name}' failed: {e}")
            time.sleep(3)

    if not downloaded:
        print("\n[ERROR] Dataset download failed across all workspaces.")
        sys.exit(1)

    # Re-evaluate stats after download
    stats = inspect_dataset(DOWNLOAD_LOCATION)


# ============================================================
# DISPLAY VERIFICATION RESULTS
# ============================================================

print("\n" + "=" * 55)
print("VERIFYING DATASET")
print("=" * 55)

selected_version = 2
print(f"Dataset version:        {selected_version}")
print(f"Total images:           {stats['total_images']}")
print(f"Train images:           {stats['train_images']}")
print(f"Validation images:      {stats['valid_images']}")
print(f"Test images:            {stats['test_images']}")
print(f"Total labels:           {stats['total_labels']}")
print(f"Classes:                {stats['classes']}")
print(f"data.yaml found:        {'YES' if stats['yaml_found'] else 'NO'}")
print(f"Actual dataset location:{DOWNLOAD_LOCATION.resolve()}")

print("\n" + "=" * 55)
print("COASTX DATASET STATUS")
print("=" * 55)

if stats["total_images"] > 0 and stats["total_labels"] > 0 and stats["yaml_found"]:
    print("[OK] Dataset downloaded successfully.")
    print(f"[INFO] Dataset location: {DOWNLOAD_LOCATION.resolve()}")
    print("Images available:         YES")
    print("YOLO annotations:         YES")
    print("Ready for YOLO training:  YES")
    print("=" * 55)
else:
    print("\n[ERROR] Dataset download verification failed.")
    print("Reason: Missing images, labels, or data.yaml.")
    print("Dataset downloaded:       NO")
    print("Ready for YOLO training:  NO")
    print("=" * 55)
    sys.exit(1)