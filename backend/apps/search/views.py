from rest_framework import views, permissions
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from elasticsearch_dsl import Q, Search
from elasticsearch_dsl.query import MultiMatch, Bool, Term, Range
from django.conf import settings
from elasticsearch import Elasticsearch


class GlobalSearchView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        query = request.data.get("query", "")
        filters = request.data.get("filters", {})
        page = int(request.data.get("page", 1))
        page_size = int(request.data.get("page_size", 20))

        if not query:
            return Response({"error": _("معامل البحث مطلوب")}, status=400)

        client = Elasticsearch(hosts=[settings.ELASTICSEARCH_DSL["default"]["hosts"]])

        results = {
            "graduates": self.search_graduates(client, query, filters, page, page_size),
            "jobs": self.search_jobs(client, query, filters, page, page_size),
            "companies": self.search_companies(client, query, filters, page, page_size),
        }

        return Response(results)

    def search_graduates(self, client, query, filters, page, page_size):
        s = Search(using=client, index="graduates")
        s = s.query(
            MultiMatch(query=query, fields=["full_name^3", "headline^2", "skill_names", "major", "college_name", "city"])
        )

        if filters.get("city"):
            s = s.filter("term", city=filters["city"])
        if filters.get("college"):
            s = s.filter("term", college_name=filters["college"])
        if filters.get("graduation_year"):
            s = s.filter("term", graduation_year=filters["graduation_year"])
        if filters.get("available_for_work") is not None:
            s = s.filter("term", available_for_work=filters["available_for_work"])

        s = s.extra(from_=(page - 1) * page_size, size=page_size)
        response = s.execute()

        return {
            "total": response.hits.total.value if response.hits.total else 0,
            "results": [hit.to_dict() for hit in response.hits],
        }

    def search_jobs(self, client, query, filters, page, page_size):
        s = Search(using=client, index="jobs")
        s = s.query(
            MultiMatch(query=query, fields=["title^3", "description", "requirements", "skill_names", "company_name"])
        )

        if filters.get("city"):
            s = s.filter("term", city=filters["city"])
        if filters.get("employment_type"):
            s = s.filter("term", employment_type=filters["employment_type"])
        if filters.get("experience_level"):
            s = s.filter("term", experience_level=filters["experience_level"])
        if filters.get("salary_min"):
            s = s.filter("range", salary_min={"gte": filters["salary_min"]})
        if filters.get("salary_max"):
            s = s.filter("range", salary_max={"lte": filters["salary_max"]})

        s = s.extra(from_=(page - 1) * page_size, size=page_size)
        response = s.execute()

        return {
            "total": response.hits.total.value if response.hits.total else 0,
            "results": [hit.to_dict() for hit in response.hits],
        }

    def search_companies(self, client, query, filters, page, page_size):
        s = Search(using=client, index="companies")
        s = s.query(
            MultiMatch(query=query, fields=["company_name^3", "description", "city"])
        )

        if filters.get("city"):
            s = s.filter("term", city=filters["city"])
        if filters.get("company_size"):
            s = s.filter("term", company_size=filters["company_size"])

        s = s.extra(from_=(page - 1) * page_size, size=page_size)
        response = s.execute()

        return {
            "total": response.hits.total.value if response.hits.total else 0,
            "results": [hit.to_dict() for hit in response.hits],
        }
