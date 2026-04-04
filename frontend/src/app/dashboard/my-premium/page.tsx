"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { API_BASE, API_V1_BASE } from "@/lib/config";
import { loadSession, loadSessionForUser } from "@/lib/workerSession";
import { getCurrentUser } from "@/lib/userStore";

interface Factor {
  factor: string;
  adjustment: number;
  explanation: string;
  confidence: number;
}

interface PremiumResult {
  base_premium: number;
  final_premium: number;
  coverage_per_day: number;
  weekly_roi_breakeven_days: number;
  recommended_plan: string;
  plan_reasoning: string;
  risk_level: string;
  risk_score: number;
  season: string;
  factors: Factor[];
}

const EARNINGS_BANDS = [
  { id: "under_2000",   label: "Under ₹2,000 / week" },
  { id: "2000_4000",    label: "₹2,000 – ₹4,000 / week" },
  { id: "4000_7000",    label: "₹4,000 – ₹7,000 / week" },
  { id: "7000_12000",   label: "₹7,000 – ₹12,000 / week" },
  { id: "above_12000",  label: "Above ₹12,000 / week" },
];

const RISK_COLOR: Record<string, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
  very_high: "#EF4444",
};

function ConfidenceBar({ v }: { v: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#0F2044] rounded-full" style={{ width: `${v * 100}%` }} />
      </div>
      <span className="text-xs text-slate-400 font-mono w-8 text-right">{(v * 100).toFixed(0)}%</span>
    </div>
  );
}

export default function MyPremiumPage() {
  const router = useRouter();
  const [result, setResult] = useState<PremiumResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [earningsBand, setEarningsBand] = useState("4000_7000");
  const [tenure, setTenure] = useState(0);
  const [profile, setProfile] = useState<{ city: string; platform: string } | null>(null);
  const [fromSession, setFromSession] = useState(false);

  async function calculate(city: string, platform: string, band: string, months: number) {
    setLoading(true);
    try {
      const res = await fetch(`${API_V1_BASE}/premium/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          platform: platform.toLowerCase(),
          weekly_earnings_band: band,
          tenure_months: months,
          claims_last_30_days: 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setFromSession(false);
        // Keep sanraksh_policy in sync so Overview/My Policy show the same value
        if (typeof window !== "undefined") {
          try {
            const existing = JSON.parse(localStorage.getItem("sanraksh_policy") || "{}");
            localStorage.setItem("sanraksh_policy", JSON.stringify({
              ...existing,
              premium: data.final_premium,
              coverage: data.coverage_per_day,
              dailyPayout: data.coverage_per_day,
              risk: data.risk_level,
            }));
          } catch {}
        }
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    if (!getCurrentUser()) { router.replace("/login"); return; }
    // First, try to load computed session from onboarding engines
    const currentUser = getCurrentUser()!;
    const session = loadSessionForUser(currentUser.id);
    if (session) {
      setFromSession(true);
      setEarningsBand(session.rawEarningsBand || "4000_7000");
      setProfile({ city: session.worker.city, platform: session.worker.platform });
      // Map engine PremiumResult to API PremiumResult shape for display
      const pr = session.premiumResult;
      setResult({
        base_premium: pr.basePremium,
        final_premium: pr.finalPremium,
        coverage_per_day: session.policy.coveragePerDay,
        weekly_roi_breakeven_days: pr.finalPremium > 0 ? session.policy.coveragePerDay / pr.finalPremium * 7 : 0,
        recommended_plan: session.policy.plan.toLowerCase(),
        plan_reasoning: `Recommended for ${session.underwritingResult.riskTier} risk workers in ${session.worker.city}.`,
        risk_level: session.underwritingResult.riskTier,
        risk_score: session.underwritingResult.riskScore / 10,
        season: "current",
        factors: pr.breakdown.map((line, i) => ({
          factor: line.replace(/[+\-₹\d.]+/g, "").trim() || `Factor ${i + 1}`,
          adjustment: parseFloat(line.match(/[+\-]?₹?([\d.]+)/)?.[1] ?? "0") * (line.startsWith("-") ? -1 : 1),
          explanation: line,
          confidence: 0.85 - i * 0.05,
        })),
      });
      setLoading(false);
      return;
    }

    // Fallback to API
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    fetch(`${API_BASE}/api/v1/workers/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const city = d.work_city || "Mumbai";
          const platform = d.delivery_platform || "swiggy";
          setProfile({ city, platform });
          calculate(city, platform, earningsBand, tenure);
        } else {
          calculate("Mumbai", "swiggy", earningsBand, tenure);
        }
      })
      .catch(() => calculate("Mumbai", "swiggy", earningsBand, tenure));
  }, []);

  function handleRecalculate() {
    const city = profile?.city || "Mumbai";
    const platform = profile?.platform || "swiggy";
    calculate(city, platform, earningsBand, tenure);
  }

  const riskColor = result ? (RISK_COLOR[result.risk_level] || "#F59E0B") : "#F59E0B";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Your coverage</p>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Premium Breakdown</h1>
          {fromSession && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Engine-computed
            </span>
          )}
        </div>
        <p className="text-slate-500 text-sm mt-1">AI-calculated pricing based on your location, platform, and earnings.</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Weekly earnings band</label>
          <select value={earningsBand} onChange={e => setEarningsBand(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white">
            {EARNINGS_BANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
        <div className="w-40">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tenure (months)</label>
          <input type="number" min={0} max={120} value={tenure} onChange={e => setTenure(Number(e.target.value))}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white" />
        </div>
        <button onClick={handleRecalculate} disabled={loading}
          className="px-5 py-2.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40">
          {loading ? "Calculating…" : "Recalculate →"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#0F2044] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : result ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">

          {/* Hero stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-[#0F2044] rounded-2xl p-5 text-white">
              <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">Weekly premium</div>
              <div className="text-4xl font-extrabold tracking-tight mb-1">₹{result.final_premium.toFixed(0)}</div>
              <div className="text-blue-300 text-xs">Base: ₹{result.base_premium.toFixed(0)}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Daily coverage</div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">₹{result.coverage_per_day.toFixed(0)}</div>
              <div className="text-xs text-slate-400">per trigger day</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Break-even</div>
              <div className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: riskColor }}>
                {result.weekly_roi_breakeven_days.toFixed(1)} <span className="text-lg">days</span>
              </div>
              <div className="text-xs text-slate-400">to recoup weekly cost</div>
            </div>
          </div>

          {/* Risk badge + plan recommendation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plan type</div>
                <div className="text-lg font-extrabold text-slate-900">Personalised Plan</div>
                <p className="text-slate-500 text-sm mt-1">{result.plan_reasoning}</p>
              </div>
              <div className="flex-shrink-0 text-center">
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: riskColor }}>
                  {result.risk_level.replace("_", " ")} risk
                </div>
                <div className="text-3xl font-extrabold" style={{ color: riskColor }}>
                  {(result.risk_score * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Season: <span className="font-semibold text-slate-600 capitalize">{result.season}</span></span>
              {profile && <>
                <span>·</span>
                <span>City: <span className="font-semibold text-slate-600">{profile.city}</span></span>
                <span>·</span>
                <span>Platform: <span className="font-semibold text-slate-600 capitalize">{profile.platform}</span></span>
              </>}
            </div>
          </div>

          {/* Factor breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Premium factors</h2>
              <p className="text-slate-400 text-xs mt-0.5">Every adjustment explained by our AI pricing engine</p>
            </div>
            <div className="divide-y divide-slate-100">
              {result.factors.map((f, i) => (
                <motion.div key={f.factor} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{f.factor}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.adjustment >= 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {f.adjustment >= 0 ? `+₹${f.adjustment.toFixed(2)}` : `-₹${Math.abs(f.adjustment).toFixed(2)}`}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed">{f.explanation}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-[10px] text-slate-400 mb-1 uppercase tracking-wide">Model confidence</div>
                    <ConfidenceBar v={f.confidence} />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">Total weekly premium</span>
              <span className="text-xl font-extrabold text-[#0F2044]">₹{result.final_premium.toFixed(0)}</span>
            </div>
          </div>

          {/* Info footer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
            <span className="font-bold">How premium is charged: </span>
            Deducted automatically each week when your policy is active. You only pay for active weeks — pausing your policy stops all charges.
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-16 text-slate-400">Failed to calculate premium. Please try again.</div>
      )}
    </div>
  );
}
