import pytest
from rest_framework import status
from apps.ads.models import Advertisement

ADS_PUBLIC_URL = "/api/v1/ads/"
ADS_ADMIN_URL = "/api/v1/admin/ads/"


@pytest.mark.django_db
class TestPublicAdsAPI:
    def test_list_ads(self, api_client):
        Advertisement.objects.create(
            title="إعلان 1",
            description="وصف",
            placement=Advertisement.Placement.MEDIUM,
            is_active=True,
        )
        response = api_client.get(ADS_PUBLIC_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_filter_ads_by_placement(self, api_client):
        Advertisement.objects.create(title="صغير", placement="small", is_active=True)
        Advertisement.objects.create(title="كبير", placement="large", is_active=True)
        response = api_client.get(f"{ADS_PUBLIC_URL}?placement=small")
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestAdminAdsAPI:
    def test_list_admin_ads(self, admin_client):
        client, user = admin_client
        Advertisement.objects.create(title="إعلان إداري", placement="medium")
        response = client.get(ADS_ADMIN_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_create_ad(self, admin_client):
        client, user = admin_client
        data = {
            "title": "إعلان جديد",
            "description": "وصف الإعلان",
            "placement": "medium",
        }
        response = client.post(ADS_ADMIN_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_admin_ads_non_admin_forbidden(self, graduate_client):
        client, user = graduate_client
        response = client.get(ADS_ADMIN_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_record_click(self, admin_client):
        client, user = admin_client
        ad = Advertisement.objects.create(title="إعلان", placement="medium")
        response = client.post(f"{ADS_ADMIN_URL}{ad.pk}/record_click/")
        assert response.status_code == status.HTTP_200_OK
        ad.refresh_from_db()
        assert ad.click_count == 1
