from backend.services.rerouting_service import evaluate_routes

def run_route_agent(current_route, alternative_routes, disruption_assessment):
    routes = evaluate_routes(current_route, alternative_routes)
    alts = routes.get('alternative_routes', [])
    best_alt = alts[0] if alts else None
    return {
        'current_route': current_route,
        'alternatives': alts,
        'best_alternative': best_alt,
        'status': 'completed',
        'message': f'Evaluated {len(alts)} alternative routes'
    }
