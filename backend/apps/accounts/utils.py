import uuid
import random
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
from .models import VerificationCode

User = get_user_model()


def generate_verification_code(user, purpose):
    code = str(random.randint(100000, 999999))
    VerificationCode.objects.create(
        user=user,
        code=code,
        purpose=purpose,
        expires_at=timezone.now() + timedelta(minutes=10),
    )
    return code


def send_verification_email(user, code):
    subject = _("رمز التحقق - خريجون")
    message = _(
        "مرحباً {name},\n\n"
        "رمز التحقق الخاص بك هو: {code}\n"
        "هذا الرقم صالح لمدة 10 دقائق.\n\n"
        "شكراً لاستخدامك خريجون."
    ).format(name=user.get_full_name() or user.username, code=code)
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])


def send_verification_sms(user, code):
    pass


def calculate_profile_completion(user):
    score = 0
    fields = ["email", "phone", "first_name", "last_name", "gender", "date_of_birth", "bio"]
    for field in fields:
        if getattr(user, field, None):
            score += 10

    if user.avatar:
        score += 10
    if user.is_verified:
        score += 10

    if hasattr(user, "graduate_profile"):
        gp = user.graduate_profile
        if gp and gp.skills.exists():
            score += 10
        if gp and gp.education.exists():
            score += 10
        if gp and gp.certifications.exists():
            score += 5
        if gp and gp.experience.exists():
            score += 5

    return min(score, 100.0)
