from django.urls import path
from . import views

urlpatterns = [
    path("meta/", views.seo_meta, name="seo-meta"),
    path("sitemap.xml", views.sitemap_xml, name="sitemap"),
]
