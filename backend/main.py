from fastapi import FastAPI
import uvicorn

app = FastAPI(title="Loci API", version="1.0.0", description="Your own Local Intelligence")


@app.get("/")
def read_root():
    return {"message": "Loci API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
