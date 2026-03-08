"use client";

const navItems = [
  { icon: "📊", label: "Overview", href: "/dashboard" },
  { icon: "🗺️", label: "Risk Map", href: "/dashboard/risk-map" },
  { icon: "📋", label: "Claims", href: "/dashboard/claims" },
  { icon: "👥", label: "Workers", href: "/dashboard/workers" },
  { icon: "📈", label: "Analytics", href: "/dashboard/analytics", active: true },
];

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-6"><p className="text-2xl font-black">🛡️ GigShield</p><p className="text-sm text-slate-400">Control Center</p></div>
        <nav className="flex-1 space-y-2 px-2 py-4">{navItems.map((item) => <a key={item.label} href={item.href} className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 ${item.active ? "border-l-4 border-cyan-400 bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{item.icon}<span>{item.label}</span></a>)}</nav>
        <div className="space-y-4 border-t border-white/10 px-5 py-6"><p className="text-sm text-emerald-300"><span className="mr-2 inline-block animate-pulse">●</span>Live</p><a href="/" className="text-sm text-slate-400 hover:text-white">← Back to Home</a></div>
      </aside>

      <main className="ml-64 flex-1 px-8 py-8">
        <a href="/dashboard" className="text-slate-400 hover:text-white">← Dashboard</a>
        <h1 className="mt-2 text-4xl font-black text-white">Analytics & Insights</h1>
        <p className="mt-1 text-slate-400">Platform performance, risk distribution, and payout intelligence</p>

        <section className="mt-8 grid grid-cols-2 gap-5 xl:grid-cols-4">
          {[
            ["📊", "Total Policies Issued", "1,089", "+8.2% MoM"],
            ["💰", "Premium Collected", "₹51,200/week", "On track"],
            ["⚡", "Avg. Payout Speed", "58 seconds", "-3s from last week"],
            ["🛡️", "Fraud Prevented", "₹12,800", "14 claims blocked"],
          ].map(([icon, label, value, sub]) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-white/5 p-5"><p>{icon}</p><p className="mt-2 text-sm text-slate-400">{label}</p><p className="text-2xl font-black">{value}</p><p className="text-sm text-slate-300">{sub}</p></article>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold text-white">Weekly Automation Rate</h2>
          <p className="text-slate-400">Percentage of claims auto-approved without manual review</p>
          <div className="mt-5 space-y-4">
            {[
              ["Week 1 (Feb 9)", 97.2],
              ["Week 2 (Feb 16)", 98.5],
              ["Week 3 (Feb 23)", 99.1],
              ["Week 4 (Mar 2)", 99.8],
            ].map(([label, pct]) => (
              <div key={label as string}>
                <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span className="font-semibold">{pct}% {label === "Week 4 (Mar 2)" && <span className="ml-2 rounded-full bg-emerald-400/20 px-2 py-0.5 text-emerald-300">Best ↑</span>}</span></div>
                <div className="h-6 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${pct}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold text-white">Top Risk Zones</h3>
            <table className="mt-4 w-full text-left text-sm"><thead className="text-slate-400"><tr><th>Zone</th><th>City</th><th>Risk</th><th>Policies</th><th>Claims</th></tr></thead><tbody>{[["Andheri West", "Mumbai", "HIGH", "234", "18"], ["Bandra-Kurla", "Mumbai", "MEDIUM", "189", "7"], ["Pune Kothrud", "Pune", "HIGH", "156", "14"], ["Delhi NCR", "Delhi", "MEDIUM", "312", "9"], ["Koramangala", "Bengaluru", "LOW", "198", "2"]].map(([zone, city, risk, policies, claims]) => <tr key={zone} className="border-t border-white/10"><td className="py-2">{zone}</td><td>{city}</td><td>{risk === "HIGH" ? "🔴 HIGH" : risk === "MEDIUM" ? "🟡 MEDIUM" : "🟢 LOW"}</td><td>{policies}</td><td>{claims}</td></tr>)}</tbody></table>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold text-white">Premium Distribution by Type</h3>
            <div className="mt-4 space-y-4">{[["Food Delivery", "423 workers", 60, "₹21,150/week", "bg-cyan-400"], ["Ride Hailing", "287 workers", 40, "₹14,350/week", "bg-violet-400"], ["Grocery", "198 workers", 28, "₹9,900/week", "bg-emerald-400"], ["E-commerce", "181 workers", 25, "₹9,050/week", "bg-amber-400"]].map(([type, workers, width, premium, color]) => <div key={type as string}><div className="mb-1 flex justify-between text-sm"><span>{type} • {workers}</span><span>{premium}</span></div><div className="h-3 rounded-full bg-slate-800"><div className={`${color} h-3 rounded-full`} style={{ width: `${width}%` }} /></div></div>)}</div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 pb-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6"><h3 className="text-xl font-bold">Payout Health</h3><div className="mt-3 space-y-2 text-sm"><p className="flex justify-between"><span className="text-slate-400">Total Paid This Week:</span><span>₹18,400</span></p><p className="flex justify-between"><span className="text-slate-400">Avg. Claim Amount:</span><span>₹960</span></p><p className="flex justify-between"><span className="text-slate-400">Fastest Payout:</span><span>12 seconds</span></p><p className="flex justify-between"><span className="text-slate-400">Largest Single Payout:</span><span>₹6,400</span></p></div></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6"><h3 className="text-xl font-bold">Fraud Intelligence</h3><div className="mt-3 space-y-2 text-sm"><p className="flex justify-between"><span className="text-slate-400">Claims Blocked:</span><span>14</span></p><p className="flex justify-between"><span className="text-slate-400">Suspicious Patterns:</span><span>3 flagged</span></p><p className="flex justify-between"><span className="text-slate-400">False Positive Rate:</span><span>0.2%</span></p><p className="flex justify-between"><span className="text-slate-400">Savings:</span><span>₹12,800</span></p></div></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6"><h3 className="text-xl font-bold">Worker Engagement</h3><div className="mt-3 space-y-2 text-sm"><p className="flex justify-between"><span className="text-slate-400">WhatsApp Users:</span><span>87%</span></p><p className="flex justify-between"><span className="text-slate-400">Web Users:</span><span>13%</span></p><p className="flex justify-between"><span className="text-slate-400">Repeat Claims:</span><span>23%</span></p><p className="flex justify-between"><span className="text-slate-400">Avg. Policy Duration:</span><span>4.2 months</span></p></div></div>
        </section>
      </main>
    </div>
  );
}
