from flask import Blueprint, request
from backend.services.rerouting_service import evaluate_routes
from backend.services.routing_service import resolve_and_calculate_route
from backend.utils.response import success_response, error_response

route_bp = Blueprint('routes', __name__)

@route_bp.route('/api/routes', methods=['POST'], strict_slashes=False)
def routes_endpoint():
    data = request.json or {}
    curr = data.get('current_route', {})
    alts = data.get('alternative_routes', [])
    return success_response(data=evaluate_routes(curr, alts))

@route_bp.route('/api/routes/calculate', methods=['POST'], strict_slashes=False)
def calculate_route():
    data = request.json or {}
    origin = data.get('origin')
    destination = data.get('destination')
    
    if not origin or not destination:
        return error_response('INVALID_INPUT', 'Origin and destination are required', status_code=400)
    if origin.lower().strip() == destination.lower().strip():
        return error_response('INVALID_INPUT', 'Origin and destination must be different', status_code=400)
        
    result = resolve_and_calculate_route(origin, destination)
    if not result.get("success"):
        return error_response('ROUTING_ERROR', result.get("error", "Unable to calculate route"), status_code=400)
        
    return success_response(data=result)
