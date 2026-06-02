from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Advertisement
from .serializers import AdvertisementSerializer


class AdvertisementViewSet(viewsets.ModelViewSet):
    queryset = Advertisement.objects.all()
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        placement = self.request.query_params.get("placement")
        if placement:
            qs = qs.filter(placement=placement, is_active=True)
        return qs

    @action(detail=True, methods=["post"])
    def record_click(self, request, pk=None):
        ad = self.get_object()
        ad.click_count += 1
        ad.save(update_fields=["click_count"])
        return Response({"success": True})


class PublicAdViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Advertisement.objects.filter(is_active=True)
    serializer_class = AdvertisementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        placement = self.request.query_params.get("placement")
        if placement:
            qs = qs.filter(placement=placement)
        return qs
