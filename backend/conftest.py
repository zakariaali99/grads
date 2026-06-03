import pytest
from rest_framework.test import APIClient
from django.core.management import call_command
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


@pytest.fixture(autouse=True)
def use_db(db):
    pass


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def auth_client(api_client, django_user_model):
    user = django_user_model.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="TestPass123",
        user_type="graduate",
        accepted_terms=True,
    )
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client, user


@pytest.fixture
def graduate_user(django_user_model):
    return django_user_model.objects.create_user(
        username="graduser",
        email="grad@example.com",
        password="TestPass123",
        user_type="graduate",
        first_name="خريج",
        last_name="اختبار",
        accepted_terms=True,
    )


@pytest.fixture
def employer_user(django_user_model):
    return django_user_model.objects.create_user(
        username="empuser",
        email="emp@example.com",
        password="TestPass123",
        user_type="employer",
        first_name="صاحب",
        last_name="عمل",
        accepted_terms=True,
    )


@pytest.fixture
def admin_user(django_user_model):
    return django_user_model.objects.create_user(
        username="adminuser",
        email="admin@example.com",
        password="TestPass123",
        user_type="admin",
        is_staff=True,
        is_superuser=True,
        accepted_terms=True,
    )


@pytest.fixture
def graduate_client(api_client, graduate_user):
    refresh = RefreshToken.for_user(graduate_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client, graduate_user


@pytest.fixture
def employer_client(api_client, employer_user):
    refresh = RefreshToken.for_user(employer_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client, employer_user


@pytest.fixture
def admin_client(api_client, admin_user):
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client, admin_user


@pytest.fixture
def sample_graduate(graduate_user, db):
    from apps.graduates.factories import (
        GraduateProfileFactory,
        SkillFactory,
        SkillCategoryFactory,
        CollegeFactory,
        EducationFactory,
        ExperienceFactory,
    )

    category = SkillCategoryFactory()
    skill1 = SkillFactory(category=category)
    skill2 = SkillFactory(category=category)
    college = CollegeFactory()
    profile = GraduateProfileFactory(
        user=graduate_user,
        college=college,
        headline="مهندس برمجيات",
        city="طرابلس",
        major="هندسة برمجيات",
    )
    profile.skills.add(skill1, skill2)
    EducationFactory(graduate=profile, degree="بكالوريوس", field_of_study="هندسة برمجيات")
    ExperienceFactory(graduate=profile, title="مطور Backend")
    return profile


@pytest.fixture
def sample_company(employer_user, db):
    from apps.employers.factories import CompanyProfileFactory, IndustryFactory

    industry = IndustryFactory()
    company = CompanyProfileFactory(user=employer_user, industry=industry)
    return company


@pytest.fixture
def sample_job(employer_user, db):
    from apps.jobs.factories import JobPostFactory, JobCategoryFactory, SkillFactory
    from apps.graduates.factories import CollegeFactory

    category = JobCategoryFactory()
    skill = SkillFactory()
    college = CollegeFactory()
    company = employer_user.company_profile
    job = JobPostFactory(
        company=company,
        posted_by=employer_user,
        category=category,
        status="active",
    )
    job.skills.add(skill)
    job.targeted_colleges.add(college)
    return job


@pytest.fixture
def sample_graduate_skill(graduate_user, db):
    from apps.graduates.factories import GraduateProfileFactory, SkillFactory, SkillCategoryFactory, GraduateSkillFactory

    profile = GraduateProfileFactory(user=graduate_user)
    skill = SkillFactory(category=SkillCategoryFactory())
    return GraduateSkillFactory(graduate=profile, skill=skill)
