class AIGenerationError(Exception):
    """Exception raised when an AI service fails to generate content or is disabled."""
    pass


class AIRateLimitError(AIGenerationError):
    """Exception raised when an AI service rate limit is exceeded."""
    pass


class AIServiceError(AIGenerationError):
    """Exception raised when an AI service encounters an internal error or is unavailable."""
    pass


class RecordNotFoundError(Exception):
    """Exception raised when a record is not found."""
    pass


class InvalidRecordTypeError(Exception):
    """Exception raised when a record type is invalid."""
    pass
