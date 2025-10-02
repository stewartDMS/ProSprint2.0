# ProSprint AI 2.0

**AI-powered ops layer that connects to your business tools and turns plain English prompts into real actions.**

Instead of just giving answers, ProSprint AI updates your CRM, sends emails, posts to Slack, drafts reports, or summarizes documents — all from one place. You type what you need, ProSprint shows a preview, and with approval, executes across your systems while keeping a full activity log.

## Features

- 🤖 **Natural Language Processing**: Convert plain English prompts into structured actions
- 🔍 **Action Preview**: Review what will be executed before approval
- ✅ **Approval Workflow**: Safe execution with user confirmation
- 🔌 **Multi-Platform Integration**: CRM, Email, Slack, Document generation and more
- 📊 **Activity Logging**: Complete audit trail of all actions
- 🎯 **Real Action Execution**: Not just answers - actual business operations

## Supported Integrations

- **CRM Systems**: Update contacts, deals, and companies (Salesforce, HubSpot, etc.)
- **Email**: Send emails via SMTP
- **Slack**: Post messages to channels
- **Document Processing**: Draft reports and summarize documents
- **Extensible**: Easy to add custom integrations

## Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/stewartDMS/ProSprint2.0.git
cd ProSprint2.0
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure your environment:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

4. Install ProSprint AI:
```bash
pip install -e .
```

### Usage

#### Basic Command

```bash
prosprint run "Send an email to john@example.com about the Q4 report"
```

#### Auto-approve Mode

```bash
prosprint run -y "Update CRM contact Sarah Johnson with status 'qualified'"
```

#### Interactive Demo

```bash
prosprint demo
```

#### View Activity Logs

```bash
prosprint logs
prosprint logs --limit 20
```

#### System Information

```bash
prosprint info
```

## Example Prompts

### Email
```bash
prosprint run "Send an email to team@company.com with subject 'Meeting Reminder' and body 'Don't forget our meeting at 3 PM'"
```

### Slack
```bash
prosprint run "Post to Slack #general: 'Build completed successfully!'"
```

### CRM Updates
```bash
prosprint run "Update CRM contact John Smith with note 'Interested in enterprise plan'"
```

### Reports
```bash
prosprint run "Draft a quarterly sales report with key metrics and achievements"
```

### Document Summarization
```bash
prosprint run "Summarize this text: [your long document text here]"
```

## Configuration

ProSprint AI uses environment variables for configuration. Copy `.env.example` to `.env` and configure:

```bash
# Required for AI processing
OPENAI_API_KEY=your_openai_api_key

# Optional integrations (configure as needed)
SLACK_TOKEN=your_slack_token
SLACK_CHANNEL=#general

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

CRM_API_KEY=your_crm_api_key
CRM_API_URL=https://api.your-crm.com
```

### Demo Mode

ProSprint AI can run in demo mode without API keys configured. Actions will be simulated rather than executed.

## Architecture

```
prosprint/
├── core/
│   ├── action.py           # Action models and types
│   ├── prompt_processor.py # AI-powered prompt processing
│   ├── executor.py         # Action execution engine
│   └── prosprint.py        # Main orchestrator
├── integrations/
│   ├── crm.py             # CRM integration
│   ├── email.py           # Email integration
│   ├── slack.py           # Slack integration
│   └── document.py        # Document processing
├── utils/
│   └── logger.py          # Activity logging
├── config.py              # Configuration management
└── cli.py                 # Command-line interface
```

## How It Works

1. **Input**: You provide a natural language prompt
2. **Processing**: AI analyzes the prompt and identifies required actions
3. **Preview**: Actions are displayed with all parameters for review
4. **Approval**: You approve or cancel the execution
5. **Execution**: Actions are executed across integrated systems
6. **Logging**: All activity is logged for audit trail

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Adding New Integrations

1. Create a new integration module in `prosprint/integrations/`
2. Implement the `execute()` method
3. Add the integration to the executor
4. Update documentation

Example:
```python
# prosprint/integrations/custom.py
class CustomIntegration:
    def execute(self, action):
        # Your integration logic here
        return {"status": "completed", "message": "Action executed"}
```

## Security Considerations

- API keys are stored in `.env` and never committed to version control
- All actions require explicit user approval (unless auto-approve is enabled)
- Complete activity logs for audit trail
- Sensitive data should be handled according to your security policies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/stewartDMS/ProSprint2.0).

---

Built with ❤️ by the ProSprint Team
