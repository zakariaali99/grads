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
