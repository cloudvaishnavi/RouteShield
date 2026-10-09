from flask import request
from backend.services.agent_service import execute_workflow
from backend.utils.response import success_response, error_response

def handle_analyze():
    try:
        data = request.json or {}
        return success_response(data=execute_workflow(data))
    except Exception as e:
        return error_response('ANALYZE_ERROR', str(e), status_code=500)
