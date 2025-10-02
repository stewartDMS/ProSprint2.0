from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    """
    CRM Integration API endpoint.
    Handles CRM operations like updating contacts, deals, and companies.
    """
    
    def do_GET(self):
        # Set response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Return CRM integration status
        response = {
            "integration": "CRM",
            "status": "connected",
            "timestamp": datetime.now().isoformat(),
            "capabilities": [
                "Update contacts",
                "Manage deals",
                "Sync companies",
                "Custom field updates"
            ],
            "connected_platform": "Demo CRM",
            "last_sync": datetime.now().isoformat()
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
        
        # Set response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Process CRM action
        action = data.get('action', 'unknown')
        entity_type = data.get('entity_type', 'contact')
        entity_data = data.get('data', {})
        
        # Demo: Simulate CRM update
        result = {
            "status": "completed",
            "message": f"CRM {action} operation successful",
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "entity_type": entity_type,
            "entity_id": f"{entity_type}_{int(datetime.now().timestamp())}",
            "details": {
                "platform": "Demo CRM",
                "operation": action,
                "affected_records": 1,
                "data_updated": entity_data
            }
        }
        
        self.wfile.write(json.dumps(result).encode())
        return
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        return
