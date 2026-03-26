"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Claim = {
  id: string;
  worker: string;
  zone: string;
  gpsJumpKm: number;
  deviceReuseCount: number;
  routeFeasible: boolean;
  peerMatch: number;
  riskScore: number;
  decision: "AUTO_PAY" | "REVIEW" | "BLOCK";
};

const BASE_CLAIMS: Claim[] = [
  { id: "CLM-MC-001", worker: "Rahul Kumar", zone: "Andheri West", gpsJumpKm: 0.6, deviceReuseCount: 1, routeFeasible: true, peerMatch: 9, riskScore: 0.12, decision: "AUTO_PAY" },
  { id: "CLM-MC-002", worker: "Priya Sharma", zone: "Dadar", gpsJumpKm: 52, deviceReuseCount: 7, routeFeasible: false, peerMatch: 1, riskScore: 0.89, decision: "BLOCK" },
  { id: "CLM-MC-003", worker: "Amit Singh", zone: "Bandra-Kurla", gpsJumpKm: 1.2, deviceReuseCount: 1, routeFeasible: true, peerMatch: 7, riskScore: 0.21, decision: "AUTO_PAY" },
  { id: "CLM-MC-004", worker: "Meera Joshi", zone: "Andheri West", gpsJumpKm: 31, deviceReuseCount: 5, routeFeasible: false, peerMatch: 0, riskScore: 0.84, decision: "BLOCK" },
  { id: "CLM-MC-005", worker: "Vikram Nair", zone: "Delhi NCR", gpsJumpKm: 3.1, deviceReuseCount: 2, routeFeasible: true, peerMatch: 3, riskScore: 0.48, decision: "REVIEW" },
  { id: "CLM-MC-006", worker: "Sunita Devi", zone: "Koramangala", gpsJumpKm: 0.5, deviceReuseCount: 1, routeFeasible: true, peerMatch: 8, riskScore: 0.17, decision: "AUTO_PAY" },
];

const navItems = [
  { href: "/dashboard",           icon: "▣",  label: "Overview" },
  { href: "/dashboard/control-tower", icon: "🛰️", label: "Control Tower" },
  { href: "/dashboard/workers",   icon: "👷", label: "Workers" },
  { href: "/dashboard/policies",  icon: "🛡️", label: "Policies" },
  { href: "/dashboard/claims",    icon: "≡",  label: "Claims" },
  { href: "/dashboard/analytics", icon: "↗",  label: "Analytics" },
  { href: "/dashboard/risk-map",  icon: "🗺️", label: "Risk Map" },
  { href: "/dashboard/market-crash", icon: "🚨", label: "Market Crash", active: true },
];

export default function MarketCrashPage() {
  const [strictMode, setStrictMode] = useState(true);
  const [ringThreshold, setRingThreshold] = useState(4);

  const claims = useMemo(() => {
    return BASE_CLAIMS.map((c) => {
      const spoofSignals = (c.gpsJumpKm > 10 ? 1 : 0) + (c.deviceReuseCount >= ringThreshold ? 1 : 0) + (!c.routeFeasible ? 1 : 0) + (c.peerMatch <= 1 ? 1 : 0);
      const adjusted = strictMode ? Math.min(0.99, c.riskScore + spoofSignals * 0.06) : Math.max(0, c.riskScore - 0.1);
      let decision: Claim["decision"] = "AUTO_PAY";
      if (adjusted >= 0.75) decision = "BLOCK";
      else if (adjusted >= 0.40) decision = "REVIEW";
      return { ...c, riskScore: Number(adjusted.toFixed(2)), decision };
    });
  }, [strictMode, ringThreshold]);

  const stats = useMemo(() => {
    const total = claims.length;
    const blocked = claims.filter((c) => c.decision === "BLOCK").length;
    const review = claims.filter((c) => c.decision === "REVIEW").length;
    const auto = claims.filter((c) => c.decision === "AUTO_PAY").length;
    const fraudRate = Math.round((blocked / Math.max(total, 1)) * 100);
    return { total, blocked, review, auto, fraudRate };
  }, [claims]);

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-white/[0.06] bg-[#060d1a]">
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white">G</span>
          <span className="text-sm font-black text-white">GigArmor</span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">Navigation</p>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${item.active ? "border border-red-500/30 bg-red-500/10 text-red-300" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-60 flex-1 p-8 space-y-6">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-red-300">Adversarial Event Mode</p>
          <h1 className="mt-1 text-3xl font-black">🚨 Market Crash Defense Console</h1>
          <p className="mt-2 text-sm text-slate-300">Simulates anti-spoofing response against GPS manipulation rings while preserving fast payout for genuine workers.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          {[
            ["Claims Inflow", stats.total, "📥", "border-cyan-500/30 bg-cyan-500/10"],
            ["Auto Payout", stats.auto, "✅", "border-emerald-500/30 bg-emerald-500/10"],
            ["Review Queue", stats.review, "🕵️", "border-amber-500/30 bg-amber-500/10"],
            ["Blocked", stats.blocked, "⛔", "border-red-500/30 bg-red-500/10"],
            ["Fraud Ring Rate", `${stats.fraudRate}%`, "🧠", "border-violet-500/30 bg-violet-500/10"],
          ].map(([label, value, icon, cls]) => (
            <div key={String(label)} className={`rounded-xl border p-4 ${cls}`}>
              <div className="flex items-center justify-between"><span className="text-xl">{icon}</span><span className="text-xl font-black">{value}</span></div>
              <p className="mt-1 text-xs text-slate-300">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 lg:col-span-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Control Panel</h2>
            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Strict Anti-Spoof Mode</span>
                <button onClick={() => setStrictMode((v) => !v)} className={`rounded-full px-3 py-1 text-xs font-bold ${strictMode ? "bg-red-500/20 text-red-300" : "bg-slate-700 text-slate-300"}`}>{strictMode ? "ON" : "OFF"}</button>
              </label>
              <div>
                <p className="mb-2 text-xs text-slate-500">Device Ring Threshold: {ringThreshold}</p>
                <input type="range" min={2} max={8} value={ringThreshold} onChange={(e) => setRingThreshold(Number(e.target.value))} className="w-full accent-cyan-400" />
              </div>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>• Teleport jumps {'>'} 10 km are treated as spoof signals</li>
                <li>• High device reuse indicates coordinated fraud rings</li>
                <li>• Low peer-event match reduces trust in claim authenticity</li>
                <li>• Route infeasibility increases risk score sharply</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 lg:col-span-2 overflow-x-auto">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Claim Decision Matrix (Live Simulation)</h2>
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-left text-[11px] uppercase tracking-wider text-slate-500">
                  {[
                    'Claim ID', 'Worker', 'Zone', 'GPS Jump', 'Device Reuse', 'Route', 'Peer Match', 'Risk', 'Decision'
                  ].map((h) => (
                    <th key={h} className="px-3 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-3 font-mono text-xs text-cyan-300">{c.id}</td>
                    <td className="px-3 py-3 text-sm text-white">{c.worker}</td>
                    <td className="px-3 py-3 text-sm text-slate-300">{c.zone}</td>
                    <td className={`px-3 py-3 text-sm ${c.gpsJumpKm > 10 ? 'text-red-300' : 'text-slate-300'}`}>{c.gpsJumpKm} km</td>
                    <td className={`px-3 py-3 text-sm ${c.deviceReuseCount >= ringThreshold ? 'text-red-300' : 'text-slate-300'}`}>{c.deviceReuseCount}</td>
                    <td className={`px-3 py-3 text-sm ${c.routeFeasible ? 'text-emerald-300' : 'text-red-300'}`}>{c.routeFeasible ? 'Feasible' : 'Impossible'}</td>
                    <td className={`px-3 py-3 text-sm ${c.peerMatch <= 1 ? 'text-amber-300' : 'text-slate-300'}`}>{c.peerMatch}</td>
                    <td className="px-3 py-3 text-sm font-semibold text-white">{Math.round(c.riskScore * 100)}%</td>
                    <td className="px-3 py-3 text-sm">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
                        c.decision === 'BLOCK' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                        c.decision === 'REVIEW' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {c.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Risk-Tier Routing (UX Balance)</h3>
            <div className="mt-3 space-y-2 text-sm">
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-300">Low Risk (0-39%): Instant auto payout for genuine workers</p>
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-300">Medium Risk (40-74%): Soft-friction review with quick SLA</p>
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-300">High Risk (75-100%): Block + investigation to prevent ring attack</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Ring Attack Indicators</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Same device/network reused across multiple high-value claims</li>
              <li>Synchronized claim timestamps from accounts with weak history</li>
              <li>Location movement impossible for expected route-time window</li>
              <li>Claims not matching real weather/disruption signal windows</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}