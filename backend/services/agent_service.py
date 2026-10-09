from backend.agents.disruption_agent import run_disruption_agent
from backend.agents.route_agent import run_route_agent
from backend.agents.decision_agent import run_decision_agent

def execute_workflow(data):
    steps = []
    d_res = run_disruption_agent(data.get('logistics_data', {}))
    steps.append({'agent': 'Disruption Agent', 'status': d_res['status'], 'message': d_res['message']})
    
    r_res = run_route_agent(data.get('current_route', {}), data.get('alternative_routes', []), d_res['assessment'])
    steps.append({'agent': 'Route Agent', 'status': r_res['status'], 'message': r_res['message']})
    
    dec_res = run_decision_agent(d_res, r_res)
    steps.append({'agent': 'Decision Agent', 'status': dec_res['status'], 'message': dec_res['message']})
    
    return {
        'success': True,
        'prediction': d_res['assessment'],
        'explanation': d_res['explanation'],
        'route_analysis': {
            'current_route': r_res['current_route'],
            'alternative_routes': r_res['alternatives'],
            'route_geometry': data.get('current_route', {}).get('route_geometry'),
            'origin': data.get('current_route', {}).get('route_origin_data'),
            'destination': data.get('current_route', {}).get('route_destination_data'),
            'duration_minutes': data.get('current_route', {}).get('duration_minutes')
        },
        'recommendation': {
            'action': dec_res['action'],
            'recommended_route': dec_res['recommended_route'],
            'reason': dec_res['reason'],
            'risk_reduction': dec_res['risk_reduction']
        },
        'agent': {'status': 'completed', 'steps': steps}
    }
