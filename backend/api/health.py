from flask import Blueprint
from backend.api.routes import router, health_check

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def flask_health():
    return health_check()

__all__ = ["router", "health_check", "health_bp"]
