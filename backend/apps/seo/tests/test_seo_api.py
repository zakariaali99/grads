import pytest
from rest_framework import status
from apps.institution.factories import InstitutionProfileFactory, GraduateTrackingFactory
from apps.accounts.factories import GraduateUserFactory
from apps.employers.factories import CompanyProfileFactory, IndustryFactory
from apps.graduates.factories import GraduateProfileFactory, CollegeFactory

SEO_META_URL = "/api/v1/seo/meta/"
SITEMAP_URL = "/api/v1/seo/sitemap.xml"


@pytest.mark.django_db
class TestSeoMetaAPI:
    def test_meta_graduate_found(self, api_client):
        user = GraduateUserFactory(username="testgrad")
        college = CollegeFactory()
        profile = GraduateProfileFactory(user=user, college=college, headline="مهندس", city="الرياض")
        response = api_client.get(f"{SEO_META_URL}?type=graduate&id={profile.pk}")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "profile"
        assert "testgrad" in response.data["url"]

    def test_meta_graduate_not_found(self, api_client):
        response = api_client.get(f"{SEO_META_URL}?type=graduate&id=99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_meta_company_found(self, api_client):
        company = CompanyProfileFactory()
        response = api_client.get(f"{SEO_META_URL}?type=company&id={company.pk}")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "company"
        assert response.data["title"] == company.company_name

    def test_meta_company_not_found(self, api_client):
        response = api_client.get(f"{SEO_META_URL}?type=company&id=99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_meta_job_found(self, api_client):
        from apps.jobs.factories import JobPostFactory
        job = JobPostFactory()
        response = api_client.get(f"{SEO_META_URL}?type=job&id={job.pk}")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["type"] == "job"

    def test_meta_invalid_type(self, api_client):
        response = api_client.get(f"{SEO_META_URL}?type=unknown&id=1")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_meta_no_params(self, api_client):
        response = api_client.get(SEO_META_URL)
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestSitemapAPI:
    def test_sitemap_returns_xml(self, api_client):
        response = api_client.get(SITEMAP_URL)
        assert response.status_code == status.HTTP_200_OK
        assert response["Content-Type"] == "application/xml"

    def test_sitemap_contains_static_urls(self, api_client):
        response = api_client.get(SITEMAP_URL)
        content = response.content.decode()
        assert "<loc>" in content
        assert "priority" in content
        assert "changefreq" in content
