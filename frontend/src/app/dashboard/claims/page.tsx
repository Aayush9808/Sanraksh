"use client";

import { useMemo, useState } from "react";

type ClaimStatus = "PAID" | "PROCESSING" | "REVIEW";

const claims = [
  ["#C001", "Rajesh Kumar", "Andheri W", "Food", "₹800", "PAID", "2m ago"],
  ["#C002", "Sunita Kumari", "Bandra-Kurla", "Grocery", "₹1,600", "PAID", "5m ago"],
  ["#C003", "Ajay Patel", "Pune Central", "Ride", "₹800", "PROCESSING", "8m ago"],
  ["#C004", "Meera Sharma", "Delhi NCR", "Food", "₹800", "REVIEW", "12m ago"],
  ["#C005", "Deepak Raut", "Koramangala", "E-comm", "₹1,600", "PAID", "15m ago"],
  ["#C006", "Priya Singh", "Andheri E", "Food", "₹800", "PAID", "22m ago"],
  ["#C007", "Kiran Naik", "Thane W", "Grocery", "₹1,600", "PROCESSING", "31m ago"],
  ["#C008", "Rahul Desai", "Bandra W", "Ride", "₹800", "REVIEW", "45m ago"],
  ["#C009", "Fatima Sheikh", "Jogeshwari", "Food", "₹800", "PAID", "1h ago"],
  ["#C010", "Santosh Yadav", "Powai", "E-comm", "₹1,600", "PAID", "1h ago"],
] as const;

const navItems = [
  { icon: "📊", label: "Overview", href: "/dashboard" },
  { icon: "🗺️", label: "Risk Map", href: "/dashboard/risk-map" },
  { icon: "📋", label: "Claims", href: "/dashboard/claims", active: true },
  { icon: "👥", label: "Workers", href: "/dashboard/workers" },
  { icon: "📈", label: "Analytics", href: "/dashboard/analytics" },
];

export default function ClaimsPage() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | ClaimStatus>("ALL");

  const filteredClaims = useMemo(
    () => claims.filter((claim) => activeFilter === "ALL" || claim[5] === activeFilter),
    [activeFilter]
  );

  const filters = [
    { label: "All (23)", value: "ALL" as const },
    { label: "Paid (18)", value: "PAID" as const },
    { label: "Processing (3)", value: "PROCESSING" as const },
    { label: "Review (2)", value: "REVIEW" as const },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-6"><p className="text-2xl font-black">🛡️ GigShield</p><p className="text-sm text-slate-400">Control Center</p></div>
        <nav className="flex-1 space-y-2 px-2 py-4">{navItems.map((item) => <a key={item.label} href={item.href} className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 ${item.active ? "border-l-4 border-cyan-400 bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{item.icon}<span>{item.label}</span></a>)}</nav>
        <div className="space-y-4 border-t border-white/10 px-5 py-6"><p className="text-sm text-emerald-300"><span className="mr-2 inline-block animate-pulse">●</span>Live</p><a href="/" className="text-sm text-slate-400 hover:text-white">← Back to Home</a></div>
      </aside>

      <main className="ml-64 flex-1 px-8 py-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <a href="/dashboard" className="text-slate-400 hover:text-white">← Dashboard</a>
            <h1 className="mt-2 text-4xl font-black text-white">Claims Management</h1>
            <p className="mt-1 text-slate-400">Review, approve, and track all worker claims in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-white/20 px-6 py-3 text-white hover:bg-white/10">Export CSV</button>
            <span className="rounded-xl border border-cyan-300/30 bg-cyan-400/20 px-4 py-2 font-bold text-cyan-300">Total Today: ₹18,400</span>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">{filters.map((filter) => <button key={filter.value} onClick={() => setActiveFilter(filter.value)} className={activeFilter === filter.value ? "rounded-xl border border-cyan-300/30 bg-cyan-400/20 px-4 py-2 text-cyan-300" : "rounded-xl px-4 py-2 text-slate-400 hover:bg-white/5 hover:text-white"}>{filter.label}</button>)}</div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-xs uppercase tracking-wider text-slate-400"><th className="px-3 py-3">ID</th><th>Worker</th><th>Zone</th><th>Type</th><th>Amount</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
              <tbody>
                {filteredClaims.map((claim) => {
                  const isReview = claim[5] === "REVIEW";
                  return (
                    <tr key={claim[0]} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-3 py-3">{claim[0]}</td><td>{claim[1]}</td><td>{claim[2]}</td><td>{claim[3]}</td><td className="font-bold">{claim[4]}</td>
                      <td>
                        {claim[5] === "PAID" && <span className="rounded-full border border-emerald-300/30 bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">PAID</span>}
                        {claim[5] === "PROCESSING" && <span className="rounded-full border border-amber-300/30 bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">PROCESSING</span>}
                        {claim[5] === "REVIEW" && <span className="rounded-full border border-red-300/30 bg-red-400/20 px-3 py-1 text-xs font-bold text-red-300">REVIEW</span>}
                      </td>
                      <td>{claim[6]}</td>
                      <td>{isReview ? <div className="flex gap-2"><button className="rounded-lg bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">Approve</button><button className="rounded-lg bg-red-400/20 px-3 py-1 text-xs font-bold text-red-300">Reject</button></div> : <button className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white hover:bg-white/10">View</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-slate-400">Total Claims Today</p><p className="text-3xl font-black">23</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-slate-400">Paid</p><p className="text-3xl font-black text-emerald-300">18</p><p className="text-slate-400">Processing: 3</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-slate-400">Under Review</p><p className="text-3xl font-black text-red-300">2</p></div>
        </section>
      </main>
    </div>
  );
}
