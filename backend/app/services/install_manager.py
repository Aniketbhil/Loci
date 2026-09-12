import json
import logging
import threading
import time
from typing import Dict, Any, Optional
from app.services.ollama_client import ollama_client

logger = logging.getLogger(__name__)


class ModelInstallTask:
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.state = "installing"  # installing, completed, error, cancelled
        self.status = "Starting download..."
        self.completed = 0
        self.total = 0
        self.percent = 0
        self.error: Optional[str] = None
        self.cancel_requested = False
        self._thread: Optional[threading.Thread] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "model_name": self.model_name,
            "state": self.state,
            "status": self.status,
            "completed": self.completed,
            "total": self.total,
            "percent": self.percent,
            "error": self.error,
        }


class InstallManager:
    def __init__(self):
        self._tasks: Dict[str, ModelInstallTask] = {}
        self._lock = threading.Lock()

    def get_task(self, model_name: str) -> Optional[ModelInstallTask]:
        with self._lock:
            return self._tasks.get(model_name)

    def get_all_tasks(self) -> Dict[str, Dict[str, Any]]:
        with self._lock:
            return {name: task.to_dict() for name, task in self._tasks.items()}

    def start_install(self, model_name: str) -> ModelInstallTask:
        with self._lock:
            existing = self._tasks.get(model_name)
            if existing and existing.state == "installing":
                return existing

            task = ModelInstallTask(model_name)
            self._tasks[model_name] = task

            thread = threading.Thread(target=self._run_pull, args=(task,), daemon=True)
            task._thread = thread
            thread.start()
            return task

    def _run_pull(self, task: ModelInstallTask):
        try:
            for progress in ollama_client.pull_model(task.model_name, stream=True):
                if task.cancel_requested:
                    task.state = "cancelled"
                    task.status = "Cancelled"
                    break

                status_str = progress.get("status", "Downloading...")
                completed = progress.get("completed", 0)
                total = progress.get("total", 0)

                task.status = status_str
                task.completed = completed
                task.total = total
                if total > 0:
                    task.percent = round((completed / total) * 100)

                if status_str in ("success", "done"):
                    task.state = "completed"
                    task.percent = 100

            if not task.cancel_requested and task.state != "error":
                task.state = "completed"
                task.percent = 100
                task.status = "Installed & ready"

        except Exception as e:
            if not task.cancel_requested:
                logger.error(f"Error pulling model {task.model_name}: {e}")
                task.state = "error"
                task.error = str(e)
                task.status = f"Error: {str(e)}"

    def cancel_install(self, model_name: str) -> bool:
        with self._lock:
            task = self._tasks.get(model_name)
            if task:
                task.cancel_requested = True
                task.state = "cancelled"
                task.status = "Cancelled"
                self._tasks.pop(model_name, None)

        try:
            ollama_client.delete_model(model_name)
        except Exception as e:
            logger.warning(f"Failed to delete model {model_name} in Ollama: {e}")
        return True


install_manager = InstallManager()
