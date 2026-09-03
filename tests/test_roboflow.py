import os
import sys
import json
import base64
import argparse
from pathlib import Path
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------
# CONSTANTS & METADATA
# ---------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent

DEFAULT_WORKSPACE = "shreyas-s-vysgk"
DEFAULT_WORKFLOW = "general-segmentation-api-2"
SERVERLESS_URL = "https://serverless.roboflow.com"

TARGET_CLASSES = {"boat", "trash", "buoy", "sinker", "swimmer"}

COLOR_MAP = {
    "boat": (0, 150, 255),       # Ocean Blue
    "trash": (255, 50, 50),      # Bright Red
    "buoy": (255, 180, 0),       # Amber / Orange
    "sinker": (160, 32, 240),    # Purple
    "swimmer": (50, 205, 50),    # Lime Green
}
DEFAULT_COLOR = (200, 200, 200)

def sanitize_message(msg: str, api_key: str) -> str:
    """Mask any occurrences of the API key in output messages or error traces."""
    if api_key and len(api_key) > 4:
        msg = msg.replace(api_key, "******")
    return msg

def load_environment() -> str:
    """Load ROBOFLOW_API_KEY from .env file securely."""
    env_path = ROOT_DIR / ".env"
    load_dotenv(dotenv_path=env_path)

    api_key = os.getenv("ROBOFLOW_API_KEY", "").strip()

    if not api_key or api_key == "PASTE_YOUR_API_KEY_HERE":
        print("[ERROR] ROBOFLOW_API_KEY is not configured in .env file.")
        print("\nPlease set your key in .env:")
        print("  ROBOFLOW_API_KEY=rf_your_api_key_here\n")
        sys.exit(1)

    return api_key

def draw_predictions_on_image(image_path: Path, output_path: Path, predictions: list) -> bool:
    """Draw bounding boxes and class labels onto local image if raw predictions are returned."""
    try:
        with Image.open(image_path).convert("RGB") as img:
            draw = ImageDraw.Draw(img)
            width, height = img.size

            for pred in predictions:
                if not isinstance(pred, dict):
                    continue

                class_name = pred.get("class") or pred.get("label") or "object"
                confidence = pred.get("confidence", pred.get("score", 0.0))
                color = COLOR_MAP.get(class_name.lower(), DEFAULT_COLOR)

                # Bounding box extraction
                x = pred.get("x")
                y = pred.get("y")
                w = pred.get("width")
                h = pred.get("height")

                if x is not None and y is not None and w is not None and h is not None:
                    left = max(0, x - w / 2)
                    top = max(0, y - h / 2)
                    right = min(width, x + w / 2)
                    bottom = min(height, y + h / 2)

                    # Draw box
                    draw.rectangle([left, top, right, bottom], outline=color, width=3)

                    # Draw label text
                    label_text = f"{class_name} {confidence:.2f}"
                    draw.rectangle([left, max(0, top - 18), left + len(label_text) * 8, top], fill=color)
                    draw.text((left + 3, max(0, top - 16)), label_text, fill=(255, 255, 255))

            img.save(output_path)
            print(f"[SUCCESS] Processed visualization saved to: {output_path}")
            return True
    except Exception as e:
        print(f"[WARNING] Could not overlay predictions on image: {e}")
        return False

def save_base64_image(b64_string: str, output_path: Path) -> bool:
    """Decode and save base64 encoded result image."""
    try:
        if "," in b64_string:
            b64_string = b64_string.split(",")[1]
        image_bytes = base64.b64decode(b64_string)
        with open(output_path, "wb") as f:
            f.write(image_bytes)
        print(f"[SUCCESS] Workflow visual output saved to: {output_path}")
        return True
    except Exception as e:
        print(f"[WARNING] Could not save base64 visualization: {e}")
        return False

def run_roboflow_test(image_path: Path, output_path: Path, workspace: str, workflow: str):
    """Connect to Roboflow Inference SDK and run the specified workflow."""
    print("==================================================")
    print("COASTX - ROBOFLOW WORKFLOW INFERENCE TEST")
    print("==================================================")
    print(f"Workspace: {workspace}")
    print(f"Workflow:  {workflow}")
    print(f"Endpoint:  {SERVERLESS_URL}")
    print(f"Image Path: {image_path}")
    print("--------------------------------------------------\n")

    # Load API Key
    api_key = load_environment()

    # Import Inference SDK
    try:
        from inference_sdk import InferenceHTTPClient, InferenceConfiguration
    except ImportError:
        print("[ERROR] Failed to import 'inference_sdk'. Please ensure inference-sdk is installed:")
        print("  pip install inference-sdk\n")
        sys.exit(1)

    # Initialize Inference Client
    try:
        client = InferenceHTTPClient(
            api_url=SERVERLESS_URL,
            api_key=api_key
        )
        # Suppress transport warning and use standard headers
        try:
            config = InferenceConfiguration(api_key_transport="legacy")
            client.configure(config)
        except Exception:
            pass

    except Exception as e:
        clean_err = sanitize_message(str(e), api_key)
        print(f"[ERROR] Failed to initialize Roboflow Inference Client: {clean_err}")
        sys.exit(1)

    # Run Workflow
    print("[INFO] Submitting image to Roboflow Workflow...")
    try:
        result = client.run_workflow(
            workspace_name=workspace,
            workflow_id=workflow,
            images={"image": str(image_path)}
        )
        print("[SUCCESS] Workflow executed successfully.\n")

    except Exception as e:
        clean_err = sanitize_message(str(e), api_key)
        print("\n[ERROR] Roboflow Workflow Execution Failed:")
        print(f"Details: {clean_err}\n")
        print("Troubleshooting Checklist:")
        print("1. Verify your ROBOFLOW_API_KEY in .env is valid for serverless inference.")
        print("2. Ensure workspace name matches: 'shreyas-s-vysgk'")
        print("3. Ensure workflow ID matches: 'general-segmentation-api-2'")
        sys.exit(1)

    # Display & Parse Results
    print("==================================================")
    print("WORKFLOW RESPONSE RESULTS")
    print("==================================================")

    # Format JSON response safely (without exposing any key)
    res_str = json.dumps(result, indent=2, default=str)
    res_str_clean = sanitize_message(res_str, api_key)
    print(res_str_clean)
    print("--------------------------------------------------\n")

    # Extract predictions & visualization
    extracted_preds = []
    saved_visual = False

    if isinstance(result, list) and len(result) > 0:
        res_item = result[0]
    elif isinstance(result, dict):
        res_item = result
    else:
        res_item = {}

    # Check for visual image outputs in result
    for key, val in res_item.items():
        if isinstance(val, str) and (val.startswith("data:image") or len(val) > 1000 and "base64" in key.lower()):
            saved_visual = save_base64_image(val, output_path)
            if saved_visual:
                break
        elif isinstance(val, dict) and "value" in val and isinstance(val["value"], str) and len(val["value"]) > 1000:
            saved_visual = save_base64_image(val["value"], output_path)
            if saved_visual:
                break

    # Look for object detection / segmentation outputs
    for key, val in res_item.items():
        if isinstance(val, list):
            for item in val:
                if isinstance(item, dict) and ("class" in item or "label" in item or "predictions" in item):
                    extracted_preds.append(item)
        elif isinstance(val, dict) and "predictions" in val and isinstance(val["predictions"], list):
            extracted_preds.extend(val["predictions"])

    # Highlight CoastX classes detected
    print("==================================================")
    print("COASTX CLASS DETECTION SUMMARY")
    print("==================================================")
    found_classes = {}
    for cls in TARGET_CLASSES:
        found_classes[cls] = 0

    for pred in extracted_preds:
        c_name = str(pred.get("class", pred.get("label", ""))).lower()
        if c_name in found_classes:
            found_classes[c_name] += 1

    for cls_name, count in found_classes.items():
        symbol = "✅" if count > 0 else "⚪"
        print(f"  {symbol} {cls_name:<10}: {count} detected")

    print("--------------------------------------------------")

    # If no pre-baked visualization was returned by server, overlay predictions locally
    if not saved_visual and extracted_preds:
        draw_predictions_on_image(image_path, output_path, extracted_preds)
    elif not saved_visual:
        # Save a copy of input image to output path
        try:
            with Image.open(image_path) as img:
                img.save(output_path)
            print(f"[INFO] Processed output saved to: {output_path}")
        except Exception:
            pass

    print("\n[COMPLETE] Roboflow Inference Test finished successfully.\n")

def main():
    parser = argparse.ArgumentParser(description="CoastX - Test Roboflow Workflow Inference")
    parser.add_argument("--image", "-i", type=str, default="assets/test.jpg", help="Path to input image file")
    parser.add_argument("--output", "-o", type=str, default="assets/output_result.jpg", help="Path to save output result image")
    parser.add_argument("--workspace", "-w", type=str, default=DEFAULT_WORKSPACE, help="Roboflow workspace ID")
    parser.add_argument("--workflow", "-f", type=str, default=DEFAULT_WORKFLOW, help="Roboflow workflow ID")

    args = parser.parse_args()

    image_path = Path(args.image)
    output_path = Path(args.output)

    # Fallback to test.jpg or create synthetic test image if specified path doesn't exist
    if not image_path.exists():
        if Path("test.jpg").exists():
            image_path = Path("test.jpg")
        else:
            print(f"[WARNING] Specified image '{args.image}' not found. Generating sample test image...")
            Path("assets").mkdir(exist_ok=True)
            image_path = Path("assets/test.jpg")
            img = Image.new("RGB", (640, 480), color=(30, 100, 150))
            draw = ImageDraw.Draw(img)
            draw.polygon([(200, 300), (440, 300), (400, 350), (240, 350)], fill=(180, 180, 180))
            draw.ellipse([(100, 200), (140, 240)], fill=(255, 100, 0))
            img.save(image_path)
            print(f"[INFO] Sample image generated at: {image_path}")

    run_roboflow_test(image_path, output_path, args.workspace, args.workflow)

if __name__ == "__main__":
    main()
