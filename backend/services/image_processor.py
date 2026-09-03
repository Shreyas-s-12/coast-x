import cv2
import uuid
from pathlib import Path
from backend.config import Config
from backend.services.detection import InferenceService
from backend.utils.helpers import get_logger

logger = get_logger("ImageProcessor")


class ImageProcessor:
    def __init__(self):
        self.inference = InferenceService()

    async def process_and_save(self, upload_file):
        unique_id = uuid.uuid4().hex[:8]
        filename = f"{unique_id}_{upload_file.filename}"
        input_path = Config.OUTPUT_IMAGES_DIR / f"input_{filename}"

        contents = await upload_file.read()
        with open(input_path, "wb") as f:
            f.write(contents)

        result = self.inference.process_image(input_path)

        output_filename = f"annotated_{filename}"
        output_path = Config.OUTPUT_IMAGES_DIR / output_filename

        if result.get("annotated_image") is not None:
            cv2.imwrite(str(output_path), result["annotated_image"])

        image_url = f"http://127.0.0.1:8000/outputs/images/{output_filename}"

        return {
            "success": True,
            "mode": "live",
            "objects": result["objects"],
            "counts": result["counts"],
            "image_url": image_url,
            "output_url": image_url,
            "risk": result["risk"]
        }


# Alias for compatibility
ImageService = ImageProcessor
