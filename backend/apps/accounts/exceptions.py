from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        errors = []
        if isinstance(response.data, dict):
            for field, messages in response.data.items():
                if isinstance(messages, list):
                    for msg in messages:
                        errors.append({"field": field, "message": str(msg)})
                else:
                    errors.append({"field": field, "message": str(messages)})
        elif isinstance(response.data, list):
            for msg in response.data:
                errors.append({"field": None, "message": str(msg)})
        response.data = {"success": False, "errors": errors}
    return response


class AppException(Exception):
    def __init__(self, message, code="error", status_code=400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)
