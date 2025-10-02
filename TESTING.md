# Testing ProSprint AI

This document describes how to test ProSprint AI and verify that everything is working correctly.

## Running the Test Suite

ProSprint AI includes a comprehensive test suite that validates all core functionality without requiring external API credentials.

### Run All Tests

```bash
python test_prosprint.py
```

Expected output:
```
============================================================
ProSprint AI - Comprehensive Test Suite
============================================================
Testing Action Model...
✓ Action Model tests passed

Testing Prompt Processor...
✓ Prompt Processor tests passed

Testing Integrations...
✓ Integration tests passed

Testing Activity Logger...
✓ Activity Logger tests passed

Testing Batch Execution...
✓ Batch Execution tests passed

Testing Configuration...
✓ Configuration tests passed

============================================================
✓ All tests passed successfully!
============================================================
```

## Manual Testing

### Test the CLI

1. **Test system information:**
```bash
prosprint info
```

2. **Test a simple action (auto-approve mode):**
```bash
prosprint run -y "Send an email to test@example.com"
```

3. **Test with approval workflow:**
```bash
prosprint run "Post to Slack: Testing ProSprint AI"
# Answer 'y' when prompted
```

4. **Test activity logs:**
```bash
prosprint logs
```

5. **Test interactive demo:**
```bash
prosprint demo
# Try various prompts, then type 'exit'
```

### Test Different Action Types

#### Email Actions
```bash
prosprint run -y "Send an email to john@example.com about the quarterly report"
```

#### Slack Actions
```bash
prosprint run -y "Post to Slack #general: Team meeting at 3 PM"
```

#### CRM Actions
```bash
prosprint run -y "Update CRM contact Sarah Johnson with status qualified"
```

#### Document Generation
```bash
prosprint run -y "Draft a report on Q4 sales performance"
```

#### Summarization
```bash
prosprint run -y "Summarize this text: ProSprint AI is an intelligent automation platform"
```

#### Multi-Action Workflows
```bash
prosprint run -y "Update CRM for new lead Jane Smith and send her a welcome email"
```

## Testing with Real APIs

To test with actual API integrations:

1. **Configure credentials in `.env`:**
```bash
cp .env.example .env
# Edit .env and add your API keys
```

2. **Test OpenAI integration:**
```bash
# Add OPENAI_API_KEY to .env
prosprint run "Send an email to team@company.com about project status"
# Should use AI processing instead of fallback
```

3. **Test Slack integration:**
```bash
# Add SLACK_TOKEN and SLACK_CHANNEL to .env
prosprint run -y "Post to Slack: Hello from ProSprint AI"
# Should actually post to Slack
```

4. **Test Email integration:**
```bash
# Add SMTP credentials to .env
prosprint run -y "Send email to yourself@yourdomain.com with subject 'Test'"
# Should send actual email
```

## Automated Testing

### Using pytest (Future)

When the pytest infrastructure is added:

```bash
# Install pytest
pip install pytest pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=prosprint

# Run specific test file
pytest tests/test_actions.py

# Run tests in verbose mode
pytest -v
```

### Continuous Integration

The project is ready for CI/CD integration. Example GitHub Actions workflow:

```yaml
name: Test ProSprint AI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -e .
      - name: Run tests
        run: python test_prosprint.py
```

## Test Coverage

Current test coverage includes:

- ✅ Action model creation and validation
- ✅ Prompt processing (fallback mode)
- ✅ All integration types (CRM, Email, Slack, Documents)
- ✅ Activity logging
- ✅ Batch execution
- ✅ Configuration management
- ✅ CLI commands
- ✅ Error handling
- ✅ Result formatting

## Testing Checklist

Before releasing, verify:

- [ ] All unit tests pass
- [ ] CLI commands work correctly
- [ ] Demo mode functions without API keys
- [ ] Activity logs are created and readable
- [ ] Configuration validation works
- [ ] Error messages are clear and helpful
- [ ] Preview displays correctly
- [ ] Approval workflow functions
- [ ] Multi-action prompts work
- [ ] All integrations execute (simulated mode)
- [ ] Documentation is accurate

## Troubleshooting Tests

### Import Errors

If you get import errors:
```bash
pip install -e .
```

### Permission Errors on Logs

If you get permission errors creating logs:
```bash
mkdir -p logs
chmod 755 logs
```

### Module Not Found

Ensure you're in the project directory:
```bash
cd /path/to/ProSprint2.0
python test_prosprint.py
```

## Performance Testing

Test performance with multiple actions:

```bash
# Time a single action
time prosprint run -y "Send an email to test@example.com"

# Test batch processing
prosprint run -y "Send emails to john@example.com, jane@example.com, and bob@example.com"
```

## Integration Testing

When testing with real services:

1. Use test accounts/channels
2. Verify actions are executed correctly
3. Check activity logs for accuracy
4. Validate error handling
5. Test rate limiting behavior

## Security Testing

Verify security measures:

1. **Credential Protection:**
   - Check that `.env` is in `.gitignore`
   - Verify API keys aren't logged
   - Test that credentials aren't displayed in previews

2. **Approval Workflow:**
   - Verify approval is required without `-y` flag
   - Test cancellation works
   - Ensure cancelled actions aren't executed

3. **Activity Logging:**
   - Check logs don't contain sensitive data
   - Verify log permissions are restrictive
   - Test log rotation works

## Reporting Issues

When reporting test failures, include:

1. Test output
2. ProSprint version (`prosprint --version`)
3. Python version (`python --version`)
4. Operating system
5. Steps to reproduce
6. Expected vs actual behavior

## Contributing Tests

When adding new features:

1. Add tests to `test_prosprint.py`
2. Ensure tests are isolated
3. Use clear test names
4. Document expected behavior
5. Test both success and error cases

---

For more information, see [CONTRIBUTING.md](CONTRIBUTING.md).
