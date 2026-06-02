from django.contrib import admin
from .models import DailyStat, StatSummary, PlatformEvent

@admin.register(DailyStat)
class DailyStatAdmin(admin.ModelAdmin):
    list_display = ["date", "new_graduates", "new_employers", "new_jobs", "applications"]
    date_hierarchy = "date"

@admin.register(StatSummary)
class StatSummaryAdmin(admin.ModelAdmin):
    list_display = [f.name for f in StatSummary._meta.fields]

@admin.register(PlatformEvent)
class PlatformEventAdmin(admin.ModelAdmin):
    list_display = ["event_type", "description", "created_at"]
    list_filter = ["event_type"]
    date_hierarchy = "created_at"
