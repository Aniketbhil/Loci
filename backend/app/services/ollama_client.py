import json
from typing import Any, Dict, Generator, List, Optional
import httpx
from app.core.config import settings


class OllamaClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")

    def list_models(self) -> List[Dict[str, Any]]:
        """List all installed models in Ollama."""
        url = f"{self.base_url}/api/tags"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url)
            response.raise_for_status()
            data = response.json()
            return data.get("models", [])

    def pull_model(
        self, model: str, stream: bool = True
    ) -> Generator[Dict[str, Any], None, None]:
        """Pull a model from Ollama registry with progress streaming."""
        url = f"{self.base_url}/api/pull"
        payload = {"name": model, "stream": stream}
        with httpx.Client(timeout=None) as client:
            with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line.strip():
                        yield json.loads(line)

    def chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        stream: bool = True,
        options: Optional[Dict[str, Any]] = None,
    ) -> Generator[Dict[str, Any], None, None]:
        """Send chat messages to an Ollama model with streaming response."""
        url = f"{self.base_url}/api/chat"
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "stream": stream,
        }
        if options:
            payload["options"] = options

        with httpx.Client(timeout=None) as client:
            with client.stream("POST", url, json=payload) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line.strip():
                        yield json.loads(line)


ollama_client = OllamaClient()
