import os
import yaml
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Config:
    PROJECT_NAME = "CoastX"
    VERSION = "1.0.0"
    HOST = os.getenv("HOST", "127.0.0.1")
    PORT = int(os.getenv("PORT", 8000))
    BASE_DIR = BASE_DIR

    # Detection & Inference Settings
    CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.50))
    IMAGE_SIZE = int(os.getenv("IMAGE_SIZE", 640))
    FRAME_SKIP = int(os.getenv("FRAME_SKIP", 2))

    # File Paths
    MODEL_PATH = BASE_DIR / "models" / "coastx_best.pt"
    WEIGHTS_PATH = BASE_DIR / "weights" / "yolo11n.pt"
    DATA_YAML_PATH = BASE_DIR / "data" / "data.yaml"
    OUTPUT_DIR = BASE_DIR / "outputs"
    OUTPUT_IMAGES_DIR = OUTPUT_DIR / "images"
    OUTPUT_VIDEOS_DIR = OUTPUT_DIR / "videos"
    OUTPUT_EVENTS_DIR = OUTPUT_DIR / "events"
    EVENTS_CSV_PATH = OUTPUT_EVENTS_DIR / "events.csv"
    TRAINING_OUTPUT_DIR = BASE_DIR / "runs" / "coastx_training"

    @classmethod
    def get_class_names(cls):
        if cls.DATA_YAML_PATH.exists():
            try:
                with open(cls.DATA_YAML_PATH, "r", encoding="utf-8") as f:
                    content = yaml.safe_load(f)
                    names = content.get("names", [])
                    if isinstance(names, dict):
                        return [names[k] for k in sorted(names.keys())]
                    elif isinstance(names, list):
                        return names
            except Exception:
                pass
        return ["boat", "buoy", "sinker", "swimmer", "trash"]

# Ensure required directories exist on module import
for d in [Config.OUTPUT_IMAGES_DIR, Config.OUTPUT_VIDEOS_DIR, Config.OUTPUT_EVENTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

