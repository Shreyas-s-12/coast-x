from flask import Blueprint
from backend.api.routes import router, get_system_stats, get_recent_events

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/analysis/stats', methods=['GET'])
def flask_stats():
    return get_system_stats()

@analysis_bp.route('/analysis/events', methods=['GET'])
def flask_events():
    return get_recent_events()

__all__ = ["router", "get_system_stats", "get_recent_events", "analysis_bp"]
