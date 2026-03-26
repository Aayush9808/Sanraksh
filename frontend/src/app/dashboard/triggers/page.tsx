"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WorkerSidebar from "../../../components/WorkerSidebar";
import { API_BASE } from "../../../lib/config";

const DISRUPTIONS = [
  {
    id: "heavy_rain", icon: "🌧️", label: "Heavy Rainfall", severity: "HIGH",
    city: "Mumbai",
    desc: "Rainfall > 60mm/hr detected via IMD API. Delivery halted across zone.",
    affected: 142, zones: ["Andheri West", "Bandra-Kurla", "Jogeshwari"],
    trigger: "Rain > 50mm/hr for 2 consecutive hours", payout: 800,
    autoFire: true, color: "border-blue-500/40 bg-blue-500/10", badge: "bg-blue-500/20 text-blue-300",
  },
  {
    id: "flood", icon: "🌊", label: "Zone Flooding", severity: "CRITICAL",
    city: "Mumbai",
    desc: "IMD Flood alert for low-lying delivery zones. Roads impassable.",
    affected: 89, zones: ["Powai", "Thane West", "Kurla"],
    trigger: "Flood warning issued by municipal corp", payout: 1200,
    autoFire: true, color: "border-cyan-500/40 bg-cyan-500/10", badge: "bg-cyan-500/20 text-cyan-300",
  },
  {
    id: "pollution", icon: "😷", label: "AQI Shutdown (GRAP-4)", severity: "HIGH",
    city: "Delhi",
    desc: "AQI > 400 in Delhi NCR. GRAP-4 restrictions halting outdoor delivery.",
    affected: 203, zones: ["Delhi NCR", "Noida", "Gurugram"],
    trigger: "AQI > 400 sustained for 4 hours", payout: 600,
    autoFire: true, color: "border-amber-500/40 bg-amber-500/10", badge: "bg-amber-500/20 text-amber-300",
  },
  {
    id: "curfew", icon: "🚫", label: "Curfew / Strike", severity: "MEDIUM",
    city: "Pune",
    desc: "Section 144 imposed in zone. Delivery activity suspended.",
    affected: 67, zones: ["Pune Central", "Shivaji Nagar"],
    trigger: "Govt curfew order issued (API + news NLP)", payout: 900,
    autoFire: false, color: "border-red-500/40 bg-red-500/10", badge: "bg-red-500/20 text-red-300",
  },
  {
    id: "app_outage", icon: "⚡", label: "Platform App Outage", severity: "MEDIUM",
    city: "Mumbai",
    desc: "Swiggy platform down > 3 hours. Workers unable to receive orders.",
    affected: 311, zones: ["All Zones"],
    trigger: "Platform API returns 503 for > 3 hours", payout: 500,
    autoFire: true, color: "border-violet-500/40 bg-violet-500/10", badge: "bg-violet-500/20 text-violet-300",
  },
];

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "bg-red-500/20 text-red-300 border-red-500/30",
  HIGH:     "bg-amber-500/20 text-amber-300 border-amber-500/30",
  MEDIUM:   "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

type TriggerState = "idle" | "scanning" | "triggered" | "processing" | "paid";
type EngineSource = "backend" | "simulation";

type BackendRunSummary = {
  disruption_id: string;
  created_claims: number;
  auto_paid_count: number;
  review_count: number;
  rejected_count: number;
  total_payout: number;
};

export default function TriggersPage() {
  const [activeDisruption, setActiveDisruption] = useState(DISRUPTIONS[0]);
  const [triggerState, setTriggerState] = useState<TriggerState>("idle");
  const [countdown, setCountdown] = useState(60);
  const [claimsProcessed, setClaimsProcessed] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  const [targetClaims, setTargetClaims] = useState(DISRUPTIONS[0].affected);
  const [expectedPayout, setExpectedPayout] = useState(DISRUPTIONS[0].affected * DISRUPTIONS[0].payout);
  const [engineSource, setEngineSource] = useState<EngineSource>("simulation");
  const [backendSummary, setBackendSummary] = useState<BackendRunSummary | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  function addLog(msg: string) {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);
  }

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  async function runSimulation() {
    setLog([]);
    setClaimsProcessed(0);
    setTotalPayout(0);
    setCountdown(60);
    setBackendSummary(null);
    if (timerRef.current) clearInterval(timerRef.current);

    setTriggerState("scanning");
    setEngineSource("backend");
    addLog("Connecting to Phase 2 automation engine...");

    try {
      const payload = {
        city: activeDisruption.city,
        zone: activeDisruption.zones[0],
        event_type:
          activeDisruption.id === "pollution"
            ? "severe_pollution"
            : activeDisruption.id === "app_outage"
              ? "market_closure"
              : activeDisruption.id,
        severity: activeDisruption.severity === "CRITICAL" ? "extreme" : activeDisruption.severity.toLowerCase(),
        strict_mode: true,
        affected_radius_km: 2,
        limit_workers: 400,
      };

      const res = await fetch(`${API_BASE}/api/v1/phase2/simulate-disruption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(7000),
      });
      if (!res.ok) throw new Error("phase2-api-unavailable");

      const data = await res.json();
      const claimsCount = Number(data.created_claims ?? 0);
      const payout = Number(data.total_payout ?? 0);

      setBackendSummary({
        disruption_id: String(data.disruption_id ?? ""),
        created_claims: claimsCount,
        auto_paid_count: Number(data.auto_paid_count ?? 0),
        review_count: Number(data.review_count ?? 0),
        rejected_count: Number(data.rejected_count ?? 0),
        total_payout: payout,
      });

      setTargetClaims(Math.max(claimsCount, 1));
      setExpectedPayout(Math.max(payout, 1));

      addLog(`Disruption created: ${String(data.disruption_id).slice(0, 8)}...`);
      addLog(`Claims created: ${claimsCount}`);
      addLog(`Auto paid: ${data.auto_paid_count} | Review: ${data.review_count} | Rejected: ${data.rejected_count}`);
      addLog(`Total payout committed: ₹${payout.toLocaleString()}`);

      setTriggerState("processing");
      setClaimsProcessed(claimsCount);
      setTotalPayout(payout);
      setCountdown(Number(data.estimated_settlement_seconds ?? 45));

      setTimeout(() => {
        setTriggerState("paid");
        addLog("✅ Phase 2 automation run completed");
      }, 1200);
      return;
    } catch {
      addLog("Backend unavailable. Switching to local simulation fallback.");
      runLocalSimulation();
    }
  }

  function runLocalSimulation() {
    setTriggerState("scanning");
    setEngineSource("simulation");
    setBackendSummary(null);
    setLog([]);
    setClaimsProcessed(0);
    setTotalPayout(0);
    setCountdown(60);
    setTargetClaims(activeDisruption.affected);
    setExpectedPayout(activeDisruption.affected * activeDisruption.payout);

    addLog(`Scanning zone: ${activeDisruption.zones[0]}`);

    setTimeout(() => addLog(`${activeDisruption.icon} ${activeDisruption.label} confirmed — severity: ${activeDisruption.severity}`), 800);
    setTimeout(() => addLog(`Trigger condition met: ${activeDisruption.trigger}`), 1600);
    setTimeout(() => addLog(`${activeDisruption.affected} affected workers identified`), 2400);
    setTimeout(() => {
      setTriggerState("triggered");
      addLog("✅ Parametric trigger FIRED — auto-generating claims");
    }, 3200);
    setTimeout(() => addLog("🤖 AI fraud check: 0 anomalies detected"), 4000);
    setTimeout(() => addLog("🤖 GPS validation: all workers in affected zone"), 4800);
    setTimeout(() => addLog("🤖 Duplicate check: passed"), 5600);
    setTimeout(() => {
      setTriggerState("processing");
      addLog("💸 Initiating mass UPI payout…");
    }, 6400);

    // Simulate claims being approved one by one
    let processed = 0;
    const batchInterval = setInterval(() => {
      const batch = Math.min(Math.floor(Math.random() * 20) + 5, activeDisruption.affected - processed);
      processed += batch;
      const payout = processed * activeDisruption.payout;
      setClaimsProcessed(processed);
      setTotalPayout(payout);
      addLog(`💰 ₹${(batch * activeDisruption.payout).toLocaleString()} disbursed to ${batch} workers`);
      if (processed >= activeDisruption.affected) {
        clearInterval(batchInterval);
        setTriggerState("paid");
        addLog(`✅ COMPLETE — ₹${(activeDisruption.affected * activeDisruption.payout).toLocaleString()} paid to ${activeDisruption.affected} workers`);
      }
    }, 1200);

    setTimeout(() => {
      let c = 60;
      timerRef.current = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0 && timerRef.current) clearInterval(timerRef.current);
      }, 1000);
    }, 6400);
  }

  function reset() {
    setTriggerState("idle");
    setLog([]);
    setClaimsProcessed(0);
    setTotalPayout(0);
    setCountdown(60);
    setTargetClaims(activeDisruption.affected);
    setExpectedPayout(activeDisruption.affected * activeDisruption.payout);
    setEngineSource("simulation");
    setBackendSummary(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const totalExpected = expectedPayout;
  const progressPct = totalExpected > 0 ? Math.min((totalPayout / totalExpected) * 100, 100) : 0;

  return (
    <div className="flex min-h-screen bg-[#060d1a] text-slate-100">
      <WorkerSidebar />

      <main className="ml-60 flex-1 px-8 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="mb-1 text-xs text-slate-500 uppercase tracking-widest">GigArmor / Parametric Engine</p>
          <h1 className="text-3xl font-black text-white">⚡ Live Disruption Triggers</h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            Engine source: {engineSource === "backend" ? "Phase 2 API" : "Local fallback"}
          </div>
          <p className="mt-1 text-sm text-slate-400">Real-time parametric insurance engine. Disruption detected → claims auto-fired → instant payout.</p>
        </motion.div>

        {/* Live status bar */}
        <motion.div className="flex gap-3 flex-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {DISRUPTIONS.filter(d => d.autoFire).map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
              className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold ${d.badge}`}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              {d.icon} {d.label} — {d.affected} workers
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Disruption selector */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Select Disruption to Simulate</h2>
            {DISRUPTIONS.map((d, i) => (
              <motion.button key={d.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.06 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => {
                setActiveDisruption(d);
                setTriggerState("idle");
                setLog([]);
                setClaimsProcessed(0);
                setTotalPayout(0);
                setCountdown(60);
                setTargetClaims(d.affected);
                setExpectedPayout(d.affected * d.payout);
                setEngineSource("simulation");
                setBackendSummary(null);
                if (timerRef.current) clearInterval(timerRef.current);
              }}
                className={`w-full rounded-2xl border p-4 text-left transition-all
                  ${activeDisruption.id === d.id ? d.color + " ring-1 ring-white/20" : "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.04]"}`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{d.icon}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${SEVERITY_COLOR[d.severity]}`}>{d.severity}</span>
                </div>
                <p className="font-semibold text-white text-sm">{d.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{d.affected} workers · ₹{d.payout} payout</p>
                {d.autoFire && (
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400">
                    <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /> Auto-trigger
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {/* Simulation panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Disruption details */}
            <div className={`rounded-2xl border p-6 ${activeDisruption.color}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{activeDisruption.icon}</span>
                  <div>
                    <h2 className="text-xl font-black text-white">{activeDisruption.label}</h2>
                    <p className="text-sm text-slate-400">{activeDisruption.desc}</p>
                  </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${SEVERITY_COLOR[activeDisruption.severity]}`}>
                  {activeDisruption.severity}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-black/20 p-3 text-center">
                  <p className="text-2xl font-black text-white">{activeDisruption.affected}</p>
                  <p className="text-xs text-slate-500">Workers Affected</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3 text-center">
                  <p className="text-2xl font-black text-cyan-300">₹{activeDisruption.payout}</p>
                  <p className="text-xs text-slate-500">Per Worker Payout</p>
                </div>
                <div className="rounded-xl bg-black/20 p-3 text-center">
                  <p className="text-2xl font-black text-emerald-300">₹{(activeDisruption.affected * activeDisruption.payout / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-slate-500">Total Disbursed</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-black/20 px-4 py-3">
                <p className="text-xs text-slate-500 mb-1">Parametric Trigger Condition</p>
                <p className="text-sm font-mono text-amber-300">{activeDisruption.trigger}</p>
              </div>
            </div>

            {/* Run simulation */}
            <AnimatePresence mode="wait">
            {triggerState === "idle" && (
              <motion.button key="run-btn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={runSimulation}
                className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-base font-bold text-white shadow-xl shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all">
                🚀 Simulate Disruption + Auto-Trigger Claims
              </motion.button>
            )}

            {/* Progress */}
            {triggerState !== "idle" && (
              <motion.div key="progress" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">
                    {triggerState === "scanning"    && "🛰️ Scanning Zone…"}
                    {triggerState === "triggered"   && "⚡ Trigger Fired!"}
                    {triggerState === "processing"  && "💸 Processing Payouts…"}
                    {triggerState === "paid"        && "✅ All Claims Paid!"}
                  </h3>
                  {triggerState === "paid" && (
                    <button onClick={reset} className="text-xs text-slate-500 hover:text-white transition-colors">Reset</button>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>{claimsProcessed} / {targetClaims} claims processed</span>
                    <span>{progressPct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06]">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${progressPct}%` }} />
                  </div>
                </div>

                {/* Live payout */}
                {(triggerState === "processing" || triggerState === "paid") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
                      <p className="text-3xl font-black text-emerald-300">₹{totalPayout.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Total Disbursed</p>
                    </div>
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
                      <p className="text-3xl font-black text-cyan-300">{triggerState === "paid" ? "✓" : countdown + "s"}</p>
                      <p className="text-xs text-slate-500">{triggerState === "paid" ? "Completed" : "Avg payout time"}</p>
                    </div>
                  </div>
                )}

                {backendSummary && (
                  <div className="grid grid-cols-3 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs">
                    <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-emerald-300">Auto Paid: {backendSummary.auto_paid_count}</div>
                    <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-300">Review: {backendSummary.review_count}</div>
                    <div className="rounded-lg bg-red-500/10 px-3 py-2 text-red-300">Rejected: {backendSummary.rejected_count}</div>
                  </div>
                )}

                {/* Live log */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">System Log</p>
                  <div ref={logRef} className="h-40 overflow-y-auto rounded-xl bg-black/40 border border-white/[0.04] p-3 space-y-1 font-mono">
                    {log.map((l, i) => (
                      <p key={i} className="text-[11px] text-emerald-400">{l}</p>
                    ))}
                    {(triggerState === "scanning" || triggerState === "processing") && (
                      <p className="text-[11px] text-slate-500 animate-pulse">▋</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* How it works */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">How Parametric Triggers Work</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { icon: "🛰️", label: "Weather/AQI API" },
                  { icon: "→", label: "" },
                  { icon: "📐", label: "Threshold Check" },
                  { icon: "→", label: "" },
                  { icon: "🤖", label: "AI Fraud Scan" },
                  { icon: "→", label: "" },
                  { icon: "✅", label: "Auto-Approve" },
                  { icon: "→", label: "" },
                  { icon: "💸", label: "UPI Payout" },
                ].map((s, i) => (
                  s.label ? (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.06 }} className="flex flex-col items-center gap-1">
                      <span className="text-xl">{s.icon}</span>
                      <span className="text-[10px] text-slate-500 text-center">{s.label}</span>
                    </motion.div>
                  ) : (
                    <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.06 }} className="text-slate-600 text-lg">→</motion.span>
                  )
                ))}
              </div>
              <p className="mt-4 text-xs text-slate-600">Zero manual intervention. Workers don&apos;t need to file — claims trigger and pay automatically when parametric conditions are met.</p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
