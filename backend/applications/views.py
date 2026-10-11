
# Create your views here.
from django.db.models import Count
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Application
from .serializers import ApplicationSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["company", "role", "notes"]
    ordering_fields = ["applied_date", "created_at", "company"]

    def get_queryset(self):
        qs = Application.objects.filter(user=self.request.user)
        status = self.request.query_params.get("status")
        return qs.filter(status=status) if status else qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False)
    def stats(self, request):
        qs = self.get_queryset()
        by_status = dict(qs.order_by().values_list("status").annotate(c=Count("id")))
        return Response({"total": qs.count(), "by_status": by_status})