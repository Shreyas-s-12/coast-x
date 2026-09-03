from pathlib import Path
from ultralytics import YOLO

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_YAML = PROJECT_ROOT / "data" / "data.yaml"
BEST_MODEL = PROJECT_ROOT / "models" / "coastx_best.pt"

def evaluate():
    print("=" * 60)
    print("COASTX - HELD-OUT TEST EVALUATION")
    print("=" * 60)
    
    if not BEST_MODEL.exists():
        print(f"[ERROR] Model file not found: {BEST_MODEL}")
        return

    model = YOLO(str(BEST_MODEL))
    metrics = model.val(data=str(DATA_YAML), split="test")
    
    print("\n--- TEST EVALUATION RESULTS ---")
    print(f"mAP50:    {metrics.box.map50:.4f}")
    print(f"mAP50-95: {metrics.box.map:.4f}")
    print(f"Precision: {metrics.box.mp:.4f}")
    print(f"Recall:    {metrics.box.mr:.4f}")

if __name__ == "__main__":
    evaluate()
