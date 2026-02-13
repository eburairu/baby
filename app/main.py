from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="Baby-App API")

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, family, baby
from app.routers import feeding, sleep, diaper, growth, contraction, schedule

app.include_router(auth.router)
app.include_router(family.router)
app.include_router(baby.router)
app.include_router(feeding.router)
app.include_router(sleep.router)
app.include_router(diaper.router)
app.include_router(growth.router)
app.include_router(contraction.router)
app.include_router(schedule.router)

frontend_build_path = os.path.join(os.path.dirname(__file__), "../frontend/out")

if os.path.exists(frontend_build_path):
    app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="static")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
