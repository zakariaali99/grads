import pytest
from apps.employers.models import Industry, CompanyProfile, HRTeamMember, CompanyReview
from apps.employers.factories import IndustryFactory, CompanyProfileFactory, HRTeamMemberFactory
from apps.accounts.factories import UserFactory, EmployerUserFactory


@pytest.mark.django_db
class TestIndustryModel:
    def test_create_industry(self):
        industry = IndustryFactory()
        assert industry.pk is not None

    def test_industry_str(self):
        industry = IndustryFactory(name_ar="تقنية المعلومات")
        assert str(industry) == "تقنية المعلومات"

    def test_industry_default_active(self):
        industry = IndustryFactory()
        assert industry.is_active is True

    def test_industry_ordering(self):
        IndustryFactory(name_ar="ب")
        IndustryFactory(name_ar="أ")
        industries = Industry.objects.all()
        assert industries[0].name_ar == "أ"


@pytest.mark.django_db
class TestCompanyProfileModel:
    def test_create_company(self):
        company = CompanyProfileFactory()
        assert company.pk is not None

    def test_company_str(self):
        company = CompanyProfileFactory(company_name="شركة التقنية")
        assert str(company) == "شركة التقنية"

    def test_company_user_relation(self):
        user = EmployerUserFactory()
        company = CompanyProfileFactory(user=user)
        assert company.user == user
        assert user.company_profile == company

    def test_company_unique_commercial_registration(self):
        CompanyProfileFactory(commercial_registration="CR123")
        with pytest.raises(Exception):
            CompanyProfileFactory(commercial_registration="CR123")

    def test_company_default_verified(self):
        company = CompanyProfileFactory()
        assert company.is_verified is False

    def test_company_default_featured(self):
        company = CompanyProfileFactory()
        assert company.is_featured is False

    def test_company_default_size(self):
        company = CompanyProfileFactory()
        assert company.company_size == CompanyProfile.CompanySize.SMALL

    def test_company_indexes(self):
        index_fields = [idx.fields for idx in CompanyProfile._meta.indexes]
        assert ["city", "industry"] in index_fields
        assert ["is_verified", "is_featured"] in index_fields


@pytest.mark.django_db
class TestHRTeamMemberModel:
    def test_create_hr_member(self):
        hr = HRTeamMemberFactory()
        assert hr.pk is not None

    def test_hr_member_unique_company_user(self):
        hr = HRTeamMemberFactory()
        with pytest.raises(Exception):
            HRTeamMemberFactory(company=hr.company, user=hr.user)

    def test_hr_member_default_role(self):
        hr = HRTeamMemberFactory()
        assert hr.role == "recruiter"

    def test_hr_member_default_active(self):
        hr = HRTeamMemberFactory()
        assert hr.is_active is True


@pytest.mark.django_db
class TestCompanyReviewModel:
    def test_create_review(self):
        company = CompanyProfileFactory()
        graduate = UserFactory(user_type="graduate")
        review = CompanyReview.objects.create(
            company=company,
            graduate=graduate,
            rating=4,
            review="شركة ممتازة",
        )
        assert review.pk is not None
        assert review.rating == 4

    def test_review_unique_company_graduate(self):
        company = CompanyProfileFactory()
        graduate = UserFactory(user_type="graduate")
        CompanyReview.objects.create(company=company, graduate=graduate, rating=5)
        with pytest.raises(Exception):
            CompanyReview.objects.create(company=company, graduate=graduate, rating=3)

    def test_review_default_not_approved(self):
        company = CompanyProfileFactory()
        graduate = UserFactory(user_type="graduate")
        review = CompanyReview.objects.create(company=company, graduate=graduate, rating=3)
        assert review.is_approved is False
