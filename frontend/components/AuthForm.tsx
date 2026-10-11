"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") await api.post("/auth/register/", form);
      const { data } = await api.post("/auth/login/", {
        username: form.username,
        password: form.password,
      });
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      router.push("/board");
    } catch (err) {
      const ex = err as { response?: { data?: unknown } };
      setError(JSON.stringify(ex.response?.data ?? "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full rounded border border-gray-300 bg-white p-2";
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={submit} className="w-96 space-y-3 rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Login" : "Create account"}</h1>
        <input className={input} placeholder="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        {mode === "register" && (
          <input className={input} type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        )}
        <input className={input} type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="break-words text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50">
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
        <p className="text-sm">
          {mode === "login" ? (
            <>No account? <Link className="text-blue-600" href="/register">Register</Link></>
          ) : (
            <>Have an account? <Link className="text-blue-600" href="/login">Login</Link></>
          )}
        </p>
      </form>
    </div>
  );
}