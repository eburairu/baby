from collections import defaultdict
import time
from fastapi import Request, HTTPException, status

class RateLimiter:
    """
    Simple in-memory rate limiter based on IP address.
    """
    def __init__(self, requests_limit: int = 5, time_window: int = 60, max_size: int = 10000):
        self.requests_limit = requests_limit
        self.time_window = time_window
        self.max_size = max_size
        self.requests = defaultdict(list)

    async def __call__(self, request: Request):
        # Using client.host relies on uvicorn's --proxy-headers config for correct IP
        client_ip = request.client.host or "unknown"

        now = time.time()

        # Prevent memory exhaustion by clearing if too large
        if len(self.requests) > self.max_size:
            self.requests.clear()

        # Clean up old requests for this IP
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < self.time_window
        ]

        if len(self.requests[client_ip]) >= self.requests_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please try again later."
            )

        self.requests[client_ip].append(now)
