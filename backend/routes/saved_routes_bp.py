from flask import Blueprint, request
from backend.services.route_storage_service import RouteStorageService
from backend.utils.response import success_response, error_response

saved_routes_bp = Blueprint('saved_routes', __name__)

@saved_routes_bp.route('/api/routes/saved', methods=['GET'], strict_slashes=False)
def get_saved_routes():
    try:
        routes = RouteStorageService.get_all_routes()
        return success_response(data={"routes": routes})
    except Exception as e:
        return error_response('DB_ERROR', str(e), status_code=500)

@saved_routes_bp.route('/api/routes/save', methods=['POST'], strict_slashes=False)
def save_route():
    try:
        data = request.json
        if not data:
            return error_response('INVALID_INPUT', 'Request body is empty', status_code=400)
            
        # Fetch POIs if not provided
        if not data.get("pois"):
            from backend.services.poi_service import POIService
            geom = data.get("route_geometry")
            orig = data.get("origin")
            dest = data.get("destination")
            data["pois"] = POIService.get_pois_along_route(geom, orig, dest)
            
        saved_route = RouteStorageService.save_route(data)
        return success_response(data=saved_route, message="Route saved successfully")
    except Exception as e:
        return error_response('DB_ERROR', str(e), status_code=500)

@saved_routes_bp.route('/api/routes/saved/<route_id>', methods=['GET'], strict_slashes=False)
def get_single_saved_route(route_id):
    try:
        route = RouteStorageService.get_route(route_id)
        if not route:
            return error_response('NOT_FOUND', 'Route not found', status_code=404)
        return success_response(data=route)
    except Exception as e:
        return error_response('DB_ERROR', str(e), status_code=500)

@saved_routes_bp.route('/api/routes/saved/<route_id>', methods=['DELETE'], strict_slashes=False)
def delete_saved_route(route_id):
    try:
        deleted = RouteStorageService.delete_route(route_id)
        if not deleted:
            return error_response('NOT_FOUND', 'Route not found', status_code=404)
        return success_response(message="Route deleted successfully")
    except Exception as e:
        return error_response('DB_ERROR', str(e), status_code=500)
