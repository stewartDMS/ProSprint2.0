"""Main ProSprint AI class orchestrating the entire workflow."""

from typing import Optional
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm

from prosprint.core.prompt_processor import PromptProcessor
from prosprint.core.executor import ActionExecutor
from prosprint.core.action import Action, ActionStatus
from prosprint.utils.logger import ActivityLogger


class ProSprintAI:
    """Main ProSprint AI orchestrator."""

    def __init__(self):
        """Initialize ProSprint AI."""
        self.processor = PromptProcessor()
        self.executor = ActionExecutor()
        self.logger = ActivityLogger()
        self.console = Console()

    def process_prompt(self, prompt: str, auto_approve: bool = False) -> list[Action]:
        """
        Process a natural language prompt and execute actions.
        
        Args:
            prompt: Natural language prompt from user
            auto_approve: If True, skip approval step
            
        Returns:
            List of executed actions
        """
        self.console.print(f"\n[bold blue]Processing prompt:[/bold blue] {prompt}\n")

        # Step 1: Convert prompt to actions
        actions = self.processor.process(prompt)
        
        if not actions:
            self.console.print("[yellow]No actions identified from prompt.[/yellow]")
            return []

        # Step 2: Show preview
        self.console.print("[bold green]Actions to be executed:[/bold green]\n")
        for i, action in enumerate(actions, 1):
            preview = action.to_preview()
            self.console.print(Panel(preview, title=f"Action {i}", border_style="cyan"))

        # Step 3: Get approval (if not auto-approved)
        if not auto_approve:
            approved = Confirm.ask("\n[bold yellow]Approve execution of these actions?[/bold yellow]")
            if not approved:
                self.console.print("[red]Execution cancelled by user.[/red]")
                for action in actions:
                    action.status = ActionStatus.CANCELLED
                return actions

        # Step 4: Execute actions
        self.console.print("\n[bold green]Executing actions...[/bold green]\n")
        executed_actions = self.executor.execute_batch(actions)

        # Step 5: Show results
        self._display_results(executed_actions)

        return executed_actions

    def _display_results(self, actions: list[Action]) -> None:
        """
        Display execution results.
        
        Args:
            actions: List of executed actions
        """
        self.console.print("\n[bold blue]Execution Results:[/bold blue]\n")
        
        for action in actions:
            if action.status == ActionStatus.COMPLETED:
                status_color = "green"
                status_text = "✓ COMPLETED"
            elif action.status == ActionStatus.FAILED:
                status_color = "red"
                status_text = "✗ FAILED"
            else:
                status_color = "yellow"
                status_text = f"○ {action.status.value.upper()}"

            result_text = [
                f"[bold]{status_text}[/bold]",
                f"Action: {action.description}"
            ]

            if action.result:
                result_text.append(f"Result: {action.result.get('message', 'Completed')}")

            if action.error:
                result_text.append(f"[red]Error: {action.error}[/red]")

            self.console.print(Panel(
                "\n".join(result_text),
                border_style=status_color
            ))

    def show_activity_log(self, limit: int = 10) -> None:
        """
        Display recent activity log.
        
        Args:
            limit: Number of recent entries to show
        """
        logs = self.logger.get_recent_logs(limit)
        
        if not logs:
            self.console.print("[yellow]No activity logs found.[/yellow]")
            return

        self.console.print(f"\n[bold blue]Recent Activity (last {len(logs)} entries):[/bold blue]\n")
        
        for log in logs:
            timestamp = log["timestamp"]
            action_type = log["action_type"]
            description = log["description"]
            status = log["status"]
            
            status_color = "green" if status == "completed" else "red" if status == "failed" else "yellow"
            
            self.console.print(f"[{status_color}]{timestamp}[/{status_color}] - {action_type}: {description} [{status}]")
