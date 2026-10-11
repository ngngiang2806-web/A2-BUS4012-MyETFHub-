from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import holdings, profiles

settings = get_settings()

app = FastAPI(
    title="MyETFHub API",
    version="0.1.0",
    description="Secure profile and ETF-holding storage for MyETFHub.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(profiles.router)
app.include_router(holdings.router)