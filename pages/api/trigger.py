from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime
import sys
import os

# Add the api directory to the path to import utils
sys.path.insert(0, os.path.dirname(__file__))
from utils.cors import set_cors_headers

class handler(BaseHTTPRequestHandler):
    """
    Python API endpoint for ProSprint automation triggers.
    Manages event triggers, scheduled automations, and webhook handlers.
    """
    
    def do_GET(self):
        # Set response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        set_cors_headers(self)
        self.end_headers()
        
        # Get list of active triggers
        triggers = self._get_active_triggers()
        
        response = {
            "message": "Active triggers retrieved successfully",
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "trigger_count": len(triggers),
            "triggers": triggers
        }
        
        # Send JSON response
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
        set_cors_headers(self)
        self.end_headers()
        
        # Process trigger creation/update
        action = data.get('action', 'create')
        trigger_type = data.get('trigger_type', 'webhook')
        
        result = self._process_trigger_action(action, trigger_type, data)
        
        response = {
            "message": f"Trigger {action} processed successfully",
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "action": action,
            "trigger_type": trigger_type,
            "result": result
        }
        
        # Send JSON response
        self.wfile.write(json.dumps(response).encode())
        return
    
    def do_DELETE(self):
        # Set response headers
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        set_cors_headers(self)
        self.end_headers()
        
        # Parse query string for trigger ID
        # In a real implementation, parse path/query params
        response = {
            "message": "Trigger deletion processed",
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "action": "delete"
        }
        
        # Send JSON response
        self.wfile.write(json.dumps(response).encode())
        return
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        set_cors_headers(self)
        self.end_headers()
        return
    
    def _get_active_triggers(self):
        """
        Get list of active automation triggers.
        
        Integration stubs:
        - Webhook Service: External system webhooks
        - Scheduler: Cron-based time triggers
        - Event Bus: Real-time event subscriptions
        - CRM: Customer lifecycle events
        """
        
        return [
            {
                "id": "trg_001",
                "name": "New Customer Onboarding",
                "type": "crm_event",
                "event": "customer.created",
                "status": "active",
                "integration": "CRM",
                "action": "start_onboarding_workflow",
                "last_triggered": "2024-01-15T10:30:00",
                "trigger_count": 45
            },
            {
                "id": "trg_002",
                "name": "Daily Report Generation",
                "type": "scheduled",
                "schedule": "0 9 * * *",
                "status": "active",
                "integration": "Scheduler",
                "action": "generate_daily_report",
                "last_triggered": "2024-01-15T09:00:00",
                "trigger_count": 312
            },
            {
                "id": "trg_003",
                "name": "High-Value Lead Alert",
                "type": "webhook",
                "endpoint": "/webhooks/high-value-lead",
                "status": "active",
                "integration": "Webhook_Service",
                "action": "notify_sales_team",
                "last_triggered": "2024-01-15T14:22:00",
                "trigger_count": 23
            },
            {
                "id": "trg_004",
                "name": "Support Ticket Escalation",
                "type": "event",
                "event": "ticket.high_priority",
                "status": "active",
                "integration": "Event_Bus",
                "action": "escalate_to_manager",
                "last_triggered": "2024-01-15T11:45:00",
                "trigger_count": 8
            },
            {
                "id": "trg_005",
                "name": "Weekly Team Sync",
                "type": "scheduled",
                "schedule": "0 10 * * 1",
                "status": "active",
                "integration": "Slack",
                "action": "post_weekly_summary",
                "last_triggered": "2024-01-15T10:00:00",
                "trigger_count": 52
            }
        ]
    
    def _process_trigger_action(self, action, trigger_type, data):
        """
        Process trigger creation, update, or deletion.
        
        Integration stubs:
        - Webhook Service: Register/unregister webhook endpoints
        - Scheduler: Create/update cron jobs
        - Event Bus: Subscribe/unsubscribe to events
        - Email: Notification on trigger activation
        - Slack: Alert team when triggers fire
        """
        
        result = {
            "action_performed": action,
            "trigger_type": trigger_type
        }
        
        if action == "create":
            # Stub: Create new trigger
            trigger_id = f"trg_{int(datetime.now().timestamp())}"
            trigger_name = data.get('name', 'Unnamed Trigger')
            
            result.update({
                "trigger_id": trigger_id,
                "trigger_name": trigger_name,
                "status": "created",
                "integration_steps": [
                    {
                        "step": 1,
                        "integration": "Webhook_Service" if trigger_type == "webhook" else "Scheduler",
                        "action": "register_trigger",
                        "status": "completed"
                    },
                    {
                        "step": 2,
                        "integration": "Email",
                        "action": "send_confirmation",
                        "status": "queued",
                        "details": "Confirmation email will be sent to admin"
                    },
                    {
                        "step": 3,
                        "integration": "Slack",
                        "action": "notify_team",
                        "status": "queued",
                        "details": "Team notification about new trigger"
                    }
                ]
            })
            
        elif action == "update":
            # Stub: Update existing trigger
            trigger_id = data.get('trigger_id', 'trg_unknown')
            
            result.update({
                "trigger_id": trigger_id,
                "status": "updated",
                "updated_fields": list(data.get('updates', {}).keys()),
                "integration_steps": [
                    {
                        "integration": "Webhook_Service",
                        "action": "update_configuration",
                        "status": "completed"
                    }
                ]
            })
            
        elif action == "enable" or action == "disable":
            # Stub: Enable/disable trigger
            trigger_id = data.get('trigger_id', 'trg_unknown')
            
            result.update({
                "trigger_id": trigger_id,
                "status": f"{action}d",
                "integration_steps": [
                    {
                        "integration": "Event_Bus",
                        "action": f"{action}_subscription",
                        "status": "completed"
                    },
                    {
                        "integration": "Slack",
                        "action": "post_status_update",
                        "status": "queued"
                    }
                ]
            })
            
        elif action == "test":
            # Stub: Test trigger
            trigger_id = data.get('trigger_id', 'trg_unknown')
            
            result.update({
                "trigger_id": trigger_id,
                "test_status": "success",
                "test_execution": {
                    "triggered_at": datetime.now().isoformat(),
                    "response_time": "125ms",
                    "integration_checks": {
                        "webhook_endpoint": "reachable",
                        "event_bus": "connected",
                        "downstream_services": "healthy"
                    }
                }
            })
        
        # Stub: External API integration - Log trigger activity
        result["audit_log"] = {
            "integration": "External_API",
            "action": "log_trigger_activity",
            "status": "logged",
            "details": "Trigger activity logged to external audit system"
        }
        
        return result
