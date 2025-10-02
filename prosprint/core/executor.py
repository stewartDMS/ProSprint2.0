"""Action execution engine for ProSprint AI."""

from datetime import datetime
from typing import Optional

from prosprint.core.action import Action, ActionStatus, ActionType
from prosprint.integrations.crm import CRMIntegration
from prosprint.integrations.email import EmailIntegration
from prosprint.integrations.slack import SlackIntegration
from prosprint.integrations.document import DocumentIntegration
from prosprint.utils.logger import ActivityLogger


class ActionExecutor:
    """Executes actions across different integrations."""

    def __init__(self):
        """Initialize the action executor with integrations."""
        self.crm = CRMIntegration()
        self.email = EmailIntegration()
        self.slack = SlackIntegration()
        self.document = DocumentIntegration()
        self.logger = ActivityLogger()

    def execute(self, action: Action) -> Action:
        """
        Execute a single action.
        
        Args:
            action: Action to execute
            
        Returns:
            Updated action with execution results
        """
        action.status = ActionStatus.EXECUTING
        action.executed_at = datetime.now()

        try:
            if action.type == ActionType.CRM_UPDATE:
                result = self.crm.execute(action)
            elif action.type == ActionType.SEND_EMAIL:
                result = self.email.execute(action)
            elif action.type == ActionType.SLACK_POST:
                result = self.slack.execute(action)
            elif action.type == ActionType.DRAFT_REPORT:
                result = self.document.draft_report(action)
            elif action.type == ActionType.SUMMARIZE_DOCUMENT:
                result = self.document.summarize(action)
            else:
                result = {"status": "completed", "message": "Custom action executed"}

            action.status = ActionStatus.COMPLETED
            action.result = result
            
            # Log successful execution
            self.logger.log_action(action)

        except Exception as e:
            action.status = ActionStatus.FAILED
            action.error = str(e)
            
            # Log failed execution
            self.logger.log_action(action)

        return action

    def execute_batch(self, actions: list[Action]) -> list[Action]:
        """
        Execute multiple actions in sequence.
        
        Args:
            actions: List of actions to execute
            
        Returns:
            List of updated actions with execution results
        """
        results = []
        for action in actions:
            executed_action = self.execute(action)
            results.append(executed_action)
        return results
