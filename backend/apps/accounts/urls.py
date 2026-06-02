from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="auth-logout"),
    path("profile/", views.ProfileView.as_view(), name="auth-profile"),
    path("change-password/", views.ChangePasswordView.as_view(), name="auth-change-password"),
    path("verify/request/", views.RequestVerificationView.as_view(), name="auth-verify-request"),
    path("verify/confirm/", views.VerifyCodeView.as_view(), name="auth-verify-confirm"),
    path("password-reset/", views.PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path("password-reset/confirm/", views.PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
    path("delete-account/", views.DeleteAccountView.as_view(), name="auth-delete-account"),
]
