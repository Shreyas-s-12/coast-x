import cv2
import numpy as np
from pathlib import Path
from backend.models.detector import ObjectDetector
from backend.models.tracker import ObjectTracker
from backend.models.risk_engine import CoastalRiskEngine
from backend.utils.logger import get_logger

logger = get_logger("InferenceService")


def is_person_class(cls_name: str) -> bool:
    return cls_name.lower() in ["person", "swimmer", "people"]


def is_plastic_class(cls_name: str) -> bool:
    return cls_name.lower() in ["trash", "plastic", "garbage", "debris"]


def is_boat_class(cls_name: str) -> bool:
    return cls_name.lower() in ["boat", "vessel", "ship"]


def get_class_color(cls_name: str):
    if is_person_class(cls_name):
        return (0, 0, 255)      # BGR RED for PERSON
    elif is_plastic_class(cls_name):
        return (255, 0, 0)      # BGR BLUE for PLASTIC
    elif is_boat_class(cls_name):
        return (0, 165, 255)    # BGR ORANGE for BOAT
    return (255, 255, 0)        # BGR Cyan for other classes


class InferenceService:
    def __init__(self):
        self._detector = None
        self.risk_engine = CoastalRiskEngine()

    @property
    def detector(self):
        if self._detector is None:
            self._detector = ObjectDetector()
        return self._detector

    def process_image(self, image_input):
        """
        Process a single image input (filepath or cv2 BGR image numpy array).
        Returns dict containing detections, risk details, class counts, and annotated image.
        Raises FileNotFoundError if YOLO model is not trained/missing.
        """
        if isinstance(image_input, (str, Path)):
            img = cv2.imread(str(image_input))
            if img is None:
                raise ValueError(f"Could not read image from {image_input}")
        else:
            img = image_input.copy()

        h, w = img.shape[:2]

        # 1. Run YOLO Object Detection
        raw_detections = self.detector.detect(img)

        # 2. Track objects
        tracker = ObjectTracker()
        tracked_detections = tracker.update(raw_detections, frame_idx=0, fps=30.0, frame_shape=(h, w))

        # 3. Evaluate Risk
        risk_result = self.risk_engine.evaluate_risk(tracked_detections)

        # 4. Annotate Image with OpenCV
        annotated_img = img.copy()

        counts = {}
        for det in tracked_detections:
            cls_name = det["class"]
            counts[cls_name] = counts.get(cls_name, 0) + 1
            conf = det["confidence"]
            bbox = det["bbox"]
            obj_id = det["object_id"]

            x1, y1, x2, y2 = map(int, bbox)

            box_color = get_class_color(cls_name)

            cv2.rectangle(annotated_img, (x1, y1), (x2, y2), box_color, 2)

            label_text = f"{cls_name} {conf:.2f}"
            cv2.putText(annotated_img, label_text, (x1, max(18, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 2)

        return {
            "objects": [
                {
                    "class": d["class"],
                    "confidence": d["confidence"],
                    "bbox": d["bbox"],
                    "object_id": d["object_id"]
                }
                for d in tracked_detections
            ],
            "counts": counts,
            "risk": risk_result,
            "annotated_image": annotated_img
        }

