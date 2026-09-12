import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.ollama_client import ollama_client


def main():
    model_name = "qwen2.5:0.5b"
    print("=== 1. Listing Installed Models ===")
    models = ollama_client.list_models()
    print(f"Installed models before pull: {[m.get('name') for m in models]}")

    print(f"\n=== 2. Pulling Model '{model_name}' ===")
    for progress in ollama_client.pull_model(model_name, stream=True):
        status = progress.get("status", "")
        completed = progress.get("completed")
        total = progress.get("total")
        if completed and total:
            pct = round((completed / total) * 100, 1)
            print(f"Progress: {status} ({pct}%)", end="\r", flush=True)
        else:
            print(f"Status: {status}", flush=True)

    print(f"\nModel '{model_name}' pulled successfully!")

    print(f"\n=== 3. Listing Installed Models After Pull ===")
    models_after = ollama_client.list_models()
    print(f"Installed models: {[m.get('name') for m in models_after]}")

    print(f"\n=== 4. Testing Chat Completion with Streaming ===")
    messages = [
        {"role": "user", "content": "Say hello from Loci in one short sentence!"}
    ]
    print("User: Say hello from Loci in one short sentence!")
    print("Assistant: ", end="", flush=True)

    full_response = ""
    for chunk in ollama_client.chat(model_name, messages, stream=True):
        token = chunk.get("message", {}).get("content", "")
        print(token, end="", flush=True)
        full_response += token

    print("\n\n=== End-to-End Test Passed! ===")


if __name__ == "__main__":
    main()
