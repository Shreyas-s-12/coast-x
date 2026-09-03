import os
import csv
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.config import Config
from backend.services.image_processor import ImageProcessor
from backend.services.video_processor import VideoProcessor
from backend.utils.helpers import get_logger

logger = get_logger("APIRoutes")

router = APIRouter()

image_processor = ImageProcessor()
video_processor = VideoProcessor()


@router.get("/health")
@router.get("/api/health")
def health_check():
    model_path = Config.MODEL_PATH
    model_exists = model_path.exists()
    model_available = False

    if model_exists:
        try:
            from ultralytics import YOLO
            _ = YOLO(str(model_path))
            model_available = True
        except Exception as e:
            logger.error(f"Error loading CoastX model from {model_path}: {e}")
            model_available = False

    return {
        "status": "ok",
        "service": Config.PROJECT_NAME,
        "mode": "live" if model_available else "demo",
        "model_available": model_available
    }


@router.post("/api/detect/image")
async def detect_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    try:
        result = await image_processor.process_and_save(file)
        return result
    except FileNotFoundError:
        return {
            "success": True,
            "mode": "demo",
            "objects": [],
            "counts": {},
            "image_url": "",
            "risk": {
                "score": 0,
                "level": "DEMO MODE",
                "activity": "DEMO",
                "alerts": ["CoastX best model file unavailable for live inference."],
                "summary": "Demo mode active. Upload succeeded."
            }
        }
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/detect/video")
async def detect_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/") and not file.filename.endswith(('.mp4', '.avi', '.mov', '.mkv')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a video.")

    try:
        result = await video_processor.process_video(file)
        return result
    except FileNotFoundError:
        return {
            "success": True,
            "mode": "demo",
            "counts": {},
            "total_events": 0,
            "events": [],
            "risk": {
                "score": 0,
                "level": "DEMO MODE",
                "activity": "DEMO",
                "alerts": ["CoastX best model file unavailable for live inference."],
                "summary": "Demo mode active."
            }
        }
    except Exception as e:
        logger.error(f"Error processing video: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/analysis/stats")
def get_system_stats():
    train_dir = Config.BASE_DIR / "data" / "train" / "images"
    valid_dir = Config.BASE_DIR / "data" / "valid" / "images"
    test_dir = Config.BASE_DIR / "data" / "test" / "images"

    train_count = len(list(train_dir.glob("*"))) if train_dir.exists() else 0
    valid_count = len(list(valid_dir.glob("*"))) if valid_dir.exists() else 0
    test_count = len(list(test_dir.glob("*"))) if test_dir.exists() else 0
    total_images = train_count + valid_count + test_count

    classes = Config.get_class_names()
    model_exists = Config.MODEL_PATH.exists()

    return {
        "status": "ok",
        "dataset": {
            "total_images": total_images,
            "train_count": train_count,
            "valid_count": valid_count,
            "test_count": test_count,
            "classes": classes
        },
        "model": {
            "trained": model_exists,
            "model_path": str(Config.MODEL_PATH),
            "mode": "live" if model_exists else "demo",
            "message": "CoastX Model Ready" if model_exists else "Demo mode active"
        },
        "system": {
            "name": Config.PROJECT_NAME,
            "version": Config.VERSION,
            "status": "OPERATIONAL"
        }
    }


@router.get("/api/analysis/events")
def get_recent_events(limit: int = 50):
    events_path = Config.EVENTS_CSV_PATH
    if not events_path.exists():
        return {"events": [], "count": 0}

    events = []
    try:
        with open(events_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                events.append(row)
        
        events.reverse()
        sliced_events = events[:limit]
        return {"events": sliced_events, "count": len(events)}
    except Exception as e:
        logger.error(f"Error reading events CSV: {e}")
        return {"events": [], "count": 0, "error": str(e)}
