from flask import Flask
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from backend.config.config import Config
from backend.routes.health_routes import health_bp
from backend.routes.prediction_routes import prediction_bp
from backend.routes.route_routes import route_bp
from backend.controllers.route_controller import handle_analyze
from backend.utils.logger import get_logger
from backend.utils.response import success_response, error_response

logger = get_logger(__name__)

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    CORS(app, resources={
        r"/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://route-shield-eight.vercel.app"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    app.config.from_object(Config)
    
    @app.route('/', methods=['GET'])
    def root_health():
        return success_response(
            data={'status': 'healthy'},
            message='RouteShield API is running'
        )

    app.register_blueprint(health_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(route_bp)
    
    from backend.routes.saved_routes_bp import saved_routes_bp
    app.register_blueprint(saved_routes_bp)

    from backend.routes.safety_routes import safety_bp
    app.register_blueprint(safety_bp)

    from backend.routes.rag_routes import rag_bp
    app.register_blueprint(rag_bp)

    app.add_url_rule('/api/analyze', view_func=handle_analyze, methods=['POST'], strict_slashes=False)
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return error_response(code=e.name.upper().replace(' ', '_'), message=e.description, status_code=e.code)

    @app.errorhandler(Exception)
    def global_error(e):
        logger.error(f'Error: {e}')
        return error_response('INTERNAL_ERROR', str(e), status_code=500)
        
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=Config.PORT)
