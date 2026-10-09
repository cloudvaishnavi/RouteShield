from flask import Blueprint
from backend.ml.model_loader import ModelLoader
from backend.utils.response import success_response

health_bp = Blueprint('health', __name__)
@health_bp.route('/api/health', methods=['GET'], strict_slashes=False)
def health_check():
    inst = ModelLoader.get_instance()
    try:
        if not inst.is_loaded: inst.load()
        loaded = True
    except Exception as e:
        from backend.utils.logger import get_logger
        get_logger(__name__).exception("Model loading failed")
        loaded = False
    return success_response({'status': 'healthy', 'model_loaded': loaded, 'preprocessor_loaded': loaded})
