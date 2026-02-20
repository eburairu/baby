from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        # HSTS: Enforce HTTPS for 1 year, including subdomains
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # CSP: Allow self, unsafe-inline/eval for dev/Next.js compatibility, and common external sources for images/connect
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;"

        # Permissions Policy: Disable sensitive features by default
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=(), payment=()"

        # Cache Control for API endpoints to prevent sensitive data caching
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"

        return response
