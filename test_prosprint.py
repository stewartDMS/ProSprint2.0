#!/usr/bin/env python3
"""
Comprehensive test script for ProSprint AI
Tests all major functionality without external API dependencies
"""

import sys
from prosprint.core.action import Action, ActionType, ActionStatus
from prosprint.core.prompt_processor import PromptProcessor
from prosprint.core.executor import ActionExecutor
from prosprint.core.prosprint import ProSprintAI
from prosprint.utils.logger import ActivityLogger
from prosprint.config import config


def test_action_model():
    """Test action model creation and methods."""
    print("Testing Action Model...")
    
    action = Action(
        id="test-123",
        type=ActionType.SEND_EMAIL,
        description="Test email action",
        parameters={"recipient": "test@example.com", "subject": "Test"}
    )
    
    assert action.id == "test-123"
    assert action.type == ActionType.SEND_EMAIL
    assert action.status == ActionStatus.PENDING
    
    preview = action.to_preview()
    assert "send_email" in preview
    assert "Test email action" in preview
    
    print("✓ Action Model tests passed")


def test_prompt_processor():
    """Test prompt processing (fallback mode)."""
    print("\nTesting Prompt Processor...")
    
    processor = PromptProcessor()
    
    # Test email detection
    actions = processor.process("Send an email to john@example.com")
    assert len(actions) > 0
    assert any(a.type == ActionType.SEND_EMAIL for a in actions)
    
    # Test Slack detection
    actions = processor.process("Post to Slack: Hello team")
    assert len(actions) > 0
    assert any(a.type == ActionType.SLACK_POST for a in actions)
    
    # Test CRM detection
    actions = processor.process("Update CRM contact")
    assert len(actions) > 0
    assert any(a.type == ActionType.CRM_UPDATE for a in actions)
    
    # Test report detection
    actions = processor.process("Draft a quarterly report")
    assert len(actions) > 0
    assert any(a.type == ActionType.DRAFT_REPORT for a in actions)
    
    # Test summarization detection
    actions = processor.process("Summarize this document")
    assert len(actions) > 0
    assert any(a.type == ActionType.SUMMARIZE_DOCUMENT for a in actions)
    
    print("✓ Prompt Processor tests passed")


def test_integrations():
    """Test integration execution."""
    print("\nTesting Integrations...")
    
    executor = ActionExecutor()
    
    # Test email integration
    email_action = Action(
        id="email-test",
        type=ActionType.SEND_EMAIL,
        description="Test email",
        parameters={"recipient": "test@example.com", "subject": "Test", "body": "Hello"}
    )
    result = executor.execute(email_action)
    assert result.status == ActionStatus.COMPLETED
    assert result.result is not None
    
    # Test Slack integration
    slack_action = Action(
        id="slack-test",
        type=ActionType.SLACK_POST,
        description="Test Slack post",
        parameters={"channel": "#test", "message": "Hello"}
    )
    result = executor.execute(slack_action)
    assert result.status == ActionStatus.COMPLETED
    
    # Test CRM integration
    crm_action = Action(
        id="crm-test",
        type=ActionType.CRM_UPDATE,
        description="Test CRM update",
        parameters={"action": "update", "details": "Test"}
    )
    result = executor.execute(crm_action)
    assert result.status == ActionStatus.COMPLETED
    
    # Test document generation
    doc_action = Action(
        id="doc-test",
        type=ActionType.DRAFT_REPORT,
        description="Test report",
        parameters={"title": "Test Report", "content": "Test content"}
    )
    result = executor.execute(doc_action)
    assert result.status == ActionStatus.COMPLETED
    assert "report" in result.result
    
    # Test summarization
    summary_action = Action(
        id="summary-test",
        type=ActionType.SUMMARIZE_DOCUMENT,
        description="Test summarization",
        parameters={"text": "This is a long text that needs to be summarized"}
    )
    result = executor.execute(summary_action)
    assert result.status == ActionStatus.COMPLETED
    assert "summary" in result.result
    
    print("✓ Integration tests passed")


def test_activity_logger():
    """Test activity logging."""
    print("\nTesting Activity Logger...")
    
    logger = ActivityLogger(log_dir="logs")
    
    test_action = Action(
        id="log-test",
        type=ActionType.SEND_EMAIL,
        description="Test log action",
        parameters={}
    )
    test_action.status = ActionStatus.COMPLETED
    
    logger.log_action(test_action)
    
    # Retrieve logs
    recent_logs = logger.get_recent_logs(limit=1)
    assert len(recent_logs) > 0
    
    print("✓ Activity Logger tests passed")


def test_batch_execution():
    """Test batch action execution."""
    print("\nTesting Batch Execution...")
    
    executor = ActionExecutor()
    
    actions = [
        Action(
            id=f"batch-{i}",
            type=ActionType.SLACK_POST,
            description=f"Test action {i}",
            parameters={"channel": "#test", "message": f"Message {i}"}
        )
        for i in range(3)
    ]
    
    results = executor.execute_batch(actions)
    assert len(results) == 3
    assert all(a.status == ActionStatus.COMPLETED for a in results)
    
    print("✓ Batch Execution tests passed")


def test_config():
    """Test configuration management."""
    print("\nTesting Configuration...")
    
    assert config is not None
    is_valid, error = config.validate()
    
    # In demo mode, OPENAI_API_KEY might not be set
    if not is_valid:
        print(f"  ℹ Config validation: {error} (expected in demo mode)")
    
    print("✓ Configuration tests passed")


def run_all_tests():
    """Run all test functions."""
    print("=" * 60)
    print("ProSprint AI - Comprehensive Test Suite")
    print("=" * 60)
    
    try:
        test_action_model()
        test_prompt_processor()
        test_integrations()
        test_activity_logger()
        test_batch_execution()
        test_config()
        
        print("\n" + "=" * 60)
        print("✓ All tests passed successfully!")
        print("=" * 60)
        return 0
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        return 1
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
