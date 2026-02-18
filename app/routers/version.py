import os
import time
from typing import Optional

import httpx
from fastapi import APIRouter

from app.schemas.version import VersionResponse

router = APIRouter(prefix="/api", tags=["version"])

# GitHub API キャッシュ（TTL: 30分）
_cache: dict = {}
_CACHE_TTL = 30 * 60  # 秒
_GITHUB_API_URL = "https://api.github.com/repos/eburairu/baby/releases/latest"


async def _fetch_latest_release() -> dict:
    now = time.time()
    if _cache.get("expires_at", 0) > now:
        return _cache["data"]

    headers = {"Accept": "application/vnd.github+json"}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    data: dict = {}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(_GITHUB_API_URL, headers=headers)
            if resp.status_code == 200:
                body = resp.json()
                tag: str = body.get("tag_name", "")
                # "v1.2.3" -> "1.2.3"
                version = tag.lstrip("v") if tag else "unknown"
                data = {
                    "version": version,
                    "release_notes": body.get("body"),
                    "published_at": body.get("published_at"),
                    "html_url": body.get("html_url"),
                }
    except Exception:
        pass

    _cache["data"] = data
    _cache["expires_at"] = now + _CACHE_TTL
    return data


@router.get("/version", response_model=VersionResponse)
async def get_version() -> VersionResponse:
    release = await _fetch_latest_release()
    return VersionResponse(
        version=release.get("version") or "unknown",
        release_notes=release.get("release_notes"),
        published_at=release.get("published_at"),
        html_url=release.get("html_url"),
    )
