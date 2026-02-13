from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="Baby-App API")

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

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
    next_static_path = os.path.join(frontend_build_path, "_next")
    if os.path.exists(next_static_path):
        app.mount("/_next", StaticFiles(directory=next_static_path), name="next-static")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_frontend(full_path: str):
    if not os.path.exists(frontend_build_path):
        return {"error": "Frontend not built"}
    file_path = os.path.join(frontend_build_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    html_path = file_path + ".html"
    if os.path.exists(html_path):
        return FileResponse(html_path)
    return FileResponse(os.path.join(frontend_build_path, "index.html"))
