from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    """
    Email Integration API endpoint.
    Handles email operations like sending messages, managing campaigns, and notifications.
    """
    
    def do_GET(self):
        # Set response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Return email integration status
        response = {
            "integration": "Email",
            "status": "connected",
            "timestamp": datetime.now().isoformat(),
            "capabilities": [
                "Send emails",
                "Template support",
                "Attachment handling",
                "Campaign management",
                "HTML/Plain text"
            ],
            "smtp_configured": True,
            "daily_quota": 500,
            "emails_sent_today": 42
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
        
        # Process email action
        action = data.get('action', 'send')
        recipient = data.get('recipient', 'user@example.com')
        subject = data.get('subject', 'Automated Email')
        body = data.get('body', '')
        
        # Demo: Simulate email sending
        result = {
            "status": "completed",
            "message": f"Email {action} operation successful",
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "email_id": f"email_{int(datetime.now().timestamp())}",
            "details": {
                "recipient": recipient,
                "subject": subject,
                "body_length": len(body),
                "delivery_status": "sent",
                "smtp_response": "250 Message accepted for delivery"
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
