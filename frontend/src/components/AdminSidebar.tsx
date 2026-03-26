"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/dashboard",                icon: "▣",  label: "Overview" },
  { href: "/dashboard/control-tower",  icon: "🛰️", label: "Control Tower" },
  { href: "/dashboard/workers",        icon: "👷", label: "Workers" },
  { href: "/dashboard/policies",       icon: "🛡️", label: "Policies" },
  { href: "/dashboard/claims",         icon: "≡",  label: "Claims" },
  { href: "/dashboard/analytics",      icon: "↗",  label: "Analytics" },
  { href: "/dashboard/risk-map",       icon: "🗺️", label: "Risk Map" },
  { href: "/dashboard/threat-defense", icon: "🚨", label: "Threat Defense" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/[0.06] bg-[#060d1a]">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.span
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/30"
          >
            G
          </motion.span>
          <span className="text-sm font-black text-white">GigArmor</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">Navigation</p>
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                  ${active
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"}`}
              >
                <span className="w-5 text-center text-base">{item.icon}</span>
                {item.label}
                {active && (
                  <motion.span
                    layoutId="admin-nav-dot"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="shrink-0 border-t border-white/[0.06] p-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-300">All systems live</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-600">99.9% uptime this month</div>
        </div>
      </div>
    </aside>
  );
}
