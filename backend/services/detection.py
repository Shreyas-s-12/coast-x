import os
import cv2
import math
import numpy as np
from pathlib import Path
from typing import List, Dict, Any
from backend.config import Config
from backend.utils.helpers import get_logger
from backend.utils.class_mapper import map_to_target_class, get_class_bgr_color

logger = get_logger("DetectionService")


class ObjectDetector:
    def __init__(self, model_path=None):
        self.model_path = model_path or Config.MODEL_PATH
        self.model = None
        self.load_model()

    def load_model(self):
        p = Path(self.model_path)
        if not p.exists():
            logger.warning(f"CoastX model file missing at {self.model_path}")
            raise FileNotFoundError(f"CoastX model file missing at {self.model_path}")

        try:
            from ultralytics import YOLO
            self.model = YOLO(str(self.model_path))
            names = getattr(self.model, "names", {})
            logger.info(f"Loaded YOLO model from {self.model_path}")
            logger.info(f"Model class names: {names}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model from {self.model_path}: {e}")
            raise RuntimeError(f"Error initializing YOLO model: {e}")

    def detect(self, image_input, conf=None):
        if self.model is None:
            raise FileNotFoundError("CoastX model unavailable.")

        confidence_threshold = conf if conf is not None else Config.CONFIDENCE_THRESHOLD
        
        if isinstance(image_input, (str, Path)):
            img = cv2.imread(str(image_input))
        else:
            img = image_input

        if img is None:
            return []

        results = self.model.predict(
            img, 
            conf=confidence_threshold, 
            imgsz=Config.IMAGE_SIZE, 
            verbose=False
        )

        detections = []
        model_names = getattr(self.model, "names", {})

        for r in results:
            for box in r.boxes:
                cls_id = int(box.cls[0].item())
                conf_val = float(box.conf[0].item())
                xyxy = box.xyxy[0].tolist()
                
                raw_cls_name = ""
                if isinstance(model_names, dict) and cls_id in model_names:
                    raw_cls_name = str(model_names[cls_id])
                elif isinstance(model_names, list) and cls_id < len(model_names):
                    raw_cls_name = str(model_names[cls_id])
                else:
                    raw_cls_name = f"class_{cls_id}"

                target_cls = map_to_target_class(raw_cls_name)

                # Skip non-target classes (e.g. buoy, sinker)
                if not target_cls:
                    continue

                detections.append({
                    "class_id": cls_id,
                    "raw_class": raw_cls_name,
                    "class": target_cls,
                    "confidence": round(conf_val, 4),
                    "bbox": [round(c, 2) for c in xyxy]
                })

        return detections


class InferenceService:
    def __init__(self):
        self._detector = None

    @property
    def detector(self):
        if self._detector is None:
            self._detector = ObjectDetector()
        return self._detector

    def process_image(self, image_input):
        if isinstance(image_input, (str, Path)):
            img = cv2.imread(str(image_input))
            if img is None:
                raise ValueError(f"Could not read image from {image_input}")
        else:
            img = image_input.copy()

        raw_detections = self.detector.detect(img)
        annotated_img = img.copy()

        person_count = 0
        plastic_count = 0
        boat_count = 0

        objects_list = []

        for det in raw_detections:
            cls_name = det["class"] # "Person", "Plastic", "Boat"
            conf = det["confidence"]
            bbox = det["bbox"]

            if cls_name == "Person":
                person_count += 1
            elif cls_name == "Plastic":
                plastic_count += 1
            elif cls_name == "Boat":
                boat_count += 1

            x1, y1, x2, y2 = map(int, bbox)
            box_color = get_class_bgr_color(cls_name)

            # Draw bounding box
            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), box_color, 2)

            # Draw label (e.g. Person 0.87)
            label_text = f"{cls_name} {conf:.2f}"
            cv2.putText(annotated_img, label_text, (x1, max(18, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 2)

            objects_list.append({
                "class": cls_name,
                "confidence": conf,
                "bbox": bbox
            })

        counts = {
            "person": person_count,
            "plastic": plastic_count,
            "boat": boat_count
        }

        return {
            "success": True,
            "mode": "live",
            "objects": objects_list,
            "counts": counts,
            "risk": {
                "score": 0,
                "level": "LOW",
                "alerts": [],
                "summary": f"Single frame detection completed cleanly. Observed: {person_count} Person, {plastic_count} Plastic, {boat_count} Boat."
            },
            "annotated_image": annotated_img
        }


# Compatibility export
DetectionService = InferenceService
