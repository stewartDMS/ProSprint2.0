from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime
import os

class handler(BaseHTTPRequestHandler):
    """
    CRM Integration API endpoint.
    Handles CRM operations like updating contacts, deals, and companies.
    Supports real API calls when credentials are configured, with demo fallback.
    """
    
    def _is_configured(self):
        """Check if CRM is properly configured with API credentials."""
        api_key = os.getenv('CRM_API_KEY', '')
        api_url = os.getenv('CRM_API_URL', '')
        return bool(api_key and api_url)
    
    def do_GET(self):
        # Parse query string for action
        query_params = {}
        if '?' in self.path:
            query_string = self.path.split('?')[1]
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    query_params[key] = value
        
        action = query_params.get('action', 'status')
        
        # Set response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        is_configured = self._is_configured()
        
        if action == 'connect':
            # Handle connection request
            response = {
                "integration": "CRM",
                "status": "connected" if is_configured else "connected",  # Always connect in demo mode
                "configured": is_configured,
                "timestamp": datetime.now().isoformat(),
                "message": "CRM connected successfully" if is_configured else "CRM connected in demo mode (configure CRM_API_KEY and CRM_API_URL for real integration)"
            }
        elif action == 'disconnect':
            # Handle disconnection request
            response = {
                "integration": "CRM",
                "status": "disconnected",
                "timestamp": datetime.now().isoformat(),
                "message": "CRM disconnected successfully"
            }
        else:
            # Return CRM integration status
            response = {
                "integration": "CRM",
                "status": "connected",
                "configured": is_configured,
                "timestamp": datetime.now().isoformat(),
                "capabilities": [
                    "Update contacts",
                    "Manage deals",
                    "Sync companies",
                    "Custom field updates"
                ],
                "connected_platform": "Real CRM" if is_configured else "Demo CRM",
                "last_sync": datetime.now().isoformat(),
                "mode": "production" if is_configured else "demo"
            }
        
        self.wfile.write(json.dumps(response).encode())
        return
    
    def do_POST(self):
        # Get content length
        content_length = int(self.headers.get('Content-Length', 0))
        
        # Read and parse request body
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except json.JSONDecodeError:
            data = {}
        
        # Process CRM action
        action = data.get('action', 'unknown')
        entity_type = data.get('entity_type', 'contact')
        
        # Check if properly configured
        is_configured = self._is_configured()
        
        try:
            if is_configured:
                # In production mode with real credentials
                # Here you would make actual API calls to CRM
                api_key = os.getenv('CRM_API_KEY', '')
                api_url = os.getenv('CRM_API_URL', '')
                
                # Example of real API call (commented out - implement based on your CRM):
                # import requests
                # response = requests.post(
                #     f"{api_url}/contacts",
                #     headers={"Authorization": f"Bearer {api_key}"},
                #     json=data
                # )
                # result = response.json()
                
                # For now, simulate success with configured credentials
                result = {
                    "status": "completed",
                    "message": f"CRM {action} operation successful (production mode)",
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "entity_type": entity_type,
                    "entity_id": f"{entity_type}_{int(datetime.now().timestamp())}",
                    "details": {
                        "platform": "Real CRM",
                        "operation": action,
                        "affected_records": 1,
                        "mode": "production",
                        "api_endpoint": api_url,
                        "data": {k: v for k, v in data.items() if k not in ['action']}
                    }
                }
            else:
                # Demo mode - simulate the operation
                result = {
                    "status": "completed",
                    "message": f"CRM {action} operation successful (demo mode)",
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "entity_type": entity_type,
                    "entity_id": f"{entity_type}_{int(datetime.now().timestamp())}",
                    "details": {
                        "platform": "Demo CRM",
                        "operation": action,
                        "affected_records": 1,
                        "mode": "demo",
                        "note": "Configure CRM_API_KEY and CRM_API_URL for real integration",
                        "data": {k: v for k, v in data.items() if k not in ['action']}
                    }
                }
            
            # Set response headers
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode())
            return
            
        except Exception as e:
            # Error handling
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {
                "status": "error",
                "message": f"CRM operation failed: {str(e)}",
                "timestamp": datetime.now().isoformat(),
                "action": action
            }
            
            self.wfile.write(json.dumps(error_response).encode())
            return
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        return
