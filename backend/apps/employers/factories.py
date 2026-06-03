import factory
from apps.employers.models import Industry, CompanyProfile, HRTeamMember
from apps.accounts.factories import EmployerUserFactory


class IndustryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Industry

    name_ar = factory.Sequence(lambda n: f"قطاع {n}")
    name_en = factory.Sequence(lambda n: f"Industry {n}")
    is_active = True


class CompanyProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CompanyProfile

    user = factory.SubFactory(EmployerUserFactory)
    company_name = factory.Sequence(lambda n: f"شركة {n}")
    company_name_en = factory.Sequence(lambda n: f"Company {n}")
    commercial_registration = factory.Sequence(lambda n: f"CR{n:08d}")
    industry = factory.SubFactory(IndustryFactory)
    company_size = CompanyProfile.CompanySize.SMALL
    city = "طرابلس"
    is_verified = False
    is_featured = False


class HRTeamMemberFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = HRTeamMember

    company = factory.SubFactory(CompanyProfileFactory)
    user = factory.SubFactory(EmployerUserFactory)
    role = "recruiter"
    is_active = True
