
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

### One-Click OAuth2 Integrations

- **HubSpot**: CRM with marketing automation - manage contacts, deals, and campaigns
- **Salesforce**: Enterprise CRM platform - leads, opportunities, accounts, and custom objects
- **Google Drive**: Cloud storage and document management - create and manage files and folders
- **Xero**: Accounting software - invoices, expenses, and financial reports
- **Notion**: All-in-one workspace - pages, databases, and team collaboration
- **Asana**: Project management - tasks, projects, and team workflows
- **Jira**: Issue tracking and agile project management - tickets, sprints, and boards
- **Gmail**: Google email service with OAuth2 - send and manage emails securely
- **Outlook**: Microsoft email via Graph API - send and manage emails with OAuth2

### Legacy Integrations

- **CRM (Generic)**: Update contacts, deals, and companies via API keys
- **Email (SMTP)**: Send emails via SMTP configuration
- **Slack**: Post messages to channels with bot token

## Integrations Page

The Integrations page (`/integrations`) provides a centralized interface for managing external app connections and running automations.

### Features

- **Visual Integration Management**: See all available integrations with their connection status
- **One-Click Connect**: Authorize and connect apps like CRM, Email, and Slack
- **Automation Triggers**: Execute automations directly from the UI with custom parameters
- **Real-time Status**: Monitor connection health and integration capabilities
- **Responsive Design**: Accessible interface that works on all devices

### Accessing Integrations

Navigate to the Integrations page from the main navigation menu or visit `/integrations` directly. Here you can:

1. **View Available Integrations**: See all integrations including CRM, Email, and Slack with their current status
2. **Connect Apps**: Click "Connect" to authorize each integration
3. **Run Automations**: Select a connected integration and fill in the automation parameters to execute actions
4. **Monitor Status**: Check connection status, capabilities, and last sync information

### Automation Flow

The automation system in ProSprint 2.0 works seamlessly across multiple interfaces:

#### 1. From the AI Assistant (PromptBox)

When you submit a prompt to the AI Assistant, ProSprint automatically detects automation opportunities:

- **Keyword Detection**: The system analyzes your prompt for keywords like "email", "slack", "crm", "contact"
- **Automatic Triggering**: If a matching integration is detected, the automation is triggered automatically
- **Task Creation**: A task is created and sent to the automation API
- **Confirmation**: You receive confirmation in the chat that the automation was triggered

Example prompts that trigger automations:
```
"Send an email to the sales team about the new product launch"
"Post a message to Slack about the completed deployment"
"Update CRM contact information for John Doe"
```

#### 2. From the Integrations Page

For more control, use the Integrations page to manually trigger automations:

- Select an integration (must be connected)
- Fill in the required parameters
- Click "Run Automation" to execute

#### 3. Backend API Flow

All automations go through the `/api/automate` endpoint:

1. Request is received with task type and parameters
2. System routes to appropriate integration handler
3. Integration executes the action (e.g., sends email, updates CRM)
4. Result is returned with status and details
5. Action is logged for audit trail

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
cp .env.example .env.local
# Edit .env.local and add your API keys (see Integration Setup below)
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

## Integration Setup

ProSprint 2.0 supports seamless one-click OAuth2 integrations with 9 major platforms. All integrations work in demo mode by default and automatically upgrade to production mode when OAuth credentials are configured.

### Quick Start

1. **Demo Mode** (default): All integrations work immediately without configuration for testing and evaluation
2. **Production Mode**: Configure OAuth2 credentials for real API access

### OAuth2 Setup Instructions

Create a `.env.local` file in the project root and add your OAuth credentials:

```bash
# Base URL (important for OAuth callbacks)
NEXT_PUBLIC_BASE_URL=https://pro-sprint-ai.vercel.app  # Production Vercel domain

# OpenAI API (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# HubSpot OAuth2
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret

# Salesforce OAuth2
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret
SALESFORCE_SANDBOX=false  # Set to true for sandbox environment

# Google OAuth2 (for both Gmail and Google Drive)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret

# Xero OAuth2
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret

# Notion OAuth2
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret

# Asana OAuth2
ASANA_CLIENT_ID=your_asana_client_id
ASANA_CLIENT_SECRET=your_asana_client_secret


# Jira OAuth2
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret

# Microsoft OAuth2 (for Outlook)
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# Legacy Integrations (optional)
SLACK_TOKEN=xoxb-your-slack-bot-token

# Email/SMTP Integration (optional - traditional method)

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password



# Gmail API OAuth2 Integration (optional - recommended)
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REDIRECT_URI=https://pro-sprint-ai.vercel.app/api/integrations/gmail/callback

# Microsoft Graph API OAuth2 Integration (optional)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT_ID=common
MICROSOFT_REDIRECT_URI=https://pro-sprint-ai.vercel.app/api/integrations/email/callback/microsoft

# Slack Integration (optional)
SLACK_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL=#general

```

### Integration Details

#### 1. CRM Integration

**Demo Mode** (default):
- Simulates CRM operations without external API calls
- Returns mock responses for testing

**Production Mode** (with API keys):
- Connects to real CRM system (Salesforce, HubSpot, etc.)
- Updates contacts, deals, and companies
- Syncs data in real-time

**Setup Steps**:
1. Obtain API key from your CRM provider
2. Add `CRM_API_KEY` and `CRM_API_URL` to `.env.local`
3. Restart the application
4. Test connection on Integrations page

**Example API Implementation** (uncomment in `/pages/api/integrations/crm.py`):
```python
import requests
api_key = os.getenv('CRM_API_KEY', '')
api_url = os.getenv('CRM_API_URL', '')
response = requests.post(
    f"{api_url}/contacts",
    headers={"Authorization": f"Bearer {api_key}"},
    json=data
)
```

#### 2. Email Integration

ProSprint 2.0 supports **three methods** for sending emails:

##### Option A: SMTP (Traditional)

**Demo Mode** (default):
- Simulates email sending without actual delivery
- Useful for testing workflows

**Production Mode** (with SMTP credentials):
- Sends real emails via SMTP
- Supports HTML and plain text
- Attachment handling

**Setup Steps**:
1. For Gmail: Enable 2FA and create an [App Password](https://support.google.com/accounts/answer/185833)
2. Add SMTP credentials to `.env.local`:
   - `SMTP_HOST`: Your SMTP server (e.g., smtp.gmail.com)
   - `SMTP_PORT`: Usually 587 for TLS
   - `SMTP_USER`: Your email address
   - `SMTP_PASSWORD`: Your password or app password
3. Restart the application
4. Test by sending a test email from Integrations page

**Example API Implementation** (uncomment in `/pages/api/integrations/email.py`):
```python
import smtplib
from email.mime.text import MIMEText

msg = MIMEText(body, 'plain')
msg['From'] = smtp_user
msg['To'] = recipient
msg['Subject'] = subject

with smtplib.SMTP(smtp_host, smtp_port) as server:
    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)
```

##### Option B: Gmail API with OAuth2 (Recommended)

**Demo Mode** (default):
- Simulates Gmail API calls without actual delivery
- No OAuth2 credentials required for testing

**Production Mode** (with OAuth2):
- Sends real emails using Gmail API
- More secure than SMTP (no app passwords needed)
- Uses OAuth2 for authentication
- Better rate limits and deliverability

**Setup Steps**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth2 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `https://pro-sprint-ai.vercel.app/api/integrations/gmail/callback`
   - For local development: also add `http://localhost:3000/api/integrations/gmail/callback`
5. Copy Client ID and Client Secret
6. Add to `.env.local`:
   ```bash
   GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=your-client-secret
   GMAIL_REDIRECT_URI=https://pro-sprint-ai.vercel.app/api/integrations/gmail/callback
   ```
7. Restart the application
8. Go to Integrations page and click "Connect" for Gmail
9. Authorize the application in the popup window
10. Test by sending an email via Gmail

**OAuth2 Scopes Required**:
- `https://www.googleapis.com/auth/gmail.send` - Send emails on behalf of user

##### Option C: Microsoft Outlook/Graph API with OAuth2

**Demo Mode** (default):
- Simulates Microsoft Graph API calls without actual delivery
- No OAuth2 credentials required for testing

**Production Mode** (with OAuth2):
- Sends real emails using Microsoft Graph API
- Works with Outlook, Office 365, and Microsoft 365
- Uses OAuth2 for authentication
- Enterprise-grade security and compliance

**Setup Steps**:
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
   - Name: "ProSprint Email Integration"
   - Supported account types: Choose based on your needs
   - Redirect URI: Web - `https://pro-sprint-ai.vercel.app/api/integrations/email/callback/microsoft`
   - For local development: also add `http://localhost:3000/api/integrations/email/callback/microsoft`
4. Note the "Application (client) ID" and "Directory (tenant) ID"
5. Create a client secret:
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Copy the secret value immediately (shown only once)
6. Add API permissions:
   - Go to "API permissions"
   - Click "Add a permission" > "Microsoft Graph" > "Delegated permissions"
   - Add `Mail.Send` permission
   - Click "Grant admin consent" (if you have admin rights)
7. Add to `.env.local`:
   ```bash
   MICROSOFT_CLIENT_ID=your-client-id
   MICROSOFT_CLIENT_SECRET=your-client-secret
   MICROSOFT_TENANT_ID=common
   MICROSOFT_REDIRECT_URI=https://pro-sprint-ai.vercel.app/api/integrations/email/callback/microsoft
   ```
8. Restart the application
9. Go to Integrations page and click "Connect" for Microsoft Outlook
10. Authorize the application in the popup window
11. Test by sending an email via Microsoft

**OAuth2 Scopes Required**:
- `https://graph.microsoft.com/Mail.Send` - Send emails on behalf of user
- `offline_access` - Get refresh tokens for long-term access

**Note**: For production deployments, update redirect URIs in both Google Cloud Console and Azure Portal to match your production domain.

#### 3. Slack Integration

**Demo Mode** (default):
- Simulates message posting
- Returns mock message IDs and permalinks

**Production Mode** (with bot token):
- Posts real messages to Slack channels
- Supports rich formatting, threads, and files
- Real-time notifications

**Setup Steps**:
1. Create a Slack App at [api.slack.com/apps](https://api.slack.com/apps)
2. Add Bot Token Scopes:
   - `chat:write` - Post messages
   - `chat:write.public` - Post to public channels
   - `channels:read` - List channels
3. Install app to workspace
4. Copy Bot User OAuth Token (starts with `xoxb-`)
5. Add to `.env.local`:
   ```
   SLACK_TOKEN=xoxb-your-bot-token
   SLACK_CHANNEL=#general
   ```
6. Restart the application
7. Test by posting a message from Integrations page

**Example API Implementation** (uncomment in `/pages/api/integrations/slack.py`):
```python
import requests

response = requests.post(
    'https://slack.com/api/chat.postMessage',
    headers={
        'Authorization': f'Bearer {slack_token}',
        'Content-Type': 'application/json'
    },
    json={
        'channel': channel,
        'text': message
    }
)
```

### Using Integrations

#### From the Integrations Page

1. Navigate to `/integrations` in your browser
2. Click "Connect" on any integration
   - Shows **[DEMO]** if no credentials configured
   - Shows **[PRODUCTION]** if credentials are configured
3. Select an integration and fill in automation parameters
4. Click "Run Automation" to execute
5. View results with success/error feedback

#### From the AI Assistant (PromptBox)

The AI Assistant automatically detects and triggers integrations:

**Email Example**:
```
"Send an email to team@example.com about the Q4 results"
```
- Automatically calls Email integration
- Extracts recipient and subject
- Sends email in configured mode (demo or production)

**Slack Example**:
```
"Post to Slack #general about deployment complete"
```
- Automatically calls Slack integration
- Extracts channel and message
- Posts message in configured mode

**CRM Example**:
```
"Update CRM contact John Doe with status qualified"
```
- Automatically calls CRM integration
- Extracts contact details
- Updates CRM in configured mode

#### Via API Endpoints

Direct API calls for programmatic access:

```bash
# Get integration status
curl https://pro-sprint-ai.vercel.app/api/integrations/email

# Trigger automation
curl -X POST https://pro-sprint-ai.vercel.app/api/integrations/slack \
  -H "Content-Type: application/json" \
  -d '{
    "action": "post_message",
    "channel": "#general",
    "message": "Hello from API"
  }'
```

### OAuth2 Integration Setup Guide

#### OAuth2 Callback Routes

ProSprint 2.0 uses dedicated OAuth2 callback routes for each integration to handle the authorization code exchange securely. Each callback route:

- Accepts the OAuth2 authorization code and state from the provider
- Exchanges the code for access and refresh tokens using client credentials from environment variables
- Stores tokens securely in memory (demo) or database (production)
- Redirects to the frontend with connection status for smooth user experience

**Callback Route URLs:**

| Integration | Callback Route |
|------------|----------------|
| Google Drive | `/api/integrations/google/callback` |
| Gmail | `/api/integrations/gmail/callback` |
| Microsoft Outlook | `/api/integrations/outlook/callback` |
| HubSpot | `/api/integrations/hubspot/callback` |
| Salesforce | `/api/integrations/salesforce/callback` |
| Xero | `/api/integrations/xero/callback` |
| Notion | `/api/integrations/notion/callback` |
| Asana | `/api/integrations/asana/callback` |
| Jira | `/api/integrations/jira/callback` |
| Slack | `/api/integrations/slack/callback` |

**Required Environment Variables by Integration:**

```bash
# Google Drive & Gmail
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GMAIL_CLIENT_ID=your_google_client_id
GMAIL_CLIENT_SECRET=your_google_client_secret

# Microsoft Outlook
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# HubSpot
HUBSPOT_CLIENT_ID=your_hubspot_client_id
HUBSPOT_CLIENT_SECRET=your_hubspot_client_secret

# Salesforce
SALESFORCE_CLIENT_ID=your_salesforce_client_id
SALESFORCE_CLIENT_SECRET=your_salesforce_client_secret
SALESFORCE_SANDBOX=false  # Set to true for sandbox environment

# Xero
XERO_CLIENT_ID=your_xero_client_id
XERO_CLIENT_SECRET=your_xero_client_secret

# Notion
NOTION_CLIENT_ID=your_notion_client_id
NOTION_CLIENT_SECRET=your_notion_client_secret

# Asana
ASANA_CLIENT_ID=your_asana_client_id
ASANA_CLIENT_SECRET=your_asana_client_secret

# Jira
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret

# Slack (OAuth2)
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret

# Base URL (important for OAuth callbacks)
NEXT_PUBLIC_BASE_URL=https://pro-sprint-ai.vercel.app  # Production Vercel domain
```

#### HubSpot Setup

1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Create a new app or select existing app
3. Navigate to "Auth" tab
4. Set redirect URL: `https://pro-sprint-ai.vercel.app/api/integrations/hubspot/callback`
   - For local development: also add `http://localhost:3000/api/integrations/hubspot/callback`
5. Copy Client ID and Client Secret
6. Add required scopes: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.companies.read`, `crm.objects.companies.write`, `crm.objects.deals.read`, `crm.objects.deals.write`
7. Add credentials to `.env.local`

**Automation Capabilities**: Create/update contacts, manage companies, track deals, custom properties

#### Salesforce Setup

1. Log in to [Salesforce](https://login.salesforce.com/) (or [Sandbox](https://test.salesforce.com/))
2. Go to Setup → Apps → App Manager → New Connected App
3. Enable OAuth Settings
4. Set Callback URL: `https://pro-sprint-ai.vercel.app/api/integrations/salesforce/callback`
   - For local development: also add `http://localhost:3000/api/integrations/salesforce/callback`
5. Select OAuth Scopes: Full access (or customize as needed)
6. Copy Consumer Key (Client ID) and Consumer Secret
7. Add credentials to `.env.local`

**Automation Capabilities**: Manage leads, opportunities, accounts, contacts, cases, custom objects

#### Google Drive & Gmail Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable APIs: Google Drive API, Gmail API, Google Docs API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set Application type: Web application
6. Add Authorized redirect URIs:
   - For production: `https://pro-sprint-ai.vercel.app/api/integrations/google/callback`
   - For production: `https://pro-sprint-ai.vercel.app/api/integrations/gmail/callback`
   - For local development: `http://localhost:3000/api/integrations/google/callback`
   - For local development: `http://localhost:3000/api/integrations/gmail/callback`
7. Copy Client ID and Client Secret
8. Add same credentials for both GOOGLE_CLIENT_ID and GMAIL_CLIENT_ID

**Automation Capabilities**: Upload/download files, create Google Docs, manage folders, send/read emails

#### Xero Setup

1. Go to [Xero Developer Portal](https://developer.xero.com/)
2. Create a new app → OAuth 2.0 app
3. Set Redirect URI: `https://pro-sprint-ai.vercel.app/api/integrations/xero/callback`
   - For local development: also add `http://localhost:3000/api/integrations/xero/callback`
4. Copy Client ID and Client Secret
5. Add credentials to `.env.local`

**Automation Capabilities**: Create invoices, track expenses, manage contacts, financial reporting

#### Notion Setup

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the Internal Integration Token (this is your Client Secret)
4. For OAuth: Go to Distribution → Public integration
5. Set Redirect URI: `https://pro-sprint-ai.vercel.app/api/integrations/notion/callback`
   - For local development: also add `http://localhost:3000/api/integrations/notion/callback`
6. Copy OAuth client ID and secret
7. Add credentials to `.env.local`

**Automation Capabilities**: Create pages, manage databases, search content, add blocks

#### Asana Setup

1. Go to [Asana Developer Console](https://app.asana.com/0/my-apps)
2. Create a new app
3. Set Redirect URL: `https://pro-sprint-ai.vercel.app/api/integrations/asana/callback`
   - For local development: also add `http://localhost:3000/api/integrations/asana/callback`
4. Copy Client ID and Client Secret
5. Add credentials to `.env.local`

**Automation Capabilities**: Create tasks, manage projects, assign work, track deadlines

#### Jira Setup

1. Go to [Atlassian Developer Console](https://developer.atlassian.com/console/myapps/)
2. Create a new OAuth 2.0 app
3. Add Callback URL: `https://pro-sprint-ai.vercel.app/api/integrations/jira/callback`
   - For local development: also add `http://localhost:3000/api/integrations/jira/callback`
4. Enable Jira API
5. Add permissions: `read:jira-work`, `write:jira-work`, `manage:jira-project`
6. Copy Client ID and Client Secret
7. Add credentials to `.env.local`

**Automation Capabilities**: Create issues, update tickets, manage sprints, custom workflows

#### Microsoft Outlook Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory → App registrations
3. Create New registration
4. Set Redirect URI (Web): `https://pro-sprint-ai.vercel.app/api/integrations/outlook/callback`
   - For local development: also add `http://localhost:3000/api/integrations/outlook/callback`
5. Go to Certificates & secrets → New client secret
6. Copy Application (client) ID and client secret value
7. Go to API permissions → Add: `Mail.Send`, `Mail.Read`
8. Add credentials to `.env.local`

**Automation Capabilities**: Send emails, read emails, manage calendar, search inbox

### Customer Workflow

1. **Browse Integrations**: Visit `/integrations` page to see all available services
2. **One-Click Connect**: Click "Connect" button on any integration
3. **OAuth Authorization**: Automatically redirected to service's authorization page
4. **Grant Access**: Review and approve requested permissions
5. **Instant Ready**: Redirected back to ProSprint with active connection
6. **Start Automating**: Use AI prompts or manual triggers to execute actions

### Troubleshooting

**Integration shows "demo mode" even with credentials**:
- Verify `.env.local` file is in project root
- Check environment variable names match exactly
- Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
- Restart Next.js dev server after changing `.env.local`
- Check browser console for errors

**OAuth redirect not working**:
- Verify redirect URIs match exactly in OAuth app settings
- Check if callback URLs include `?action=callback`
- Ensure `NEXT_PUBLIC_BASE_URL` matches your deployment URL
- For production, update all redirect URIs to use HTTPS

**Token expired errors**:
- Tokens are automatically refreshed (when refresh_token is available)
- Disconnect and reconnect the integration to get new tokens
- Check token storage implementation for your environment

**Email not sending**:
- Verify SMTP credentials are correct (legacy integration)
- For OAuth Gmail/Outlook, ensure proper scopes are granted
- Check API quotas and rate limits

**Slack messages not posting**:
- Verify bot token starts with `xoxb-`
- Ensure bot is added to the target channel
- Check bot has `chat:write` permission
- Verify channel name includes # prefix

**CRM not updating**:
- Verify API endpoint URL is correct
- Check API key has required permissions
- Review CRM API documentation for required fields
- Check API rate limits

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

# ProSprint 2.0

ProSprint - The Intelligent app that automates your business activities and makes running a business seamless

## Overview

ProSprint 2.0 is a hybrid web application that combines the power of Next.js (React + TypeScript) for the frontend with Python for backend API routes. This architecture allows you to leverage the best of both worlds: modern React UI with powerful Python automation capabilities.

## Architecture

This project uses a **hybrid deployment model** on Vercel:

- **Frontend**: Next.js with React and TypeScript
- **Backend API**: Python serverless functions
- **Hosting**: Vercel (supports both Next.js and Python runtimes)

### Why Hybrid?

- **Next.js Frontend**: Fast, SEO-friendly React applications with server-side rendering
- **Python Backend**: Leverage Python's rich ecosystem for automation, data processing, and ML
- **Serverless**: Automatically scales and only pay for what you use
- **Single Deployment**: Both frontend and backend deploy together on Vercel

## Project Structure

```
ProSprint2.0/
├── pages/
│   ├── index.tsx              # Main dashboard page (React + TypeScript)
│   └── api/
│       ├── automate.py        # Python API endpoint for automation
│       ├── report.py          # Python API endpoint for reports
│       └── trigger.py         # Python API endpoint for triggers
├── package.json               # Node.js dependencies and scripts
├── requirements.txt           # Python dependencies
├── vercel.json                # Vercel deployment configuration
├── tsconfig.json              # TypeScript configuration
├── next.config.js             # Next.js configuration
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.9 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/stewartDMS/ProSprint2.0.git
   cd ProSprint2.0
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Install Python dependencies** (optional for local development):
   ```bash
   pip install -r requirements.txt
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The Python API endpoints are available at:
- [http://localhost:3000/api/automate](http://localhost:3000/api/automate)
- [http://localhost:3000/api/report](http://localhost:3000/api/report)
- [http://localhost:3000/api/trigger](http://localhost:3000/api/trigger)

### Testing the API

**Automation API**:
```bash
# Check automation status
curl http://localhost:3000/api/automate

# Send automation task
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{"task": "sample_automation", "priority": "high"}'
```

**Reports API**:
```bash
# Get sample report
curl http://localhost:3000/api/report

# Generate custom report
curl -X POST http://localhost:3000/api/report \
  -H "Content-Type: application/json" \
  -d '{"report_type": "analytics", "date_range": "last_30_days"}'
```

**Triggers API**:
```bash
# Get active triggers
curl http://localhost:3000/api/trigger

# Create new trigger
curl -X POST http://localhost:3000/api/trigger \
  -H "Content-Type: application/json" \
  -d '{"action": "create", "trigger_type": "webhook", "name": "New Lead Alert"}'

# Test a trigger
curl -X POST http://localhost:3000/api/trigger \
  -H "Content-Type: application/json" \
  -d '{"action": "test", "trigger_id": "trg_001"}'
```

## Deployment to Vercel

### Option 1: Deploy with Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts** to link your project and deploy.

### Option 2: Deploy with GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will automatically detect the Next.js framework
5. Click "Deploy"

### Environment Variables

If your application needs environment variables, add them in:
- **Local development**: Create a `.env.local` file
- **Vercel deployment**: Add them in the Vercel dashboard under Settings → Environment Variables

#### OpenAI API Configuration

The AI Assistant feature requires an OpenAI API key to provide real AI-powered responses. The API key is kept secure on the server side and never exposed to the frontend.

**Setup Instructions:**

1. **For Local Development:**
   ```bash
   # Create .env.local in the project root
   echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
   ```

2. **For Vercel Deployment:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add a new variable:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key
     - Select appropriate environments (Production, Preview, Development)

**Demo Mode:**

If `OPENAI_API_KEY` is not configured, the AI Assistant automatically runs in demo mode:
- Shows a simulated response to demonstrate the UI
- Displays a message indicating demo mode is active
- No actual API calls are made to OpenAI
- Perfect for testing the interface without incurring API costs

To get an OpenAI API key:
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy and add it to your `.env.local` or Vercel environment variables

**Security Note:** The API key is only accessible server-side through the `/api/openai` endpoint, ensuring your credentials are never exposed to the browser.

## Key Features

### Frontend (Next.js + React)
- **Modern UI**: Built with React 18 and TypeScript
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Fetch data from Python API endpoints
- **Type Safety**: Full TypeScript support for better development experience

### Backend (Python API)
- **Serverless Functions**: Python endpoints that scale automatically
- **Fast API**: Quick response times with efficient Python code
- **Extensible**: Easy to add more automation features
- **CORS Support**: Built-in cross-origin resource sharing

## API Endpoints

### Automation API - /api/automate

#### GET /api/automate
Returns the current status of the automation system.

**Response**:
```json
{
  "message": "ProSprint Automation API is running",
  "status": "success",
  "timestamp": "2024-01-01T12:00:00.000000",
  "features": [
    "Task Automation",
    "Workflow Management",
    "Business Process Optimization"
  ],
  "active_workflows": 3,
  "completed_tasks_today": 47,
  "integration_status": {
    "crm": "connected",
    "email": "connected",
    "slack": "ready"
  }
}
```

#### POST /api/automate
Submits an automation task for processing.

**Request Body**:
```json
{
  "task": "sample_automation",
  "priority": "high"
}
```

**Response**:
```json
{
  "message": "Automation task received and processed",
  "status": "processing",
  "timestamp": "2024-01-01T12:00:00.000000",
  "task_id": "task_1234567890.123",
  "task_type": "sample_automation",
  "priority": "high",
  "estimated_completion": "2-5 minutes",
  "automation_result": {
    "actions_scheduled": 4,
    "workflow_initiated": true
  }
}
```

**Integration Points**:
- CRM: Update customer records, sync contacts
- Email: Send automated notifications, campaign management
- Slack: Post updates, notify teams
- External APIs: Webhook triggers, data sync

---

### Integration APIs

#### CRM Integration - /api/integrations/crm.py

##### GET /api/integrations/crm
Returns the CRM integration status and capabilities.

**Response**:
```json
{
  "integration": "CRM",
  "status": "connected",
  "timestamp": "2024-01-01T12:00:00.000000",
  "capabilities": [
    "Update contacts",
    "Manage deals",
    "Sync companies",
    "Custom field updates"
  ],
  "connected_platform": "Demo CRM",
  "last_sync": "2024-01-01T12:00:00.000000"
}
```

##### POST /api/integrations/crm
Executes a CRM action.

**Request Body**:
```json
{
  "action": "update",
  "entity_type": "contact",
  "data": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response**:
```json
{
  "status": "completed",
  "message": "CRM update operation successful",
  "timestamp": "2024-01-01T12:00:00.000000",
  "action": "update",
  "entity_type": "contact",
  "entity_id": "contact_1234567890",
  "details": {
    "platform": "Demo CRM",
    "operation": "update",
    "affected_records": 1
  }
}
```

#### Email Integration - /api/integrations/email.py

##### GET /api/integrations/email
Returns the email integration status and capabilities.

**Response**:
```json
{
  "integration": "Email",
  "status": "connected",
  "timestamp": "2024-01-01T12:00:00.000000",
  "capabilities": [
    "Send emails",
    "Template support",
    "Attachment handling",
    "Campaign management",
    "HTML/Plain text"
  ],
  "smtp_configured": true,
  "daily_quota": 500,
  "emails_sent_today": 42
}
```

##### POST /api/integrations/email
Sends an email.

**Request Body**:
```json
{
  "action": "send",
  "recipient": "user@example.com",
  "subject": "Test Email",
  "body": "This is a test email."
}
```

**Response**:
```json
{
  "status": "completed",
  "message": "Email send operation successful",
  "timestamp": "2024-01-01T12:00:00.000000",
  "action": "send",
  "email_id": "email_1234567890",
  "details": {
    "recipient": "user@example.com",
    "subject": "Test Email",
    "delivery_status": "sent",
    "smtp_response": "250 Message accepted for delivery"
  }
}
```

#### Slack Integration - /api/integrations/slack.py

##### GET /api/integrations/slack
Returns the Slack integration status and capabilities.

**Response**:
```json
{
  "integration": "Slack",
  "status": "connected",
  "timestamp": "2024-01-01T12:00:00.000000",
  "capabilities": [
    "Post to channels",
    "Direct messages",
    "Rich formatting",
    "File uploads",
    "Thread replies"
  ],
  "workspace": "Demo Workspace",
  "bot_name": "ProSprint Bot",
  "available_channels": ["#general", "#ops", "#dev", "#alerts"]
}
```

##### POST /api/integrations/slack
Posts a message to Slack.

**Request Body**:
```json
{
  "action": "post_message",
  "channel": "#general",
  "message": "Hello from ProSprint!"
}
```

**Response**:
```json
{
  "status": "completed",
  "message": "Slack post_message operation successful",
  "timestamp": "2024-01-01T12:00:00.000000",
  "action": "post_message",
  "message_id": "slack_1234567890",
  "details": {
    "channel": "#general",
    "workspace": "Demo Workspace",
    "posted_by": "ProSprint Bot",
    "permalink": "https://demo.slack.com/archives/C12345/1234567890"
  }
}
```

---

### Reports API - /api/report

#### GET /api/report
Generates and returns a sample business report with key metrics.

**Response**:
```json
{
  "message": "Report generated successfully",
  "status": "success",
  "timestamp": "2024-01-01T12:00:00.000000",
  "report": {
    "title": "Business Performance Summary",
    "period": {
      "start": "2023-12-01",
      "end": "2024-01-01"
    },
    "metrics": {
      "total_tasks": 1247,
      "completed_tasks": 1089,
      "completion_rate": 87.3,
      "active_workflows": 23
    },
    "top_automations": [
      {
        "name": "Customer Onboarding",
        "executions": 45,
        "success_rate": 96.7
      }
    ]
  }
}
```

#### POST /api/report
Generates a custom report based on specified parameters.

**Request Body**:
```json
{
  "report_type": "analytics",
  "date_range": "last_30_days"
}
```

**Response**:
```json
{
  "message": "Custom analytics report generated",
  "status": "success",
  "timestamp": "2024-01-01T12:00:00.000000",
  "report_type": "analytics",
  "date_range": "last_30_days",
  "report": {
    "title": "Analytics Report",
    "data": {
      "user_engagement": "High",
      "efficiency_score": 92.5
    }
  }
}
```

**Integration Points**:
- CRM: Pull customer data, conversion rates
- Analytics: Track user engagement, performance metrics
- Document Service: Generate PDF reports, export to cloud storage
- External APIs: Third-party data integration

**Supported Report Types**:
- `summary` - High-level business metrics
- `detailed` - Comprehensive breakdown of activities
- `analytics` - User engagement and performance analysis

---

### Triggers API - /api/trigger

#### GET /api/trigger
Retrieves the list of active automation triggers.

**Response**:
```json
{
  "message": "Active triggers retrieved successfully",
  "status": "success",
  "timestamp": "2024-01-01T12:00:00.000000",
  "trigger_count": 5,
  "triggers": [
    {
      "id": "trg_001",
      "name": "New Customer Onboarding",
      "type": "crm_event",
      "event": "customer.created",
      "status": "active",
      "integration": "CRM"
    }
  ]
}
```

#### POST /api/trigger
Creates or updates an automation trigger.

**Request Body** (Create):
```json
{
  "action": "create",
  "trigger_type": "webhook",
  "name": "High-Value Lead Alert",
  "event": "lead.qualified"
}
```

**Request Body** (Update):
```json
{
  "action": "update",
  "trigger_id": "trg_001",
  "updates": {
    "status": "active"
  }
}
```

**Request Body** (Test):
```json
{
  "action": "test",
  "trigger_id": "trg_001"
}
```

**Response**:
```json
{
  "message": "Trigger create processed successfully",
  "status": "success",
  "timestamp": "2024-01-01T12:00:00.000000",
  "action": "create",
  "trigger_type": "webhook",
  "result": {
    "trigger_id": "trg_1234567890",
    "status": "created",
    "integration_steps": [
      {
        "integration": "Webhook_Service",
        "action": "register_trigger",
        "status": "completed"
      }
    ]
  }
}
```

**Integration Points**:
- Webhook Service: External system webhooks
- Scheduler: Cron-based time triggers
- Event Bus: Real-time event subscriptions
- CRM: Customer lifecycle events
- Email: Notification on trigger activation
- Slack: Alert team when triggers fire

**Supported Trigger Types**:
- `webhook` - HTTP webhook endpoints
- `scheduled` - Cron-based time triggers
- `event` - Event-driven triggers
- `crm_event` - CRM lifecycle events

**Supported Actions**:
- `create` - Create a new trigger
- `update` - Update existing trigger
- `enable` - Enable a trigger
- `disable` - Disable a trigger
- `test` - Test trigger execution

---

### OpenAI API - /api/openai

Secure server-side proxy for OpenAI API requests. This endpoint keeps your OpenAI API key secure by handling all requests on the server side, preventing key exposure in the frontend.

#### POST /api/openai

Processes chat completion requests using OpenAI's GPT models.

**Request Body**:
```json
{
  "messages": [
    { "role": "user", "content": "How can I automate my email workflows?" }
  ],
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "max_tokens": 500
}
```

**Parameters**:
- `messages` (required): Array of message objects with `role` and `content`
- `model` (optional): OpenAI model to use (default: "gpt-3.5-turbo")
- `temperature` (optional): Sampling temperature 0-2 (default: 0.7)
- `max_tokens` (optional): Maximum tokens in response (default: 500)

**Success Response**:
```json
{
  "choices": [
    {
      "message": {
        "content": "Here are some ways to automate your email workflows..."
      }
    }
  ]
}
```

**Demo Mode Response** (when OPENAI_API_KEY is not configured):
```json
{
  "error": "OpenAI API key not configured. Running in demo mode.",
  "demoMode": true
}
```

**Error Response**:
```json
{
  "error": "Error message describing what went wrong",
  "demoMode": false
}
```

**Security Features**:
- API key is only stored server-side as `OPENAI_API_KEY` environment variable
- Never exposed to the browser or frontend code
- All requests are proxied through the secure backend
- Compatible with Vercel deployment and environment variables

**Demo Mode Behavior**:
- If `OPENAI_API_KEY` is not set, the API returns a demo mode flag
- Frontend automatically falls back to showing demo responses
- No charges incurred when running in demo mode
- Perfect for testing and development without API costs

## Technology Stack

### Frontend
- **Next.js 14**: React framework with server-side rendering
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript 5**: Type-safe JavaScript
- **CSS-in-JS**: Inline styles for component-based styling

### Backend
- **Python 3.9+**: Core programming language for API
- **BaseHTTPRequestHandler**: Built-in Python HTTP server for serverless functions
- **JSON**: Data exchange format

### Deployment
- **Vercel**: Hosting platform with automatic deployments
- **Git**: Version control
- **GitHub**: Code repository and CI/CD integration

## Development Tips

1. **Hot Reload**: The development server automatically reloads when you save files
2. **API Testing**: Use tools like Postman or curl to test API endpoints
3. **TypeScript Errors**: Run `npm run build` to check for TypeScript errors
4. **Linting**: Run `npm run lint` to check code quality

## Extending the Application

### Adding New Pages
Create new files in the `pages/` directory:
```typescript
// pages/about.tsx
export default function About() {
  return <div>About Page</div>;
}
```

### Adding New API Endpoints
Create new Python files in the `pages/api/` directory:
```python
# pages/api/tasks.py
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"message": "Tasks API"}).encode())
```

## Troubleshooting

### Common Issues

**Issue**: `Module not found` error
- **Solution**: Run `npm install` to install dependencies

**Issue**: Python API not working locally
- **Solution**: Vercel's Python runtime is designed for deployment. For local testing, use `vercel dev` instead of `npm run dev`

**Issue**: TypeScript errors
- **Solution**: Check `tsconfig.json` and ensure all types are properly defined

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the maintainers.

## Roadmap

- [ ] Add authentication and user management
- [ ] Implement more automation workflows
- [ ] Add database integration
- [ ] Create admin dashboard
- [ ] Add real-time notifications
- [ ] Implement testing suite

## Acknowledgments

Built with ❤️ using Next.js and Python on Vercel.

