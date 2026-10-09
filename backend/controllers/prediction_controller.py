from flask import request
from backend.services.prediction_service import execute_prediction
from backend.utils.response import success_response, error_response

def handle_prediction():
    try:
        data = request.json or {}
        return success_response(data={'prediction': execute_prediction(data)})
    except Exception as e:
        return error_response('PREDICTION_ERROR', str(e), status_code=500)
