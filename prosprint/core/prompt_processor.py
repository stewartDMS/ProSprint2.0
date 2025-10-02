"""AI-powered prompt processor that converts plain English to actions."""

import json
import uuid
from typing import Optional
from openai import OpenAI

from prosprint.config import config
from prosprint.core.action import Action, ActionType


class PromptProcessor:
    """Processes natural language prompts and converts them to executable actions."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the prompt processor.
        
        Args:
            api_key: OpenAI API key (uses config if not provided)
        """
        self.api_key = api_key or config.openai_api_key
        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def process(self, prompt: str) -> list[Action]:
        """
        Process a natural language prompt and convert it to actions.
        
        Args:
            prompt: Natural language prompt from user
            
        Returns:
            List of Action objects to be executed
        """
        if not self.client:
            # Fallback for demo mode without API key
            return self._process_fallback(prompt)

        system_prompt = """You are ProSprint AI, an intelligent assistant that converts natural language 
requests into structured actions for business automation. Analyze the user's request and determine 
what actions need to be performed.

Available action types:
- crm_update: Update CRM records (contacts, deals, companies)
- send_email: Send emails to recipients
- slack_post: Post messages to Slack channels
- draft_report: Generate reports or documents
- summarize_document: Summarize documents or long text

Return a JSON array of actions with this structure:
[{
    "type": "action_type",
    "description": "Human-readable description",
    "parameters": {
        "key1": "value1",
        "key2": "value2"
    }
}]

Be specific and extract all relevant details from the user's prompt."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )

            content = response.choices[0].message.content
            actions_data = json.loads(content)
            
            actions = []
            for action_data in actions_data:
                action = Action(
                    id=str(uuid.uuid4()),
                    type=ActionType(action_data["type"]),
                    description=action_data["description"],
                    parameters=action_data.get("parameters", {})
                )
                actions.append(action)
            
            return actions

        except Exception as e:
            # Fallback to demo mode on error
            print(f"Warning: AI processing failed ({e}), using fallback mode")
            return self._process_fallback(prompt)

    def _process_fallback(self, prompt: str) -> list[Action]:
        """
        Fallback processor that uses simple pattern matching.
        
        Args:
            prompt: Natural language prompt
            
        Returns:
            List of Action objects
        """
        actions = []
        prompt_lower = prompt.lower()

        # Simple keyword-based action detection
        if "email" in prompt_lower or "send" in prompt_lower and "mail" in prompt_lower:
            actions.append(Action(
                id=str(uuid.uuid4()),
                type=ActionType.SEND_EMAIL,
                description=f"Send email based on: {prompt}",
                parameters={
                    "subject": "Email from ProSprint AI",
                    "body": prompt,
                    "recipient": "recipient@example.com"
                }
            ))

        if "slack" in prompt_lower or "post" in prompt_lower:
            actions.append(Action(
                id=str(uuid.uuid4()),
                type=ActionType.SLACK_POST,
                description=f"Post to Slack: {prompt}",
                parameters={
                    "channel": config.slack_channel or "#general",
                    "message": prompt
                }
            ))

        if "crm" in prompt_lower or "update" in prompt_lower and "contact" in prompt_lower:
            actions.append(Action(
                id=str(uuid.uuid4()),
                type=ActionType.CRM_UPDATE,
                description=f"Update CRM based on: {prompt}",
                parameters={
                    "action": "update",
                    "details": prompt
                }
            ))

        if "report" in prompt_lower or "draft" in prompt_lower:
            actions.append(Action(
                id=str(uuid.uuid4()),
                type=ActionType.DRAFT_REPORT,
                description=f"Draft report: {prompt}",
                parameters={
                    "title": "Report from ProSprint AI",
                    "content": prompt
                }
            ))

        if "summarize" in prompt_lower or "summary" in prompt_lower:
            actions.append(Action(
                id=str(uuid.uuid4()),
                type=ActionType.SUMMARIZE_DOCUMENT,
                description=f"Summarize: {prompt}",
                parameters={
                    "text": prompt
                }
            ))

        # If no specific action detected, create a custom action
        if not actions:
            actions.append(Action(
                id=str(uuid.uuid4()),
                type=ActionType.CUSTOM,
                description=f"Execute custom action: {prompt}",
                parameters={"prompt": prompt}
            ))

        return actions
