import pytest
from apps.analytics.models import DailyStat, StatSummary, PlatformEvent
from apps.analytics.factories import DailyStatFactory


@pytest.mark.django_db
class TestDailyStatModel:
    def test_create_daily_stat(self):
        stat = DailyStatFactory()
        assert stat.pk is not None

    def test_daily_stat_unique_date(self):
        DailyStatFactory(date="2024-01-01")
        with pytest.raises(Exception):
            DailyStatFactory(date="2024-01-01")

    def test_daily_stat_default_values(self):
        stat = DailyStatFactory()
        assert stat.new_graduates == 0
        assert stat.new_employers == 0
        assert stat.new_jobs == 0
        assert stat.applications == 0

    def test_daily_stat_ordering(self):
        DailyStatFactory(date="2024-01-02")
        DailyStatFactory(date="2024-01-01")
        stats = DailyStat.objects.all()
        assert stats[0].date > stats[1].date or stats[0].date == stats[1].date


@pytest.mark.django_db
class TestStatSummaryModel:
    def test_create_summary(self):
        summary, created = StatSummary.objects.get_or_create(pk=1)
        assert summary is not None
        assert summary.total_users == 0


@pytest.mark.django_db
class TestPlatformEventModel:
    def test_create_event(self):
        event = PlatformEvent.objects.create(
            event_type="user_registered",
            description="مستخدم جديد",
        )
        assert event.pk is not None
