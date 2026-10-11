
from django.conf import settings
from django.db import models


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = "applied"
        INTERVIEW = "interview"
        OFFER = "offer"
        REJECTED = "rejected"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="applications")
    company = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    location = models.CharField(max_length=150, blank=True)
    job_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    applied_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.role} @ {self.company}"
# Create your models here.
