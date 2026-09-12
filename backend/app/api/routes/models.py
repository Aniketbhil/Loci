import json
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from app.services.recommendations import recommend_models
from app.services.ollama_client import ollama_client
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


@router.post("/install/{model_name:path}")
def install_model(model_name: str):
    def progress_generator():
        try:
            for progress in ollama_client.pull_model(model_name, stream=True):
                data_str = json.dumps(progress)
                yield f"data: {data_str}\n\n"
        except Exception as e:
            error_data = json.dumps({"error": str(e), "status": "failed"})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(progress_generator(), media_type="text/event-stream")
