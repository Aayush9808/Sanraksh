"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const WORKER_NAV = [
  { href: "/dashboard",              label: "Overview",     icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: "/dashboard/triggers",     label: "Live Triggers", badge: 2, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { href: "/dashboard/my-policy",   label: "My Policy",    icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { href: "/dashboard/profile",     label: "Profile",      icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

const ADMIN_NAV = [
  { href: "/dashboard",              label: "Command Center", icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  { href: "/dashboard/claims",       label: "Claims",         badge: 3, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
  { href: "/dashboard/workers",      label: "Workers",        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { href: "/dashboard/triggers",     label: "Triggers",       icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { href: "/dashboard/analytics",    label: "Analytics",      icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { href: "/dashboard/policies",     label: "Policies",       icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { href: "/dashboard/risk-map",     label: "Risk Map",       icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg> },
  { href: "/dashboard/market-crash", label: "Threat Events",  badge: 1, icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { href: "/dashboard/premium-calculator", label: "Premium Calc", icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg> },
  { href: "/dashboard/profile",      label: "Profile",        icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState("worker");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const r = typeof window !== "undefined" ? localStorage.getItem("role") : "";
    if (!token) {
      router.replace("/login");
      return;
    }
    if (r) setRole(r);
    setAuthChecked(true);
  }, [router]);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") { localStorage.removeItem("token"); localStorage.removeItem("role"); }
    router.push("/login");
  }, [router]);

  const nav = role === "admin" ? ADMIN_NAV : WORKER_NAV;
  const activeItem = nav.find(n => n.href === pathname) || nav[0];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-xs">GA</span>
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">GigArmor</div>
            <div className="text-xs text-slate-400 font-medium capitalize">{role} portal</div>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-0.5">
        {nav.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? "bg-[#0F2044] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <span className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && !isActive && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: status + logout */}
      <div className="px-3 py-3 border-t border-slate-200 space-y-1 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <span className="text-emerald-700 text-xs font-semibold">Engine operational</span>
        </div>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 text-sm font-semibold transition-all">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>
    </>
  );

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0F2044] flex items-center justify-center">
            <span className="text-white font-black text-sm">GA</span>
          </div>
          <div className="w-5 h-5 border-2 border-[#0F2044] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white border-r border-slate-200 fixed top-0 bottom-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60">

        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 h-14 flex items-center px-4 sm:px-6 gap-3 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
            <span className="text-slate-400 font-medium truncate hidden sm:block">GigArmor</span>
            <span className="text-slate-300 hidden sm:block">/</span>
            <span className="font-semibold text-slate-900 truncate">{activeItem.label}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0F2044] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {role === "admin" ? "AD" : "W"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 page-enter pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden mobile-nav">
        {nav.slice(0, 5).map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`mobile-nav-item relative ${isActive ? "active" : ""}`}>
              {item.badge && (
                <span className="absolute top-1.5 right-1/2 translate-x-3 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              <span className={isActive ? "text-[#0F2044]" : "text-slate-400"}>{item.icon}</span>
              <span>{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
