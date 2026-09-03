from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.config import Config
from backend.api.health import health_bp
from backend.api.detection import detection_bp
from backend.api.analysis import analysis_bp
from backend.utils.logger import get_logger

logger = get_logger("App")

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register blueprints
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(detection_bp, url_prefix="/api")
    app.register_blueprint(analysis_bp, url_prefix="/api")

    # Serve static outputs
    @app.route("/outputs/<path:filename>")
    def serve_outputs(filename):
        return send_from_directory(Config.OUTPUT_DIR, filename)

    logger.info("CoastX Backend Application Initialized.")
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
