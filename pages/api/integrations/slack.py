from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    """
    Slack Integration API endpoint.
    Handles Slack operations like posting messages, direct messages, and notifications.
    """
    
    def do_GET(self):
        # Set response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Return Slack integration status
        response = {
            "integration": "Slack",
            "status": "connected",
            "timestamp": datetime.now().isoformat(),
            "capabilities": [
                "Post to channels",
                "Direct messages",
                "Rich formatting",
                "File uploads",
                "Thread replies"
            ],
            "workspace": "Demo Workspace",
            "bot_name": "ProSprint Bot",
            "available_channels": ["#general", "#ops", "#dev", "#alerts"]
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
        
        # Process Slack action
        action = data.get('action', 'post_message')
        channel = data.get('channel', '#general')
        message = data.get('message', '')
        
        # Demo: Simulate Slack posting
        result = {
            "status": "completed",
            "message": f"Slack {action} operation successful",
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "message_id": f"slack_{int(datetime.now().timestamp())}",
            "details": {
                "channel": channel,
                "message_length": len(message),
                "workspace": "Demo Workspace",
                "posted_by": "ProSprint Bot",
                "permalink": f"https://demo.slack.com/archives/C12345/{int(datetime.now().timestamp())}"
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
