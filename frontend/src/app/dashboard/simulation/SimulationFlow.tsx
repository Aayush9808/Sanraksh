"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentUser } from "@/lib/userStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type ClaimStatus = "idle" | "running" | "approved" | "rejected";
type RejectionReason = "not_eligible" | "high_fraud_risk";

interface StepState {
  status: "waiting" | "checking" | "done" | "failed";
  detail?: string;
}

interface ClaimRecord {
  id: string;
  date: string;
  triggerType: string;
  triggerLabel: string;
  status: "approved" | "rejected";
  payout: number;
  fraudScore: number;
  rejectionReason?: RejectionReason;
}

interface LiveEvent {
  id: string;
  icon: string;
  label: string;
  status: "approved" | "rejected";
  payout: number;
  time: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_POLICY = {
  premium: 49,
  dailyPayout: 450,
  risk: "Low",
  city: "Pune",
  platforms: ["Swiggy", "Zomato"],
};

function getActivePolicy() {
  if (typeof window === "undefined") return DEMO_POLICY;
  try {
    const raw = localStorage.getItem("giginsur_policy");
    if (raw) return { ...DEMO_POLICY, ...JSON.parse(raw) };
  } catch {}
  return DEMO_POLICY;
}

function getClaimsHistory(): ClaimRecord[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("giginsur_claims") || "[]"); } catch { return []; }
}

function saveClaimsHistory(records: ClaimRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("giginsur_claims", JSON.stringify(records.slice(0, 10)));
}

const TRIGGERS = [
  { id: "heavy_rain",      label: "Heavy Rain",       icon: "🌧️", desc: "Rainfall > 50mm in 24h",        color: "#3B82F6" },
  { id: "platform_outage", label: "Platform Outage",  icon: "📵", desc: "App down for > 2 hours",         color: "#8B5CF6" },
  { id: "earnings_drop",   label: "Earnings Drop",    icon: "📉", desc: "Weekly earnings < ₹2,000",       color: "#F59E0B" },
  { id: "aqi_severe",      label: "Severe AQI",       icon: "🌫️", desc: "AQI > 400 in your zone",         color: "#EF4444" },
  { id: "cyclone",         label: "Cyclone Alert",    icon: "🌀", desc: "Government cyclone warning",     color: "#10B981" },
];

const CLAIM_STEPS = [
  { id: 1, label: "Trigger detected",    icon: "📡" },
  { id: 2, label: "Eligibility check",   icon: "📋" },
  { id: 3, label: "Fraud analysis",      icon: "🔍" },
  { id: 4, label: "Payout calculation",  icon: "💰" },
];

// ─── History table ────────────────────────────────────────────────────────────

function HistoryTable({ records, onClear }: { records: ClaimRecord[]; onClear: () => void }) {
  if (records.length === 0) return null;
  return (
    <div className="panel overflow-hidden mt-5">
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div>
          <p className="lbl mb-0.5">Simulation log</p>
          <h2 className="font-bold text-slate-900">Past simulations ({records.length})</h2>
        </div>
        <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors">
          Clear all
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {records.map(r => (
          <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-lg">{TRIGGERS.find(t => t.id === r.triggerType)?.icon ?? "⚡"}</span>
              <div>
                <div className="font-semibold text-slate-800 text-sm">{r.triggerLabel}</div>
                <div className="text-xs text-slate-400">
                  {new Date(r.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
            </div>
            <div className="text-right">
              {r.status === "approved" ? (
                <div>
                  <div className="text-emerald-600 font-bold text-sm">₹{r.payout}</div>
                  <span className="tag tag-live text-xs">Approved</span>
                </div>
              ) : (
                <div>
                  <div className="text-slate-400 text-xs mb-0.5">
                    {r.rejectionReason === "high_fraud_risk" ? "High fraud risk" : "Not eligible"}
                  </div>
                  <span className="tag tag-neg text-xs">Rejected</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SimulationFlow() {
  const router = useRouter();
  const [selectedTrigger, setSelectedTrigger] = useState(TRIGGERS[0].id);
  const [claimStatus, setClaimStatus] = useState<ClaimStatus>("idle");
  const [steps, setSteps] = useState<StepState[]>([
    { status: "waiting" }, { status: "waiting" },
    { status: "waiting" }, { status: "waiting" },
  ]);
  const [payout, setPayout] = useState(0);
  const [fraudScore, setFraudScore] = useState(0);
  const [rejectionReason, setRejectionReason] = useState<RejectionReason | null>(null);
  const [history, setHistory] = useState<ClaimRecord[]>([]);
  const [policy, setPolicy] = useState(DEMO_POLICY);
  const [isDemo, setIsDemo] = useState(false);
  const [autoEngine, setAutoEngine] = useState(false);
  const [liveActivity, setLiveActivity] = useState<LiveEvent[]>([]);

  // Refs so interval callbacks always see fresh state
  const historyRef = useRef<ClaimRecord[]>([]);
  const policyRef = useRef(DEMO_POLICY);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { policyRef.current = policy; }, [policy]);

  useEffect(() => {
    if (!getCurrentUser()) { router.replace("/login"); return; }
    setPolicy(getActivePolicy());
    setHistory(getClaimsHistory());
    setIsDemo(!localStorage.getItem("giginsur_policy"));
  }, []);

  // Auto engine loop — fires every 8 s while enabled
  useEffect(() => {
    if (!autoEngine) return;
    const interval = setInterval(runAutoSimulation, 8000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEngine]);

  function runAutoSimulation() {
    const currentPolicy = policyRef.current;
    const trigger = TRIGGERS[Math.floor(Math.random() * TRIGGERS.length)];
    const isEligible = Math.random() > 0.3;
    const fraud = parseFloat(Math.random().toFixed(2));
    const status: "approved" | "rejected" = (!isEligible || fraud > 0.8) ? "rejected" : "approved";
    const autoRejReason: RejectionReason | undefined =
      !isEligible ? "not_eligible" : fraud > 0.8 ? "high_fraud_risk" : undefined;
    const autoPayout =
      status === "approved" ? currentPolicy.dailyPayout * (Math.floor(Math.random() * 3) + 1) : 0;

    const record: ClaimRecord = {
      id: `CLM-${Date.now()}`,
      date: new Date().toISOString(),
      triggerType: trigger.id,
      triggerLabel: trigger.label,
      status,
      payout: autoPayout,
      fraudScore: fraud,
      rejectionReason: autoRejReason,
    };

    const updated = [record, ...historyRef.current];
    setHistory(updated);
    saveClaimsHistory(updated);

    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLiveActivity(prev => [{ id: record.id, icon: trigger.icon, label: trigger.label, status, payout: autoPayout, time: timeStr }, ...prev].slice(0, 8));
  }

  function updateStep(idx: number, s: Partial<StepState>) {
    setSteps(prev => prev.map((st, i) => i === idx ? { ...st, ...s } : st));
  }

  async function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

  async function handleSimulation() {
    const currentPolicy = getActivePolicy();
    setPolicy(currentPolicy);
    setClaimStatus("running");
    setRejectionReason(null);

    const fraud = parseFloat((Math.random()).toFixed(2));
    const isEligible = Math.random() > 0.25;
    setFraudScore(fraud);

    const triggerObj = TRIGGERS.find(t => t.id === selectedTrigger)!;
    const calculatedPayout = currentPolicy.dailyPayout * (Math.floor(Math.random() * 3) + 1);

    // Reset to waiting
    setSteps([{ status: "waiting" }, { status: "waiting" }, { status: "waiting" }, { status: "waiting" }]);

    // Step 1 — Trigger detected
    updateStep(0, { status: "checking" });
    await delay(800 + Math.random() * 300);
    updateStep(0, { status: "done", detail: `Parametric signal received — ${triggerObj.label}` });

    // Step 2 — Eligibility
    await delay(500);
    updateStep(1, { status: "checking" });
    await delay(900 + Math.random() * 300);
    if (!isEligible) {
      updateStep(1, { status: "failed", detail: "Policy period mismatch — earnings band not qualifying" });
      await delay(350);
      setRejectionReason("not_eligible");
      setClaimStatus("rejected");
      const record: ClaimRecord = {
        id: `CLM-${Date.now()}`, date: new Date().toISOString(),
        triggerType: selectedTrigger, triggerLabel: triggerObj.label,
        status: "rejected", payout: 0, fraudScore: fraud,
        rejectionReason: "not_eligible",
      };
      const updated = [record, ...history];
      setHistory(updated);
      saveClaimsHistory(updated);
      return;
    }
    updateStep(1, { status: "done", detail: "Policy active · Earnings period verified · Zone matched" });

    // Step 3 — Fraud analysis
    await delay(500);
    updateStep(2, { status: "checking" });
    await delay(1100 + Math.random() * 300);
    if (fraud > 0.8) {
      updateStep(2, { status: "failed", detail: `Fraud score: ${(fraud * 100).toFixed(0)}% — exceeds 80% threshold` });
      await delay(350);
      setRejectionReason("high_fraud_risk");
      setClaimStatus("rejected");
      const record: ClaimRecord = {
        id: `CLM-${Date.now()}`, date: new Date().toISOString(),
        triggerType: selectedTrigger, triggerLabel: triggerObj.label,
        status: "rejected", payout: 0, fraudScore: fraud,
        rejectionReason: "high_fraud_risk",
      };
      const updated = [record, ...history];
      setHistory(updated);
      saveClaimsHistory(updated);
      return;
    }
    updateStep(2, { status: "done", detail: `Fraud score: ${(fraud * 100).toFixed(0)}% — within threshold` });

    // Step 4 — Payout
    await delay(500);
    updateStep(3, { status: "checking" });
    await delay(1000 + Math.random() * 300);
    setPayout(calculatedPayout);
    updateStep(3, { status: "done", detail: `₹${calculatedPayout} queued for UPI transfer` });
    await delay(300);

    setClaimStatus("approved");
    const record: ClaimRecord = {
      id: `CLM-${Date.now()}`, date: new Date().toISOString(),
      triggerType: selectedTrigger, triggerLabel: triggerObj.label,
      status: "approved", payout: calculatedPayout, fraudScore: fraud,
    };
    const updated = [record, ...history];
    setHistory(updated);
    saveClaimsHistory(updated);
  }

  function reset() {
    setClaimStatus("idle");
    setSteps([{ status: "waiting" }, { status: "waiting" }, { status: "waiting" }, { status: "waiting" }]);
    setPayout(0);
    setFraudScore(0);
    setRejectionReason(null);
  }

  const triggerObj = TRIGGERS.find(t => t.id === selectedTrigger)!;
  const isRunning = claimStatus === "running";

  return (
    <div className="max-w-3xl">

      {/* Header banner */}
      <div className="rounded-2xl bg-[#0F2044] p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Core feature demo</p>
          <h1 className="text-white font-extrabold text-xl tracking-tight">Claim Flow Simulation</h1>
          <p className="text-blue-200 text-sm mt-0.5">Trigger → Eligibility → Fraud check → Payout</p>
        </div>
        <button
          onClick={() => setAutoEngine(e => !e)}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 border text-xs font-semibold transition-all active:scale-95 ${
            autoEngine
              ? "bg-emerald-400/20 border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/30"
              : "bg-white/10 border-white/20 text-blue-200 hover:bg-white/20"
          }`}>
          {autoEngine && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {autoEngine ? "Auto Engine Running ⚡" : "▶ Start Auto Engine"}
        </button>
      </div>

      <div className="panel-raised p-6">

        {/* Trigger selector */}
        <AnimatePresence>
          {(claimStatus === "idle" || claimStatus === "approved" || claimStatus === "rejected") && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-6">
              <p className="lbl mb-2">Select trigger event</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {TRIGGERS.map(t => (
                  <button key={t.id}
                    onClick={() => { if (!isRunning) setSelectedTrigger(t.id); }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedTrigger === t.id
                        ? "border-[#0F2044] bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}>
                    <span className="text-xl flex-shrink-0">{t.icon}</span>
                    <div>
                      <div className={`font-bold text-xs ${selectedTrigger === t.id ? "text-[#0F2044]" : "text-slate-700"}`}>
                        {t.label}
                      </div>
                      <div className="text-slate-400 text-[10px] leading-tight">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing steps */}
        <AnimatePresence>
          {claimStatus !== "idle" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
              <p className="lbl mb-3">Claim processing pipeline</p>
              <div className="space-y-2">
                {CLAIM_STEPS.map((step, i) => {
                  const st = steps[i];
                  return (
                    <motion.div key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                        st.status === "done"     ? "bg-emerald-50 border-emerald-200" :
                        st.status === "failed"   ? "bg-red-50 border-red-200" :
                        st.status === "checking" ? "bg-blue-50 border-blue-200" :
                                                   "bg-slate-50 border-slate-100"
                      }`}>
                      {/* Step icon */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-extrabold transition-all ${
                        st.status === "done"     ? "bg-emerald-500 text-white" :
                        st.status === "failed"   ? "bg-red-500 text-white" :
                        st.status === "checking" ? "bg-[#0F2044] text-white" :
                                                   "bg-slate-200 text-slate-400"
                      }`}>
                        {st.status === "done"     ? "✓" :
                         st.status === "failed"   ? "✕" :
                         st.status === "checking" ? (
                           <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                         ) : step.id}
                      </div>
                      {/* Step text */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm ${
                          st.status === "done"     ? "text-emerald-700" :
                          st.status === "failed"   ? "text-red-700" :
                          st.status === "checking" ? "text-blue-800" :
                                                     "text-slate-400"
                        }`}>
                          <span className="mr-1.5">{step.icon}</span>
                          {step.label}
                          {st.status === "checking" && (
                            <span className="text-xs font-normal ml-1 opacity-60">checking…</span>
                          )}
                        </div>
                        {st.detail && (
                          <div className={`text-xs mt-0.5 ${st.status === "failed" ? "text-red-600" : "text-slate-500"}`}>
                            {st.detail}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Approved result */}
        <AnimatePresence>
          {claimStatus === "approved" && (
            <motion.div key="approved"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                    <motion.path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }} />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-extrabold text-emerald-800 text-lg mb-0.5">Claim Approved ✅</div>
                  <div className="text-emerald-700 text-sm mb-3">
                    Trigger: <span className="font-semibold">{triggerObj.icon} {triggerObj.label}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center">
                      <div className="text-xs text-emerald-600 font-bold mb-0.5">Payout</div>
                      <div className="text-xl font-extrabold text-emerald-800">₹{payout}</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center">
                      <div className="text-xs text-emerald-600 font-bold mb-0.5">Fraud score</div>
                      <div className="text-xl font-extrabold text-emerald-800">{(fraudScore * 100).toFixed(0)}%</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-emerald-100 text-center">
                      <div className="text-xs text-emerald-600 font-bold mb-0.5">Transfer</div>
                      <div className="text-sm font-bold text-emerald-800">UPI · 2h</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rejected result */}
        <AnimatePresence>
          {claimStatus === "rejected" && (
            <motion.div key="rejected"
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center flex-shrink-0 text-2xl">
                  ❌
                </div>
                <div className="flex-1">
                  <div className="font-extrabold text-red-800 text-lg mb-0.5">Claim Rejected</div>
                  <div className="text-red-700 text-sm mb-2">
                    Trigger: <span className="font-semibold">{triggerObj.icon} {triggerObj.label}</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-red-100 rounded-xl">
                    <span className="text-xs font-extrabold text-red-800 mt-0.5 flex-shrink-0">Reason:</span>
                    <span className="text-xs text-red-700">
                      {rejectionReason === "high_fraud_risk"
                        ? `Fraud score ${(fraudScore * 100).toFixed(0)}% exceeds the 80% threshold — claim flagged for review`
                        : "Policy eligibility check failed — earnings period or zone criteria not met"}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="flex items-center gap-3 flex-wrap">
          {claimStatus === "idle" && (
            <button onClick={handleSimulation}
              className="bg-[#0F2044] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1E3A5F] active:scale-95 transition-all flex items-center gap-2">
              ▶ Run Simulation
            </button>
          )}
          {isRunning && (
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <div className="w-4 h-4 rounded-full border-2 border-[#0F2044] border-t-transparent animate-spin" />
              Processing claim…
            </div>
          )}
          {(claimStatus === "approved" || claimStatus === "rejected") && (
            <>
              <button onClick={reset}
                className="bg-[#0F2044] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1E3A5F] active:scale-95 transition-all">
                ↺ Run again
              </button>
              <button onClick={reset}
                className="border border-slate-200 text-slate-600 font-semibold text-sm px-4 py-3 rounded-xl hover:bg-slate-50 transition-all">
                Change trigger
              </button>
            </>
          )}
        </div>

        {/* Policy context */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400">Policy in use:</span>
          <span className="text-xs font-semibold text-slate-600">₹{policy.premium}/week</span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs font-semibold text-slate-600">₹{policy.dailyPayout}/day payout</span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs font-semibold text-slate-600">{policy.city}</span>
          {isDemo && (
            <span className="ml-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">demo data</span>
          )}
        </div>
      </div>

      {/* Live Activity feed */}
      <AnimatePresence>
        {liveActivity.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="panel overflow-hidden mt-5">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <p className="lbl mb-0">Auto engine</p>
                  <h2 className="font-bold text-slate-900 text-sm">Live Activity</h2>
                </div>
              </div>
              <button onClick={() => setLiveActivity([])} className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors">
                Clear
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {liveActivity.map(e => (
                <motion.div key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{e.icon}</span>
                    <span className="text-sm font-semibold text-slate-700">{e.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{e.time}</span>
                  </div>
                  {e.status === "approved" ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold text-sm">₹{e.payout}</span>
                      <span className="text-base">✅</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-red-500 font-semibold text-sm">Rejected</span>
                      <span className="text-base">❌</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulation history */}
      <HistoryTable records={history} onClear={() => { setHistory([]); saveClaimsHistory([]); }} />
    </div>
  );
}
