import cv2
import uuid
import math
import imageio
import numpy as np
from pathlib import Path
from backend.config import Config
from backend.services.detection import InferenceService
from backend.utils.helpers import get_logger
from backend.utils.class_mapper import map_to_target_class, get_class_bgr_color
from backend.services.temporal_safety import TemporalSafetyEngine

logger = get_logger("VideoProcessor")


class VideoProcessor:
    def __init__(self):
        self.inference = InferenceService()
        self.temporal_safety = TemporalSafetyEngine()

    async def process_video(self, video_file):
        unique_id = uuid.uuid4().hex[:8]
        filename = f"{unique_id}_{video_file.filename}"
        input_path = Config.OUTPUT_VIDEOS_DIR / f"raw_{filename}"

        contents = await video_file.read()
        with open(input_path, "wb") as f:
            f.write(contents)

        cap = cv2.VideoCapture(str(input_path))
        if not cap.isOpened():
            raise ValueError(f"Could not open video file at {input_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        if not fps or math.isnan(fps) or fps <= 0:
            fps = 30.0

        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) or 640
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)) or 480

        output_filename = f"processed_{unique_id}.mp4"
        output_path = Config.OUTPUT_VIDEOS_DIR / output_filename
        
        # Initialize video writer with imageio libx264 (mp4v fallback)
        use_imageio = True
        try:
            video_writer = imageio.get_writer(
                str(output_path), 
                fps=fps, 
                codec='libx264', 
                pixelformat='yuv420p'
            )
        except Exception as e:
            logger.warning(f"imageio libx264 writer failed: {e}. Falling back to cv2.VideoWriter mp4v.")
            use_imageio = False
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            video_writer = cv2.VideoWriter(str(output_path), fourcc, fps, (w, h))

        frame_count = 0
        raw_frame_detections = 0

        # Persistent track memory: track_id -> {"class": target_cls, "hits": hit_count, "last_seen": frame_idx, "speed": 0.0}
        track_history = {}

        # Per-frame object counts tracking for peak / average metrics
        frame_person_counts = []
        frame_plastic_counts = []
        frame_boat_counts = []

        model = self.inference.detector.model
        conf_threshold = Config.CONFIDENCE_THRESHOLD

        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret or frame is None:
                    break

                frame_count += 1
                
                # Perform ByteTrack persistent tracking
                results = model.track(
                    frame,
                    persist=True,
                    tracker="bytetrack.yaml",
                    conf=conf_threshold,
                    verbose=False
                )

                annotated_frame = frame.copy()
                current_frame_person = 0
                current_frame_plastic = 0
                current_frame_boat = 0

                for r in results:
                    boxes = r.boxes
                    if boxes is None or len(boxes) == 0:
                        continue

                    xyxy_arr = boxes.xyxy.cpu().numpy()
                    cls_ids = boxes.cls.int().cpu().tolist()
                    confs = boxes.conf.cpu().tolist()
                    track_ids = boxes.id.int().cpu().tolist() if boxes.id is not None else [None] * len(boxes)

                    for box, cls_id, conf, tid in zip(xyxy_arr, cls_ids, confs, track_ids):
                        raw_cname = model.names.get(cls_id, f"class_{cls_id}")
                        target_cls = map_to_target_class(raw_cname)

                        # Skip non-target classes (buoy, sinker, etc.)
                        if not target_cls:
                            continue

                        raw_frame_detections += 1

                        if tid is not None:
                            if tid not in track_history:
                                track_history[tid] = {"object_id": tid, "class": target_cls, "hits": 1, "last_seen": frame_count, "speed": 0.0}
                            else:
                                track_history[tid]["hits"] += 1
                                track_history[tid]["last_seen"] = frame_count

                        # Count per-frame active detections
                        if target_cls == "Person":
                            current_frame_person += 1
                        elif target_cls == "Plastic":
                            current_frame_plastic += 1
                        elif target_cls == "Boat":
                            current_frame_boat += 1

                        # Bounding box color specification:
                        box_color = get_class_bgr_color(target_cls)

                        x1, y1, x2, y2 = map(int, box)
                        cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), box_color, 2)

                        if tid is not None:
                            label = f"{target_cls} #{tid} {conf:.2f}"
                        else:
                            label = f"{target_cls} {conf:.2f}"

                        cv2.putText(annotated_frame, label, (x1, max(18, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, box_color, 2)

                frame_person_counts.append(current_frame_person)
                frame_plastic_counts.append(current_frame_plastic)
                frame_boat_counts.append(current_frame_boat)

                # Write frame to video writer
                if use_imageio:
                    rgb_frame = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
                    video_writer.append_data(rgb_frame)
                else:
                    video_writer.write(annotated_frame)

        finally:
            cap.release()
            if use_imageio:
                video_writer.close()
            else:
                video_writer.release()

        # MINIMUM STABLE CONFIRMATION REQUIREMENT: Require track to be present for >= 3 frames
        MIN_STABLE_HITS = 3

        confirmed_people_ids = {
            tid for tid, info in track_history.items() 
            if info["class"] == "Person" and info["hits"] >= MIN_STABLE_HITS
        }
        confirmed_plastic_ids = {
            tid for tid, info in track_history.items() 
            if info["class"] == "Plastic" and info["hits"] >= MIN_STABLE_HITS
        }
        confirmed_boat_ids = {
            tid for tid, info in track_history.items() 
            if info["class"] == "Boat" and info["hits"] >= MIN_STABLE_HITS
        }

        confirmed_tracked_people = len(confirmed_people_ids)
        confirmed_tracked_plastic = len(confirmed_plastic_ids)
        confirmed_tracked_boats = len(confirmed_boat_ids)

        current_people = frame_person_counts[-1] if frame_person_counts else 0
        peak_people = max(frame_person_counts) if frame_person_counts else 0
        average_people = round(float(np.mean(frame_person_counts)), 1) if frame_person_counts else 0.0

        current_boats = frame_boat_counts[-1] if frame_boat_counts else 0
        peak_boats = max(frame_boat_counts) if frame_boat_counts else 0

        current_plastic = frame_plastic_counts[-1] if frame_plastic_counts else 0
        peak_plastic = max(frame_plastic_counts) if frame_plastic_counts else 0

        # Evaluate temporal safety using architecture module
        safety_eval = self.temporal_safety.evaluate_track_safety(track_history)

        output_exists = output_path.exists()
        output_size = output_path.stat().st_size if output_exists else 0

        logger.info(f"Video analysis finished. Processed {frame_count} frames, output size: {output_size} bytes.")

        if not output_exists or output_size == 0:
            raise RuntimeError(f"Video processing failed. Output video at {output_path} is missing or empty.")

        output_relative_url = f"/outputs/videos/{output_filename}"
        output_full_url = f"http://127.0.0.1:8000/outputs/videos/{output_filename}"

        metrics = {
            "current_people": current_people,
            "peak_people": peak_people,
            "average_people": average_people,
            "confirmed_tracked_people": confirmed_tracked_people,
            "current_boats": current_boats,
            "peak_boats": peak_boats,
            "current_plastic": current_plastic,
            "peak_plastic": peak_plastic
        }

        counts = {
            "person": confirmed_tracked_people,
            "plastic": confirmed_tracked_plastic,
            "boat": confirmed_tracked_boats
        }

        return {
            "success": True,
            "mode": "live",
            "original_filename": video_file.filename,
            "output_filename": output_filename,
            "output_video": output_relative_url,
            "output_url": output_full_url,
            "frames_processed": frame_count,
            "raw_frame_detections": raw_frame_detections,
            "total_detections": raw_frame_detections,
            "metrics": metrics,
            "counts": counts,
            "unique_people": confirmed_tracked_people,
            "unique_plastic": confirmed_tracked_plastic,
            "unique_boats": confirmed_tracked_boats,
            "total_events": len(safety_eval.get("alerts", [])),
            "events": safety_eval.get("alerts", []),
            "risk": {
                "score": 0,
                "level": safety_eval.get("distress_level", "LOW"),
                "alerts": safety_eval.get("alerts", []),
                "summary": f"Video analysis completed cleanly with persistent ByteTracking. Metrics: {confirmed_tracked_people} people, {confirmed_tracked_plastic} plastic, {confirmed_tracked_boats} boats."
            }
        }


# Compatibility export
VideoService = VideoProcessor
