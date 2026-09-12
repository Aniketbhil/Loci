from typing import Optional
from fastapi import APIRouter, Query
from app.services.recommendations import recommend_models
from app.schemas.models import ModelRecommendationsResponse

router = APIRouter()


@router.get("/recommendations", response_model=ModelRecommendationsResponse)
def get_model_recommendations(
    ram_gb: Optional[float] = Query(None, description="Override system RAM in GB for testing"),
    vram_gb: Optional[float] = Query(None, description="Override VRAM in GB for testing"),
    gpu_available: Optional[bool] = Query(None, description="Override GPU availability for testing"),
):
    return recommend_models(ram_gb=ram_gb, vram_gb=vram_gb, gpu_available=gpu_available)
