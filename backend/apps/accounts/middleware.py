import json
from django.http.request import RawPostDataException
from .models import AuditLog


class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.method not in ("GET", "HEAD", "OPTIONS") and request.user.is_authenticated:
            self.log_action(request, response)
        return response

    def log_action(self, request, response):
        try:
            body = request.body.decode("utf-8") if request.body else "{}"
            details = json.loads(body) if body else {}
        except (json.JSONDecodeError, UnicodeDecodeError, RawPostDataException):
            details = {}
        AuditLog.objects.create(
            user=request.user if request.user.is_authenticated else None,
            action=f"{request.method} {request.path}",
            model_name=request.resolver_match.view_name if request.resolver_match else "",
            details=details,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
        )

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")


class DeviceTrackingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.user.is_authenticated:
            ip = self.get_client_ip(request)
            ua = request.META.get("HTTP_USER_AGENT", "")
            if ip and ip != request.user.last_ip:
                User = request.user.__class__
                User.objects.filter(pk=request.user.pk).update(last_ip=ip, last_device=ua[:255])
        return response

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
