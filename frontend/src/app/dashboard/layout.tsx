"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type Role = "admin" | "worker";

const ADMIN_ROUTES = [
  "/dashboard","/dashboard/control-tower","/dashboard/workers","/dashboard/policies",
  "/dashboard/claims","/dashboard/analytics","/dashboard/risk-map","/dashboard/threat-defense",
];
const WORKER_ROUTES = [
  "/dashboard/my-policy","/dashboard/triggers","/dashboard/policy-terms","/dashboard/profile",
];

const ADMIN_NAV = [
  { label: "Overview", href: "/dashboard" },
  { label: "Control Tower", href: "/dashboard/control-tower" },
  { label: "Workers", href: "/dashboard/workers" },
  { label: "Policies", href: "/dashboard/policies" },
  { label: "Claims", href: "/dashboard/claims" },
  { label: "Analytics", href: "/dashboard/analytics" },
  { label: "Risk Map", href: "/dashboard/risk-map" },
  { label: "Threat Defense", href: "/dashboard/threat-defense" },
];

const WORKER_NAV = [
  { label: "My Policy", href: "/dashboard/my-policy" },
  { label: "Triggers", href: "/dashboard/triggers" },
  { label: "Policy Terms", href: "/dashboard/policy-terms" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [userRole, setUserRole] = useState<Role>("worker");
  const [userName, setUserName] = useState("");
  const [userPlatform, setUserPlatform] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("gigarmor_token");
    const rawUser = localStorage.getItem("gigarmor_user");
    if (!token || !rawUser) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(rawUser);
      const role: Role = user.role === "admin" ? "admin" : "worker";
      setUserRole(role);
      setUserName(user.name || "");
      setUserPlatform(user.platform || "");
      const isAdmin = ADMIN_ROUTES.includes(pathname);
      const isWorker = WORKER_ROUTES.includes(pathname);
      if (isAdmin && role !== "admin") { router.replace("/dashboard/my-policy"); return; }
      if (!isAdmin && !isWorker) { router.replace(role === "admin" ? "/dashboard" : "/dashboard/my-policy"); return; }
      setAllowed(true);
    } catch { router.replace("/login"); }
  }, [pathname, router]);

  function handleLogout() {
    localStorage.removeItem("gigarmor_token");
    localStorage.removeItem("gigarmor_user");
    router.push("/login");
  }

  const navItems = userRole === "admin" ? ADMIN_NAV : WORKER_NAV;

  if (!allowed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border border-[#00FF87] animate-spin" style={{ animationDuration: "1s" }} />
          <span className="font-mono text-[10px] tracking-widest uppercase text-[#444]">Authenticating...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* ── TOP BAR ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-black border-b border-[#1a1a1a] flex items-center z-50">
        <div className="flex items-center h-full px-6 border-r border-[#1a1a1a] shrink-0">
          <Link href={userRole === "admin" ? "/dashboard" : "/dashboard/my-policy"} className="flex items-center gap-2.5">
            <div className="w-6 h-6 border border-[#00FF87] flex items-center justify-center">
              <span className="font-mono text-[8px] text-[#00FF87] font-bold">GS</span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white">GigShield</span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex items-center h-full overflow-x-auto scrollbar-hide px-4 gap-1">
          {navItems.map(item => {
            const active = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href} href={item.href}
                className={`relative h-full flex items-center px-4 font-mono text-[10px] tracking-widest uppercase whitespace-nowrap transition-colors ${
                  active ? "text-white" : "text-[#444] hover:text-[#777]"
                }`}
              >
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px bg-[#00FF87]"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="flex items-center h-full border-l border-[#1a1a1a] px-4 gap-4 shrink-0">
          <div className="hidden md:block text-right">
            <div className="font-mono text-[10px] text-white">{userName}</div>
            <div className="mono-label">{userPlatform || userRole}</div>
          </div>
          <div className={`w-7 h-7 flex items-center justify-center font-mono text-[10px] font-bold ${
            userRole === "admin" ? "bg-[#00FF87] text-black" : "border border-[#2a2a2a] text-[#555]"
          }`}>
            {userName.charAt(0).toUpperCase() || "?"}
          </div>
          <button onClick={handleLogout}
            className="font-mono text-[10px] tracking-widest uppercase text-[#333] hover:text-[#ff4444] transition-colors">
            Exit
          </button>
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────────── */}
      <main className="pt-12 min-h-screen">
        {children}
      </main>
    </div>
  );
}
