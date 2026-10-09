from flask import Blueprint
from backend.controllers.rag_controller import handle_rag_explanation

rag_bp = Blueprint('rag', __name__)
rag_bp.add_url_rule('/api/rag/explain', view_func=handle_rag_explanation, methods=['POST'], strict_slashes=False)
