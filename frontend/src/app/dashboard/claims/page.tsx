"use client";

import { useState } from "react";

const navItems = [
  { icon: "📊", label: "Overview", href: "/dashboard" },
  { icon: "🗺️", label: "Risk Map", href: "/dashboard/risk-map" },
  { icon: "📋", label: "Claims", href: "/dashboard/claims", active: true },
  { icon: "👥", label: "Workers", href: "/dashboard/workers" },
  { icon: "📈", label: "Analytics", href: "/dashboard/analytics" },
];

const allClaims = [
  { id: "C001", name: "Rajesh Kumar",   initials: "RK", zone: "Andheri West",    type: "Food",     amount: "₹800",   status: "PAID",       time: "2m ago" },
  { id: "C002", name: "Sunita Kumari",  initials: "SK", zone: "Bandra-Kurla",   type: "Grocery",  amount: "₹1,600", status: "PAID",       time: "5m ago" },
  { id: "C003", name: "Ajay Patel",     initials: "AP", zone: "Pune Central",   type: "Ride",     amount: "₹800",   status: "PROCESSING", time: "8m ago" },
  { id: "C004", name: "Meera Sharma",   initials: "MS", zone: "Delhi NCR",      type: "Food",     amount: "₹800",   status: "REVIEW",     time: "12m ago" },
  { id: "C005", name: "Deepak Raut",    initials: "DR", zone: "Koramangala",    type: "E-comm",   amount: "₹1,600", status: "PAID",       time: "15m ago" },
  { id: "C006", name: "Priya Singh",    initials: "PS", zone: "Andheri East",   type: "Food",     amount: "₹800",   status: "PAID",       time: "22m ago" },
  { id: "C007", name: "Kiran Naik",     initials: "KN", zone: "Thane West",     type: "Grocery",  amount: "₹1,600", status: "PROCESSING", time: "31m ago" },
  { id: "C008", name: "Rahul Desai",    initials: "RD", zone: "Bandra West",    type: "Ride",     amount: "₹800",   status: "REVIEW",     time: "45m ago" },
  { id: "C009", name: "Fatima Sheikh",  initials: "FS", zone: "Jogeshwari",     type: "Food",     amount: "₹800",   status: "PAID",       time: "1h ago" },
  { id: "C010", name: "Santosh Yadav",  initials: "SY", zone: "Powai",          type: "E-comm",   amount: "₹1,600", status: "PAID",       time: "1h ago" },
];

const avatarColors: Record<string, string> = {
  RK: "bg-cyan-400/20 text-cyan-300",
  SK: "bg-violet-400/20 text-violet-300",
  AP: "bg-emerald-400/20 text-emerald-300",
  MS: "bg-pink-400/20 text-pink-300",
  DR: "bg-amber-400/20 text-amber-300",
  PS: "bg-blue-400/20 text-blue-300",
  KN: "bg-teal-400/20 text-teal-300",
  RD: "bg-orange-400/20 text-orange-300",
  FS: "bg-rose-400/20 text-rose-300",
  SY: "bg-indigo-400/20 text-indigo-300",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID:       "bg-emerald-400/20 text-emerald-300 border border-emerald-300/30",
    PROCESSING: "bg-amber-400/20 text-amber-300 border border-amber-300/30",
    REVIEW:     "bg-red-400/20 text-red-300 border border-red-300/30",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

export default function ClaimsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = [
    { label: "All",        count: allClaims.length },
    { label: "PAID",       count: allClaims.filter(c => c.status === "PAID").length },
    { label: "PROCESSING", count: allClaims.filter(c => c.status === "PROCESSING").length },
    { label: "REVIEW",     count: allClaims.filter(c => c.status === "REVIEW").length },
  ];

  const filtered = activeFilter === "All" ? allClaims : allClaims.filter(c => c.status === activeFilter);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-2xl font-black">🛡️ GigShield</p>
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

      {/* Main Content */}
      <main className="ml-64 flex-1 px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
              ← Dashboard
            </a>
            <h1 className="text-4xl font-black text-white">Claims Management</h1>
            <p className="mt-1 text-slate-400">Review, approve, and track all worker claims in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Total Today: ₹18,400
            </div>
            <button className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Export CSV ↗
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                activeFilter === f.label
                  ? "border border-cyan-300/30 bg-cyan-400/20 text-cyan-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {f.label === "All" ? "All" : f.label.charAt(0) + f.label.slice(1).toLowerCase()}{" "}
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">{f.count}</span>
            </button>
          ))}
        </div>

        {/* Claims Table */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="font-bold text-white">
              {filtered.length} claim{filtered.length !== 1 ? "s" : ""} — {activeFilter === "All" ? "all statuses" : activeFilter.toLowerCase()}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["ID", "Worker", "Zone", "Type", "Amount", "Status", "Time", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((claim) => (
                  <tr key={claim.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 text-sm font-mono text-cyan-300">#{claim.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarColors[claim.initials]}`}>
                          {claim.initials}
                        </span>
                        <span className="text-sm font-semibold text-white">{claim.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">{claim.zone}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">{claim.type}</td>
                    <td className="px-4 py-4 text-sm font-bold text-white">{claim.amount}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">{claim.time}</td>
                    <td className="px-4 py-4">
                      {claim.status === "REVIEW" ? (
                        <div className="flex gap-2">
                          <button className="rounded-lg bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-300/30 hover:bg-emerald-400/30 transition-colors">
                            Approve
                          </button>
                          <button className="rounded-lg bg-red-400/20 px-3 py-1 text-xs font-bold text-red-300 border border-red-300/30 hover:bg-red-400/30 transition-colors">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total Claims", value: "23", color: "text-white" },
            { label: "Paid",         value: "18", color: "text-emerald-300" },
            { label: "Processing",   value: "3",  color: "text-amber-300" },
            { label: "Under Review", value: "2",  color: "text-red-300" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-lg shadow-black/20">
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="mt-1 text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
