from backend.services.prediction_service import execute_prediction

def assess_disruption(raw_data: dict):
    pred = execute_prediction(raw_data)
    score = pred['risk_score']
    level = 'HIGH' if score > 0.7 else 'MEDIUM' if score > 0.4 else 'LOW'
    return {
        'predicted_disruption': pred['prediction'] == 1,
        'risk_score': score,
        'risk_level': level,
        'confidence': pred['confidence'],
        'contributions': pred.get('contributions', [])
    }
