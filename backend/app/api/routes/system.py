from fastapi import APIRouter
from app.services.hardware import get_hardware_info
from app.schemas.hardware import HardwareResponse

router = APIRouter()


@router.get("/hardware", response_model=HardwareResponse)
def get_hardware():
    return get_hardware_info()
