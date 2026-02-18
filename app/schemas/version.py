from pydantic import BaseModel
from typing import Optional


class VersionResponse(BaseModel):
    version: str
    release_notes: Optional[str] = None
    published_at: Optional[str] = None
    html_url: Optional[str] = None
