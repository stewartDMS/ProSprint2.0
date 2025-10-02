# Contributing to ProSprint AI

Thank you for your interest in contributing to ProSprint AI! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/ProSprint2.0.git
   cd ProSprint2.0
   ```

3. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -e .
   ```

5. Set up your environment:
   ```bash
   cp .env.example .env
   # Add your API keys to .env
   ```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in the appropriate modules
2. Test your changes thoroughly
3. Update documentation if needed
4. Ensure code follows the project style

### Testing

Run tests before submitting:

```bash
# Run all tests (when test suite is implemented)
pytest tests/

# Test your changes manually
prosprint run "Your test prompt"
prosprint demo
```

### Committing Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "Add feature: Brief description of what you added"
```

Follow these commit message guidelines:
- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Reference issues when applicable: "Fix #123: Issue description"

### Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub
3. Provide a clear description of your changes
4. Link any related issues
5. Wait for review and address feedback

## Code Style Guidelines

### Python Style

- Follow PEP 8 guidelines
- Use type hints where appropriate
- Write docstrings for functions and classes
- Keep functions focused and single-purpose
- Use meaningful variable names

Example:
```python
def process_action(action: Action) -> dict[str, Any]:
    """
    Process a single action and return results.
    
    Args:
        action: Action object to process
        
    Returns:
        Dictionary containing execution results
    """
    # Implementation
    pass
```

### Documentation

- Update README.md if adding new features
- Add examples to EXAMPLES.md
- Update ARCHITECTURE.md for structural changes
- Include inline comments for complex logic
- Write clear docstrings

## Adding New Integrations

To add a new integration:

1. Create a new file in `prosprint/integrations/`:
   ```python
   # prosprint/integrations/your_integration.py
   from typing import Any
   from prosprint.config import config
   
   class YourIntegration:
       """Integration with Your Service."""
       
       def __init__(self):
           """Initialize the integration."""
           self.api_key = config.your_api_key
       
       def execute(self, action) -> dict[str, Any]:
           """
           Execute an action on your service.
           
           Args:
               action: Action object with parameters
               
           Returns:
               Result dictionary
           """
           # Implementation
           return {
               "status": "completed",
               "message": "Action executed successfully"
           }
   ```

2. Add configuration to `prosprint/config.py`:
   ```python
   self.your_api_key = os.getenv("YOUR_API_KEY", "")
   ```

3. Register in `prosprint/core/executor.py`:
   ```python
   from prosprint.integrations.your_integration import YourIntegration
   
   # In __init__:
   self.your_integration = YourIntegration()
   
   # In execute:
   elif action.type == ActionType.YOUR_ACTION:
       result = self.your_integration.execute(action)
   ```

4. Add action type to `prosprint/core/action.py`:
   ```python
   class ActionType(str, Enum):
       YOUR_ACTION = "your_action"
   ```

5. Update documentation
6. Add tests
7. Submit PR

## Adding New Features

When adding new features:

1. Discuss major changes in an issue first
2. Keep changes focused and atomic
3. Update tests
4. Update documentation
5. Ensure backward compatibility when possible

## Bug Reports

When reporting bugs, include:

- ProSprint AI version
- Python version
- Operating system
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages/logs
- Configuration (without sensitive data)

Use the bug report template:

```markdown
**Description**
Brief description of the bug

**To Reproduce**
1. Step 1
2. Step 2
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- ProSprint AI version: 
- Python version:
- OS:

**Additional Context**
Any other relevant information
```

## Feature Requests

For feature requests:

- Describe the feature clearly
- Explain the use case
- Provide examples if possible
- Discuss potential implementation approaches

## Code Review Process

All submissions require review. We aim to:

- Respond to PRs within 48 hours
- Provide constructive feedback
- Help contributors improve their code
- Maintain high code quality

## Community Guidelines

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the code, not the person
- Follow the code of conduct

## Getting Help

- Check existing documentation
- Search existing issues
- Ask questions in issues/discussions
- Reach out to maintainers

## Recognition

Contributors will be:
- Listed in commit history
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ProSprint AI! 🚀
