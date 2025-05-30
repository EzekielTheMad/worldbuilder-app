from flask import Flask, jsonify, session
from flask_cors import CORS
import os
from datetime import timedelta
import sys

# Fix the path more explicitly for Docker
if '/app' not in sys.path:
    sys.path.insert(0, '/app')

app = Flask(__name__)

# Configure app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Configure CORS
CORS(app, 
     origins=os.getenv('ALLOWED_ORIGINS', '*').split(','),
     supports_credentials=True)

# Import and register blueprints with error handling
try:
    from api.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    print("Auth blueprint registered successfully")
except ImportError as e:
    print(f"Warning: Could not import auth blueprint: {e}")

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'environment': os.getenv('ENVIRONMENT', 'development'),
        'version': '0.1.0'
    })

@app.route('/')
def index():
    return jsonify({
        'message': 'World Builder API',
        'endpoints': {
            'health': '/health',
            'auth': {
                'login': '/api/auth/discord',
                'callback': '/api/auth/discord/callback',
                'logout': '/api/auth/logout',
                'me': '/api/auth/me'
            }
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=os.getenv('ENVIRONMENT') == 'development')