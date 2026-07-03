from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.logger import log_event


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        log_event(
            "http_request",
            employee_id=None,
            status_code=response.status_code,
            outcome=f"{request.method} {request.url.path}",
        )
        return response

