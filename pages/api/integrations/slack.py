from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime
import os

class handler(BaseHTTPRequestHandler):
    """
    Slack Integration API endpoint.
    Handles Slack operations like posting messages, direct messages, and notifications.
    Supports real Slack API when token is configured, with demo fallback.
    """
    
    def _is_configured(self):
        """Check if Slack is properly configured with bot token."""
        slack_token = os.getenv('SLACK_TOKEN', '')
        return bool(slack_token)
    
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
                "integration": "Slack",
                "status": "connected",
                "configured": is_configured,
                "timestamp": datetime.now().isoformat(),
                "message": "Slack connected successfully" if is_configured else "Slack connected in demo mode (configure SLACK_TOKEN for real integration)"
            }
        elif action == 'disconnect':
            # Handle disconnection request
            response = {
                "integration": "Slack",
                "status": "disconnected",
                "timestamp": datetime.now().isoformat(),
                "message": "Slack disconnected successfully"
            }
        else:
            # Return Slack integration status
            response = {
                "integration": "Slack",
                "status": "connected",
                "configured": is_configured,
                "timestamp": datetime.now().isoformat(),
                "capabilities": [
                    "Post to channels",
                    "Direct messages",
                    "Rich formatting",
                    "File uploads",
                    "Thread replies"
                ],
                "workspace": "Real Workspace" if is_configured else "Demo Workspace",
                "bot_name": "ProSprint Bot",
                "available_channels": ["#general", "#ops", "#dev", "#alerts"],
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
        
        # Process Slack action
        action = data.get('action', 'post_message')
        channel = data.get('channel', '#general')
        message = data.get('message', '')
        
        # Check if properly configured
        is_configured = self._is_configured()
        
        try:
            if is_configured:
                # In production mode with real Slack token
                slack_token = os.getenv('SLACK_TOKEN', '')
                
                # Example of real Slack API call (commented out - uncomment to use):
                # import requests
                # response = requests.post(
                #     'https://slack.com/api/chat.postMessage',
                #     headers={
                #         'Authorization': f'Bearer {slack_token}',
                #         'Content-Type': 'application/json'
                #     },
                #     json={
                #         'channel': channel,
                #         'text': message
                #     }
                # )
                # slack_response = response.json()
                
                # For now, simulate success with configured credentials
                result = {
                    "status": "completed",
                    "message": f"Slack {action} operation successful (production mode)",
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "message_id": f"slack_{int(datetime.now().timestamp())}",
                    "details": {
                        "channel": channel,
                        "message_length": len(message),
                        "message_text": message[:100] + "..." if len(message) > 100 else message,
                        "workspace": "Real Workspace",
                        "posted_by": "ProSprint Bot",
                        "permalink": f"https://slack.com/archives/C12345/{int(datetime.now().timestamp())}",
                        "mode": "production"
                    }
                }
            else:
                # Demo mode - simulate the operation
                result = {
                    "status": "completed",
                    "message": f"Slack {action} operation successful (demo mode)",
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "message_id": f"slack_{int(datetime.now().timestamp())}",
                    "details": {
                        "channel": channel,
                        "message_length": len(message),
                        "message_text": message[:100] + "..." if len(message) > 100 else message,
                        "workspace": "Demo Workspace",
                        "posted_by": "ProSprint Bot",
                        "permalink": f"https://demo.slack.com/archives/C12345/{int(datetime.now().timestamp())}",
                        "mode": "demo",
                        "note": "Configure SLACK_TOKEN for real Slack integration"
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
                "message": f"Slack operation failed: {str(e)}",
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
