from fastapi import FastAPI
from app.middleware.security import SecurityHeadersMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Baby App API")
# Trigger reload

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(SecurityHeadersMiddleware)

from app.routers import auth, family, baby, notifications
from app.routers import feeding, sleep, diaper, growth, contraction, schedule, note, baby_permissions, ai_summary, upload, comments
from app.routers import version

app.include_router(version.router)
app.include_router(auth.router)
app.include_router(family.router)
app.include_router(baby.router)
app.include_router(notifications.router)
app.include_router(feeding.router)
app.include_router(sleep.router)
app.include_router(diaper.router)
app.include_router(growth.router)
app.include_router(contraction.router)
app.include_router(schedule.router)
app.include_router(note.router)
app.include_router(baby_permissions.router)
app.include_router(ai_summary.router)
app.include_router(upload.router)
app.include_router(comments.router)

frontend_build_path = os.path.join(os.path.dirname(__file__), "../frontend/out")

if os.path.exists(frontend_build_path):
    next_static_path = os.path.join(frontend_build_path, "_next")
    if os.path.exists(next_static_path):
        app.mount("/_next", StaticFiles(directory=next_static_path), name="next-static")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(full_path: str):
    if not os.path.exists(frontend_build_path):
        return {"error": "Frontend not built"}

    # Secure path resolution to prevent traversal attacks
    base_path = os.path.abspath(frontend_build_path)
    # Join with base path and resolve absolute path (handles ..)
    requested_path = os.path.abspath(os.path.join(base_path, full_path.lstrip("/")))

    # Check if the resolved path starts with the base path
    if not requested_path.startswith(base_path):
        # Path traversal attempt - serve index.html (SPA routing handles 404)
        return FileResponse(os.path.join(frontend_build_path, "index.html"))

    if os.path.exists(requested_path) and os.path.isfile(requested_path):
        return FileResponse(requested_path)

    html_path = requested_path + ".html"
    if os.path.exists(html_path) and os.path.isfile(html_path):
        return FileResponse(html_path)

    return FileResponse(os.path.join(frontend_build_path, "index.html"))
