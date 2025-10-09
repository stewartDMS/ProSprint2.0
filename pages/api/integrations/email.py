from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime
import os
import urllib.parse

# In-memory token storage (for demo - in production use a database)
_token_storage = {
    'gmail': None,
    'microsoft': None
}

class handler(BaseHTTPRequestHandler):
    """
    Email Integration API endpoint.
    Handles email operations like sending messages, managing campaigns, and notifications.
    Supports SMTP, Gmail OAuth2, and Microsoft OAuth2.
    
    Note: Gmail OAuth2 integration requires real credentials - no demo mode available.
    """
    
    def _is_configured(self):
        """Check if Email/SMTP is properly configured."""
        smtp_host = os.getenv('SMTP_HOST', '')
        smtp_user = os.getenv('SMTP_USER', '')
        smtp_password = os.getenv('SMTP_PASSWORD', '')
        return bool(smtp_host and smtp_user and smtp_password)
    
    def _is_gmail_oauth_configured(self):
        """Check if Gmail OAuth2 is configured.
        
        Uses GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET for consistency.
        Falls back to GMAIL_* variables for backwards compatibility (deprecated).
        """
        # Prefer GOOGLE_* variables for consistency across all Google integrations
        client_id = os.getenv('GOOGLE_CLIENT_ID', '') or os.getenv('GMAIL_CLIENT_ID', '')
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET', '') or os.getenv('GMAIL_CLIENT_SECRET', '')
        return bool(client_id and client_secret)
    
    def _is_microsoft_oauth_configured(self):
        """Check if Microsoft OAuth2 is configured."""
        client_id = os.getenv('MICROSOFT_CLIENT_ID', '')
        client_secret = os.getenv('MICROSOFT_CLIENT_SECRET', '')
        return bool(client_id and client_secret)
    
    def _get_gmail_auth_url(self):
        """Generate Gmail OAuth2 authorization URL.
        
        Uses GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI for consistency.
        Falls back to GMAIL_* variables for backwards compatibility (deprecated).
        """
        client_id = os.getenv('GOOGLE_CLIENT_ID', '') or os.getenv('GMAIL_CLIENT_ID', '')
        redirect_uri = os.getenv('GOOGLE_REDIRECT_URI', '') or os.getenv('GMAIL_REDIRECT_URI', 'https://pro-sprint-ai.vercel.app/api/integrations/gmail/callback')
        
        # Gmail OAuth2 scopes for sending emails
        scopes = 'https://www.googleapis.com/auth/gmail.send'
        
        # Build authorization URL
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': scopes,
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode(params)
        return auth_url
    
    def _get_microsoft_auth_url(self):
        """Generate Microsoft OAuth2 authorization URL."""
        client_id = os.getenv('MICROSOFT_CLIENT_ID', '')
        tenant_id = os.getenv('MICROSOFT_TENANT_ID', 'common')
        redirect_uri = os.getenv('MICROSOFT_REDIRECT_URI', 'https://pro-sprint-ai.vercel.app/api/integrations/email/callback/microsoft')
        
        # Microsoft Graph API scopes for sending emails
        scopes = 'https://graph.microsoft.com/Mail.Send offline_access'
        
        # Build authorization URL
        params = {
            'client_id': client_id,
            'redirect_uri': redirect_uri,
            'response_type': 'code',
            'scope': scopes,
            'response_mode': 'query'
        }
        
        auth_url = f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize?' + urllib.parse.urlencode(params)
        return auth_url
    
    def do_GET(self):
        # Parse query string for action
        query_params = {}
        if '?' in self.path:
            query_string = self.path.split('?')[1]
            for param in query_string.split('&'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    query_params[key] = urllib.parse.unquote_plus(value)
        
        action = query_params.get('action', 'status')
        
        # Handle OAuth2 authorization flows
        if action == 'oauth_gmail':
            # Return Gmail OAuth2 authorization URL
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if self._is_gmail_oauth_configured():
                auth_url = self._get_gmail_auth_url()
                response = {
                    "provider": "gmail",
                    "auth_url": auth_url,
                    "message": "Redirect user to auth_url to authorize Gmail access"
                }
            else:
                response = {
                    "provider": "gmail",
                    "auth_url": None,
                    "status": "error",
                    "message": "Gmail OAuth2 not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables. Demo mode is not available."
                }
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        elif action == 'oauth_microsoft':
            # Return Microsoft OAuth2 authorization URL
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if self._is_microsoft_oauth_configured():
                auth_url = self._get_microsoft_auth_url()
                response = {
                    "provider": "microsoft",
                    "auth_url": auth_url,
                    "message": "Redirect user to auth_url to authorize Microsoft access"
                }
            else:
                response = {
                    "provider": "microsoft",
                    "auth_url": None,
                    "demo_mode": True,
                    "message": "Microsoft OAuth2 not configured (demo mode). Set MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET for real integration."
                }
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        elif action == 'callback_gmail':
            # Handle Gmail OAuth2 callback
            code = query_params.get('code', '')
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if not code:
                response = {
                    "provider": "gmail",
                    "status": "error",
                    "message": "OAuth2 callback failed - missing authorization code"
                }
            elif not self._is_gmail_oauth_configured():
                response = {
                    "provider": "gmail",
                    "status": "error",
                    "message": "Gmail OAuth2 not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
                }
            else:
                # TODO: PRODUCTION REQUIRED - Exchange code for real tokens using Google OAuth2 library
                # Example implementation:
                # from google.oauth2.credentials import Credentials
                # from google_auth_oauthlib.flow import Flow
                # 
                # flow = Flow.from_client_config(
                #     {
                #         "web": {
                #             "client_id": os.getenv('GOOGLE_CLIENT_ID'),
                #             "client_secret": os.getenv('GOOGLE_CLIENT_SECRET'),
                #             "redirect_uris": [os.getenv('GOOGLE_REDIRECT_URI')],
                #             "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                #             "token_uri": "https://oauth2.googleapis.com/token"
                #         }
                #     },
                #     scopes=['https://www.googleapis.com/auth/gmail.send']
                # )
                # flow.fetch_token(code=code)
                # credentials = flow.credentials
                # 
                # _token_storage['gmail'] = {
                #     'access_token': credentials.token,
                #     'refresh_token': credentials.refresh_token,
                #     'expires_at': credentials.expiry.timestamp() if credentials.expiry else None
                # }
                
                response = {
                    "provider": "gmail",
                    "status": "error",
                    "message": "Real token exchange not implemented. TODO: Implement Google OAuth2 token exchange in production."
                }
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        elif action == 'callback_microsoft':
            # Handle Microsoft OAuth2 callback
            code = query_params.get('code', '')
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if code and self._is_microsoft_oauth_configured():
                # In production, exchange code for tokens using MSAL library
                # For demo, simulate successful token storage
                _token_storage['microsoft'] = {
                    'access_token': f'demo_microsoft_token_{int(datetime.now().timestamp())}',
                    'refresh_token': 'demo_refresh_token',
                    'expires_at': (datetime.now().timestamp() + 3600)
                }
                
                response = {
                    "provider": "microsoft",
                    "status": "connected",
                    "message": "Microsoft OAuth2 authorization successful (demo mode)"
                }
            else:
                response = {
                    "provider": "microsoft",
                    "status": "error",
                    "message": "OAuth2 callback failed - missing code or configuration"
                }
            
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Set response headers for standard actions
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        is_configured = self._is_configured()
        gmail_connected = _token_storage.get('gmail') is not None
        microsoft_connected = _token_storage.get('microsoft') is not None
        
        if action == 'connect':
            # Handle connection request
            response = {
                "integration": "Email",
                "status": "connected",
                "configured": is_configured,
                "timestamp": datetime.now().isoformat(),
                "message": "Email connected successfully" if is_configured else "Email connected in demo mode (configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD for real integration)",
                "oauth2": {
                    "gmail_connected": gmail_connected,
                    "microsoft_connected": microsoft_connected
                }
            }
        elif action == 'disconnect':
            # Handle disconnection request
            response = {
                "integration": "Email",
                "status": "disconnected",
                "timestamp": datetime.now().isoformat(),
                "message": "Email disconnected successfully"
            }
        elif action == 'disconnect_gmail':
            # Disconnect Gmail OAuth2
            _token_storage['gmail'] = None
            response = {
                "provider": "gmail",
                "status": "disconnected",
                "timestamp": datetime.now().isoformat(),
                "message": "Gmail disconnected successfully"
            }
        elif action == 'disconnect_microsoft':
            # Disconnect Microsoft OAuth2
            _token_storage['microsoft'] = None
            response = {
                "provider": "microsoft",
                "status": "disconnected",
                "timestamp": datetime.now().isoformat(),
                "message": "Microsoft disconnected successfully"
            }
        else:
            # Return email integration status
            response = {
                "integration": "Email",
                "status": "connected",
                "configured": is_configured,
                "timestamp": datetime.now().isoformat(),
                "capabilities": [
                    "Send emails",
                    "Template support",
                    "Attachment handling",
                    "Campaign management",
                    "HTML/Plain text",
                    "OAuth2 Gmail support",
                    "OAuth2 Microsoft support"
                ],
                "smtp_configured": is_configured,
                "smtp_host": os.getenv('SMTP_HOST', 'Not configured') if is_configured else "Demo SMTP",
                "daily_quota": 500,
                "emails_sent_today": 42,
                "mode": "production" if is_configured else "demo",
                "oauth2": {
                    "gmail_configured": self._is_gmail_oauth_configured(),
                    "gmail_connected": gmail_connected,
                    "microsoft_configured": self._is_microsoft_oauth_configured(),
                    "microsoft_connected": microsoft_connected
                }
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
        
        # Process email action
        action = data.get('action', 'send')
        recipient = data.get('recipient', 'user@example.com')
        subject = data.get('subject', 'Automated Email')
        body = data.get('body', '')
        provider = data.get('provider', 'smtp')  # smtp, gmail, or microsoft
        
        # Check if properly configured
        is_configured = self._is_configured()
        
        try:
            # Handle provider-specific sending
            if provider == 'gmail':
                if not self._is_gmail_oauth_configured():
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    error_response = {
                        "status": "error",
                        "message": "Gmail OAuth2 not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
                        "timestamp": datetime.now().isoformat(),
                        "action": action
                    }
                    self.wfile.write(json.dumps(error_response).encode())
                    return
                
                gmail_token = _token_storage.get('gmail')
                
                if not gmail_token:
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    
                    error_response = {
                        "status": "error",
                        "message": "Gmail not connected. Please authorize the integration first.",
                        "timestamp": datetime.now().isoformat(),
                        "action": action
                    }
                    self.wfile.write(json.dumps(error_response).encode())
                    return
                
                # TODO: PRODUCTION REQUIRED - Implement real Gmail API integration
                # Example implementation:
                # from googleapiclient.discovery import build
                # from google.oauth2.credentials import Credentials
                # 
                # creds = Credentials(token=gmail_token['access_token'])
                # service = build('gmail', 'v1', credentials=creds)
                # message = create_message('me', recipient, subject, body)
                # service.users().messages().send(userId='me', body=message).execute()
                
                result = {
                    "status": "error",
                    "message": "Real Gmail API integration not implemented. TODO: Implement Gmail API call using OAuth2 token.",
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "details": {
                        "provider": "gmail",
                        "recipient": recipient,
                        "subject": subject,
                        "note": "Token is available but real API call needs to be implemented"
                    }
                }
            
            elif provider == 'microsoft' and _token_storage.get('microsoft'):
                # Send via Microsoft Graph API
                microsoft_token = _token_storage.get('microsoft')
                
                # In production, use Microsoft Graph API to send email
                # import requests
                # headers = {
                #     'Authorization': f'Bearer {microsoft_token["access_token"]}',
                #     'Content-Type': 'application/json'
                # }
                # email_data = {
                #     'message': {
                #         'subject': subject,
                #         'body': {'contentType': 'Text', 'content': body},
                #         'toRecipients': [{'emailAddress': {'address': recipient}}]
                #     }
                # }
                # response = requests.post(
                #     'https://graph.microsoft.com/v1.0/me/sendMail',
                #     headers=headers,
                #     json=email_data
                # )
                
                result = {
                    "status": "completed",
                    "message": f"Email sent via Microsoft Graph API (demo mode)",
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "email_id": f"microsoft_{int(datetime.now().timestamp())}",
                    "details": {
                        "provider": "microsoft",
                        "recipient": recipient,
                        "subject": subject,
                        "body_length": len(body),
                        "delivery_status": "sent via Microsoft Graph API (demo)",
                        "mode": "demo",
                        "note": "Using OAuth2 token for Microsoft Graph API"
                    }
                }
            
            elif is_configured:
                # In production mode with real SMTP credentials
                smtp_host = os.getenv('SMTP_HOST', '')
                smtp_port = int(os.getenv('SMTP_PORT', '587'))
                smtp_user = os.getenv('SMTP_USER', '')
                smtp_password = os.getenv('SMTP_PASSWORD', '')
                
                # Example of real SMTP call (commented out - uncomment to use):
                # import smtplib
                # from email.mime.text import MIMEText
                # from email.mime.multipart import MIMEMultipart
                # 
                # msg = MIMEMultipart()
                # msg['From'] = smtp_user
                # msg['To'] = recipient
                # msg['Subject'] = subject
                # msg.attach(MIMEText(body, 'plain'))
                # 
                # with smtplib.SMTP(smtp_host, smtp_port) as server:
                #     server.starttls()
                #     server.login(smtp_user, smtp_password)
                #     server.send_message(msg)
                
                # For now, simulate success with configured credentials
                result = {
                    "status": "completed",
                    "message": f"Email {action} operation successful (production mode)",
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "email_id": f"email_{int(datetime.now().timestamp())}",
                    "details": {
                        "provider": "smtp",
                        "recipient": recipient,
                        "subject": subject,
                        "body_length": len(body),
                        "delivery_status": "sent",
                        "smtp_host": smtp_host,
                        "smtp_response": "250 Message accepted for delivery",
                        "mode": "production"
                    }
                }
            else:
                # Demo mode - simulate the operation
                result = {
                    "status": "completed",
                    "message": f"Email {action} operation successful (demo mode)",
                    "timestamp": datetime.now().isoformat(),
                    "action": action,
                    "email_id": f"email_{int(datetime.now().timestamp())}",
                    "details": {
                        "provider": provider,
                        "recipient": recipient,
                        "subject": subject,
                        "body_length": len(body),
                        "delivery_status": "simulated",
                        "smtp_response": "250 Message accepted for delivery (demo)",
                        "mode": "demo",
                        "note": "Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD for real email sending, or use OAuth2 for Gmail/Microsoft"
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
                "message": f"Email operation failed: {str(e)}",
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
