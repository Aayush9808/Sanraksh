"use client";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const navItems = [
  { icon: "▣",  label: "Overview",  href: "/dashboard" },
  { icon: "👷", label: "Workers",   href: "/dashboard/workers" },
  { icon: "🛡️", label: "Policies",  href: "/dashboard/policies" },
  { icon: "≡",  label: "Claims",    href: "/dashboard/claims" },
  { icon: "↗",  label: "Analytics", href: "/dashboard/analytics", active: true },
  { icon: "🗺️", label: "Risk Map",  href: "/dashboard/risk-map" },
  { icon: "🚨", label: "Market Crash", href: "/dashboard/market-crash" },
];

const automationWeeks = [
  { label: "Week 1 (Feb 9)",  pct: 97.2, best: false },
  { label: "Week 2 (Feb 16)", pct: 98.5, best: false },
  { label: "Week 3 (Feb 23)", pct: 99.1, best: false },
  { label: "Week 4 (Mar 2)",  pct: 99.8, best: true },
];

const deliveryTypes = [
  { type: "Food Delivery", workers: 423, pct: 60, premium: "₹21,150/wk", color: "bg-cyan-400" },
  { type: "Ride Hailing",  workers: 287, pct: 40, premium: "₹14,350/wk", color: "bg-violet-400" },
  { type: "Grocery",       workers: 198, pct: 28, premium: "₹9,900/wk",  color: "bg-emerald-400" },
  { type: "E-commerce",    workers: 181, pct: 25, premium: "₹9,050/wk",  color: "bg-amber-400" },
];

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, string> = {
    HIGH:   "bg-red-400/20 text-red-300 border border-red-300/30",
    MEDIUM: "bg-amber-400/20 text-amber-300 border border-amber-300/30",
    LOW:    "bg-emerald-400/20 text-emerald-300 border border-emerald-300/30",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${map[risk]}`}>{risk}</span>;
}

export default function AnalyticsPage() {
  const [dashData, setDashData] = useState<Record<string, number> | null>(null);
  const [workerStats, setWorkerStats] = useState<Record<string, unknown> | null>(null);
  const [riskHeatmap, setRiskHeatmap] = useState<{zone: string; city: string; risk_score: number; risk_level: string}[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [d, w, h] = await Promise.all([
          fetch(`${API_BASE}/api/v1/analytics/dashboard`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/api/v1/analytics/workers-stats`).then(r => r.ok ? r.json() : null),
          fetch(`${API_BASE}/api/v1/analytics/risk-heatmap`).then(r => r.ok ? r.json() : null),
        ]);
        if (d) setDashData(d);
        if (w) setWorkerStats(w);
        if (h && h.length) setRiskHeatmap(h.slice(0, 5));
      } catch {}
    }
    load();
  }, []);

  const fmt = (n: number) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(1)}K` : String(n);

  const topMetrics = [
    { icon: "📊", label: "Total Policies Issued", value: dashData ? String(dashData.active_policies ?? "1,089") : "1,089", sub: "+8.2% MoM", color: "border-cyan-400/50 from-cyan-400/20 to-blue-400/10" },
    { icon: "💰", label: "Total Premium Collected", value: dashData ? fmt(Number(dashData.total_payout ?? 51200)) : "₹51.2K", sub: "Cumulative", color: "border-emerald-400/50 from-emerald-400/20 to-green-400/10" },
    { icon: "⚡", label: "Automation Rate", value: dashData ? `${Number(dashData.automation_rate ?? 58).toFixed(1)}%` : "58.1%", sub: "Claims auto-approved", color: "border-amber-400/50 from-amber-400/20 to-orange-400/10" },
    { icon: "👷", label: "Active Workers", value: dashData ? String(dashData.total_users ?? "502") : "502", sub: "Across 6 cities", color: "border-violet-400/50 from-violet-400/20 to-purple-400/10" },
  ];

  const displayZones = riskHeatmap.length > 0 ? riskHeatmap.map(z => ({
    zone: z.zone, city: z.city,
    risk: z.risk_level?.toUpperCase() ?? "MEDIUM",
    policies: Math.round(z.risk_score * 300),
    claims: Math.round(z.risk_score * 20),
  })) : [
    { zone: "Andheri West", city: "Mumbai",    risk: "HIGH",   policies: 234, claims: 18 },
    { zone: "Bandra-Kurla", city: "Mumbai",    risk: "MEDIUM", policies: 189, claims: 7 },
    { zone: "Pune Kothrud", city: "Pune",      risk: "HIGH",   policies: 156, claims: 14 },
    { zone: "Delhi NCR",    city: "Delhi",     risk: "MEDIUM", policies: 312, claims: 9 },
    { zone: "Koramangala",  city: "Bengaluru", risk: "LOW",    policies: 198, claims: 2 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-2xl font-black">🛡️ GigArmor</p>
          <p className="mt-1 text-xs text-slate-400">Control Center</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                item.active
                  ? "border-l-4 border-cyan-400 bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
            <span className="text-emerald-300 font-semibold">Live</span>
          </div>
          <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Back to Home
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
            ← Dashboard
          </a>
          <h1 className="text-4xl font-black text-white">Analytics & Insights</h1>
          <p className="mt-1 text-slate-400">Platform performance, risk distribution, and payout intelligence</p>
        </div>

        {/* Top Metrics */}
        <div className="mb-8 grid grid-cols-2 gap-5 xl:grid-cols-4">
          {topMetrics.map((m) => (
            <div key={m.label} className={`rounded-2xl border-l-4 bg-gradient-to-br p-5 shadow-lg shadow-black/20 ${m.color}`}>
              <div className="mb-2 text-2xl">{m.icon}</div>
              <div className="text-2xl font-black text-white">{m.value}</div>
              <div className="mt-1 text-sm font-semibold text-slate-200">{m.label}</div>
              <div className="mt-1 text-xs text-slate-400">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Automation Rate Trend */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
          <h2 className="text-xl font-bold text-white">Weekly Automation Rate</h2>
          <p className="mt-1 text-sm text-slate-400">Percentage of claims auto-approved without manual review</p>
          <div className="mt-6 space-y-4">
            {automationWeeks.map((w) => (
              <div key={w.label} className="flex items-center gap-4">
                <div className="w-36 shrink-0 text-sm text-slate-400">{w.label}</div>
                <div className="flex-1 h-6 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
                    style={{ width: `${w.pct}%` }}
                  />
                </div>
                <div className="flex w-20 items-center gap-2 justify-end">
                  <span className="text-sm font-bold text-white">{w.pct}%</span>
                  {w.best && (
                    <span className="rounded-full bg-emerald-400/20 border border-emerald-300/30 px-2 py-0.5 text-xs font-bold text-emerald-300">Best ↑</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Risk Zones + Premium Distribution */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Risk Zones */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <h2 className="mb-4 text-xl font-bold text-white">Top Risk Zones</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["Zone", "City", "Risk", "Policies", "Claims"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayZones.map((z) => (
                  <tr key={z.zone} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 text-sm font-semibold text-white">{z.zone}</td>
                    <td className="py-3 text-sm text-slate-400">{z.city}</td>
                    <td className="py-3"><RiskBadge risk={z.risk} /></td>
                    <td className="py-3 text-sm text-slate-300">{z.policies}</td>
                    <td className="py-3 text-sm font-bold text-amber-300">{z.claims}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Premium Distribution */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <h2 className="mb-4 text-xl font-bold text-white">Premium by Delivery Type</h2>
            <div className="space-y-5">
              {deliveryTypes.map((d) => (
                <div key={d.type}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-white">{d.type}</span>
                    <span className="text-slate-400">{d.workers} workers · {d.premium}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full rounded-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: 3 summary cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Payout Reliability */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <h3 className="mb-4 font-bold text-white">💸 Payout Reliability</h3>
            {[
              ["Total Paid This Week", "₹18,400"],
              ["Avg. Claim Amount",    "₹960"],
              ["Fastest Payout",       "12 seconds"],
              ["Largest Payout",       "₹6,400"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-white/10 py-2 text-sm last:border-0">
                <span className="text-slate-400">{label}</span>
                <span className="font-bold text-white">{val}</span>
              </div>
            ))}
          </div>

          {/* Fraud Intelligence */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <h3 className="mb-4 font-bold text-white">🛡️ Fraud Intelligence</h3>
            {[
              ["Claims Blocked",      "14"],
              ["Suspicious Patterns", "3 flagged"],
              ["False Positive Rate", "0.2%"],
              ["Savings Protected",   "₹12,800"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-white/10 py-2 text-sm last:border-0">
                <span className="text-slate-400">{label}</span>
                <span className="font-bold text-white">{val}</span>
              </div>
            ))}
          </div>

          {/* Worker Engagement */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20">
            <h3 className="mb-4 font-bold text-white">👥 Worker Engagement</h3>
            {[
              ["WhatsApp Users",        "87%"],
              ["Web Portal Users",      "13%"],
              ["Repeat Claim Rate",     "23%"],
              ["Avg. Policy Duration",  "4.2 months"],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-white/10 py-2 text-sm last:border-0">
                <span className="text-slate-400">{label}</span>
                <span className="font-bold text-white">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
