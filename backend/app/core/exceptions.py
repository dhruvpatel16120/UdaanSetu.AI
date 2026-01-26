from typing import Optional

class BaseAPIException(Exception):
    """Base class for all API exceptions"""
    def __init__(
        self, 
        message: str, 
        status_code: int = 500, 
        code: str = "internal_error",
        details: Optional[dict] = None
    ):
        self.message = message
        self.status_code = status_code
        self.code = code
        self.details = details
        super().__init__(self.message)

class NotFoundException(BaseAPIException):
    def __init__(self, message: str = "Resource not found", code: str = "not_found"):
        super().__init__(message=message, status_code=404, code=code)

class BadRequestException(BaseAPIException):
    def __init__(self, message: str = "Bad request", code: str = "bad_request"):
        super().__init__(message=message, status_code=400, code=code)

class UnauthorizedException(BaseAPIException):
    def __init__(self, message: str = "Unauthorized", code: str = "unauthorized"):
        super().__init__(message=message, status_code=401, code=code)

class ForbiddenException(BaseAPIException):
    def __init__(self, message: str = "Forbidden", code: str = "forbidden"):
        super().__init__(message=message, status_code=403, code=code)

class DatabaseException(BaseAPIException):
    def __init__(self, message: str = "Database error", details: Optional[dict] = None):
        super().__init__(
            message=message, 
            status_code=500, 
            code="database_error",
            details=details
        )
