"""Email integration module."""

from typing import Any
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from prosprint.config import config


class EmailIntegration:
    """Integration with email systems."""

    def __init__(self):
        """Initialize email integration."""
        self.smtp_host = config.smtp_host
        self.smtp_port = int(config.smtp_port)
        self.smtp_user = config.smtp_user
        self.smtp_password = config.smtp_password

    def execute(self, action) -> dict[str, Any]:
        """
        Execute an email action.
        
        Args:
            action: Action object with email parameters
            
        Returns:
            Result dictionary
        """
        recipient = action.parameters.get("recipient", "")
        subject = action.parameters.get("subject", "ProSprint AI Notification")
        body = action.parameters.get("body", "")

        if not all([self.smtp_host, self.smtp_user, self.smtp_password]):
            return {
                "status": "simulated",
                "message": f"Email simulated (no SMTP configured): {subject} to {recipient}",
                "recipient": recipient,
                "subject": subject
            }

        try:
            # Create message
            message = MIMEMultipart()
            message["From"] = self.smtp_user
            message["To"] = recipient
            message["Subject"] = subject
            message.attach(MIMEText(body, "plain"))

            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)

            return {
                "status": "completed",
                "message": f"Email sent to {recipient}",
                "recipient": recipient,
                "subject": subject
            }

        except Exception as e:
            raise Exception(f"Failed to send email: {str(e)}")
