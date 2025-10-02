"""Action model for ProSprint AI."""

from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field


class ActionType(str, Enum):
    """Types of actions that can be executed."""
    
    CRM_UPDATE = "crm_update"
    SEND_EMAIL = "send_email"
    SLACK_POST = "slack_post"
    DRAFT_REPORT = "draft_report"
    SUMMARIZE_DOCUMENT = "summarize_document"
    CUSTOM = "custom"


class ActionStatus(str, Enum):
    """Status of an action."""
    
    PENDING = "pending"
    APPROVED = "approved"
    EXECUTING = "executing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Action(BaseModel):
    """Model representing an action to be executed."""
    
    id: str = Field(description="Unique action identifier")
    type: ActionType = Field(description="Type of action")
    description: str = Field(description="Human-readable action description")
    parameters: dict[str, Any] = Field(default_factory=dict, description="Action parameters")
    status: ActionStatus = Field(default=ActionStatus.PENDING, description="Current status")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    executed_at: Optional[datetime] = Field(default=None, description="Execution timestamp")
    result: Optional[dict[str, Any]] = Field(default=None, description="Execution result")
    error: Optional[str] = Field(default=None, description="Error message if failed")

    def to_preview(self) -> str:
        """
        Generate a preview string for user approval.
        
        Returns:
            Human-readable preview of the action
        """
        preview_lines = [
            f"Action: {self.type.value}",
            f"Description: {self.description}",
            "Parameters:"
        ]
        
        for key, value in self.parameters.items():
            preview_lines.append(f"  - {key}: {value}")
        
        return "\n".join(preview_lines)
