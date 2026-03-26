"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import OrbitalDock from "@/components/ui/OrbitalDock";
import CommandPalette from "@/components/ui/CommandPalette";

const AmbientCanvas = dynamic(() => import("@/components/ui/AmbientCanvas"), { ssr: false });

type Role = "admin" | "worker";

const ADMIN_ROUTES = [
  "/dashboard",
  "/dashboard/control-tower",
  "/dashboard/workers",
  "/dashboard/policies",
  "/dashboard/claims",
  "/dashboard/analytics",
  "/dashboard/risk-map",
  "/dashboard/threat-defense",
];

const WORKER_ROUTES = [
  "/dashboard/my-policy",
  "/dashboard/triggers",
  "/dashboard/policy-terms",
  "/dashboard/profile",
];

const ADMIN_DOCK = [
  { id: "overview", label: "Overview", icon: "◎", href: "/dashboard" },
  { id: "control", label: "Control Tower", icon: "⚡", href: "/dashboard/control-tower" },
  { id: "workers", label: "Workers", icon: "👥", href: "/dashboard/workers" },
  { id: "policies", label: "Policies", icon: "📋", href: "/dashboard/policies" },
  { id: "claims", label: "Claims", icon: "💰", href: "/dashboard/claims" },
  { id: "analytics", label: "Analytics", icon: "📊", href: "/dashboard/analytics" },
  { id: "risk", label: "Risk Map", icon: "🗺", href: "/dashboard/risk-map" },
  { id: "defense", label: "Threat Defense", icon: "🛡", href: "/dashboard/threat-defense" },
];

const WORKER_DOCK = [
  { id: "policy", label: "My Policy", icon: "🛡", href: "/dashboard/my-policy" },
  { id: "triggers", label: "Triggers", icon: "⚡", href: "/dashboard/triggers" },
  { id: "terms", label: "Policy Terms", icon: "📄", href: "/dashboard/policy-terms" },
  { id: "profile", label: "Profile", icon: "👤", href: "/dashboard/profile" },
];

const CMD_ITEMS_ADMIN = [
  ...ADMIN_DOCK.map(d => ({ ...d, section: "Dashboard" })),
  { id: "logout", label: "Sign Out", icon: "🚪", href: "__logout__", section: "Account" },
];

const CMD_ITEMS_WORKER = [
  ...WORKER_DOCK.map(d => ({ ...d, section: "Dashboard" })),
  { id: "logout", label: "Sign Out", icon: "🚪", href: "__logout__", section: "Account" },
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
  const [userRole, setUserRole] = useState<Role>("worker");

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

    setUserRole(role);
    setAllowed(true);
  }, [requiredRole, router]);

  function handleLogout() {
    localStorage.removeItem("gigarmor_token");
    localStorage.removeItem("gigarmor_user");
    localStorage.removeItem("gigarmor_profile");
    router.replace("/login");
  }

  function handleNav(href: string) {
    if (href === "__logout__") {
      handleLogout();
    } else {
      router.push(href);
    }
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-surface-0 grid place-items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-2 border-accent-amber/30 border-t-accent-amber rounded-full animate-spin" />
          <p className="text-xs text-text-muted font-mono tracking-wider">AUTHENTICATING</p>
        </motion.div>
      </div>
    );
  }

  const dockItems = userRole === "admin" ? ADMIN_DOCK : WORKER_DOCK;
  const cmdItems = userRole === "admin" ? CMD_ITEMS_ADMIN : CMD_ITEMS_WORKER;

  return (
    <div className="relative min-h-screen bg-surface-0">
      <AmbientCanvas intensity={0.4} />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 glass border-b border-white/[0.04]">
        <div className="flex items-center justify-between h-12 px-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-amber to-accent-ember flex items-center justify-center text-[10px] font-bold text-surface-0">G</div>
            <span className="text-sm font-semibold text-text-primary tracking-tight">GigArmor</span>
            <span className="text-[10px] font-mono text-text-muted bg-surface-3 px-1.5 py-0.5 rounded">
              {userRole === "admin" ? "ADMIN" : "WORKER"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const e = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                window.dispatchEvent(e);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-3/50 hover:bg-surface-3
                text-text-muted hover:text-text-secondary text-xs transition-colors border border-white/[0.04]"
            >
              <span>Search</span>
              <kbd className="text-[10px] font-mono bg-surface-4 px-1 py-0.5 rounded">⌘K</kbd>
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-text-muted hover:text-state-danger transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette items={cmdItems} onNavigate={handleNav} />

      {/* Main content */}
      <div className="pt-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Orbital Dock */}
      <OrbitalDock items={dockItems} />
    </div>
  );
}
