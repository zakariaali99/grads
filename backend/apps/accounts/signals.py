from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.graduates.models import GraduateProfile
from apps.employers.models import CompanyProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.user_type == "graduate":
            GraduateProfile.objects.get_or_create(user=instance)
        elif instance.user_type == "employer":
            CompanyProfile.objects.get_or_create(user=instance)
