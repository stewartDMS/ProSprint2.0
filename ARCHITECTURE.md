# ProSprint AI Architecture

## Overview

ProSprint AI is designed as a modular, extensible system that bridges natural language input with business tool automation. The architecture follows a clean separation of concerns with distinct layers for processing, execution, and integration.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLI Interface                           │
│                    (prosprint/cli.py)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                   ProSprint Core                             │
│                (prosprint/core/prosprint.py)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Orchestration Layer                                  │   │
│  │  - Workflow management                                │   │
│  │  - Preview generation                                 │   │
│  │  - Approval handling                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└───────┬──────────────────────────────────┬─────────────────┘
        │                                  │
┌───────▼──────────────┐         ┌─────────▼─────────────────┐
│  Prompt Processor    │         │   Action Executor         │
│  (AI-powered)        │         │  (Integration Engine)     │
│                      │         │                           │
│  - NLP Analysis      │         │  - Action dispatch        │
│  - Action Detection  │         │  - Error handling         │
│  - Parameter Extract │         │  - Result aggregation     │
└──────────────────────┘         └────────┬──────────────────┘
                                          │
                       ┌──────────────────┴──────────────────┐
                       │                                     │
        ┌──────────────▼───────┐              ┌──────────────▼──────┐
        │  Business Integrations│              │   Activity Logger   │
        │                      │              │                     │
        │  - CRM              │              │  - JSON logs        │
        │  - Email            │              │  - Audit trail      │
        │  - Slack            │              │  - Query interface  │
        │  - Documents        │              │                     │
        └──────────────────────┘              └─────────────────────┘
```

## Core Components

### 1. CLI Interface (`prosprint/cli.py`)

**Responsibility**: User interaction and command-line interface

**Features**:
- Command parsing with Click
- Rich terminal UI with colors and panels
- Interactive demo mode
- Configuration validation

**Commands**:
- `run`: Execute prompts
- `logs`: View activity logs
- `info`: System information
- `demo`: Interactive mode

### 2. ProSprint Core (`prosprint/core/prosprint.py`)

**Responsibility**: Main orchestration and workflow management

**Key Functions**:
- `process_prompt()`: Main workflow orchestrator
- `_display_results()`: Format and display execution results
- `show_activity_log()`: Display historical activity

**Workflow**:
1. Accept natural language input
2. Convert to structured actions
3. Generate preview
4. Handle approval
5. Execute actions
6. Display results

### 3. Prompt Processor (`prosprint/core/prompt_processor.py`)

**Responsibility**: Convert natural language to structured actions

**Approach**:
- **Primary**: OpenAI GPT-4 for intelligent parsing
- **Fallback**: Pattern matching for demo mode

**Output**: List of `Action` objects with:
- Action type
- Description
- Parameters
- Metadata

### 4. Action Model (`prosprint/core/action.py`)

**Responsibility**: Data models and action definitions

**Models**:
- `ActionType`: Enumeration of supported actions
- `ActionStatus`: Lifecycle states
- `Action`: Complete action specification

**Action Lifecycle**:
```
PENDING → APPROVED → EXECUTING → COMPLETED/FAILED
                              → CANCELLED
```

### 5. Action Executor (`prosprint/core/executor.py`)

**Responsibility**: Execute actions across integrations

**Features**:
- Integration routing
- Error handling
- Result collection
- Logging coordination

**Execution Flow**:
```python
1. Update status to EXECUTING
2. Route to appropriate integration
3. Execute action
4. Handle result/error
5. Update action with result
6. Log execution
```

## Integration Layer

### Base Integration Pattern

Each integration follows a consistent pattern:

```python
class IntegrationName:
    def __init__(self):
        # Load configuration
        pass
    
    def execute(self, action) -> dict:
        # Perform action
        # Return result dictionary
        pass
```

### Available Integrations

#### CRM Integration (`integrations/crm.py`)
- Contact management
- Deal updates
- Company records
- Custom field updates

#### Email Integration (`integrations/email.py`)
- SMTP-based email sending
- Template support
- Attachment handling
- HTML/Plain text

#### Slack Integration (`integrations/slack.py`)
- Channel posting
- Direct messages
- Rich message formatting
- File uploads

#### Document Integration (`integrations/document.py`)
- Report generation
- Document summarization
- Template rendering
- Format conversion

## Configuration Management

### Config System (`prosprint/config.py`)

**Features**:
- Environment variable loading
- Validation
- Default values
- Multiple environment support

**Configuration Hierarchy**:
1. Environment variables
2. `.env` file
3. Default values

## Activity Logging

### Logger (`prosprint/utils/logger.py`)

**Format**: JSON Lines (JSONL)

**Log Entry Structure**:
```json
{
    "timestamp": "ISO-8601",
    "action_id": "UUID",
    "action_type": "type",
    "description": "Human readable",
    "status": "completed/failed",
    "parameters": {},
    "result": {},
    "error": null
}
```

**Features**:
- Daily log rotation
- Query interface
- Date-based retrieval
- Audit compliance

## Data Flow

### Request Flow

```
User Input
    ↓
CLI Parse
    ↓
ProSprint Core
    ↓
Prompt Processor (AI)
    ↓
Action Objects
    ↓
Preview Display
    ↓
User Approval
    ↓
Action Executor
    ↓
Integration(s)
    ↓
Results + Logging
    ↓
Display Results
```

### Error Handling Flow

```
Error Occurs
    ↓
Catch in Executor
    ↓
Update Action Status → FAILED
    ↓
Log Error
    ↓
Display to User
    ↓
Continue with Next Action (if batch)
```

## Extensibility

### Adding New Integrations

1. Create integration module:
```python
# prosprint/integrations/new_integration.py
class NewIntegration:
    def execute(self, action):
        # Implementation
        return {"status": "completed"}
```

2. Register in executor:
```python
# prosprint/core/executor.py
self.new_integration = NewIntegration()

# In execute() method:
elif action.type == ActionType.NEW_ACTION:
    result = self.new_integration.execute(action)
```

3. Add action type:
```python
# prosprint/core/action.py
class ActionType(str, Enum):
    NEW_ACTION = "new_action"
```

### Adding New Commands

```python
# prosprint/cli.py
@cli.command()
def new_command():
    """New command description."""
    # Implementation
    pass
```

## Security Considerations

### Credential Management
- Environment variables only
- No hardcoded secrets
- `.env` in `.gitignore`
- Separate production/development configs

### Approval Workflow
- Explicit user confirmation
- Action preview before execution
- Auto-approve for trusted workflows only

### Audit Trail
- All actions logged
- Timestamps preserved
- Immutable log files
- Query interface for compliance

## Performance Considerations

### Optimization Points
1. **Parallel Execution**: Future enhancement for independent actions
2. **Caching**: AI responses for repeated prompts
3. **Batch Operations**: Group similar actions
4. **Connection Pooling**: Reuse integration connections

### Scalability
- Stateless design
- Horizontal scaling ready
- Queue-based execution (future)
- Rate limiting aware

## Testing Strategy

### Unit Tests
- Individual component testing
- Mock external dependencies
- Action lifecycle validation

### Integration Tests
- End-to-end workflows
- Real integration testing (with test credentials)
- Error scenario handling

### Demo Mode
- No external dependencies
- Simulated execution
- Full UI experience

## Future Enhancements

### Planned Features
1. **Parallel Execution**: Execute independent actions concurrently
2. **Workflow Templates**: Pre-defined action sequences
3. **Scheduling**: Cron-like scheduled execution
4. **Web UI**: Browser-based interface
5. **API Server**: REST API for external integrations
6. **Plugin System**: Dynamic integration loading
7. **Multi-language Support**: I18n for global use
8. **Advanced AI**: Custom model training
9. **Database Backend**: Persistent storage
10. **Analytics Dashboard**: Usage metrics and insights

## Technology Stack

- **Language**: Python 3.8+
- **AI**: OpenAI GPT-4
- **CLI**: Click + Rich
- **Config**: python-dotenv
- **Validation**: Pydantic
- **Testing**: pytest (planned)
- **Logging**: JSON Lines

## Design Principles

1. **Modularity**: Independent, interchangeable components
2. **Extensibility**: Easy to add new integrations and features
3. **Safety**: Approval workflow prevents unintended actions
4. **Transparency**: Full visibility into what will be executed
5. **Auditability**: Complete activity logs
6. **Usability**: Natural language interface
7. **Reliability**: Graceful error handling
8. **Maintainability**: Clean, documented code

---

For implementation details, see the source code and inline documentation.
