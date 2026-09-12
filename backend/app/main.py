from fastapi import FastAPI
from app.api.router import api_router
from app.api.routes import conversations
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
)


@app.get("/")
def root():
    return {"message": f"{settings.PROJECT_NAME} is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix="/api/conversations", tags=["conversations"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
