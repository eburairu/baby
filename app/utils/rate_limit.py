from collections import defaultdict
import threading
import time
from fastapi import Request, HTTPException, status
from app.utils.audit import get_client_ip

class RateLimiter:
    """
    Simple in-memory rate limiter based on IP address or custom key.
    """
    def __init__(
        self,
        requests_limit: int = 5,
        time_window: int = 60,
        max_size: int = 10000,
        error_message: str = "Too many requests. Please try again later.",
    ):
        self.requests_limit = requests_limit
        self.time_window = time_window
        self.max_size = max_size
        self.error_message = error_message
        self.requests = defaultdict(list)
        self._lock = threading.Lock()

    def check(self, key: str):
        """
        Check if the key has exceeded the rate limit.
        Raises HTTPException(429) if limit exceeded.
        """
        now = time.time()

        with self._lock:
            # Clean up old requests for this key first
            if key in self.requests:
                self.requests[key] = [
                    req_time for req_time in self.requests[key]
                    if now - req_time < self.time_window
                ]
                # If the key becomes empty, remove it
                if not self.requests[key]:
                    del self.requests[key]

            # If this is a new key (or was deleted above), check max_size before adding
            if key not in self.requests and len(self.requests) >= self.max_size:
                # Instead of clearing everything (DoS vulnerability), remove the oldest entry
                try:
                    oldest_key = next(iter(self.requests))
                    del self.requests[oldest_key]
                except StopIteration:
                    pass  # Should not happen if len >= max_size > 0

            # Check request limit
            # Accessing self.requests[key] creates the list if it doesn't exist (defaultdict)
            current_requests = self.requests[key]
            if len(current_requests) >= self.requests_limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=self.error_message,
                )

            current_requests.append(now)

    async def __call__(self, request: Request):
        # Safely extract IP considering X-Forwarded-For
        client_ip = get_client_ip(request) or "unknown"
        self.check(client_ip)
