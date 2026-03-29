"use client";

import { useMemo, useState } from "react";

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
  { id: "CLM-001", worker: "Rahul Kumar",  zone: "Andheri West",  gpsJumpKm: 0.6, deviceReuseCount: 1, routeFeasible: true,  peerMatch: 9, riskScore: 0.12, decision: "AUTO_PAY" },
  { id: "CLM-002", worker: "Priya Sharma", zone: "Dadar",          gpsJumpKm: 52,  deviceReuseCount: 7, routeFeasible: false, peerMatch: 1, riskScore: 0.89, decision: "BLOCK" },
  { id: "CLM-003", worker: "Amit Singh",   zone: "Bandra-Kurla",   gpsJumpKm: 1.2, deviceReuseCount: 1, routeFeasible: true,  peerMatch: 7, riskScore: 0.21, decision: "AUTO_PAY" },
  { id: "CLM-004", worker: "Meera Joshi",  zone: "Andheri West",   gpsJumpKm: 31,  deviceReuseCount: 5, routeFeasible: false, peerMatch: 0, riskScore: 0.84, decision: "BLOCK" },
  { id: "CLM-005", worker: "Vikram Nair",  zone: "Delhi NCR",      gpsJumpKm: 3.1, deviceReuseCount: 2, routeFeasible: true,  peerMatch: 3, riskScore: 0.48, decision: "REVIEW" },
  { id: "CLM-006", worker: "Sunita Devi",  zone: "Koramangala",    gpsJumpKm: 0.5, deviceReuseCount: 1, routeFeasible: true,  peerMatch: 8, riskScore: 0.17, decision: "AUTO_PAY" },
];

const SCENARIOS = [
  {
    id: "gps-ring",
    label: "GPS Spoofing Ring Attack",
    tag: "Active · Phase 1",
    tagColor: "text-red-600 bg-red-50 border-red-200",
    description: "Detects coordinated GPS manipulation rings attempting to file fraudulent claims during real disruption windows.",
  },
  {
    id: "platform-abuse",
    label: "Platform Outage Abuse",
    tag: "Planned · Phase 2",
    tagColor: "text-amber-600 bg-amber-50 border-amber-200",
    description: "Flags mass claim floods during platform downtime where volume anomaly suggests coordinated fraud.",
  },
  {
    id: "weather-exploit",
    label: "Weather Event Exploit",
    tag: "Planned · Phase 2",
    tagColor: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Detects claims filed for rain or AQI events that do not match actual meteorological data for the claimed zone.",
  },
];

export default function AdversarialEventConsolePage() {
  const [activeScenario, setActiveScenario] = useState("gps-ring");
  const [strictMode, setStrictMode] = useState(true);
  const [ringThreshold, setRingThreshold] = useState(4);

  const scenario = SCENARIOS.find((s) => s.id === activeScenario)!;

  const claims = useMemo(() => {
    if (activeScenario !== "gps-ring") return [];
    return BASE_CLAIMS.map((c) => {
      const spoofSignals =
        (c.gpsJumpKm > 10 ? 1 : 0) +
        (c.deviceReuseCount >= ringThreshold ? 1 : 0) +
        (!c.routeFeasible ? 1 : 0) +
        (c.peerMatch <= 1 ? 1 : 0);
      const adjusted = strictMode
        ? Math.min(0.99, c.riskScore + spoofSignals * 0.06)
        : Math.max(0, c.riskScore - 0.1);
      let decision: Claim["decision"] = "AUTO_PAY";
      if (adjusted >= 0.75) decision = "BLOCK";
      else if (adjusted >= 0.40) decision = "REVIEW";
      return { ...c, riskScore: Number(adjusted.toFixed(2)), decision };
    });
  }, [activeScenario, strictMode, ringThreshold]);

  const stats = useMemo(() => {
    const total = claims.length;
    const blocked = claims.filter((c) => c.decision === "BLOCK").length;
    const review = claims.filter((c) => c.decision === "REVIEW").length;
    const auto = claims.filter((c) => c.decision === "AUTO_PAY").length;
    const fraudRate = Math.round((blocked / Math.max(total, 1)) * 100);
    return { total, blocked, review, auto, fraudRate };
  }, [claims]);

  return (
    <div className="max-w-[1400px]">
      {/* Page header */}
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Admin portal · AI fraud detection</p>
          <h1 className="text-slate-800 font-bold text-xl" style={{ letterSpacing: "-0.03em" }}>
            Adversarial Event Console
          </h1>
        </div>
        <span className="tag tag-warn">Live simulation</span>
      </div>

      {/* Scenario selector */}
      <div className="panel p-5 mb-6">
        <p className="lbl mb-3">Select disruption scenario</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className={`text-left rounded-xl border p-4 transition-all ${
                activeScenario === s.id
                  ? "border-[#0F2044] bg-[#0F2044]/5 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-sm font-bold text-slate-800">{s.label}</span>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.tagColor}`}>{s.tag}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* GPS Spoofing Ring — active scenario */}
      {activeScenario === "gps-ring" && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Claims Inflow",   value: stats.total,           color: "text-slate-800" },
              { label: "Auto Payout",     value: stats.auto,            color: "text-emerald-600" },
              { label: "Under Review",    value: stats.review,          color: "text-amber-600" },
              { label: "Blocked",         value: stats.blocked,         color: "text-red-600" },
              { label: "Fraud Ring Rate", value: `${stats.fraudRate}%`, color: "text-violet-600" },
            ].map((k) => (
              <div key={k.label} className="panel p-4">
                <div className={`text-2xl font-extrabold ${k.color}`} style={{ letterSpacing: "-0.04em" }}>{k.value}</div>
                <div className="lbl mt-1">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Control panel + decision matrix */}
          <div className="grid gap-6 lg:grid-cols-3 mb-6">
            <div className="panel p-5 lg:col-span-1">
              <p className="lbl mb-4">Control Panel</p>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Strict Anti-Spoof Mode</span>
                  <button
                    onClick={() => setStrictMode((v) => !v)}
                    className={`rounded-full px-3 py-1 text-xs font-bold border transition-all ${
                      strictMode
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {strictMode ? "ON" : "OFF"}
                  </button>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Device Ring Threshold</span>
                    <span className="font-bold text-slate-700">{ringThreshold} devices</span>
                  </div>
                  <input
                    type="range" min={2} max={8} value={ringThreshold}
                    onChange={(e) => setRingThreshold(Number(e.target.value))}
                    className="w-full accent-[#0F2044]"
                  />
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
                  <p>GPS jump &gt; 10 km → spoof signal</p>
                  <p>Device reuse ≥ threshold → ring flag</p>
                  <p>Low peer-event match → reduced trust</p>
                  <p>Infeasible route → sharp risk increase</p>
                </div>
              </div>
            </div>

            <div className="panel p-5 lg:col-span-2 overflow-x-auto">
              <p className="lbl mb-4">Claim Decision Matrix · Live simulation</p>
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    {["Claim ID", "Worker", "Zone", "GPS Jump", "Device Reuse", "Route", "Peer", "Risk", "Decision"].map((h) => (
                      <th key={h} className="px-2 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claims.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-2 py-3 font-mono text-xs text-[#0F2044]">{c.id}</td>
                      <td className="px-2 py-3 font-medium text-slate-800">{c.worker}</td>
                      <td className="px-2 py-3 text-slate-500">{c.zone}</td>
                      <td className={`px-2 py-3 font-semibold ${c.gpsJumpKm > 10 ? "text-red-600" : "text-slate-600"}`}>{c.gpsJumpKm} km</td>
                      <td className={`px-2 py-3 font-semibold ${c.deviceReuseCount >= ringThreshold ? "text-red-600" : "text-slate-600"}`}>{c.deviceReuseCount}</td>
                      <td className={`px-2 py-3 font-semibold ${c.routeFeasible ? "text-emerald-600" : "text-red-600"}`}>{c.routeFeasible ? "OK" : "Impossible"}</td>
                      <td className={`px-2 py-3 font-semibold ${c.peerMatch <= 1 ? "text-amber-600" : "text-slate-600"}`}>{c.peerMatch}</td>
                      <td className="px-2 py-3 font-bold text-slate-800">{Math.round(c.riskScore * 100)}%</td>
                      <td className="px-2 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          c.decision === "BLOCK"  ? "bg-red-50 text-red-600 border-red-200"         :
                          c.decision === "REVIEW" ? "bg-amber-50 text-amber-600 border-amber-200"   :
                                                    "bg-emerald-50 text-emerald-600 border-emerald-200"
                        }`}>{c.decision}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk tiers + ring indicators */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel p-5">
              <p className="lbl mb-3">Risk-Tier Routing</p>
              <div className="space-y-2 text-sm">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                  <span className="font-bold text-emerald-700">0–39% risk</span>
                  <span className="text-emerald-600"> — Instant auto payout for genuine workers</span>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5">
                  <span className="font-bold text-amber-700">40–74% risk</span>
                  <span className="text-amber-600"> — Soft-friction review with fast SLA</span>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
                  <span className="font-bold text-red-700">75–100% risk</span>
                  <span className="text-red-600"> — Blocked and sent to investigation queue</span>
                </div>
              </div>
            </div>

            <div className="panel p-5">
              <p className="lbl mb-3">Ring Attack Indicators</p>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {[
                  "Same device reused across multiple high-value claims",
                  "Synchronized timestamps from accounts with weak history",
                  "GPS movement impossible for expected route-time window",
                  "Claims filed outside real disruption signal windows",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-0.5 text-[#0F2044] font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Placeholder for future scenarios */}
      {activeScenario !== "gps-ring" && (
        <div className="panel p-12 text-center">
          <p className="text-xl font-bold text-slate-400 mb-2">{scenario.label}</p>
          <p className="text-slate-400 text-sm max-w-md mx-auto">{scenario.description}</p>
          <span className={`inline-block mt-5 text-xs font-bold px-3 py-1.5 rounded-full border ${scenario.tagColor}`}>{scenario.tag}</span>
        </div>
      )}
    </div>
  );
}
