# ProSprint AI Examples

This document provides detailed examples of how to use ProSprint AI for various business automation tasks.

## Table of Contents

1. [Email Automation](#email-automation)
2. [Slack Integration](#slack-integration)
3. [CRM Management](#crm-management)
4. [Document Generation](#document-generation)
5. [Document Summarization](#document-summarization)
6. [Complex Workflows](#complex-workflows)

## Email Automation

### Send a Simple Email

```bash
prosprint run "Send an email to john@example.com about the quarterly report"
```

**What happens:**
- AI identifies this as an email action
- Extracts recipient: john@example.com
- Generates subject and body based on context
- Shows preview for approval
- Sends email via configured SMTP

### Send Email with Specific Details

```bash
prosprint run "Send an email to team@company.com with subject 'Sprint Review' and tell them about our progress this week"
```

**Result:**
- Subject: "Sprint Review"
- Body: Generated based on the prompt
- Recipient: team@company.com

## Slack Integration

### Post to Default Channel

```bash
prosprint run "Post to Slack: Build completed successfully with all tests passing"
```

### Post to Specific Channel

```bash
prosprint run "Post to Slack #engineering: New deployment to production scheduled for 3 PM"
```

### Announcement

```bash
prosprint run "Announce on Slack: All-hands meeting tomorrow at 10 AM in the main conference room"
```

## CRM Management

### Update Contact

```bash
prosprint run "Update CRM contact Sarah Johnson with status 'qualified' and note 'Interested in enterprise plan'"
```

### Add New Lead

```bash
prosprint run "Add new lead to CRM: John Doe from Acme Corp, interested in our services"
```

### Update Deal Status

```bash
prosprint run "Update CRM deal 'Q4 Enterprise Contract' to stage 'negotiation'"
```

## Document Generation

### Draft a Report

```bash
prosprint run "Draft a quarterly sales report including revenue, growth metrics, and top performing products"
```

### Create Meeting Notes

```bash
prosprint run "Create meeting notes document for client strategy session with action items and next steps"
```

### Generate Proposal

```bash
prosprint run "Draft a project proposal for website redesign including timeline and deliverables"
```

## Document Summarization

### Summarize Long Text

```bash
prosprint run "Summarize this document: [paste your long text here]"
```

### Extract Key Points

```bash
prosprint run "Summarize the key points from this meeting transcript: [transcript text]"
```

## Complex Workflows

### Multi-Action Workflow

```bash
prosprint run "Update CRM contact John Smith as 'closed-won', send him a welcome email, and post to Slack that we have a new customer"
```

**What happens:**
1. Updates CRM contact status
2. Sends welcome email to John Smith
3. Posts celebration message to Slack
4. All actions shown in preview
5. Execute after approval

### Batch Email

```bash
prosprint run "Send email to sales@company.com and support@company.com about the new product launch next week"
```

## Auto-Approve Mode

For automated workflows or when you trust the actions:

```bash
prosprint run -y "Post daily standup reminder to Slack #team"
```

The `-y` flag skips the approval step.

## Demo Mode

Try ProSprint AI without configuring API keys:

```bash
prosprint demo
```

Then enter prompts interactively:
```
Enter your prompt: Send an email to boss@company.com about my vacation request
Enter your prompt: Update CRM for follow-up next week
Enter your prompt: exit
```

## Activity Logs

View what ProSprint AI has done:

```bash
# View last 10 actions
prosprint logs

# View last 50 actions
prosprint logs --limit 50
```

## Best Practices

### Be Specific

❌ Bad: "Send email"
✅ Good: "Send email to john@example.com about project deadline"

### Include Context

❌ Bad: "Update CRM"
✅ Good: "Update CRM contact Sarah Johnson with status 'qualified' and next follow-up date as next Monday"

### Review Previews

Always review the action preview before approving to ensure:
- Correct recipients
- Appropriate message content
- Intended actions

### Use Auto-Approve Carefully

Only use `-y` flag when:
- You've tested the prompt before
- The action is low-risk
- You're running automated workflows

### Check Logs Regularly

Review activity logs to:
- Audit what was executed
- Debug issues
- Track automation patterns

## Troubleshooting

### No API Key Configured

If you see: "Configuration Error: OPENAI_API_KEY is required"

**Solution:**
1. Copy `.env.example` to `.env`
2. Add your OpenAI API key
3. Run the command again

### Email Not Sending

**Check:**
- SMTP credentials in `.env`
- Firewall/security settings
- App password (if using Gmail)

### Slack Messages Not Posting

**Check:**
- Slack token in `.env`
- Channel name (include # symbol)
- Bot permissions

### Actions Simulated Instead of Executed

This happens when integration credentials are not configured. Add credentials to `.env` for real execution.

## Integration with CI/CD

ProSprint AI can be integrated into automated workflows:

```yaml
# GitHub Actions example
- name: Notify team
  run: |
    prosprint run -y "Post to Slack: Deployment to production completed successfully"
```

## Scripting

Use ProSprint AI in bash scripts:

```bash
#!/bin/bash
# notify.sh

if [ "$BUILD_STATUS" == "success" ]; then
  prosprint run -y "Post to Slack: Build #$BUILD_NUMBER completed successfully"
else
  prosprint run -y "Send email to team@company.com about build failure #$BUILD_NUMBER"
fi
```

## Advanced Usage

### Chaining Commands

```bash
prosprint run "Draft report on Q4 results" && \
prosprint run "Send email to executives@company.com with the Q4 report" && \
prosprint run "Post to Slack: Q4 report has been sent to executives"
```

### Environment-Specific Configuration

```bash
# Development
export ENV=dev
prosprint run "Post to Slack #dev-team: New feature deployed to dev"

# Production
export ENV=prod
prosprint run "Post to Slack #general: New release v2.0 is live"
```

---

For more information, see the main [README.md](README.md).
