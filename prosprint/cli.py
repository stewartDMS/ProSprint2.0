"""Command-line interface for ProSprint AI."""

import click
from rich.console import Console
from rich.panel import Panel

from prosprint import __version__, __description__
from prosprint.config import config
from prosprint.core.prosprint import ProSprintAI


console = Console()


@click.group()
@click.version_option(version=__version__)
def cli():
    """
    ProSprint AI - AI-powered ops layer for business automation.
    
    Connects to your business tools and turns plain English prompts into real actions.
    """
    pass


@cli.command()
@click.argument("prompt", nargs=-1, required=True)
@click.option("--auto-approve", "-y", is_flag=True, help="Automatically approve actions without confirmation")
def run(prompt, auto_approve):
    """
    Execute a natural language prompt.
    
    Example:
        prosprint run "Send an email to john@example.com about the Q4 report"
        prosprint run "Update CRM contact John Smith with status 'qualified'"
        prosprint run "Post to Slack: Team meeting at 3 PM today"
    """
    # Validate configuration
    is_valid, error = config.validate()
    if not is_valid:
        console.print(f"[red]Configuration Error:[/red] {error}")
        console.print("\n[yellow]Tip:[/yellow] Copy .env.example to .env and configure your API keys")
        console.print("[yellow]Running in demo mode with limited functionality...[/yellow]\n")

    # Join prompt words
    prompt_text = " ".join(prompt)
    
    # Initialize and run ProSprint AI
    prosprint = ProSprintAI()
    prosprint.process_prompt(prompt_text, auto_approve=auto_approve)


@cli.command()
@click.option("--limit", "-n", default=10, help="Number of recent entries to show")
def logs(limit):
    """
    Display recent activity logs.
    
    Example:
        prosprint logs
        prosprint logs --limit 20
    """
    prosprint = ProSprintAI()
    prosprint.show_activity_log(limit=limit)


@cli.command()
def info():
    """Display ProSprint AI information and configuration status."""
    console.print(Panel(
        f"""[bold cyan]ProSprint AI[/bold cyan]
        
Version: {__version__}
Description: {__description__}

[bold]Configuration Status:[/bold]
- OpenAI API Key: {"✓ Configured" if config.openai_api_key else "✗ Not configured"}
- Slack Token: {"✓ Configured" if config.slack_token else "✗ Not configured"}
- Email SMTP: {"✓ Configured" if config.smtp_host else "✗ Not configured"}
- CRM API: {"✓ Configured" if config.crm_api_key else "✗ Not configured"}

[bold]Available Integrations:[/bold]
- CRM Updates (Salesforce, HubSpot, etc.)
- Email (SMTP)
- Slack
- Document Generation
- Document Summarization

[yellow]Tip:[/yellow] Configure your API keys in the .env file for full functionality.
""",
        title="ProSprint AI Information",
        border_style="blue"
    ))


@cli.command()
def demo():
    """Run interactive demo mode."""
    console.print(Panel(
        """[bold cyan]ProSprint AI - Interactive Demo Mode[/bold cyan]
        
Welcome! This demo shows how ProSprint AI converts natural language into actions.

Try these example prompts:
1. "Send an email to team@company.com about quarterly results"
2. "Update CRM contact Sarah Johnson with note 'Follow up next week'"
3. "Post to Slack: Reminder - standup at 10 AM"
4. "Draft a report on Q4 sales performance"
5. "Summarize this text: [your long text here]"

Type 'exit' or 'quit' to end the demo.
""",
        border_style="cyan"
    ))
    
    prosprint = ProSprintAI()
    
    while True:
        try:
            prompt = console.input("\n[bold blue]Enter your prompt:[/bold blue] ")
            
            if prompt.lower() in ["exit", "quit", "q"]:
                console.print("\n[green]Thank you for using ProSprint AI![/green]")
                break
            
            if not prompt.strip():
                continue
            
            prosprint.process_prompt(prompt)
            
        except KeyboardInterrupt:
            console.print("\n\n[green]Thank you for using ProSprint AI![/green]")
            break
        except Exception as e:
            console.print(f"\n[red]Error:[/red] {str(e)}")


def main():
    """Main entry point for the CLI."""
    cli()


if __name__ == "__main__":
    main()
