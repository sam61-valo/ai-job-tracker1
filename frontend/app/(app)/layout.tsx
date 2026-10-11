"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const subscribe = () => () => {};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const token = hydrated ? localStorage.getItem("access") : null;

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;

  const links = [["/board", "Board"], ["/ai", "AI Match"], ["/dashboard", "Dashboard"]];
  return (
    <div>
      <nav className="flex items-center gap-6 bg-white px-6 py-3 shadow">
        <span className="font-bold">AI Job Tracker</span>
        {links.map(([href, label]) => (
          <Link key={href} href={href}
            className={path === href ? "font-semibold text-blue-600" : "text-gray-600"}>
            {label}
          </Link>
        ))}
        <button className="ml-auto text-sm text-red-600"
          onClick={() => { localStorage.clear(); router.push("/login"); }}>
          Logout
        </button>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}