from flask import Blueprint
from backend.controllers.prediction_controller import handle_prediction

prediction_bp = Blueprint('prediction', __name__)
prediction_bp.route('/api/prediction', methods=['POST'], strict_slashes=False)(handle_prediction)
