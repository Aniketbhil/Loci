from fastapi import APIRouter
from app.api.routes import health, conversations, system, models, chat

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(models.router, prefix="/models", tags=["models"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
