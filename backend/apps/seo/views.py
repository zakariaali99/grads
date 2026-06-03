from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.http import HttpResponse
from django.template.loader import render_to_string
from apps.graduates.models import GraduateProfile
from apps.employers.models import CompanyProfile
from apps.jobs.models import JobPost
from django.urls import reverse


@api_view(["GET"])
@permission_classes([AllowAny])
def seo_meta(request):
    content_type = request.query_params.get("type")
    obj_id = request.query_params.get("id")

    base_url = request.build_absolute_uri("/").rstrip("/")

    if content_type == "graduate" and obj_id:
        try:
            profile = GraduateProfile.objects.select_related("user", "college").get(id=obj_id)
            full_name = profile.user.get_full_name() or profile.user.username
            title = f"{full_name} — {profile.headline or profile.major or ''}" if profile.headline or profile.major else full_name
            description = f"{full_name} | {profile.college.name_ar if profile.college else ''} | {profile.city or ''}"
            image = profile.user.avatar.url if profile.user.avatar else None
            url = f"{base_url}/graduate/{profile.user.username}"
            return Response({
                "title": title.strip(),
                "description": description.strip(),
                "image": request.build_absolute_uri(image) if image else None,
                "url": url,
                "type": "profile",
            })
        except GraduateProfile.DoesNotExist:
            pass

    elif content_type == "company" and obj_id:
        try:
            company = CompanyProfile.objects.select_related("user", "industry").get(id=obj_id)
            title = company.company_name
            description = company.description or company.industry.name_ar if company.industry else ""
            image = company.logo.url if company.logo else None
            url = f"{base_url}/company/{company.pk}"
            return Response({
                "title": title.strip(),
                "description": str(description).strip(),
                "image": request.build_absolute_uri(image) if image else None,
                "url": url,
                "type": "company",
            })
        except CompanyProfile.DoesNotExist:
            pass

    elif content_type == "job" and obj_id:
        try:
            job = JobPost.objects.select_related("company", "category").get(id=obj_id)
            title = job.title
            description = f"{job.company.company_name} — {job.city or ''} | {job.employment_type or ''}"
            image = job.company.logo.url if job.company and job.company.logo else None
            url = f"{base_url}/jobs/{job.pk}"
            return Response({
                "title": title.strip(),
                "description": str(description).strip(),
                "image": request.build_absolute_uri(image) if image else None,
                "url": url,
                "type": "job",
            })
        except JobPost.DoesNotExist:
            pass

    return Response({"error": "Not found"}, status=404)


def sitemap_xml(request):
    base_url = request.build_absolute_uri("/").rstrip("/")

    graduates = GraduateProfile.objects.filter(user__is_active=True, user__is_banned=False).select_related("user")
    companies = CompanyProfile.objects.all()
    jobs = JobPost.objects.filter(status="active")

    urls = [
        {"loc": f"{base_url}/", "priority": "1.0", "changefreq": "daily"},
        {"loc": f"{base_url}/login", "priority": "0.5", "changefreq": "monthly"},
        {"loc": f"{base_url}/register", "priority": "0.5", "changefreq": "monthly"},
        {"loc": f"{base_url}/about", "priority": "0.6", "changefreq": "monthly"},
        {"loc": f"{base_url}/contact", "priority": "0.6", "changefreq": "monthly"},
        {"loc": f"{base_url}/terms", "priority": "0.4", "changefreq": "yearly"},
        {"loc": f"{base_url}/privacy", "priority": "0.4", "changefreq": "yearly"},
    ]

    for g in graduates:
        urls.append({
            "loc": f"{base_url}/graduate/{g.user.username}",
            "priority": "0.8",
            "changefreq": "weekly",
        })

    for c in companies:
        urls.append({
            "loc": f"{base_url}/company/{c.pk}",
            "priority": "0.7",
            "changefreq": "weekly",
        })

    for j in jobs:
        urls.append({
            "loc": f"{base_url}/jobs/{j.pk}",
            "priority": "0.9",
            "changefreq": "daily",
        })

    xml = render_to_string("seo/sitemap.xml", {"urls": urls})
    return HttpResponse(xml, content_type="application/xml")
