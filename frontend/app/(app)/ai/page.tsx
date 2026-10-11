"use client";
import { useState } from "react";
import { api } from "@/lib/api";

interface Result {
  score: number; matched_skills: string[]; missing_skills: string[]; suggestions: string[];
}
function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold">{title}</h3>
      <ul className="list-disc pl-5 text-sm">{items?.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}

export default function AiPage() {
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const fd = new FormData();
      fd.append("job_description", jd);
      if (file) fd.append("resume_file", file);
      else fd.append("resume_text", resume);
      const { data } = await api.post("/ai/match/", fd);
      setResult(data);
    } catch (err) {
      const ex = err as { response?: { data?: unknown } };
      setError(JSON.stringify(ex.response?.data ?? "Request failed"));
    } finally {
      setLoading(false);
    }
  };

  const box = "w-full rounded border border-gray-300 bg-white p-2";
 
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <h1 className="text-2xl font-bold">Resume vs Job Description</h1>
      <textarea className={box} rows={6} placeholder="Paste job description"
        value={jd} onChange={(e) => setJd(e.target.value)} />
      <textarea className={box} rows={6} placeholder="Paste resume text (or upload a PDF below)"
        value={resume} onChange={(e) => setResume(e.target.value)} />
      <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <div>
        <button onClick={run} disabled={loading || !jd}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
          {loading ? "Analyzing..." : "Analyze match"}
        </button>
      </div>
      {error && <p className="break-words text-sm text-red-600">{error}</p>}
      {result && (
        <div className="space-y-3 rounded-lg bg-white p-4 shadow">
          <div className="text-4xl font-bold text-blue-600">{result.score}%</div>
          <List title="Matched skills" items={result.matched_skills} />
          <List title="Missing skills" items={result.missing_skills} />
          <List title="Suggestions" items={result.suggestions} />
        </div>
      )}
    </div>
  );
}