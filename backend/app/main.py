from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.db.init_db import init_db


app = FastAPI(
    title="Workout Quest API",
    version="1.0.0",
    description="Gamified workout and habit tracking backend.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router, prefix="/api")
