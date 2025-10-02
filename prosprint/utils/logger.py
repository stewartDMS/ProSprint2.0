"""Activity logger for ProSprint AI."""

import json
import os
from datetime import datetime
from pathlib import Path


class ActivityLogger:
    """Logs all actions and their results."""

    def __init__(self, log_dir: str = "logs"):
        """
        Initialize the activity logger.
        
        Args:
            log_dir: Directory to store log files
        """
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        self.log_file = self.log_dir / f"activity_{datetime.now().strftime('%Y%m%d')}.jsonl"

    def log_action(self, action) -> None:
        """
        Log an action and its result.
        
        Args:
            action: Action object to log
        """
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "action_id": action.id,
            "action_type": action.type.value,
            "description": action.description,
            "status": action.status.value,
            "parameters": action.parameters,
            "result": action.result,
            "error": action.error
        }

        with open(self.log_file, "a") as f:
            f.write(json.dumps(log_entry) + "\n")

    def get_recent_logs(self, limit: int = 10) -> list[dict]:
        """
        Get recent log entries.
        
        Args:
            limit: Maximum number of entries to return
            
        Returns:
            List of log entries
        """
        if not self.log_file.exists():
            return []

        logs = []
        with open(self.log_file, "r") as f:
            for line in f:
                if line.strip():
                    logs.append(json.loads(line))

        return logs[-limit:]

    def get_logs_by_date(self, date: str) -> list[dict]:
        """
        Get logs for a specific date.
        
        Args:
            date: Date in YYYYMMDD format
            
        Returns:
            List of log entries
        """
        log_file = self.log_dir / f"activity_{date}.jsonl"
        
        if not log_file.exists():
            return []

        logs = []
        with open(log_file, "r") as f:
            for line in f:
                if line.strip():
                    logs.append(json.loads(line))

        return logs
