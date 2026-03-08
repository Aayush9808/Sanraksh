"use client";

import { useState } from "react";

const navItems = [
  { href: "/dashboard",            icon: "📊", label: "Overview",  active: true  },
  { href: "/dashboard/claims",     icon: "📋", label: "Claims",    active: false },
  { href: "/dashboard/analytics",  icon: "📈", label: "Analytics", active: false },
  { href: "/dashboard/risk-map",   icon: "🗺️", label: "Risk Map",  active: false },
  { href: "/",                     icon: "🏠", label: "Home",      active: false },
];

const activity = [
  { dot: "bg-amber-400",  text: "Heavy rain detected in Andheri West (2km zone)",      time: "2 min ago"  },
  { dot: "bg-emerald-400",text: "12 claims auto-approved — ₹9,600 disbursed",           time: "5 min ago"  },
  { dot: "bg-cyan-400",   text: "New worker registered: Rahul Kumar, Bandra-Kurla",    time: "10 min ago" },
  { dot: "bg-violet-400", text: "Fraud alert cleared — Priya Sharma verified",         time: "18 min ago" },
  { dot: "bg-emerald-400",text: "Claim #C-2041 paid — Amit Singh, ₹800",               time: "24 min ago" },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    { icon: "👥", val: "1,247",   label: "Total Workers",    sub: "Registered users",        color: "border-cyan-300/30    bg-cyan-400/10    text-cyan-100"   },
    { icon: "📋", val: "1,089",   label: "Active Policies",  sub: "Coverage in force",       color: "border-emerald-300/30 bg-emerald-400/10 text-emerald-100"},
    { icon: "⚡", val: "23",      label: "Claims Today",     sub: "Disruption events",       color: "border-amber-300/30   bg-amber-400/10   text-amber-100"  },
    { icon: "💰", val: "₹2.7L",   label: "Total Payouts",    sub: "Lifetime disbursed",      color: "border-violet-300/30  bg-violet-400/10  text-violet-100" },
  ];

  const quickLinks = [
    { href: "/dashboard/risk-map",  icon: "🗺️", title: "Risk Heatmap",   desc: "High-risk micro-zones and live disruption signals",  accent: "group-hover:text-cyan-300"    },
    { href: "/dashboard/claims",    icon: "📋", title: "Manage Claims",  desc: "Review, approve or reject pending claim requests",   accent: "group-hover:text-emerald-300"  },
    { href: "/dashboard/analytics", icon: "📈", title: "Analytics",     desc: "Conversion rates, claim velocity, protection ROI",   accent: "group-hover:text-violet-300"   },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-slate-900 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
          <span className="text-lg">🛡️</span>
          <span className="text-base font-black text-white">GigShield</span>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                item.active
                  ? "bg-cyan-400/20 text-cyan-300 border border-cyan-300/30"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}>
              <span>{item.icon}</span>{item.label}
              {item.active && <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />}
            </a>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <div className="rounded-xl bg-emerald-400/10 border border-emerald-300/20 px-3 py-2 text-xs font-semibold text-emerald-300">
            ✅ All systems operational
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/90 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden">☰</button>
            <div>
              <p className="text-xs text-slate-500">GigShield Platform</p>
              <h1 className="text-lg font-black text-white leading-tight">Control Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-400 sm:block">Live · Updated now</span>
            <a href="/" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors">← Home</a>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {/* Hero strip */}
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-950 via-slate-900 to-violet-950 p-6 md:p-8">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Live platform overview</p>
            <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">Real-time gig worker protection dashboard</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Monitor active policies, track disruption events, and process claims with transparent worker-friendly workflows.</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-2xl border p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 ${s.color}`}>
                <div className="text-2xl">{s.icon}</div>
                <div className="mt-2 text-2xl font-black">{s.val}</div>
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="mt-0.5 text-xs opacity-70">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Middle row */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            {/* Automation rate */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
              <h3 className="mb-4 text-base font-bold text-white">Automation Rate</h3>
              <div className="text-5xl font-black text-emerald-300">99.8%</div>
              <p className="mt-1 text-sm text-slate-400">Claims auto-approved without manual intervention</p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: "99.8%" }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500"><span>0%</span><span>100%</span></div>
            </div>

            {/* Activity feed */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
              <h3 className="mb-4 text-base font-bold text-white">Live Activity Feed</h3>
              <div className="space-y-0">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-white/5 py-2.5 last:border-0">
                    <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${a.dot}`} />
                    <div>
                      <p className="text-sm text-slate-200">{a.text}</p>
                      <p className="text-xs text-slate-500">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid gap-5 md:grid-cols-3">
            {quickLinks.map((q) => (
              <a key={q.href} href={q.href}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-white/20">
                <div className="mb-3 text-4xl">{q.icon}</div>
                <div className="font-bold text-white">{q.title}</div>
                <div className="mt-1 text-sm text-slate-300">{q.desc}</div>
                <div className={`mt-4 text-sm font-semibold text-slate-400 transition-colors ${q.accent}`}>Open section →</div>
              </a>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
