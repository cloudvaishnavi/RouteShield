def run_decision_agent(disruption_result, route_result):
    if disruption_result.get('needs_intervention') and route_result.get('best_alternative'):
        return {
            'action': 'REROUTE',
            'recommended_route': route_result['best_alternative'],
            'reason': 'High disruption risk; alternative route exists.',
            'risk_reduction': 0.35,
            'eta_difference_minutes': 15,
            'distance_difference_km': 10,
            'status': 'completed',
            'message': 'Decision made to reroute'
        }
    return {
        'action': 'STAY',
        'recommended_route': route_result.get('current_route'),
        'reason': 'Risk acceptable or no alternative.',
        'risk_reduction': 0.0,
        'eta_difference_minutes': 0,
        'distance_difference_km': 0,
        'status': 'completed',
        'message': 'Decision made to stay'
    }
