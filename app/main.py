from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.middleware.security import SecurityHeadersMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Botoro API")

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

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

# Trusted Host Middleware (Security Enhancement)
allowed_hosts = os.getenv("ALLOWED_HOSTS", "*").split(",")
app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

from app.routers import auth, family, baby, notifications, admin
from app.routers import feeding, sleep, diaper, growth, contraction, schedule, note, baby_permissions, ai_summary, upload, comments, ai_feedback, ai_settings
from app.routers import version, vaccinations, milestones
from app.routers import timer
from app.routers import temperatures

app.include_router(version.router)
app.include_router(auth.router)
app.include_router(family.router)
app.include_router(baby.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(feeding.router)
app.include_router(sleep.router)
app.include_router(diaper.router)
app.include_router(growth.router)
app.include_router(contraction.router)
app.include_router(schedule.router)
app.include_router(note.router)
app.include_router(vaccinations.router)
app.include_router(milestones.router)
app.include_router(baby_permissions.router)
app.include_router(ai_summary.router)
app.include_router(ai_feedback.router)
app.include_router(ai_settings.router)
app.include_router(upload.router)
app.include_router(comments.router)
app.include_router(timer.router)
app.include_router(temperatures.router)

frontend_build_path = os.path.join(os.path.dirname(__file__), "../frontend/out")

if os.path.exists(frontend_build_path):
    next_static_path = os.path.join(frontend_build_path, "_next")
    if os.path.exists(next_static_path):
        app.mount("/_next", StaticFiles(directory=next_static_path), name="next-static")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.get("/ads.txt", include_in_schema=False)
async def serve_ads_txt():
    ads_txt_path = os.path.join(frontend_build_path, "ads.txt")
    if os.path.exists(ads_txt_path):
        return FileResponse(ads_txt_path)
    return {"error": "ads.txt not found"}


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
