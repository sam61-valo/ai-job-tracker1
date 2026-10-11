"use client";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { STATUSES } from "@/lib/types";

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await api.get("/applications/stats/")).data,
  });
  if (!data) return <p>Loading...</p>;

  const chart = STATUSES.map((s) => ({ status: s, count: data.by_status[s] ?? 0 }));
  const offers = data.by_status.offer ?? 0;
  const rate = data.total ? Math.round((offers / data.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card label="Total" value={data.total} />
        <Card label="Interviews" value={data.by_status.interview ?? 0} />
        <Card label="Offers" value={offers} />
        <Card label="Success rate" value={`${rate}%`} />
      </div>
      <div className="h-72 rounded-lg bg-white p-4 shadow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}