import pytest
from rest_framework import status
from apps.accounts.factories import UserFactory, EmployerUserFactory

ADMIN_USERS_URL = "/api/v1/admin/users/"
ADMIN_GRADUATES_URL = "/api/v1/admin/graduates/"
ADMIN_COMPANIES_URL = "/api/v1/admin/companies/"


@pytest.mark.django_db
class TestAdminUsersAPI:
    def test_list_users(self, admin_client):
        client, user = admin_client
        UserFactory()
        response = client.get(ADMIN_USERS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_list_users_non_admin_forbidden(self, graduate_client):
        client, user = graduate_client
        response = client.get(ADMIN_USERS_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_ban_user(self, admin_client):
        client, admin = admin_client
        target = UserFactory()
        response = client.post(
            f"{ADMIN_USERS_URL}{target.pk}/ban/",
            {"reason": "سبب الحظر"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        target.refresh_from_db()
        assert target.is_banned is True
        assert target.is_active is False

    def test_unban_user(self, admin_client):
        client, admin = admin_client
        target = UserFactory(is_banned=True, is_active=False, ban_reason="سبب")
        response = client.post(f"{ADMIN_USERS_URL}{target.pk}/unban/")
        assert response.status_code == status.HTTP_200_OK
        target.refresh_from_db()
        assert target.is_banned is False
        assert target.is_active is True

    def test_verify_user(self, admin_client):
        client, admin = admin_client
        target = UserFactory(is_verified=False)
        response = client.post(f"{ADMIN_USERS_URL}{target.pk}/verify/")
        assert response.status_code == status.HTTP_200_OK
        target.refresh_from_db()
        assert target.is_verified is True

    def test_delete_user(self, admin_client):
        client, admin = admin_client
        target = UserFactory()
        response = client.delete(f"{ADMIN_USERS_URL}{target.pk}/")
        assert response.status_code == status.HTTP_200_OK
        target.refresh_from_db()
        assert target.is_active is False


@pytest.mark.django_db
class TestAdminGraduatesAPI:
    def test_list_graduates(self, admin_client):
        client, admin = admin_client
        from apps.graduates.factories import GraduateProfileFactory
        GraduateProfileFactory()
        response = client.get(ADMIN_GRADUATES_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data or isinstance(response.data, list)

    def test_verify_graduate(self, admin_client):
        client, admin = admin_client
        from apps.graduates.factories import GraduateProfileFactory
        profile = GraduateProfileFactory()
        response = client.post(f"{ADMIN_GRADUATES_URL}{profile.pk}/verify/")
        assert response.status_code == status.HTTP_200_OK
        profile.user.refresh_from_db()
        assert profile.user.is_verified is True


@pytest.mark.django_db
class TestAdminCompaniesAPI:
    def test_list_companies(self, admin_client):
        client, admin = admin_client
        from apps.employers.factories import CompanyProfileFactory
        CompanyProfileFactory()
        response = client.get(ADMIN_COMPANIES_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_verify_company(self, admin_client):
        client, admin = admin_client
        from apps.employers.factories import CompanyProfileFactory
        company = CompanyProfileFactory(is_verified=False)
        response = client.post(f"{ADMIN_COMPANIES_URL}{company.pk}/verify/")
        assert response.status_code == status.HTTP_200_OK
        company.refresh_from_db()
        assert company.is_verified is True

    def test_delete_company(self, admin_client):
        client, admin = admin_client
        from apps.employers.factories import CompanyProfileFactory
        company = CompanyProfileFactory()
        response = client.delete(f"{ADMIN_COMPANIES_URL}{company.pk}/")
        assert response.status_code == status.HTTP_200_OK
        company.user.refresh_from_db()
        assert company.user.is_active is False

    def test_toggle_featured_company(self, admin_client):
        client, admin = admin_client
        from apps.employers.factories import CompanyProfileFactory
        company = CompanyProfileFactory(is_featured=False)
        response = client.post(f"{ADMIN_COMPANIES_URL}{company.pk}/toggle_featured/")
        assert response.status_code == status.HTTP_200_OK
        company.refresh_from_db()
        assert company.is_featured is True

    def test_destroy_graduate(self, admin_client):
        client, admin = admin_client
        from apps.graduates.factories import GraduateProfileFactory
        profile = GraduateProfileFactory()
        response = client.delete(f"{ADMIN_GRADUATES_URL}{profile.pk}/")
        assert response.status_code == status.HTTP_200_OK
        profile.user.refresh_from_db()
        assert profile.user.is_active is False


ADMIN_JOBS_URL = "/api/v1/admin/jobs/"
ADMIN_AUDIT_LOGS_URL = "/api/v1/admin/audit-logs/"
ADMIN_PLATFORM_EVENTS_URL = "/api/v1/admin/platform-events/"
ADMIN_DAILY_STATS_URL = "/api/v1/admin/daily-stats/"


@pytest.mark.django_db
class TestAdminJobsAPI:
    def test_list_jobs(self, admin_client):
        client, admin = admin_client
        from apps.jobs.factories import JobPostFactory
        JobPostFactory()
        response = client.get(ADMIN_JOBS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data or isinstance(response.data, list)

    def test_list_jobs_non_admin_forbidden(self, graduate_client):
        client, user = graduate_client
        response = client.get(ADMIN_JOBS_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_toggle_featured_job(self, admin_client):
        client, admin = admin_client
        from apps.jobs.factories import JobPostFactory
        job = JobPostFactory(is_featured=False)
        response = client.post(f"{ADMIN_JOBS_URL}{job.pk}/toggle_featured/")
        assert response.status_code == status.HTTP_200_OK
        job.refresh_from_db()
        assert job.is_featured is True

    def test_destroy_job(self, admin_client):
        client, admin = admin_client
        from apps.jobs.factories import JobPostFactory
        job = JobPostFactory(status="active")
        response = client.delete(f"{ADMIN_JOBS_URL}{job.pk}/")
        assert response.status_code == status.HTTP_200_OK
        job.refresh_from_db()
        assert job.status == "closed"


@pytest.mark.django_db
class TestAdminAuditLogsAPI:
    def test_list_audit_logs(self, admin_client):
        client, admin = admin_client
        from apps.accounts.models import AuditLog
        AuditLog.objects.create(
            user=admin, action="test", model_name="User", object_id="1"
        )
        response = client.get(ADMIN_AUDIT_LOGS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data

    def test_list_audit_logs_non_admin_forbidden(self, graduate_client):
        client, user = graduate_client
        response = client.get(ADMIN_AUDIT_LOGS_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAdminPlatformEventsAPI:
    def test_list_platform_events(self, admin_client):
        client, admin = admin_client
        from apps.analytics.models import PlatformEvent
        PlatformEvent.objects.create(event_type="test_event", description="test")
        response = client.get(ADMIN_PLATFORM_EVENTS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data

    def test_list_platform_events_non_admin_forbidden(self, graduate_client):
        client, user = graduate_client
        response = client.get(ADMIN_PLATFORM_EVENTS_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestAdminDailyStatsAPI:
    def test_list_daily_stats(self, admin_client):
        client, admin = admin_client
        from apps.analytics.models import DailyStat
        from datetime import date
        DailyStat.objects.create(date=date.today(), new_graduates=5)
        response = client.get(ADMIN_DAILY_STATS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "results" in response.data

    def test_daily_stats_filter_by_days(self, admin_client):
        client, admin = admin_client
        from apps.analytics.models import DailyStat
        from datetime import date, timedelta
        DailyStat.objects.create(date=date.today(), new_graduates=5)
        DailyStat.objects.create(date=date.today() - timedelta(days=10), new_graduates=3)
        response = client.get(ADMIN_DAILY_STATS_URL, {"days": "7"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_list_daily_stats_non_admin_forbidden(self, graduate_client):
        client, user = graduate_client
        response = client.get(ADMIN_DAILY_STATS_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN
