"""Configuration management for ProSprint AI."""

import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration class for ProSprint AI."""

    def __init__(self):
        """Initialize configuration from environment variables."""
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        
        # Integration credentials
        self.slack_token = os.getenv("SLACK_TOKEN", "")
        self.slack_channel = os.getenv("SLACK_CHANNEL", "")
        
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = os.getenv("SMTP_PORT", "587")
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        
        self.crm_api_key = os.getenv("CRM_API_KEY", "")
        self.crm_api_url = os.getenv("CRM_API_URL", "")

    def validate(self) -> tuple[bool, Optional[str]]:
        """
        Validate configuration.
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not self.openai_api_key:
            return False, "OPENAI_API_KEY is required. Please set it in .env file."
        return True, None


# Global configuration instance
config = Config()
