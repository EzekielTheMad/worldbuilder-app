# Create auth.py in the backend/api directory

from flask import Blueprint, request, jsonify, redirect, session
import requests
import os
from datetime import datetime
import secrets

bp = Blueprint('auth', __name__)

DISCORD_CLIENT_ID = os.getenv('DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET')
DISCORD_REDIRECT_URI = os.getenv('DISCORD_REDIRECT_URI', 'https://worldbuilder.app/auth/discord/callback')
DISCORD_API_BASE = 'https://discord.com/api/v10'

@bp.route('/discord')
def discord_login():
    """Redirect to Discord OAuth"""
    state = secrets.token_urlsafe(16)
    session['oauth_state'] = state
    
    params = {
        'client_id': DISCORD_CLIENT_ID,
        'redirect_uri': DISCORD_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'identify email',
        'state': state
    }
    
    discord_auth_url = f"https://discord.com/api/oauth2/authorize?" + "&".join([f"{k}={v}" for k, v in params.items()])
    return redirect(discord_auth_url)

@bp.route('/discord/callback')
def discord_callback():
    """Handle Discord OAuth callback"""
    code = request.args.get('code')
    state = request.args.get('state')
    
    # Verify state
    if state != session.get('oauth_state'):
        return jsonify({'error': 'Invalid state parameter'}), 400
    
    if not code:
        return jsonify({'error': 'No code provided'}), 400
    
    # Exchange code for token
    token_data = {
        'client_id': DISCORD_CLIENT_ID,
        'client_secret': DISCORD_CLIENT_SECRET,
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': DISCORD_REDIRECT_URI
    }
    
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    token_response = requests.post(
        f"{DISCORD_API_BASE}/oauth2/token",
        data=token_data,
        headers=headers
    )
    
    if token_response.status_code != 200:
        return jsonify({'error': 'Failed to get token'}), 400
    
    tokens = token_response.json()
    access_token = tokens['access_token']
    
    # Get user info
    user_headers = {
        'Authorization': f"Bearer {access_token}"
    }
    
    user_response = requests.get(
        f"{DISCORD_API_BASE}/users/@me",
        headers=user_headers
    )
    
    if user_response.status_code != 200:
        return jsonify({'error': 'Failed to get user info'}), 400
    
    discord_user = user_response.json()
    
    # Here you would normally:
    # 1. Check if user exists in database
    # 2. Create user if not exists
    # 3. Create session/JWT token
    # 4. Redirect to frontend with token
    
    # For now, let's redirect with user info
    frontend_url = os.getenv('PUBLIC_URL', 'https://worldbuilder.app')
    
    # In production, you'd create a JWT token here
    # For now, we'll just redirect with success
    return redirect(f"{frontend_url}/dashboard?login=success&user={discord_user['username']}")

@bp.route('/logout')
def logout():
    """Logout user"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@bp.route('/me')
def get_current_user():
    """Get current user info"""
    # This would check JWT/session and return user info
    # For now, return mock data
    return jsonify({
        'id': session.get('user_id'),
        'username': session.get('username'),
        'authenticated': 'user_id' in session
    })
