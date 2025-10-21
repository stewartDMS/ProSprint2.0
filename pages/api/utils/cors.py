"""
CORS (Cross-Origin Resource Sharing) Utility for Python API Routes

Provides centralized CORS configuration for Python-based API endpoints.
Supports configurable allowed origins for production deployments.

Environment Variables:
- ALLOWED_ORIGINS: Comma-separated list of allowed origins
- NEXT_PUBLIC_BASE_URL: Base URL for the application (used as fallback)

Usage:
    from utils.cors import set_cors_headers
    
    def do_GET(self):
        set_cors_headers(self)
        # ... rest of handler
"""

import os


def get_allowed_origin():
    """
    Get allowed origin from environment variables.
    Falls back to wildcard if not configured.
    
    Returns:
        str: Allowed origin value for Access-Control-Allow-Origin header
    """
    # Check for explicit ALLOWED_ORIGINS configuration
    allowed_origins_env = os.environ.get('ALLOWED_ORIGINS', '')
    if allowed_origins_env:
        origins = [origin.strip() for origin in allowed_origins_env.split(',')]
        # For simplicity, use first origin if multiple are specified
        # In production, you'd check the request Origin header
        return origins[0] if origins else '*'
    
    # Check for NEXT_PUBLIC_BASE_URL as fallback
    base_url = os.environ.get('NEXT_PUBLIC_BASE_URL', '')
    if base_url:
        return base_url
    
    # Default to wildcard for development/demo
    return '*'


def set_cors_headers(handler):
    """
    Set CORS headers on a Python API handler response.
    
    Args:
        handler: BaseHTTPRequestHandler instance
    """
    allowed_origin = get_allowed_origin()
    
    handler.send_header('Access-Control-Allow-Origin', allowed_origin)
    handler.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    handler.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    handler.send_header('Access-Control-Max-Age', '86400')
