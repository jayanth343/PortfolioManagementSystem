
from flask import Flask
from flask_cors import CORS
from services.stock_service import register_routes


def create_app():
    app = Flask(__name__)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    

    register_routes(app)
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return {'status': 'healthy', 'service': 'Portfolio Management API'}, 200
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Resource not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Internal server error: {str(error)}')
        return {'error': 'Internal server error'}, 500
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
