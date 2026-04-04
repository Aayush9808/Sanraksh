"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
];

const PLATFORMS = [
  { value: "swiggy",   label: "Swiggy" },
  { value: "zomato",   label: "Zomato" },
  { value: "uber",     label: "Uber" },
  { value: "ola",      label: "Ola" },
  { value: "blinkit",  label: "Blinkit" },
  { value: "zepto",    label: "Zepto" },
  { value: "dunzo",    label: "Dunzo" },
  { value: "rapido",   label: "Rapido" },
  { value: "porter",   label: "Porter" },
  { value: "amazon",   label: "Amazon" },
  { value: "flipkart", label: "Flipkart" },
  { value: "other",    label: "Other" },
];

const EARNINGS_BANDS = [
  { value: "under_2000",  label: "Under ₹2,000 / week", coverage: 450 },
  { value: "2000_4000",   label: "₹2,000 – ₹4,000 / week", coverage: 600 },
  { value: "4000_7000",   label: "₹4,000 – ₹7,000 / week", coverage: 800 },
  { value: "7000_12000",  label: "₹7,000 – ₹12,000 / week", coverage: 1000 },
  { value: "above_12000", label: "Above ₹12,000 / week", coverage: 1200 },
];

interface Factor {
  factor: string;
  base: number;
  adjustment: number;
  explanation: string;
  confidence: number;
}

interface CalcResult {
  base_premium: number;
  factors: Factor[];
  final_premium: number;
  coverage_per_day: number;
  weekly_roi_breakeven_days: number;
  recommended_plan: string;
  plan_reasoning: string;
  risk_level: string;
  risk_score: number;
  season: string;
}

function ConfidenceBar({ val }: { val: number }) {
  const pct = Math.round(val * 100);
  const color = pct >= 85 ? "#10b981" : pct >= 65 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 999 }} />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    high: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold capitalize ${map[level] || map.medium}`}>
      {level} risk
    </span>
  );
}

export default function PremiumCalculatorPage() {
  const [city, setCity] = useState("Mumbai");
  const [platform, setPlatform] = useState("swiggy");
  const [earningsBand, setEarningsBand] = useState("4000_7000");
  const [tenure, setTenure] = useState(0);
  const [recentClaims, setRecentClaims] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [error, setError] = useState("");

  async function calculate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/premium/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          platform,
          weekly_earnings_band: earningsBand,
          tenure_months: tenure,
          claims_last_30_days: recentClaims,
        }),
      });
      if (!res.ok) throw new Error("Calculation failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Could not connect to pricing engine. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const coverageInfo = EARNINGS_BANDS.find(b => b.value === earningsBand);

  return (
    <div className="p-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="lbl mb-1">AI-Powered Pricing Engine</p>
        <h1 className="text-2xl font-extrabold text-slate-900" style={{ letterSpacing: "-0.03em" }}>
          Premium Calculator
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Real-time parametric pricing with full factor breakdown — no hidden fees, no guesswork.
        </p>
      </div>

      <div className="grid xl:grid-cols-[380px_1fr] gap-5 items-start">
        {/* Input panel */}
        <div className="panel p-5 space-y-5">
          <div>
            <label className="lbl block mb-1.5">City</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2044]/20"
            >
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="lbl block mb-1.5">Delivery Platform</label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2044]/20"
            >
              {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className="lbl block mb-1.5">Weekly Earnings Band</label>
            <select
              value={earningsBand}
              onChange={e => setEarningsBand(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2044]/20"
            >
              {EARNINGS_BANDS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            {coverageInfo && (
              <p className="text-xs text-slate-400 mt-1.5">
                Daily coverage: <strong className="text-slate-600">₹{coverageInfo.coverage}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="lbl block mb-1.5">
              Tenure with GigInsu₹
              <span className="text-amber-500 font-bold ml-2">{tenure} month{tenure !== 1 ? "s" : ""}</span>
            </label>
            <input
              type="range" min={0} max={36} value={tenure}
              onChange={e => setTenure(Number(e.target.value))}
              className="w-full accent-[#0F2044]"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>0 months</span>
              <span>3 years</span>
            </div>
          </div>

          <div>
            <label className="lbl block mb-1.5">Claims in last 30 days</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(n => (
                <button
                  key={n}
                  onClick={() => setRecentClaims(n)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    recentClaims === n
                      ? "bg-[#0F2044] text-white border-[#0F2044]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {n}{n === 3 ? "+" : ""}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#0F2044] text-white font-bold text-sm hover:bg-[#1a3566] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Calculating…" : "Calculate My Premium →"}
          </button>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
          )}
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="panel p-10 text-center">
                <div className="text-4xl mb-3">🧮</div>
                <div className="font-bold text-slate-800 mb-1">Your personalised quote</div>
                <div className="text-sm text-slate-400">Fill in the form and click Calculate to see a full AI-factor breakdown of your weekly premium.</div>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="panel p-10 text-center">
                <div className="inline-flex items-center gap-3 text-slate-600">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <span className="font-semibold">Running pricing engine…</span>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">

                {/* Premium hero card */}
                <div className="panel p-6 bg-[#0F2044] text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Your weekly premium</p>
                      <div className="text-5xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.04em" }}>
                        ₹{result.final_premium.toFixed(0)}
                        <span className="text-xl text-slate-400 font-normal ml-1">/week</span>
                      </div>
                      <p className="text-slate-300 text-sm mt-2">
                        Base: ₹{result.base_premium} · Coverage: ₹{result.coverage_per_day}/day
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-slate-400 mb-1">Break-even</div>
                      <div className="font-bold text-amber-400 text-2xl">{result.weekly_roi_breakeven_days.toFixed(1)}</div>
                      <div className="text-xs text-slate-400">days worked</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-3 flex-wrap">
                    <RiskBadge level={result.risk_level} />
                    <span className="text-xs text-slate-300">
                      <strong className="text-white">{result.recommended_plan}</strong> recommended
                    </span>
                    <span className="text-xs text-slate-400 capitalize">Season: {result.season}</span>
                  </div>
                </div>

                {/* Plan reasoning */}
                <div className="panel p-4">
                  <p className="lbl mb-1">Why this plan?</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{result.plan_reasoning}</p>
                </div>

                {/* Factor breakdown */}
                <div className="panel overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <p className="lbl mb-0.5">AI factor breakdown</p>
                    <h2 className="font-bold text-slate-900">What drives your price</h2>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {result.factors.map((f, i) => (
                      <motion.div key={f.factor} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800 text-sm">{f.factor}</div>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.explanation}</p>
                            <div className="mt-2">
                              <div className="text-xs text-slate-400 mb-0.5">Signal confidence</div>
                              <ConfidenceBar val={f.confidence} />
                            </div>
                          </div>
                          <div className={`flex-shrink-0 font-bold text-lg font-mono ${
                            f.adjustment > 0 ? "text-red-500" : f.adjustment < 0 ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {f.adjustment > 0 ? "+" : ""}{f.adjustment.toFixed(1)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">Final weekly premium</span>
                    <span className="font-extrabold text-[#0F2044] text-xl">₹{result.final_premium.toFixed(0)}</span>
                  </div>
                </div>

                {/* ROI explainer */}
                <div className="panel p-4">
                  <p className="lbl mb-2">Your ROI at a glance</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="panel-inset p-3 text-center">
                      <div className="font-bold text-[#0F2044] text-xl">₹{result.final_premium.toFixed(0)}</div>
                      <div className="lbl text-xs mt-0.5">Weekly cost</div>
                    </div>
                    <div className="panel-inset p-3 text-center">
                      <div className="font-bold text-emerald-600 text-xl">₹{result.coverage_per_day.toFixed(0)}</div>
                      <div className="lbl text-xs mt-0.5">Daily payout</div>
                    </div>
                    <div className="panel-inset p-3 text-center">
                      <div className="font-bold text-amber-500 text-xl">{result.weekly_roi_breakeven_days.toFixed(1)}d</div>
                      <div className="lbl text-xs mt-0.5">Break-even</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    If you lose {result.weekly_roi_breakeven_days.toFixed(1)} or more working days per week due to disruptions, GigInsu₹ pays for itself.
                    With ₹{result.coverage_per_day}/day coverage, one qualifying event covers {((result.coverage_per_day / result.final_premium) * 7).toFixed(1)} days of premium.
                  </p>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
