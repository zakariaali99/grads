import pytest
from rest_framework import status

ANALYTICS_ADMIN_URL = "/api/v1/analytics/admin/"
ANALYTICS_EMPLOYER_URL = "/api/v1/analytics/employer/"
ANALYTICS_GRADUATE_URL = "/api/v1/analytics/graduate/"


@pytest.mark.django_db
class TestAnalyticsAPI:
    def test_admin_analytics(self, admin_client):
        client, user = admin_client
        response = client.get(ANALYTICS_ADMIN_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "total_users" in response.data

    def test_admin_analytics_unauthorized(self, graduate_client):
        client, user = graduate_client
        response = client.get(ANALYTICS_ADMIN_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_employer_analytics(self, employer_client):
        client, user = employer_client
        from apps.employers.factories import CompanyProfileFactory
        CompanyProfileFactory(user=user)
        response = client.get(ANALYTICS_EMPLOYER_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "jobs" in response.data

    def test_employer_analytics_graduate_forbidden(self, graduate_client):
        client, user = graduate_client
        response = client.get(ANALYTICS_EMPLOYER_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_graduate_analytics(self, graduate_client):
        client, user = graduate_client
        from apps.graduates.factories import GraduateProfileFactory
        GraduateProfileFactory(user=user)
        response = client.get(ANALYTICS_GRADUATE_URL)
        assert response.status_code == status.HTTP_200_OK
        assert "profile" in response.data

    def test_graduate_analytics_employer_forbidden(self, employer_client):
        client, user = employer_client
        response = client.get(ANALYTICS_GRADUATE_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated(self, api_client):
        response = api_client.get(ANALYTICS_ADMIN_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
