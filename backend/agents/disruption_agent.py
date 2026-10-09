from backend.services.disruption_service import assess_disruption
from backend.services.explanation_service import explain_prediction

def run_disruption_agent(data):
    assessment = assess_disruption(data)
    explanation = explain_prediction(data, assessment)
    needs_intervention = assessment['risk_level'] in ['HIGH', 'MEDIUM']
    return {
        'assessment': assessment,
        'explanation': explanation,
        'needs_intervention': needs_intervention,
        'status': 'completed',
        'message': f"Disruption risk assessed as {assessment['risk_level']}"
    }
