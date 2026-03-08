"use client";

const navItems = [
  { icon: "📊", label: "Overview", href: "/dashboard", active: true },
  { icon: "🗺️", label: "Risk Map", href: "/dashboard/risk-map" },
  { icon: "📋", label: "Claims", href: "/dashboard/claims" },
  { icon: "👥", label: "Workers", href: "/dashboard/workers" },
  { icon: "📈", label: "Analytics", href: "/dashboard/analytics" },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-2xl font-black text-white">🛡️ GigShield</p>
          <p className="text-sm text-slate-400">Control Center</p>
        </div>
        <nav className="flex-1 space-y-2 px-2 py-4">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 ${
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
        <div className="space-y-4 border-t border-white/10 px-5 py-6">
          <p className="text-sm text-emerald-300"><span className="mr-2 inline-block animate-pulse">●</span>Live</p>
          <a href="/" className="text-sm text-slate-400 hover:text-white">← Back to Home</a>
        </div>
      </aside>

      <main className="ml-64 flex-1">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-8 py-4 backdrop-blur">
          <div>
            <p className="text-xl font-bold text-white">Good morning, Admin 👋</p>
            <p className="text-sm text-slate-400">March 8, 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300"><span className="mr-1 inline-block animate-pulse">●</span>Live</span>
            <button className="rounded-xl border border-white/20 px-6 py-3 text-white hover:bg-white/10">Refresh Data</button>
          </div>
        </div>

        <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-violet-950 px-8 py-10">
          <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Live platform overview</p>
            <h1 className="mt-2 text-3xl font-black text-white md:text-5xl">Real-time Worker Protection Dashboard</h1>
            <p className="mt-3 text-slate-300">Monitor active policies, track disruption events, process claims automatically.</p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-5 px-8 py-8 xl:grid-cols-4">
          {[
            ["👥", "Total Workers", "1,247", "+12% this week", "border-cyan-400"],
            ["📋", "Active Policies", "1,089", "87.3% coverage", "border-emerald-400"],
            ["⚡", "Claims Today", "23", "₹18,400 paid out", "border-amber-400"],
            ["🤖", "Auto-Approved", "99.8%", "0 manual reviews", "border-violet-400"],
          ].map(([icon, label, value, sub, border]) => (
            <article key={label} className={`rounded-2xl border border-white/10 border-l-4 ${border} bg-gradient-to-br from-white/10 to-white/5 p-5`}>
              <p className="text-2xl">{icon}</p><p className="mt-2 text-sm text-slate-400">{label}</p><p className="text-3xl font-black text-white">{value}</p><p className="text-sm text-slate-300">{sub}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 px-8 pb-8 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold text-white">Live Disruption Events</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-400"><tr><th className="py-2">Zone</th><th>Type</th><th>Severity</th><th>Workers</th><th>Status</th></tr></thead>
                <tbody>
                  {[
                    ["Andheri West", "Heavy Rain", "HIGH", "234", "Auto-paying"],
                    ["Bandra-Kurla", "Waterlogging", "MEDIUM", "89", "Monitoring"],
                    ["Pune Kothrud", "Storm", "HIGH", "156", "Auto-paying"],
                    ["Delhi NCR", "Dense Fog", "MEDIUM", "312", "Monitoring"],
                  ].map(([zone, type, severity, workers, status]) => (
                    <tr key={zone} className="border-t border-white/10 hover:bg-white/5">
                      <td className="py-3">{zone}</td><td>{type}</td>
                      <td>{severity === "HIGH" ? <span className="rounded-full border border-red-300/30 bg-red-400/20 px-3 py-1 text-xs font-bold text-red-300">HIGH</span> : <span className="rounded-full border border-amber-300/30 bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">MEDIUM</span>}</td>
                      <td>{workers}</td><td className={status === "Auto-paying" ? "text-emerald-300" : "text-slate-300"}>{status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Claim Pipeline</h2>
              <a href="/dashboard/claims" className="text-sm text-cyan-300 hover:text-cyan-200">View all →</a>
            </div>
            <div className="mt-4 space-y-1">
              {[
                ["RK", "Rajesh Kumar", "₹800", "PAID", "2 min ago"],
                ["SK", "Sunita Kumari", "₹1,600", "PAID", "5 min ago"],
                ["AP", "Ajay Patel", "₹800", "PROCESSING", "8 min ago"],
                ["MS", "Meera Sharma", "₹800", "REVIEW", "12 min ago"],
                ["DR", "Deepak Raut", "₹1,600", "PAID", "15 min ago"],
              ].map(([initials, name, amount, status, time]) => (
                <div key={name} className="flex items-center gap-3 border-b border-white/10 py-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{initials}</span>
                  <div className="flex-1"><p className="font-semibold text-white">{name}</p><p className="text-xs text-slate-400">{time}</p></div>
                  <span className="font-bold text-white">{amount}</span>
                  {status === "PAID" && <span className="rounded-full border border-emerald-300/30 bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">PAID</span>}
                  {status === "PROCESSING" && <span className="rounded-full border border-amber-300/30 bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">PROCESSING</span>}
                  {status === "REVIEW" && <span className="rounded-full border border-red-300/30 bg-red-400/20 px-3 py-1 text-xs font-bold text-red-300">REVIEW</span>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 px-8 pb-8 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold text-white">Automation Rate Trend</h3>
            <div className="mt-4 space-y-4">
              {[
                ["Week 1", 97.2],
                ["Week 2", 98.5],
                ["Week 3", 99.1],
                ["Week 4", 99.8],
              ].map(([label, pct]) => (
                <div key={label as string}>
                  <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{pct}%</span></div>
                  <div className="h-3 rounded-full bg-slate-800">
                    <div className={`${label === "Week 4" ? "bg-gradient-to-r from-cyan-400 to-emerald-400" : "bg-gradient-to-r from-cyan-400/60 to-cyan-400"} h-3 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {["🗺️ Risk Map", "📤 Export CSV", "➕ Add Worker", "🔧 Settings"].map((action) => (
                <button key={action} className="rounded-xl border border-white/20 px-4 py-5 text-sm text-white hover:bg-white/10">{action}</button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold text-white">Coverage Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Total Premium Collected:</span><span className="font-semibold">₹51,200/week</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Coverage Issued:</span><span className="font-semibold">₹8,71,200/week</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Avg. Payout per Claim:</span><span className="font-semibold">₹960</span></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
