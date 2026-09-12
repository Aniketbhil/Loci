from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class RAMInfo(BaseModel):
    total_bytes: int
    total_gb: float
    available_gb: float
    used_gb: float
    usage_percent: float


class CPUInfo(BaseModel):
    logical_cores: int
    physical_cores: int
    cpu_usage_percent: float


class GPUInfo(BaseModel):
    available: bool
    vendor: Optional[str] = None
    name: Optional[str] = None
    vram_total_mb: Optional[int] = None
    vram_free_mb: Optional[int] = None
    count: int = 0
    devices: List[Dict[str, Any]] = []
    details: str


class HardwareResponse(BaseModel):
    ram: RAMInfo
    cpu: CPUInfo
    gpu: GPUInfo
