import json
import time
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.services.recommendations import recommend_models
from app.services.ollama_client import ollama_client
from app.services.install_manager import install_manager
from app.schemas.models import ModelRecommendationsResponse

router = APIRouter()


@router.get("/recommendations", response_model=ModelRecommendationsResponse)
def get_model_recommendations(
    ram_gb: Optional[float] = Query(None, description="Override system RAM in GB for testing"),
    vram_gb: Optional[float] = Query(None, description="Override VRAM in GB for testing"),
    gpu_available: Optional[bool] = Query(None, description="Override GPU availability for testing"),
):
    return recommend_models(ram_gb=ram_gb, vram_gb=vram_gb, gpu_available=gpu_available)


@router.get("/installed")
def list_installed_models():
    try:
        models = ollama_client.list_models()
        return {"models": models}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to Ollama service: {str(e)}",
        )


@router.get("/install/statuses")
def get_all_install_statuses():
    return install_manager.get_all_tasks()


@router.get("/install/{model_name:path}/status")
def get_install_status(model_name: str):
    task = install_manager.get_task(model_name)
    if not task:
        return {"model_name": model_name, "state": "not_started", "percent": 0, "status": ""}
    return task.to_dict()


@router.post("/install/{model_name:path}")
def install_model(model_name: str):
    task = install_manager.start_install(model_name)

    def progress_generator():
        last_percent = -1
        last_status = None
        while True:
            current_dict = task.to_dict()
            cur_percent = current_dict["percent"]
            cur_status = current_dict["status"]
            cur_state = current_dict["state"]

            if cur_percent != last_percent or cur_status != last_status:
                last_percent = cur_percent
                last_status = cur_status
                yield f"data: {json.dumps(current_dict)}\n\n"

            if cur_state in ("completed", "error", "cancelled"):
                break

            time.sleep(0.3)

    return StreamingResponse(progress_generator(), media_type="text/event-stream")


@router.delete("/install/{model_name:path}")
def cancel_install_model(model_name: str):
    try:
        install_manager.cancel_install(model_name)
        return {"status": "cancelled", "model": model_name}
    except Exception as e:
        return {"status": "cancelled", "model": model_name, "error": str(e)}
