"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const navItems = [
  { href: "/dashboard",            icon: "▣",  label: "Overview",    active: true  },
  { href: "/dashboard/my-policy",  icon: "🛡️", label: "My Policy",   active: false },
  { href: "/dashboard/triggers",   icon: "⚡",  label: "Triggers",    active: false },
  { href: "/dashboard/workers",    icon: "👷", label: "Workers",     active: false },
  { href: "/dashboard/policies",   icon: "🛡️", label: "Policies",   active: false },
  { href: "/dashboard/claims",     icon: "≡",  label: "Claims",      active: false },
  { href: "/dashboard/analytics",  icon: "↗",  label: "Analytics",   active: false },
  { href: "/dashboard/risk-map",   icon: "🗺️", label: "Risk Map",   active: false },
  { href: "/dashboard/market-crash", icon: "🚨", label: "Market Crash", active: false },
];

const MOCK_CLAIMS_DATA = [
  { day: "Mon", claims: 8,  payout: 6400  },
  { day: "Tue", claims: 12, payout: 9600  },
  { day: "Wed", claims: 23, payout: 18400 },
  { day: "Thu", claims: 17, payout: 13600 },
  { day: "Fri", claims: 9,  payout: 7200  },
  { day: "Sat", claims: 31, payout: 24800 },
  { day: "Sun", claims: 14, payout: 11200 },
];

const MOCK_POLICY_MIX = [
  { name: "Weather",  value: 42, color: "#22d3ee" },
  { name: "Flood",    value: 20, color: "#38bdf8" },
  { name: "Job Loss", value: 21, color: "#a78bfa" },
  { name: "Curfew",   value: 10, color: "#34d399" },
  { name: "Pollution",value: 7,  color: "#f59e0b" },
];

const activity = [
  { dot: "bg-amber-400",   text: "Heavy rain alert — Andheri West (Zone 7)",        time: "2 min ago"  },
  { dot: "bg-emerald-400", text: "12 claims auto-approved — ₹9,600 disbursed",       time: "5 min ago"  },
  { dot: "bg-cyan-400",    text: "New worker: Rahul Kumar, Bandra-Kurla",            time: "10 min ago" },
  { dot: "bg-violet-400",  text: "Fraud alert cleared — Priya Sharma verified",      time: "18 min ago" },
  { dot: "bg-emerald-400", text: "Claim #CLM-20241208-00041 paid — Amit Singh",      time: "24 min ago" },
];

const MOCK_RECENT_CLAIMS = [
  { id: "C-2045", name: "Vikram Nair",  type: "Weather",  amount: "800",   status: "PAID",       sc: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "C-2044", name: "Sunita Devi",  type: "Weather",  amount: "800",   status: "PROCESSING", sc: "bg-amber-500/20 text-amber-300 border-amber-500/30"       },
  { id: "C-2043", name: "Raju Mehtani", type: "Flood",    amount: "800",   status: "REVIEW",     sc: "bg-red-500/20 text-red-300 border-red-500/30"             },
  { id: "C-2042", name: "Priya Sharma", type: "Weather",  amount: "800",   status: "PAID",       sc: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { id: "C-2041", name: "Amit Singh",   type: "Weather",  amount: "800",   status: "PAID",       sc: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
];

function fmt(n: number): string {
  if (n >= 100000) return (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function statusClass(s: string): string {
  if (s === "paid") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (s === "pending") return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  return "bg-red-500/20 text-red-300 border-red-500/30";
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ total_users: 1247, active_policies: 1089, claims_today: 23, total_payout_amount: 274000, automation_rate: 94.2, claims_review: 8 });
  const [claimsData, setClaimsData] = useState(MOCK_CLAIMS_DATA);
  const [policyMix, setPolicyMix] = useState(MOCK_POLICY_MIX);
  const [recentClaims, setRecentClaims] = useState(MOCK_RECENT_CLAIMS);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, summaryRes, mixRes, claimsRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/analytics/dashboard`),
          fetch(`${API_BASE}/api/v1/analytics/claims-summary?days=7`),
          fetch(`${API_BASE}/api/v1/analytics/policy-mix`),
          fetch(`${API_BASE}/api/v1/claims/all?limit=5`),
        ]);
        if (dashRes.ok) setStats(await dashRes.json());
        if (summaryRes.ok) { const d = await summaryRes.json(); if (d.length) setClaimsData(d); }
        if (mixRes.ok) { const d = await mixRes.json(); if (d.length) setPolicyMix(d); }
        if (claimsRes.ok) {
          const d = await claimsRes.json();
          if (d.claims?.length) {
            setRecentClaims(d.claims.slice(0, 5).map((c: any) => ({
              id: c.claim_number, name: c.worker_name || "Worker",
              type: "Weather", amount: c.amount?.toString() || "800",
              status: c.status?.toUpperCase() || "PAID",
              sc: statusClass(c.status || ""),
            })));
          }
        }
      } catch { /* use mock data */ }
    }
    loadData();
  }, []);

  const kpis = [
    { icon: "👥", val: fmt(stats.total_users),         label: "Total Workers",   sub: "registered",      c: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"     },
    { icon: "📋", val: fmt(stats.active_policies),      label: "Active Policies", sub: `${Math.round(stats.active_policies/Math.max(stats.total_users,1)*100)}% coverage`, c: "border-violet-500/30 bg-violet-500/10 text-violet-300"},
    { icon: "⚡", val: stats.claims_today.toString(),   label: "Claims Today",    sub: `${stats.claims_review} in review`, c: "border-amber-500/30 bg-amber-500/10 text-amber-300"},
    { icon: "💰", val: `₹${fmt(stats.total_payout_amount)}`, label: "Total Payouts", sub: `${stats.automation_rate}% automated`, c: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"},
  ];

  return (
    <div className="flex h-screen bg-[#030712] text-slate-100 overflow-hidden">

      {/* ─── SIDEBAR ─── */}
      <aside className={"fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/[0.06] bg-[#060d1a] transition-transform duration-300 lg:translate-x-0 " + (sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/30">G</span>
          <span className="text-sm font-black text-white">GigArmor</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">Navigation</p>
          {navItems.map(item => (
            <a key={item.href} href={item.href}
               className={"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " + (item.active ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
              {item.active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />}
            </a>
          ))}
        </nav>
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

      {/* ─── MAIN ─── */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-60">

        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#030712]/90 px-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="rounded-lg p-1.5 text-slate-500 hover:text-white lg:hidden">
              ☰
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">GigArmor</p>
              <h1 className="text-base font-black leading-tight text-white">Control Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </div>
            <a href="/" className="rounded-xl border border-white/[0.08] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:text-white">
              Back to Home
            </a>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {kpis.map(k => (
              <div key={k.label} className={"rounded-2xl border p-4 transition hover:-translate-y-0.5 " + k.c}>
                <div className="text-xl">{k.icon}</div>
                <div className="mt-2 text-2xl font-black text-white">
                  {k.val === "2.74L" ? <>&#8377;{k.val}</> : k.val}
                </div>
                <div className="text-xs font-semibold text-slate-200">{k.label}</div>
                <div className="mt-0.5 text-[11px] opacity-60">{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid gap-5 lg:grid-cols-3">

            {/* Area chart */}
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Claims This Week</h3>
                  <p className="text-xs text-slate-500">Daily claims processed + payout value</p>
                </div>
                <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 text-xs font-semibold text-cyan-300">+28% vs last week</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={claimsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="claimsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22d3ee" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, padding: "8px 12px" }}
                    labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                    itemStyle={{ color: "#22d3ee" }}
                  />
                  <Area type="monotone" dataKey="claims" stroke="#22d3ee" strokeWidth={2} fill="url(#claimsGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="mb-0.5 text-sm font-bold text-white">Policy Mix</h3>
              <p className="mb-3 text-xs text-slate-500">Active policies by type</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={policyMix} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                    {policyMix.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {policyMix.map(p => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-slate-400">{p.name}</span>
                    </div>
                    <span className="font-semibold text-slate-200">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid gap-5 lg:grid-cols-3">

            {/* Recent claims table */}
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent Claims</h3>
                <a href="/dashboard/claims" className="text-xs font-semibold text-cyan-400 transition hover:text-cyan-300">View all →</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-left">
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">ID</th>
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Worker</th>
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Type</th>
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaims.map(c => (
                      <tr key={c.id} className="border-b border-white/[0.03] transition hover:bg-white/[0.02]">
                        <td className="py-3 font-mono text-xs text-slate-500">{c.id}</td>
                        <td className="py-3 text-sm font-medium text-slate-200">{c.name}</td>
                        <td className="py-3 text-xs text-slate-400 hidden sm:table-cell">{c.type}</td>
                        <td className="py-3 text-sm font-bold text-white">&#8377;{c.amount}</td>
                        <td className="py-3">
                          <span className={"rounded-full border px-2 py-0.5 text-[10px] font-bold " + c.sc}>{c.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity feed */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <h3 className="mb-4 text-sm font-bold text-white">Live Activity</h3>
              <div>
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 border-b border-white/[0.04] py-3 last:border-0">
                    <span className={"mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full " + a.dot} />
                    <div>
                      <p className="text-xs leading-relaxed text-slate-300">{a.text}</p>
                      <p className="mt-0.5 text-[10px] text-slate-600">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  ["/dashboard/workers",  "Workers"],
                  ["/dashboard/claims",    "Claims"],
                  ["/dashboard/analytics", "Analytics"],
                ].map(([href, label]) => (
                  <a key={href} href={href}
                     className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-2 py-2 text-center text-[11px] font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white">
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
