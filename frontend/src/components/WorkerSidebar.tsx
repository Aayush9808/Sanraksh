"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard/my-policy",    icon: "🛡️", label: "My Policy" },
  { href: "/dashboard/triggers",     icon: "⚡", label: "Live Alerts" },
  { href: "/dashboard/policy-terms", icon: "📘", label: "Policy Terms" },
  { href: "/dashboard/profile",      icon: "👤", label: "Profile" },
];

interface UserData {
  name: string;
  phone: string;
  platform: string;
  city: string;
  role: string;
  zone?: string;
}

export default function WorkerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("gigarmor_user");
    if (raw) setUser(JSON.parse(raw) as UserData);
  }, []);

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-white/[0.06] bg-[#060d1a] z-40">
      {/* Logo */}
      <div className="border-b border-white/[0.06] px-5 py-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.span
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            G
          </motion.span>
          <span className="text-lg font-black tracking-tight text-white">GigArmor</span>
        </Link>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Worker Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                  ${active
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shadow-sm shadow-cyan-500/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
                {active && (
                  <motion.span
                    layoutId="worker-nav-dot"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Live alerts indicator */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-3 py-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          <span className="text-[11px] font-semibold text-amber-300">3 Active Alerts</span>
        </div>
      </div>

      {/* User info + sign out */}
      <div className="border-t border-white/[0.06] p-4 space-y-2">
        {user && (
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500">{user.platform}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => { localStorage.clear(); router.push("/login"); }}
          className="w-full rounded-xl border border-white/[0.06] px-3 py-2 text-xs text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
