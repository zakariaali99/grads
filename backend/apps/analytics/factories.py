import factory
from datetime import date
from apps.analytics.models import DailyStat


class DailyStatFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = DailyStat

    date = factory.Sequence(lambda n: date(2024, 1, 1) + __import__("datetime").timedelta(days=n))
    new_graduates = 0
    new_employers = 0
    new_jobs = 0
    applications = 0
    profile_views = 0
    searches = 0
    interviews = 0
    hirings = 0
