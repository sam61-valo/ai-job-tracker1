import json
import google.generativeai as genai
from django.conf import settings
from pypdf import PdfReader
from rest_framework.views import APIView
from rest_framework.response import Response


class MatchView(APIView):
    def post(self, request):
        jd = request.data.get("job_description", "").strip()
        resume = request.data.get("resume_text", "").strip()
        pdf = request.FILES.get("resume_file")
        if pdf:
            resume = "\n".join(p.extract_text() or "" for p in PdfReader(pdf).pages)
        if not jd or not resume:
            return Response({"error": "job_description and resume (text or PDF) required"}, status=400)

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        prompt = f"""Compare this resume to the job description.
Return ONLY JSON: {{"score": 0-100, "matched_skills": [], "missing_skills": [], "suggestions": []}}

RESUME:
{resume[:8000]}

JOB DESCRIPTION:
{jd[:8000]}"""
        try:
            res = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            return Response(json.loads(res.text))
        except Exception as e:
            return Response({"error": str(e)}, status=502)