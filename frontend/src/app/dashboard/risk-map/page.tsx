"use client";

const navItems = [
  { icon: "📊", label: "Overview", href: "/dashboard" },
  { icon: "🗺️", label: "Risk Map", href: "/dashboard/risk-map", active: true },
  { icon: "📋", label: "Claims", href: "/dashboard/claims" },
  { icon: "👥", label: "Workers", href: "/dashboard/workers" },
  { icon: "📈", label: "Analytics", href: "/dashboard/analytics" },
];

export default function RiskMapPage() {
  const zones = [
    ["ZONE_MUM_01", "Andheri West", "HIGH", "82"],
    ["ZONE_MUM_02", "Bandra-Kurla", "MEDIUM", "64"],
    ["ZONE_PUN_01", "Pune Kothrud", "HIGH", "77"],
    ["ZONE_DEL_01", "Delhi NCR", "MEDIUM", "58"],
    ["ZONE_BLR_01", "Koramangala", "LOW", "31"],
    ["ZONE_MUM_03", "Mumbai Central", "LOW", "28"],
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-900">
        <div className="border-b border-white/10 px-5 py-6"><p className="text-2xl font-black">🛡️ GigShield</p><p className="text-sm text-slate-400">Control Center</p></div>
        <nav className="flex-1 space-y-2 px-2 py-4">{navItems.map((item) => <a key={item.label} href={item.href} className={`mx-2 flex items-center gap-3 rounded-xl px-4 py-3 ${item.active ? "border-l-4 border-cyan-400 bg-cyan-400/10 text-cyan-300" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>{item.icon}<span>{item.label}</span></a>)}</nav>
      </aside>
      <main className="ml-64 flex-1 px-8 py-8">
        <h1 className="text-4xl font-black text-white">Risk Map</h1>
        <p className="mt-2 text-slate-400">Hyperlocal 2km×2km zone monitoring for disruption readiness.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{zones.map(([id, zone, risk, score]) => <article key={id} className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm text-slate-400">{id}</p><h3 className="mt-1 text-xl font-bold">{zone}</h3><p className="mt-3 text-sm">Risk Level: {risk === "HIGH" ? <span className="text-red-300">🔴 HIGH</span> : risk === "MEDIUM" ? <span className="text-amber-300">🟡 MEDIUM</span> : <span className="text-emerald-300">🟢 LOW</span>}</p><p className="text-sm text-slate-300">Risk Score: {score}/100</p></article>)}</div>
      </main>
    </div>
  );
}
