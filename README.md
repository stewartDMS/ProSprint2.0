
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
│       └── automate.py        # Python API endpoint for automation
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

The Python API endpoint is available at [http://localhost:3000/api/automate](http://localhost:3000/api/automate).

### Testing the API

**GET Request** (Check status):
```bash
curl http://localhost:3000/api/automate
```

**POST Request** (Send automation task):
```bash
curl -X POST http://localhost:3000/api/automate \
  -H "Content-Type: application/json" \
  -d '{"task": "sample_automation", "priority": "high"}'
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

### GET /api/automate
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
  ]
}
```

### POST /api/automate
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
  "message": "Automation task received",
  "status": "processing",
  "timestamp": "2024-01-01T12:00:00.000000",
  "received_data": {
    "task": "sample_automation",
    "priority": "high"
  }
}
```

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

