"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";
import { loadSessionForUser } from "@/lib/workerSession";
import { getCurrentUser } from "@/lib/userStore";

const COVERAGE_ITEMS = [
  { icon: "💰", label: "Income protection",        desc: "Compensates for earnings lost during covered events" },
  { icon: "🌧️", label: "Weather protection",       desc: "Triggers on heavy rain, flooding, heat wave, cyclone" },
  { icon: "📱", label: "Platform downtime cover",  desc: "Activates if your delivery platform goes offline" },
];

const TRIGGER_ITEMS = [
  { icon: "📉", label: "Earnings drop below threshold", likelihood: 0.55, color: "#F59E0B" },
  { icon: "🌧️", label: "Rainfall above trigger limit",  likelihood: 0.72, color: "#EF4444" },
  { icon: "📵", label: "Platform outage detected",       likelihood: 0.45, color: "#F59E0B" },
  { icon: "🌫️", label: "AQI > 400 severe",              likelihood: 0.28, color: "#10B981" },
  { icon: "🌀", label: "Cyclone / extreme weather",      likelihood: 0.08, color: "#10B981" },
];

const DEMO_POLICY_DATA = {
  id: "DEMO-001",
  premium: 25,
  risk: "Low",
  dailyPayout: 375,
  platforms: ["Swiggy", "Zomato"],
  city: "Pune",
  status: "Active",
  startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
  triggers: [
    "Low demand (earnings drop below threshold)",
    "Heavy rain / flooding",
    "Platform outage detected",
    "AQI > 400 severe",
    "Cyclone / extreme weather warning",
  ],
  payoutRule: "Auto payout when trigger conditions met",
};

interface StoredPolicy {
  id: string;
  premium: number;
  risk: string;
  dailyPayout: number;
  platforms: string[];
  city: string;
  status: string;
  startDate: string;
  triggers: string[];
  payoutRule: string;
}

interface ClaimData {
  id: string;
  claim_number: string;
  event_type?: string;
  claim_amount?: number;
  status?: string;
  claim_date?: string;
}

function LikelihoodBar({ v, color }: { v: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 bg-slate-700 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${v * 100}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
      </div>
      <span className="font-mono text-xs font-semibold" style={{ color }}>{(v * 100).toFixed(0)}%</span>
    </div>
  );
}

export default function MyPolicyPage() {
  const router = useRouter();
  const [storedPolicy, setStoredPolicy] = useState<StoredPolicy | null>(null);
  const [sessionPremium, setSessionPremium] = useState<number | null>(null);
  const [sessionCover, setSessionCover] = useState<number | null>(null);
  const [sessionPolicyNum, setSessionPolicyNum] = useState<string | null>(null);
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [simulateState, setSimulateState] = useState<"idle" | "running" | "result">("idle");
  const [simulatedPayout, setSimulatedPayout] = useState(0);

  useEffect(() => {
    if (!getCurrentUser()) { router.replace("/login"); return; }
    const currentUser = getCurrentUser()!;

    // Load stored policy (generated at onboarding completion)
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("sanraksh_policy");
        if (raw) setStoredPolicy(JSON.parse(raw));
        else setStoredPolicy(DEMO_POLICY_DATA as StoredPolicy);
      } catch { setStoredPolicy(DEMO_POLICY_DATA as StoredPolicy); }
    }

    // Load session for extra data
    const session = loadSessionForUser(currentUser.id);
    if (session) {
      setSessionPremium(session.policy.weeklyPremium);
      setSessionCover(session.policy.coveragePerDay);
      setSessionPolicyNum(`POL-${session.worker.worker_id}`);
    }

    // Try fetching claims from API
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    fetch(`${API_BASE}/api/v1/workers/me/claims`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (Array.isArray(d)) {
          setClaims(d);
          const earned = d.filter((c: ClaimData) => c.status === "paid")
            .reduce((s: number, c: ClaimData) => s + (c.claim_amount || 0), 0);
          setTotalEarned(Math.round(earned));
        }
      }).catch(() => {});
  }, []);

  async function simulateClaim() {
    setSimulateState("running");
    await new Promise(r => setTimeout(r, 2000));
    const payout = storedPolicy ? Math.round(storedPolicy.dailyPayout * (2 + Math.random() * 3)) : 0;
    setSimulatedPayout(payout);
    setSimulateState("result");
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const riskColor = (r?: string) =>
    r === "High" || r === "high" ? "#EF4444" : r === "Medium" || r === "medium" ? "#F59E0B" : "#10B981";

  const premium = storedPolicy?.premium ?? sessionPremium;
  const cover = storedPolicy?.dailyPayout ?? sessionCover;
  const risk = storedPolicy?.risk ?? "—";
  const policyId = storedPolicy?.id ?? sessionPolicyNum ?? "—";
  const startDate = storedPolicy?.startDate;
  const endDate = startDate ? new Date(new Date(startDate).getTime() + 365 * 86400000).toISOString() : undefined;
  const today = new Date();
  const endDateObj = endDate ? new Date(endDate) : null;
  const daysLeft = endDateObj ? Math.max(0, Math.ceil((endDateObj.getTime() - today.getTime()) / 86400000)) : 365;
  const pct = Math.round((daysLeft / 365) * 100);

  const statusTag = (s?: string) => {
    if (s === "paid") return "tag-live";
    if (s === "pending") return "tag-warn";
    if (s === "rejected") return "tag-neg";
    return "tag-neutral";
  };

  return (
    <div className="max-w-5xl">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Worker portal</p>
          <h1 className="text-slate-800 font-bold text-xl" style={{ letterSpacing: "-0.03em" }}>My Insurance Policy</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="tag tag-live">Active ✅</span>
          <span className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
            ⚡ Auto Claim Enabled
          </span>
        </div>
      </div>

      {/* Top row: policy card + ring + stats */}
      <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 mb-6">
        {/* Policy card */}
        <div className="panel p-5">
          <p className="lbl mb-3">Policy details</p>
          <div className="text-slate-800 font-bold text-lg mb-0.5">Sanraksh Personalised Plan</div>
          <p className="lbl mb-4 font-mono text-xs">{policyId}</p>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Weekly premium</span>
              <span className="font-bold text-slate-900">₹{premium?.toFixed(0) ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Daily payout</span>
              <span className="font-bold text-amber-500">₹{cover?.toLocaleString() ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Risk level</span>
              <span className="font-bold capitalize" style={{ color: riskColor(risk) }}>{risk}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Start date</span>
              <span className="text-slate-600">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Expires</span>
              <span className="text-slate-600">{formatDate(endDate)}</span>
            </div>
            {storedPolicy?.city && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">City</span>
                <span className="text-slate-600">{storedPolicy.city}</span>
              </div>
            )}
            {storedPolicy != null && (storedPolicy.platforms?.length ?? 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Platforms</span>
                <span className="text-slate-600 text-right">{storedPolicy.platforms.join(", ")}</span>
              </div>
            )}
          </div>
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <span>✓</span> {storedPolicy?.payoutRule ?? "Auto payout when trigger conditions met"}
            </div>
          </div>
        </div>

        {/* Coverage ring */}
        <div className="panel p-5 flex flex-col items-center justify-center">
          <p className="lbl mb-4">Coverage remaining</p>
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#E2E8F0" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - pct / 100) }}
                transition={{ duration: 1.2, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-slate-800 font-bold text-2xl" style={{ letterSpacing: "-0.04em" }}>{pct}%</div>
              <div className="lbl text-xs text-center">{daysLeft}d left</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="panel p-5 flex flex-col gap-4">
          <div>
            <p className="lbl mb-1">Total earned</p>
            <div className="text-amber-500 font-extrabold text-3xl" style={{ letterSpacing: "-0.04em" }}>₹{totalEarned.toLocaleString()}</div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="lbl mb-1">Paid claims</p>
            <div className="text-slate-800 font-bold text-2xl">{claims.filter(c => c.status === "paid").length}</div>
          </div>
        </div>
      </div>

      {/* Coverage includes */}
      <div className="panel p-5 mb-4">
        <p className="lbl mb-1">What's covered</p>
        <h2 className="text-slate-800 font-bold mb-4" style={{ letterSpacing: "-0.02em" }}>Coverage includes</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {COVERAGE_ITEMS.map(item => (
            <div key={item.label} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="font-bold text-slate-800 text-sm">{item.label}</div>
                <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Triggers */}
      <div className="panel p-5 mb-4">
        <p className="lbl mb-1">Auto payout conditions</p>
        <h2 className="text-slate-800 font-bold mb-4" style={{ letterSpacing: "-0.02em" }}>Active triggers</h2>
        <div className="space-y-3">
          {TRIGGER_ITEMS.map(t => (
            <div key={t.label} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xl flex-shrink-0">{t.icon}</span>
                <span className="text-sm text-slate-700 font-medium truncate">{t.label}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <LikelihoodBar v={t.likelihood} color={t.color} />
                <span className="tag tag-live text-xs">active</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulate Claim */}
      <div className="panel p-5 mb-4">
        <p className="lbl mb-1">Demo</p>
        <h2 className="text-slate-800 font-bold mb-1" style={{ letterSpacing: "-0.02em" }}>Simulate a claim</h2>
        <p className="text-slate-400 text-sm mb-4">Trigger a demo payout to see how auto-claim works.</p>

        <AnimatePresence mode="wait">
          {simulateState === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={simulateClaim}
                className="bg-[#0F2044] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1E3A5F] transition flex items-center gap-2">
                ▶ Simulate Claim
              </button>
            </motion.div>
          )}
          {simulateState === "running" && (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3 text-slate-600 text-sm font-medium py-2">
              <div className="w-5 h-5 rounded-full border-2 border-[#0F2044] border-t-transparent animate-spin" />
              Evaluating trigger conditions…
            </motion.div>
          )}
          {simulateState === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-emerald-800 mb-0.5">Claim approved! 🎉</div>
                <div className="text-emerald-700 text-sm">Payout of <span className="font-extrabold text-lg">₹{simulatedPayout}</span> would be transferred to your UPI within 2 hours.</div>
                <button onClick={() => setSimulateState("idle")}
                  className="mt-3 text-xs text-emerald-700 font-semibold hover:underline">Run again →</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Payout history */}
      <div className="panel overflow-hidden">
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #E2E8F0" }}>
          <p className="lbl mb-1">Payment history</p>
          <h2 className="text-slate-800 font-bold" style={{ letterSpacing: "-0.02em" }}>
            Past payouts {claims.length > 0 ? `(${claims.length})` : ""}
          </h2>
        </div>
        {claims.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">
            No claims yet — triggers will auto-initiate payouts when conditions are met.
          </div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Claim #</th><th>Date</th><th>Event</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs">{c.claim_number}</td>
                  <td className="font-mono text-xs">{formatDate(c.claim_date)}</td>
                  <td><span className="text-slate-600 font-medium">{c.event_type || "—"}</span></td>
                  <td><span className="text-amber-500 font-mono font-bold">₹{(c.claim_amount || 0).toFixed(0)}</span></td>
                  <td><span className={`tag ${statusTag(c.status)}`}>{c.status || "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

