from flask import Blueprint
from backend.api.routes import router, detect_image, detect_video

detection_bp = Blueprint('detection', __name__)

__all__ = ["router", "detect_image", "detect_video", "detection_bp"]
