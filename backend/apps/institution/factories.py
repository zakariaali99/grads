import factory
from apps.institution.models import InstitutionProfile, GraduateTracking, InstitutionPartnership
from apps.accounts.factories import UserFactory, GraduateUserFactory
from apps.employers.factories import CompanyProfileFactory


class InstitutionUserFactory(UserFactory):
    user_type = "institution"


class InstitutionProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = InstitutionProfile

    user = factory.SubFactory(InstitutionUserFactory)
    institution_name = factory.Sequence(lambda n: f"جامعة {n}")
    institution_name_en = factory.Sequence(lambda n: f"University {n}")
    institution_type = InstitutionProfile.InstitutionType.UNIVERSITY
    license_number = factory.Sequence(lambda n: f"LIC{n:08d}")
    city = "الرياض"
    country = "المملكة العربية السعودية"


class GraduateTrackingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = GraduateTracking

    institution = factory.SubFactory(InstitutionProfileFactory)
    graduate = factory.SubFactory(GraduateUserFactory)
    student_id = factory.Sequence(lambda n: f"STU{n:05d}")
    major = "هندسة برمجيات"
    enrollment_year = 2020
    status = GraduateTracking.Status.GRADUATED


class InstitutionPartnershipFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = InstitutionPartnership

    institution = factory.SubFactory(InstitutionProfileFactory)
    company = factory.SubFactory(CompanyProfileFactory)
    partnership_type = InstitutionPartnership.PartnershipType.RECRUITMENT
    status = InstitutionPartnership.Status.ACTIVE
    contact_person_name = "أحمد"
    contact_email = factory.Sequence(lambda n: f"contact{n}@example.com")
