from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ModelCatalogEntry(BaseModel):
    id: str
    name: str
    ollama_tag: str
    param_size: str
    param_size_billions: float
    recommended_quant: str
    min_ram_gb: float
    min_vram_gb: float
    tier: str
    description: str


class TierRecommendation(BaseModel):
    tier: str
    tier_label: str
    model: ModelCatalogEntry
    meets_hardware_requirements: bool
    reason: str


class HardwareSummary(BaseModel):
    total_ram_gb: float
    vram_gb: Optional[float] = None
    gpu_available: bool
    details: str


class ModelRecommendationsResponse(BaseModel):
    hardware_summary: HardwareSummary
    recommendations: List[TierRecommendation]
