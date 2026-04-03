"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gigWorkers, getRandomWorker } from "@/lib/workerData";
import type { GigWorker } from "@/lib/workerData";
import {
  runInsuranceSimulation,
  runSimulationWithForcedTrigger,
  resetAndRun,
} from "@/lib/insuranceSimulation";
import type { SimulationResult } from "@/lib/insuranceSimulation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RiskBadge({ tier }: { tier: "low" | "medium" | "high" | undefined }) {
  if (!tier) return null;
  const styles = {
    low:    "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high:   "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${styles[tier]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {tier} risk
    </span>
  );
}

function StatusPill({ ok, trueLabel, falseLabel }: { ok: boolean; trueLabel: string; falseLabel: string }) {
  return ok ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      {trueLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      {falseLabel}
    </span>
  );
}

function Card({ title, label, children }: { title: string; label?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900">{title}</h3>
        {label}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function AutoInterval({ running, onTick }: { running: boolean; onTick: () => void }) {
  useEffect(() => {
    if (!running) return;
    const id = setInterval(onTick, 5000);
    return () => clearInterval(id);
  }, [running, onTick]);
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SimulationPage() {
  const [worker, setWorker] = useState<GigWorker | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [autoRun, setAutoRun] = useState(false);
  const [lastTick, setLastTick] = useState<string>("");

  // On mount: load assigned worker from localStorage or pick random
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("sim_worker") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GigWorker;
        setWorker(parsed);
        return;
      } catch {}
    }
    const rnd = getRandomWorker();
    setWorker(rnd);
    if (typeof window !== "undefined") localStorage.setItem("sim_worker", JSON.stringify(rnd));
  }, []);

  const handleRun = useCallback(() => {
    if (!worker) return;
    const r = runInsuranceSimulation(worker);
    setResult(r);
    setLastTick(new Date().toLocaleTimeString());
  }, [worker]);

  const handleForce = useCallback(() => {
    if (!worker) return;
    const r = runSimulationWithForcedTrigger(worker);
    setResult(r);
    setLastTick(new Date().toLocaleTimeString());
  }, [worker]);

  const handleReset = useCallback(() => {
    setAutoRun(false);
    setResult(null);
    setLastTick("");
    const rnd = getRandomWorker();
    setWorker(rnd);
    if (typeof window !== "undefined") localStorage.setItem("sim_worker", JSON.stringify(rnd));
  }, []);

  const handleAutoTick = useCallback(() => {
    if (!worker) return;
    const r = resetAndRun(worker);
    setResult(r);
    setLastTick(new Date().toLocaleTimeString());
  }, [worker]);

  return (
    <div className="max-w-5xl">
      <AutoInterval running={autoRun} onTick={handleAutoTick} />

      {/* Header */}
      <div className="rounded-2xl bg-[#0F2044] p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">End-to-end prototype</p>
          <h1 className="text-white font-extrabold text-xl tracking-tight">Insurance Simulation</h1>
          <p className="text-blue-200 text-sm mt-0.5">Underwriting → Pricing → Trigger → Payout</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {lastTick && (
            <span className="text-blue-300 text-xs font-mono">Last run: {lastTick}</span>
          )}
          {autoRun && (
            <span className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Auto-running every 5s
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleRun}
          className="bg-[#0F2044] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#1a3260] transition-all"
        >
          ▶ Run Insurance Simulation
        </button>
        <button
          onClick={handleForce}
          className="bg-amber-400 text-[#0F2044] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-300 transition-all"
        >
          ⚡ Simulate Trigger
        </button>
        <button
          onClick={() => { setAutoRun(v => !v); }}
          className={`font-bold text-sm px-5 py-2.5 rounded-xl transition-all border ${
            autoRun
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {autoRun ? "⏸ Stop Auto" : "🔄 Auto Simulate"}
        </button>
        <button
          onClick={handleReset}
          className="bg-white text-slate-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
        >
          ↺ Reset &amp; New Worker
        </button>
      </div>

      {/* Worker Info */}
      {worker && (
        <Card title="Worker Profile" label={<RiskBadge tier={result?.underwritingResult?.riskTier} />}>
          <Row label="Worker ID"   value={<span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{worker.worker_id}</span>} />
          <Row label="Name"        value={worker.name} />
          <Row label="Platform"    value={worker.platform} />
          <Row label="City"        value={worker.city} />
          <Row label="Active days" value={`${worker.days_active_last_30} / 30`} />
          <Row label="Avg income"  value={`₹${worker.avg_daily_income.toLocaleString("en-IN")}/day`} />
          <Row label="Hours/day"   value={worker.hours_per_day} />
          <Row label="Peak hours"  value={<span className="capitalize">{worker.peak_hours}</span>} />
        </Card>
      )}

      {/* Results — shown only after a run */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-5 mt-5"
          >
            {/* Underwriting */}
            <Card
              title="Underwriting"
              label={<StatusPill ok={result.underwritingResult.eligible} trueLabel="Eligible" falseLabel="Not Eligible" />}
            >
              <Row label="Eligibility"   value={result.underwritingResult.eligibilityReason} />
              <Row label="Risk score"    value={result.underwritingResult.riskScore} />
              <Row label="Risk tier"     value={<RiskBadge tier={result.underwritingResult.riskTier} />} />
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1.5 font-semibold">Explanation</p>
                {result.underwritingResult.explanation.length === 0 ? (
                  <p className="text-xs text-slate-400">No risk factors triggered.</p>
                ) : (
                  <ul className="space-y-1">
                    {result.underwritingResult.explanation.map((e, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="text-amber-500">•</span> {e}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            {/* Pricing */}
            <Card title="Pricing" label={<span className="text-[#0F2044] font-bold text-sm">₹{result.premiumResult.finalPremium}/wk</span>}>
              <Row label="Base premium"     value={`₹${result.premiumResult.basePremium}`} />
              <Row label="Adjusted premium" value={`₹${result.premiumResult.adjustedPremium}`} />
              <Row
                label="Final premium"
                value={<span className="text-[#0F2044] font-extrabold text-base">₹{result.premiumResult.finalPremium}</span>}
              />
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1.5 font-semibold">Breakdown</p>
                <ul className="space-y-1">
                  {result.premiumResult.breakdown.map((b, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="text-blue-400">→</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* Trigger */}
            <Card
              title="Parametric Trigger"
              label={<StatusPill ok={result.triggerResult.trigger} trueLabel="Trigger Active" falseLabel="No Trigger" />}
            >
              <Row label="City"     value={result.triggerResult.city} />
              <Row label="Type"     value={result.triggerResult.triggerType ?? "—"} />
              <Row label="Value"    value={
                result.triggerResult.value === -1 ? "No data" :
                result.triggerResult.triggerType === "AQI"
                  ? `AQI ${result.triggerResult.value}`
                  : `${result.triggerResult.value} mm`
              } />
              <Row label="Severity" value={
                result.triggerResult.trigger
                  ? <RiskBadge tier={result.triggerResult.severity as "low" | "medium" | "high"} />
                  : "—"
              } />
              <Row label="Source"   value={result.triggerResult.source ?? "N/A"} />
              <Row
                label="Timestamp"
                value={<span className="font-mono text-xs">{result.triggerResult.timestamp.slice(11, 19)} UTC</span>}
              />
            </Card>

            {/* Payout */}
            <Card
              title="Payout / Claims"
              label={
                <StatusPill
                  ok={result.payoutResult.status === "SUCCESS"}
                  trueLabel="Payout Success"
                  falseLabel="Payout Failed"
                />
              }
            >
              <Row
                label="Payout ID"
                value={<span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded truncate max-w-[180px] block text-right">{result.payoutResult.payoutId}</span>}
              />
              <Row label="Amount" value={
                result.payoutResult.status === "SUCCESS"
                  ? <span className="text-emerald-600 font-extrabold text-base">₹{result.payoutResult.payoutAmount.toLocaleString("en-IN")}</span>
                  : <span className="text-slate-400">₹0</span>
              } />
              <Row label="Method"    value={result.payoutResult.paymentMethod} />
              <div className="pt-1 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1.5 font-semibold">Reason</p>
                <p className={`text-xs leading-relaxed ${result.payoutResult.status === "SUCCESS" ? "text-emerald-700" : "text-red-600"}`}>
                  {result.payoutResult.reason}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && worker && (
        <div className="mt-8 text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="text-4xl mb-3">🛡️</div>
          <p className="font-bold text-slate-700 text-lg mb-1">Ready to simulate</p>
          <p className="text-slate-400 text-sm">Click <strong>Run Insurance Simulation</strong> to run the full pipeline for {worker.name}</p>
        </div>
      )}
    </div>
  );
}
