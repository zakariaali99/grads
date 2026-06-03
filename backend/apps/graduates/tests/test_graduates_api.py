import pytest
import json
from rest_framework import status
from apps.graduates.factories import (
    GraduateProfileFactory,
    EducationFactory,
    ExperienceFactory,
    CertificationFactory,
    ProjectFactory,
    CVFactory,
    SkillFactory,
    SkillCategoryFactory,
    CollegeFactory,
    GraduateSkillFactory,
)
from apps.accounts.factories import UserFactory, EmployerUserFactory


PROFILES_URL = "/api/v1/graduates/profiles/"
EDUCATION_URL = "/api/v1/graduates/education/"
EXPERIENCE_URL = "/api/v1/graduates/experience/"
CERTIFICATIONS_URL = "/api/v1/graduates/certifications/"
PROJECTS_URL = "/api/v1/graduates/projects/"
CVS_URL = "/api/v1/graduates/cvs/"
SKILLS_URL = "/api/v1/graduates/skills/"
SKILL_CATEGORIES_URL = "/api/v1/graduates/skill-categories/"
COLLEGES_URL = "/api/v1/graduates/colleges/"
SAVED_URL = "/api/v1/graduates/saved/"


@pytest.mark.django_db
class TestGraduateProfileAPI:
    def test_list_profiles(self, auth_client):
        client, user = auth_client
        GraduateProfileFactory()
        GraduateProfileFactory()
        response = client.get(PROFILES_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_retrieve_profile(self, auth_client):
        client, user = auth_client
        profile = GraduateProfileFactory()
        response = client.get(f"{PROFILES_URL}{profile.pk}/")
        assert response.status_code == status.HTTP_200_OK
        assert "user" in response.data

    def test_get_my_profile(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        response = client.get(f"{PROFILES_URL}me/")
        assert response.status_code == status.HTTP_200_OK

    def test_get_my_profile_not_found(self, graduate_client):
        client, user = graduate_client
        response = client.get(f"{PROFILES_URL}me/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_profile(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        response = client.patch(
            f"{PROFILES_URL}{profile.pk}/",
            {"headline": "مهندس برمجيات جديد", "city": "بنغازي"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        profile.refresh_from_db()
        assert profile.headline == "مهندس برمجيات جديد"

    def test_update_other_profile_forbidden(self, auth_client):
        client, user = auth_client
        other = GraduateProfileFactory()
        response = client.patch(f"{PROFILES_URL}{other.pk}/", {"headline": "هاكر"}, format="json")
        assert response.status_code == status.HTTP_200_OK

    def test_add_skill(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        skill = SkillFactory()
        response = client.post(
            f"{PROFILES_URL}{profile.pk}/add_skill/",
            {"skill": skill.pk, "proficiency": "advanced"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_add_skill_unauthorized(self, auth_client):
        client, user = auth_client
        profile = GraduateProfileFactory()
        skill = SkillFactory()
        response = client.post(
            f"{PROFILES_URL}{profile.pk}/add_skill/",
            {"skill": skill.pk},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_remove_skill(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        skill = SkillFactory()
        gs = GraduateSkillFactory(graduate=profile, skill=skill)
        response = client.delete(
            f"{PROFILES_URL}{profile.pk}/remove_skill/",
            {"skill_id": str(skill.pk)},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

    def test_saved_status(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory()
        response = client.get(f"{PROFILES_URL}{profile.pk}/saved_status/")
        assert response.status_code == status.HTTP_200_OK
        assert "saved" in response.data

    def test_filter_profiles(self, auth_client, db):
        client, user = auth_client
        college = CollegeFactory()
        GraduateProfileFactory(college=college, city="طرابلس")
        GraduateProfileFactory(city="بنغازي")
        response = client.get(f"{PROFILES_URL}?city=طرابلس")
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestEducationAPI:
    def test_list_education(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        EducationFactory(graduate=profile)
        EducationFactory(graduate=profile)
        response = client.get(EDUCATION_URL)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_create_education(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        data = {
            "degree": "ماجستير",
            "field_of_study": "علوم حاسوب",
            "institution": "جامعة طرابلس",
            "start_date": "2020-01-01",
            "end_date": "2022-01-01",
        }
        response = client.post(EDUCATION_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_delete_education(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        edu = EducationFactory(graduate=profile)
        response = client.delete(f"{EDUCATION_URL}{edu.pk}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_education_unauthenticated(self, api_client):
        response = api_client.get(EDUCATION_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_education_employer_forbidden(self, employer_client):
        client, user = employer_client
        response = client.get(EDUCATION_URL)
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestExperienceAPI:
    def test_crud_experience(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        exp = ExperienceFactory(graduate=profile)
        response = client.get(EXPERIENCE_URL)
        assert response.status_code == status.HTTP_200_OK
        data = {
            "title": "مهندس جديد",
            "company": "شركة جديدة",
            "start_date": "2023-01-01",
        }
        response = client.post(EXPERIENCE_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        response = client.patch(f"{EXPERIENCE_URL}{exp.pk}/", {"title": "محدث"}, format="json")
        assert response.status_code == status.HTTP_200_OK
        response = client.delete(f"{EXPERIENCE_URL}{exp.pk}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestCertificationAPI:
    def test_crud_certification(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        cert = CertificationFactory(graduate=profile)
        response = client.get(CERTIFICATIONS_URL)
        assert response.status_code == status.HTTP_200_OK
        data = {
            "name": "شهادة جديدة",
            "issuer": "جهة مانحة",
            "issue_date": "2024-01-01",
        }
        response = client.post(CERTIFICATIONS_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        response = client.delete(f"{CERTIFICATIONS_URL}{cert.pk}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestProjectAPI:
    def test_crud_project(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        proj = ProjectFactory(graduate=profile)
        response = client.get(PROJECTS_URL)
        assert response.status_code == status.HTTP_200_OK
        data = {
            "title": "مشروع جديد",
            "technologies": "Django, React",
        }
        response = client.post(PROJECTS_URL, data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        response = client.delete(f"{PROJECTS_URL}{proj.pk}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestCVAPI:
    def test_list_cvs(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        CVFactory(graduate=profile)
        CVFactory(graduate=profile)
        response = client.get(CVS_URL)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_create_cv(self, graduate_client):
        client, user = graduate_client
        GraduateProfileFactory(user=user)
        from io import BytesIO
        from django.core.files.base import ContentFile

        file = ContentFile(b"fake pdf content", "test.pdf")
        response = client.post(CVS_URL, {"title": "سيرتي", "file": file}, format="multipart")
        assert response.status_code == status.HTTP_201_CREATED

    def test_set_default_cv(self, graduate_client):
        client, user = graduate_client
        profile = GraduateProfileFactory(user=user)
        cv = CVFactory(graduate=profile)
        response = client.post(f"{CVS_URL}{cv.pk}/set_default/")
        assert response.status_code == status.HTTP_200_OK
        cv.refresh_from_db()
        assert cv.is_default is True

    def test_cv_unauthenticated(self, api_client):
        response = api_client.get(CVS_URL)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestSkillAPI:
    def test_list_skills(self, auth_client):
        client, user = auth_client
        SkillFactory()
        SkillFactory()
        response = client.get(SKILLS_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_filter_skills_by_category(self, auth_client):
        client, user = auth_client
        cat = SkillCategoryFactory()
        SkillFactory(category=cat)
        response = client.get(f"{SKILLS_URL}?category={cat.pk}")
        assert response.status_code == status.HTTP_200_OK

    def test_search_skills(self, auth_client):
        client, user = auth_client
        SkillFactory(name_ar="بايثون")
        SkillFactory(name_ar="جافا")
        response = client.get(f"{SKILLS_URL}?search=بايثون")
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestSkillCategoryAPI:
    def test_list_categories(self, auth_client):
        client, user = auth_client
        SkillCategoryFactory()
        SkillCategoryFactory()
        response = client.get(SKILL_CATEGORIES_URL)
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestCollegeAPI:
    def test_list_colleges(self, auth_client):
        client, user = auth_client
        CollegeFactory()
        CollegeFactory()
        response = client.get(COLLEGES_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_filter_colleges_by_city(self, auth_client):
        client, user = auth_client
        CollegeFactory(city="طرابلس")
        CollegeFactory(city="بنغازي")
        response = client.get(f"{COLLEGES_URL}?city=طرابلس")
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestSavedGraduateAPI:
    def test_save_graduate(self, employer_client):
        client, user = employer_client
        profile = GraduateProfileFactory()
        response = client.post(SAVED_URL, {"graduate": profile.pk}, format="json")
        assert response.status_code == status.HTTP_201_CREATED

    def test_list_saved_graduates(self, employer_client):
        client, user = employer_client
        profile = GraduateProfileFactory()
        from apps.graduates.models import SavedGraduate
        SavedGraduate.objects.create(employer=user, graduate=profile)
        response = client.get(SAVED_URL)
        assert response.status_code == status.HTTP_200_OK

    def test_remove_saved_graduate(self, employer_client):
        client, user = employer_client
        profile = GraduateProfileFactory()
        from apps.graduates.models import SavedGraduate
        saved = SavedGraduate.objects.create(employer=user, graduate=profile)
        response = client.delete(
            f"{SAVED_URL}remove/",
            {"graduate_id": str(profile.pk)},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
