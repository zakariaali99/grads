from django.db import models
from django.utils.translation import gettext_lazy as _


class Advertisement(models.Model):
    class Placement(models.TextChoices):
        SMALL = "small", _("صغير")
        MEDIUM = "medium", _("متوسط")
        LARGE = "large", _("كبير")
        SIDEBAR = "sidebar", _("شريط جانبي")

    title = models.CharField(max_length=255, verbose_name=_("العنوان"))
    description = models.TextField(blank=True, verbose_name=_("الوصف"))
    image_url = models.URLField(blank=True, verbose_name=_("رابط الصورة"))
    link_url = models.URLField(blank=True, verbose_name=_("رابط الإعلان"))
    placement = models.CharField(max_length=20, choices=Placement.choices, default=Placement.MEDIUM, verbose_name=_("المكان"))
    is_active = models.BooleanField(default=True, verbose_name=_("نشط"))
    sort_order = models.PositiveIntegerField(default=0, verbose_name=_("الترتيب"))
    click_count = models.PositiveIntegerField(default=0, verbose_name=_("عدد النقرات"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("إعلان")
        verbose_name_plural = _("الإعلانات")
        ordering = ["sort_order", "-created_at"]

    def __str__(self):
        return self.title
