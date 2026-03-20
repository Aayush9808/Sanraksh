"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Role = "admin" | "worker";

const ADMIN_ROUTES = [
  "/dashboard",
  "/dashboard/workers",
  "/dashboard/policies",
  "/dashboard/claims",
  "/dashboard/analytics",
  "/dashboard/risk-map",
  "/dashboard/market-crash",
];

const WORKER_ROUTES = [
  "/dashboard/my-policy",
  "/dashboard/triggers",
  "/dashboard/policy-terms",
  "/dashboard/profile",
];

function routeRole(pathname: string): Role | null {
  if (WORKER_ROUTES.includes(pathname)) return "worker";
  if (ADMIN_ROUTES.includes(pathname)) return "admin";
  return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  const requiredRole = useMemo(() => routeRole(pathname), [pathname]);

  useEffect(() => {
    const token = localStorage.getItem("gigarmor_token");
    const rawUser = localStorage.getItem("gigarmor_user");

    if (!token || !rawUser) {
      router.replace("/login");
      return;
    }

    let role: Role = "worker";
    try {
      const user = JSON.parse(rawUser) as { role?: string };
      role = user.role === "admin" ? "admin" : "worker";
    } catch {
      router.replace("/login");
      return;
    }

    if (requiredRole && role !== requiredRole) {
      router.replace(role === "admin" ? "/dashboard" : "/dashboard/my-policy");
      return;
    }

    setAllowed(true);
  }, [requiredRole, router]);

  if (!allowed) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 grid place-items-center">
        <p className="text-sm">Checking access…</p>
      </div>
    );
  }

  function handleLogout() {
    localStorage.removeItem("gigarmor_token");
    localStorage.removeItem("gigarmor_user");
    localStorage.removeItem("gigarmor_profile");
    router.replace("/login");
  }

  return (
    <>
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 z-[70] rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 shadow-lg shadow-black/30 transition hover:bg-red-500/20 hover:text-red-200"
      >
        Logout
      </button>
      {children}
    </>
  );
}
