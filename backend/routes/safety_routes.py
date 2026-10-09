from flask import Blueprint, request
from backend.services.safety_service import SafetyService
from backend.utils.response import success_response, error_response

safety_bp = Blueprint('safety', __name__)

@safety_bp.route('/api/safety/location', methods=['POST'], strict_slashes=False)
def update_location():
    try:
        data = request.get_json(silent=True) or {}
        driver_id = data.get('driver_id', 'anonymous_driver')
        lat = data.get('lat')
        lng = data.get('lng')
        is_demo = data.get('is_demo', False)
        accelerated = data.get('accelerated', False)
        
        if lat is None or lng is None:
            return error_response('INVALID_INPUT', 'lat and lng are required', status_code=400)
            
        incident = SafetyService.update_location(driver_id, lat, lng, is_demo, accelerated)
        zones = SafetyService.get_zones()
        active_zones = any(z.get('enabled', True) for z in zones)
        
        return success_response(data={"incident": incident, "zones_active": active_zones})
    except Exception as e:
        return error_response('SAFETY_ERROR', str(e), status_code=500)

@safety_bp.route('/api/safety/confirm', methods=['POST'], strict_slashes=False)
def confirm_safety():
    try:
        data = request.get_json(silent=True) or {}
        driver_id = data.get('driver_id', 'anonymous_driver')
        incident_id = data.get('incident_id')
        
        if not incident_id:
            return error_response('INVALID_INPUT', 'incident_id is required', status_code=400)
            
        result = SafetyService.confirm_safety(driver_id, incident_id)
        if not result["success"]:
            return error_response('SAFETY_ERROR', result["error"], status_code=400)
            
        return success_response(data={"incident": result["incident"]}, message="Safety confirmed successfully")
    except Exception as e:
        return error_response('SAFETY_ERROR', str(e), status_code=500)

@safety_bp.route('/api/safety/status', methods=['GET'], strict_slashes=False)
def get_status():
    try:
        driver_id = request.args.get('driver_id', 'anonymous_driver')
        incident = SafetyService.get_driver_status(driver_id)
        return success_response(data={"incident": incident})
    except Exception as e:
        return error_response('SAFETY_ERROR', str(e), status_code=500)

@safety_bp.route('/api/safety/zones', methods=['GET', 'POST'], strict_slashes=False)
def manage_zones():
    try:
        if request.method == 'GET':
            zones = SafetyService.get_zones()
            return success_response(data={"zones": zones})
        else:
            data = request.get_json(silent=True) or {}
            zone = SafetyService.upsert_zone(
                zone_id=data.get('zone_id'),
                name=data.get('name', 'New Zone'),
                lat=data.get('latitude'),
                lng=data.get('longitude'),
                radius_meters=data.get('radius_meters', 5000),
                risk_level=data.get('risk_level', 'HIGH'),
                enabled=data.get('enabled', True)
            )
            return success_response(data={"zone": zone}, message="Zone configured successfully")
    except Exception as e:
        return error_response('SAFETY_ERROR', str(e), status_code=500)
