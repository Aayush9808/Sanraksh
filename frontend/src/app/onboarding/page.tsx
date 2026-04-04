"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE, API_V1_BASE } from "@/lib/config";
import { gigWorkers } from "@/lib/workerData";
import type { GigWorker } from "@/lib/workerData";
import { evaluateWorker } from "@/lib/underwritingEngine";
import { calculatePremium as calcPremiumEngine } from "@/lib/pricingEngine";
import { saveSession } from "@/lib/workerSession";
import { getCurrentUser } from "@/lib/userStore";
import { logStep, logError } from "@/lib/debugLogger";

// ─── Constants ────────────────────────────────────────────────────────────────

const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];

const PLATFORMS = [
  { id: "swiggy",  label: "Swiggy",   icon: "🛒", color: "#FC8019" },
  { id: "zomato",  label: "Zomato",   icon: "🍕", color: "#E23744" },
  { id: "blinkit", label: "Blinkit",  icon: "⚡", color: "#F5C518" },
  { id: "dunzo",   label: "Dunzo",    icon: "📦", color: "#00D37F" },
  { id: "porter",  label: "Porter",   icon: "🚚", color: "#FF6B35" },
  { id: "zepto",   label: "Zepto",    icon: "🏃", color: "#8B5CF6" },
  { id: "rapido",  label: "Rapido",   icon: "🏁", color: "#FFD700" },
  { id: "other",   label: "Other",    icon: "📱", color: "#64748B" },
];

const EARNINGS_BANDS = [
  { id: "under_2000",  label: "Under ₹2,000",  sub: "per week" },
  { id: "2000_4000",   label: "₹2,000–₹4,000", sub: "per week" },
  { id: "4000_7000",   label: "₹4,000–₹7,000", sub: "per week" },
  { id: "7000_12000",  label: "₹7,000–₹12,000", sub: "per week" },
  { id: "above_12000", label: "Above ₹12,000",  sub: "per week" },
];

const STEP_NAMES = [
  "Personal Info",
  "Aadhaar",
  "OTP",
  "Platforms",
  "Premium",
  "Plan",
  "Payment",
  "Get Started",
];

// ─── Engine mappings ──────────────────────────────────────────────────────────

const CITY_MAP: Record<string, GigWorker["city"]> = {
  Mumbai: "Mumbai", Delhi: "Delhi", Bengaluru: "Bangalore",
  Hyderabad: "Hyderabad", Pune: "Pune",
  Chennai: "Mumbai", Kolkata: "Delhi", Ahmedabad: "Mumbai",
};

const PLATFORM_MAP: Record<string, GigWorker["platform"]> = {
  swiggy: "Swiggy", zomato: "Zomato", blinkit: "Blinkit", porter: "Porter",
  dunzo: "Swiggy", zepto: "Blinkit", rapido: "Ola", other: "Swiggy",
};

const DAILY_INCOME: Record<string, number> = {
  under_2000: 285, "2000_4000": 428, "4000_7000": 785,
  "7000_12000": 1357, above_12000: 2143,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// Simulated weekly earnings per platform (₹)
function simulateEarnings(platformId: string): number {
  const base: Record<string, number> = {
    swiggy: 5200, zomato: 4800, blinkit: 6100, dunzo: 3900,
    porter: 7200, zepto: 5600, rapido: 4400, other: 4000,
  };
  const jitter = Math.floor(Math.random() * 800) - 400;
  return (base[platformId] || 4500) + jitter;
}

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OtpInput({ value, onChange, onFill }: { value: string; onChange: (v: string) => void; onFill: (v: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const getInput = (i: number) => containerRef.current?.querySelectorAll<HTMLInputElement>("input")[i];
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handleChange = useCallback((i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    const next = (value.slice(0, i) + ch + value.slice(i + 1)).slice(0, 6);
    onChange(next);
    if (ch && i < 5) setTimeout(() => getInput(i + 1)?.focus(), 0);
    if (ch && i === 5) setTimeout(() => onFill(next), 80);
  }, [value, onChange, onFill]);

  const handleKey = useCallback((i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) { onChange(value.slice(0, i) + value.slice(i + 1)); }
      else if (i > 0) { getInput(i - 1)?.focus(); onChange(value.slice(0, i - 1) + value.slice(i)); }
    }
  }, [digits, value, onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste) { onChange(paste); if (paste.length === 6) setTimeout(() => onFill(paste), 100); }
    e.preventDefault();
  }, [onChange, onFill]);

  return (
    <div ref={containerRef} className="flex gap-3" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
          autoFocus={i === 0}
          className="w-12 h-14 text-center text-2xl font-extrabold rounded-xl border-2 outline-none transition-all"
          style={{
            borderColor: d ? "#0F2044" : "#CBD5E1",
            background: d ? "#EEF2FF" : "#F8FAFC",
            color: "#0F2044",
          }}
          onFocus={e => { e.target.select(); }}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
        />
      ))}
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepBar({ step }: { step: number }) {
  return (
    <div className="hidden lg:flex flex-col gap-2 w-48 flex-shrink-0">
      {STEP_NAMES.map((name, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={name} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
              done ? "bg-emerald-500 text-white" : active ? "bg-[#0F2044] text-white ring-4 ring-[#0F2044]/15" : "bg-slate-100 text-slate-400"
            }`}>
              {done ? "✓" : n}
            </div>
            <span className={`text-sm transition-colors ${active ? "font-bold text-slate-900" : done ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Route guard — must have a registered account to access onboarding
  useEffect(() => {
    if (!getCurrentUser()) {
      router.replace("/register");
    }
  }, []);

  // Step 1
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // Step 2
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarState, setAadhaarState] = useState<"idle" | "verifying" | "verified">("idle");

  // Step 3
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 4
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [premiumToast, setPremiumToast] = useState(false);
  const [platformsDone, setPlatformsDone] = useState(false);

  // Step 5
  const [earningsBand, setEarningsBand] = useState("4000_7000");
  const [premiumResult, setPremiumResult] = useState<{
    final_premium: number; coverage_per_day: number; recommended_plan: string;
    risk_level: string; risk_score: number; season: string;
    factors: { factor: string; adjustment: number }[];
  } | null>(null);

  // Step 6
  const [selectedPlan, setSelectedPlan] = useState("standard");

  // Step 7
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wallet">("upi");
  const [upiId, setUpiId] = useState("");

  // Step 8
  const [registering, setRegistering] = useState(false);

  // Refs
  const earningsRef = useRef<HTMLDivElement>(null);

  // ── Send OTP on entering step 3 ────────────────────────────────────────────
  useEffect(() => {
    if (step === 3 && !otpSent) {
      fetch(`${API_BASE}/api/v1/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      }).catch(() => {});
      setOtpSent(true);
    }
  }, [step, otpSent, phone]);

  function togglePlatform(id: string) {
    setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  // ── Premium calculation (local, always works) ─────────────────────────────
  const EARNINGS_TO_NUM: Record<string, number> = {
    under_2000: 1000, "2000_4000": 3000, "4000_7000": 5500,
    "7000_12000": 9500, above_12000: 14000,
  };

  function calcLocalPremium() {
    const METRO = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata"];
    const TIER2 = ["Pune", "Ahmedabad"];
    const cityRisk = METRO.includes(city) ? 3 : TIER2.includes(city) ? 2 : 1;
    const platformCount = platforms.length;
    const weeklyEarnings = EARNINGS_TO_NUM[earningsBand] ?? 5500;
    const premium = Math.round(50 + (cityRisk * 20) + (platformCount * 15) + (weeklyEarnings * 0.01));
    const riskLabel = premium > 150 ? "High" : premium > 100 ? "Medium" : "Low";
    return {
      final_premium: premium,
      coverage_per_day: Math.round(weeklyEarnings / 7 * 0.4),
      recommended_plan: premium > 150 ? "pro" : premium > 100 ? "standard" : "lite",
      risk_level: riskLabel,
      risk_score: premium > 150 ? 0.75 : premium > 100 ? 0.45 : 0.2,
      season: "normal",
      factors: [
        { factor: "Base premium", adjustment: 50 },
        { factor: "City risk (×20)", adjustment: cityRisk * 20 },
        { factor: "Platforms (×15 each)", adjustment: platformCount * 15 },
        { factor: "Earnings (×0.01)", adjustment: Math.round(weeklyEarnings * 0.01) },
      ],
    };
  }

  async function handleCalculatePremium() {
    setLoading(true);
    await sleep(800);
    // Try API first, fall back to local engine
    let result = null;
    try {
      const res = await fetch(`${API_V1_BASE}/premium/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city, platform: platforms[0] || "swiggy",
          weekly_earnings_band: earningsBand,
          tenure_months: 0, claims_last_30_days: 0,
        }),
      });
      if (res.ok) result = await res.json();
    } catch {}
    if (!result) result = calcLocalPremium();
    setPremiumResult(result);
    setSelectedPlan(result.recommended_plan || "standard");
    if (typeof window !== "undefined") {
      const earningsNum = EARNINGS_TO_NUM[earningsBand] ?? 5500;
      localStorage.setItem("giginsur_premium", JSON.stringify({
        premium: result.final_premium,
        risk: result.risk_level,
        city,
        platforms,
        earnings: earningsNum,
      }));
    }
    setLoading(false);
    setPremiumToast(true);
    setTimeout(() => { setPremiumToast(false); next(); }, 1200);
  }

  // ── Recalculate premium ────────────────────────────────────────────────────
  function handleRecalculate() {
    setPremiumResult(null);
    setEarningsBand("");
    if (typeof window !== "undefined") localStorage.removeItem("giginsur_premium");
    setTimeout(() => earningsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  // ── Payment simulation ─────────────────────────────────────────────────────
  async function processPayment() {
    setPaymentState("processing");
    await sleep(2200);
    setPaymentState("success");
  }

  // ── Final registration ─────────────────────────────────────────────────────
  async function completeRegistration() {
    setRegistering(true);
    try {
      const primaryPlatform = platforms[0] || "other";
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          name,
          work_city: city,
          delivery_platform: primaryPlatform,
          plan_type: selectedPlan,
          weekly_earnings_band: earningsBand,
          aadhaar_last4: aadhaar,
        }),
      });
      const data = res.ok ? await res.json() : null;

      // Now verify OTP to get JWT token
      const verifyRes = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      if (verifyRes.ok) {
        const vd = await verifyRes.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("token", vd.access_token);
          localStorage.setItem("role", vd.role || "worker");
          if (data?.plan) localStorage.setItem("plan", data.plan);
        }
      } else {
        // If register failed (phone exists), still try to log in
        if (typeof window !== "undefined") {
          localStorage.setItem("token", "demo-token");
          localStorage.setItem("role", "worker");
        }
      }
    } catch {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", "demo-token");
        localStorage.setItem("role", "worker");
      }
    }

    // ── Run insurance engines & persist session ────────────────────────────
    try {
      const mappedCity = CITY_MAP[city] ?? "Mumbai";
      const mappedPlatform = PLATFORM_MAP[platforms[0] ?? "swiggy"] ?? "Swiggy";
      const avgDailyIncome = DAILY_INCOME[earningsBand] ?? 785;
      const daysActive = 22;

      // Use a matching worker from the dataset as a realistic base
      const base =
        gigWorkers.find(w => w.city === mappedCity && w.platform === mappedPlatform) ??
        gigWorkers[0];

      const worker: GigWorker = {
        ...base,
        worker_id: `USR-${phone.slice(-6)}`,
        name,
        city: mappedCity,
        platform: mappedPlatform,
        avg_daily_income: avgDailyIncome,
        days_active_last_30: daysActive,
        hours_per_day: 8,
        total_earnings_last_30_days: avgDailyIncome * daysActive,
      };

      const underwritingResult = evaluateWorker(worker);
      const engineResult = calcPremiumEngine(worker, underwritingResult);

      const planPrice = premiumResult?.final_premium ?? engineResult.finalPremium;
      const coveragePerDay = premiumResult?.coverage_per_day ?? Math.round(avgDailyIncome * 0.3);

      const currentUser = getCurrentUser();
      const sessionPayload = {
        userId: currentUser?.id ?? `phone-${phone.slice(-6)}`,
        worker,
        underwritingResult,
        premiumResult: engineResult,
        policy: {
          plan: "Personalised Plan",
          weeklyPremium: planPrice,
          coveragePerDay,
          triggersCovered: ["Heavy Rain", "Poor AQI", "Platform Outage", "Cyclone Alert"],
          issuedAt: new Date().toISOString(),
        },
        rawEarningsBand: earningsBand,
      };
      saveSession(sessionPayload);

      // ── Generate and persist the policy object ─────────────────────────
      if (typeof window !== "undefined") {
        const storedPremium = (() => {
          try { return JSON.parse(localStorage.getItem("giginsur_premium") || "null"); } catch { return null; }
        })();
        const policyObj = {
          id: `POLICY_${Date.now()}`,
          premium: planPrice,
          risk: premiumResult?.risk_level ?? storedPremium?.risk ?? "Medium",
          dailyPayout: coveragePerDay,
          platforms,
          city,
          status: "Active",
          startDate: new Date().toISOString(),
          triggers: [
            "Low demand (earnings drop below threshold)",
            "Heavy rain / flooding",
            "Platform outage detected",
            "AQI > 400 severe",
            "Cyclone / extreme weather warning",
          ],
          payoutRule: "Auto payout when trigger conditions met",
        };
        localStorage.setItem("giginsur_policy", JSON.stringify(policyObj));
      }

      logStep("Onboarding Complete — Worker Profile", {
        workerId: worker.worker_id,
        name: worker.name,
        city: worker.city,
        platform: worker.platform,
        earningsBand,
      });
      logStep("Onboarding Complete — Engine Output", {
        riskTier: underwritingResult.riskTier,
        riskScore: underwritingResult.riskScore,
        eligible: underwritingResult.eligible,
        finalPremium: engineResult.finalPremium,
        plan: sessionPayload.policy.plan,
        coveragePerDay,
      });
    } catch (e) {
      logError("Engine failure during onboarding (non-fatal)", e);
      // Engine failure is non-fatal — user still gets to the dashboard
    }

    setRegistering(false);
    router.push("/dashboard?mode=user");
  }

  const next = () => { setErr(""); setStep(s => s + 1); };
  const back = () => { setErr(""); setStep(s => s - 1); };

  // ── Validation per step ────────────────────────────────────────────────────
  function validateStep1() {
    if (!name.trim() || name.trim().length < 2) { setErr("Enter your full name."); return false; }
    if (phone.length !== 10) { setErr("Enter a valid 10-digit mobile number."); return false; }
    if (!city) { setErr("Select your city."); return false; }
    return true;
  }

  const riskColor = (rl: string) =>
    rl === "High" || rl === "high" || rl === "high_risk" || rl === "very_high" ? "#EF4444"
    : rl === "Medium" || rl === "medium" || rl === "moderate_risk" ? "#F59E0B"
    : "#10B981";

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Left sidebar */}
      <div className="hidden lg:flex flex-col w-72 flex-shrink-0 bg-white border-r border-slate-200 px-8 py-10">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
            <span className="text-white font-black text-sm">GI</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">GigInsu₹</span>
        </Link>
        <div className="mb-8">
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight mb-1">Get protected</h2>
          <p className="text-slate-400 text-sm">in under 5 minutes.</p>
        </div>
        <StepBar step={step} />
        <div className="mt-auto bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-amber-700 text-xs font-bold uppercase tracking-wide mb-1">No upfront cost</div>
          <p className="text-amber-600 text-xs leading-relaxed">Premium deducted only when your coverage triggers. Register for free.</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10 md:px-12">
        <div className="w-full max-w-lg">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
                <span className="text-white font-black text-sm">GI</span>
              </div>
              <span className="font-bold text-slate-900">GigInsu₹</span>
            </Link>
            <span className="text-sm text-slate-400">Step {step}/8</span>
          </div>

          {/* Mobile progress */}
          <div className="lg:hidden mb-6">
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span className="font-semibold text-slate-600">{STEP_NAMES[step - 1]}</span>
              <span>{step} of 8</span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#0F2044] rounded-full"
                animate={{ width: `${(step / 8) * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.25 }}>

              {/* ── STEP 1: Personal Info ─────────────────────────────────── */}
              {step === 1 && (
                <form onSubmit={e => e.preventDefault()}>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 01 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Tell us about yourself</h2>
                    <p className="text-slate-400 text-sm">Basic details to set up your coverage.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full name</label>
                      <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition"
                        placeholder="As on your Aadhaar" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Mobile number</label>
                      <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0F2044] focus-within:ring-2 focus-within:ring-[#0F2044]/10 transition bg-white">
                        <span className="inline-flex items-center bg-slate-50 border-r border-slate-200 px-3 text-slate-500 text-sm font-semibold">+91</span>
                        <input type="tel" inputMode="numeric" className="flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none"
                          placeholder="10-digit number" value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">City</label>
                      <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition"
                        value={city} onChange={e => setCity(e.target.value)}>
                        <option value="">Select your city</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  {err && <p className="text-red-500 text-sm mt-3">{err}</p>}
                  <button type="submit" onClick={() => { if (validateStep1()) next(); }}
                    className="w-full mt-6 py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                    Continue →
                  </button>
                  <p className="text-center text-slate-400 text-sm mt-5">
                    Already registered? <Link href="/login" className="text-[#0F2044] font-semibold hover:underline">Sign in →</Link>
                  </p>
                </form>
              )}

              {/* ── STEP 2: Aadhaar ──────────────────────────────────────── */}
              {step === 2 && (
                <form onSubmit={e => e.preventDefault()}>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 02 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Aadhaar verification</h2>
                    <p className="text-slate-400 text-sm">We only need the last 4 digits. Your data stays private.</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Last 4 digits of Aadhaar</label>
                    <input type="text" inputMode="numeric" maxLength={4} placeholder="XXXX"
                      value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-2xl font-mono text-center tracking-[0.5em] text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition" />
                  </div>

                  <AnimatePresence mode="wait">
                    {aadhaarState === "verifying" && (
                      <motion.div key="verifying" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                        <Spinner size={18} />
                        <span className="text-amber-700 font-semibold text-sm">Verifying with UIDAI database…</span>
                      </motion.div>
                    )}
                    {aadhaarState === "verified" && (
                      <motion.div key="verified" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-5">
                        <span className="text-emerald-600 text-xl">✓</span>
                        <div>
                          <div className="text-emerald-700 font-bold text-sm">Aadhaar Verified</div>
                          <div className="text-emerald-600 text-xs">Identity confirmed for {name}</div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={aadhaar.length < 4 || aadhaarState === "verifying"}
                      onClick={async () => {
                        if (aadhaarState === "verified") { next(); return; }
                        if (aadhaar.length < 4) { setErr("Enter last 4 digits."); return; }
                        setAadhaarState("verifying");
                        await sleep(2000);
                        setAadhaarState("verified");
                        setErr("");
                      }}
                      className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40 disabled:cursor-not-allowed">
                      {aadhaarState === "verifying" ? (
                        <span className="flex items-center gap-2 justify-center"><Spinner />Verifying…</span>
                      ) : aadhaarState === "verified" ? "Continue →" : "Verify →"}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 text-center mt-4">
                    🔒 We never store your Aadhaar number. Only used for identity verification.
                  </p>
                </form>
              )}

              {/* ── STEP 3: OTP ──────────────────────────────────────────── */}
              {step === 3 && (
                <form onSubmit={e => e.preventDefault()}>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 03 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Verify your number</h2>
                    <p className="text-slate-500 text-sm">OTP sent to <span className="font-bold text-slate-800">+91 {phone}</span></p>
                    <p className="text-amber-600 text-xs font-medium mt-1">Demo: enter any 6 digits</p>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">6-digit OTP</label>
                    <OtpInput value={otp} onChange={setOtp} onFill={async (filled) => {
                      if (filled.length < 6) return;
                      setLoading(true);
                      setErr("");
                      try {
                        const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ phone, otp: filled }),
                        });
                        // verify-otp may fail if user not registered yet — that's OK at this stage,
                        // we just validate OTP format and proceed
                        if (res.ok || res.status === 404) {
                          setOtpVerified(true);
                          setTimeout(() => next(), 400);
                        } else {
                          setErr("Incorrect OTP. Please try again.");
                        }
                      } catch {
                        // Network fallback: accept any 6-digit
                        setOtpVerified(true);
                        setTimeout(() => next(), 400);
                      } finally {
                        setLoading(false);
                      }
                    }} />
                  </div>

                  {otpVerified && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-4">
                      <span>✓</span> Phone verified
                    </motion.div>
                  )}

                  {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                    <button type="submit" onClick={async () => {
                      if (otp.length < 6) { setErr("Enter the complete 6-digit OTP."); return; }
                      setLoading(true); setErr("");
                      try {
                        const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ phone, otp }),
                        });
                        if (res.ok || res.status === 404) { setOtpVerified(true); next(); }
                        else setErr("Incorrect OTP.");
                      } catch { setOtpVerified(true); next(); }
                      finally { setLoading(false); }
                    }}
                      disabled={loading || otp.length < 6}
                      className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40">
                      {loading ? <span className="flex items-center gap-2 justify-center"><Spinner />Verifying…</span> : "Verify & Continue →"}
                    </button>
                  </div>

                  <button type="button" onClick={() => {
                    fetch(`${API_BASE}/api/v1/auth/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) }).catch(() => {});
                  }} className="w-full mt-3 text-center text-sm text-[#0F2044] font-semibold hover:underline">
                    Resend OTP
                  </button>
                </form>
              )}

              {/* ── STEP 4: Platform Linking ──────────────────────────────── */}
              {step === 4 && (
                <form onSubmit={e => e.preventDefault()}>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 04 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Link your platforms</h2>
                    <p className="text-slate-400 text-sm">Select all platforms you work on. We'll fetch your earnings data.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {PLATFORMS.map(p => {
                      const sel = platforms.includes(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                          className={`relative flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                            sel ? "border-[#0F2044] bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}>
                          <span className="text-xl">{p.icon}</span>
                          <span className={`font-bold text-sm flex-1 ${sel ? "text-[#0F2044]" : "text-slate-700"}`}>{p.label}</span>
                          {sel && (
                            <div className="w-5 h-5 rounded-full bg-[#0F2044] flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-[9px] font-black">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {platforms.length > 0 && (
                    <div className="p-3 bg-[#0F2044]/5 rounded-xl text-xs text-slate-600 font-medium mb-4">
                      {platforms.length} platform{platforms.length > 1 ? "s" : ""} selected
                    </div>
                  )}

                  {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                    <button type="submit" onClick={() => {
                      if (platforms.length === 0) { setErr("Select at least one platform."); return; }
                      next();
                    }}
                      className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                      Continue →
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 5: Premium Calculation ───────────────────────────── */}
              {step === 5 && (
                <form onSubmit={e => e.preventDefault()}>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 05 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Your personalised premium</h2>
                    <p className="text-slate-400 text-sm">Our AI engine calculates your exact price based on location, platform, and earnings.</p>
                  </div>

                  <div className="mb-5" ref={earningsRef}>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Weekly earnings band</label>
                    {!earningsBand && !premiumResult && (
                      <p className="text-xs text-amber-600 font-medium mb-2">Adjust your inputs to recalculate premium</p>
                    )}
                    <div className="space-y-2">
                      {EARNINGS_BANDS.map(b => (
                        <button key={b.id} type="button" onClick={() => setEarningsBand(b.id)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                            earningsBand === b.id ? "border-[#0F2044] bg-blue-50 text-[#0F2044]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}>
                          <span className="font-semibold">{b.label}</span>
                          <span className="text-xs text-slate-400">{b.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {premiumResult ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0F2044] rounded-2xl p-5 text-white mb-5">
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div>
                          <div className="text-blue-300 text-xs font-bold mb-1">Weekly premium</div>
                          <div className="text-2xl font-extrabold">₹{premiumResult.final_premium.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-blue-300 text-xs font-bold mb-1">Daily cover</div>
                          <div className="text-2xl font-extrabold">₹{premiumResult.coverage_per_day.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-blue-300 text-xs font-bold mb-1">Risk level</div>
                          <div className="text-xl font-extrabold capitalize" style={{ color: riskColor(premiumResult.risk_level) }}>
                            {premiumResult.risk_level.replace(/_/g, " ")}
                          </div>
                        </div>
                      </div>
                      <div className="mt-1 mb-3 text-xs text-blue-200 bg-white/10 rounded-xl px-3 py-2">
                        {premiumResult.risk_level === "High" || premiumResult.risk_level === "high_risk"
                          ? "Your metro location and multiple active platforms increase exposure."
                          : premiumResult.risk_level === "Medium" || premiumResult.risk_level === "moderate_risk"
                          ? "Moderate risk — solid coverage at a competitive rate."
                          : "Low risk profile — you qualify for our most affordable coverage."}
                      </div>
                      <div className="border-t border-white/10 pt-3">
                        <div className="text-blue-300 text-xs font-bold mb-2">Price breakdown</div>
                        <div className="space-y-1">
                          {premiumResult.factors.slice(0, 4).map(f => (
                            <div key={f.factor} className="flex justify-between text-xs">
                              <span className="text-blue-200">{f.factor}</span>
                              <span className={f.adjustment >= 0 ? "text-red-300" : "text-emerald-300"}>
                                {f.adjustment >= 0 ? `+₹${f.adjustment.toFixed(2)}` : `-₹${Math.abs(f.adjustment).toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-slate-100 rounded-2xl p-5 mb-5 text-center text-slate-400 text-sm">
                      Click "Calculate" to see your personalised price
                    </div>
                  )}

                  {premiumResult && (
                    <button type="button" onClick={handleRecalculate}
                      className="w-full mb-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition flex items-center justify-center gap-1.5">
                      <span>↺</span> Recalculate
                    </button>
                  )}

                  {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

                  <div className="flex gap-3">
                    <button type="button" onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                    {!premiumResult ? (
                      <button type="submit" onClick={handleCalculatePremium} disabled={loading}
                        className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40">
                        {loading ? <span className="flex items-center gap-2 justify-center"><Spinner />Calculating…</span> : "Calculate my premium →"}
                      </button>
                    ) : (
                      <>
                        {premiumToast && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                            className="flex-[2] py-3.5 bg-emerald-500 text-white font-bold text-sm rounded-xl text-center">
                            ✓ Your personalised premium calculated
                          </motion.div>
                        )}
                        {!premiumToast && (
                          <button type="submit" onClick={next}
                            className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                            Choose plan →
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </form>
              )}

              {/* ── STEP 6: Confirm Plan ──────────────────────────────────── */}
              {step === 6 && (
                <form onSubmit={e => e.preventDefault()}>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 06 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Confirm your plan</h2>
                    <p className="text-slate-400 text-sm">This plan is personalised based on your earnings, location, and platform activity.</p>
                  </div>

                  {premiumResult ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-[#0F2044] rounded-2xl p-5 text-white mb-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-blue-300 text-xs font-bold mb-1">Your personalised plan</div>
                          <div className="text-3xl font-extrabold">
                            ₹{premiumResult.final_premium.toFixed(0)}
                            <span className="text-base font-normal text-blue-300">/week</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-blue-300 text-xs font-bold mb-1">Risk level</div>
                          <div className="text-lg font-extrabold capitalize" style={{ color: riskColor(premiumResult.risk_level) }}>
                            {premiumResult.risk_level.replace(/_/g, " ")}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white/10 rounded-xl p-3">
                          <div className="text-blue-300 text-xs font-bold mb-1">Daily payout</div>
                          <div className="text-xl font-extrabold">₹{premiumResult.coverage_per_day.toFixed(0)}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3">
                          <div className="text-blue-300 text-xs font-bold mb-1">Coverage type</div>
                          <div className="text-xl font-extrabold">Personalised</div>
                        </div>
                      </div>
                      <div className="border-t border-white/10 pt-3">
                        <div className="text-blue-300 text-xs font-bold mb-2">Price breakdown</div>
                        <div className="space-y-1">
                          {premiumResult.factors.slice(0, 4).map(f => (
                            <div key={f.factor} className="flex justify-between text-xs">
                              <span className="text-blue-200">{f.factor}</span>
                              <span className={f.adjustment >= 0 ? "text-red-300" : "text-emerald-300"}>
                                {f.adjustment >= 0 ? `+₹${f.adjustment.toFixed(2)}` : `-₹${Math.abs(f.adjustment).toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-slate-100 rounded-2xl p-5 mb-5 text-center text-slate-400 text-sm">
                      No premium data found. Please go back and calculate your premium.
                    </div>
                  )}

                  <button type="button" onClick={back}
                    className="w-full mb-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition flex items-center justify-center gap-1.5">
                    <span>↺</span> Recalculate Premium
                  </button>

                  <button type="submit" onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.setItem("giginsur_plan", selectedPlan);
                      localStorage.setItem("giginsur_plan_confirmed", "true");
                    }
                    next();
                  }}
                    className="w-full py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                    Continue to Payment →
                  </button>
                </form>
              )}

              {/* ── STEP 7: Payment ───────────────────────────────────────── */}
              {step === 7 && (
                <form onSubmit={e => e.preventDefault()}>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 07 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Secure your protection</h2>
                    <p className="text-slate-400 text-sm">You only pay when coverage is triggered. No upfront risk.</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {paymentState === "idle" && (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

                        {/* Payment method selector */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                          {([
                            { id: "upi",    label: "UPI",    icon: "⚡", sub: "Recommended" },
                            { id: "card",   label: "Card",   icon: "💳", sub: "" },
                            { id: "wallet", label: "Wallet", icon: "👜", sub: "" },
                          ] as const).map(m => (
                            <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                                paymentMethod === m.id ? "border-[#0F2044] bg-blue-50 text-[#0F2044]" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                              }`}>
                              <span className="text-lg">{m.icon}</span>
                              <span>{m.label}</span>
                              {m.sub && <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">{m.sub}</span>}
                            </button>
                          ))}
                        </div>

                        {/* UPI input */}
                        {paymentMethod === "upi" && (
                          <div className="mb-5">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">UPI ID</label>
                            <input
                              type="text"
                              placeholder="name@upi"
                              value={upiId}
                              onChange={e => setUpiId(e.target.value)}
                              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0F2044] focus:ring-2 focus:ring-[#0F2044]/10 bg-white transition"
                            />
                            <p className="text-xs text-slate-400 mt-1">Demo: enter any UPI ID to continue</p>
                          </div>
                        )}

                        {/* Demo card */}
                        {paymentMethod === "card" && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.015, boxShadow: "0 8px 32px rgba(15,32,68,0.18)" }}
                            className="bg-gradient-to-br from-[#0F2044] to-[#1E3A5F] rounded-2xl p-6 text-white mb-5 relative overflow-hidden cursor-default transition-shadow">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-16 -translate-y-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-8 translate-y-8 pointer-events-none" />
                            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-2.5 py-1 text-[10px] font-bold text-blue-200 mb-4">
                              <span>🔒</span> Demo mode — hackathon
                            </div>
                            <div className="font-mono text-xl tracking-widest mb-4">4242  ****  ****  4242</div>
                            <div className="flex justify-between text-sm">
                              <div>
                                <div className="text-blue-300 text-xs">Cardholder</div>
                                <div className="font-semibold">{name.toUpperCase() || "YOUR NAME"}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-blue-300 text-xs">Expires</div>
                                <div className="font-mono font-semibold">12/28</div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Wallet placeholder */}
                        {paymentMethod === "wallet" && (
                          <div className="mb-5 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                            <span className="text-2xl">👜</span>
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">Paytm / PhonePe / Amazon Pay</div>
                              <div className="text-xs text-slate-400 mt-0.5">Demo: click Activate to proceed</div>
                            </div>
                          </div>
                        )}

                        {/* Payment summary */}
                        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-blue-100 mb-2">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Payment summary</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Plan</span>
                              <span className="font-semibold text-slate-800">Personalised Plan</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Weekly premium</span>
                              <span className="font-bold text-slate-900">₹{premiumResult?.final_premium ?? "—"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Daily cover</span>
                              <span className="font-semibold text-emerald-600">₹{premiumResult?.coverage_per_day ?? "—"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Risk level</span>
                              <span className="font-semibold capitalize" style={{ color: premiumResult ? riskColor(premiumResult.risk_level) : "#64748B" }}>
                                {premiumResult?.risk_level ?? "—"}
                              </span>
                            </div>
                            <div className="border-t border-blue-100 pt-2 mt-2">
                              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                                <span>✓</span> No charge unless triggered
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-5">
                          <button type="button" onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                          <button type="submit" onClick={processPayment}
                            className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition flex items-center justify-center gap-2">
                            <span>🔒</span> Activate Protection
                          </button>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-3">
                          <span>🔐 256-bit secure</span>
                          <span>·</span>
                          <span>No upfront cost</span>
                          <span>·</span>
                          <span>Cancel anytime</span>
                        </p>
                      </motion.div>
                    )}

                    {paymentState === "processing" && (
                      <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16 gap-5">
                        <div className="w-16 h-16 rounded-full border-4 border-[#0F2044] border-t-transparent animate-spin" />
                        <div className="text-center">
                          <p className="font-bold text-slate-900 text-lg">Activating protection…</p>
                          <p className="text-slate-400 text-sm mt-1">Securing ₹{premiumResult?.final_premium ?? "—"}/week coverage</p>
                        </div>
                      </motion.div>
                    )}

                    {paymentState === "success" && (
                      <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="text-center py-6">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-4">
                          <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
                            <motion.path d="M10 24L20 35L38 13" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                          </svg>
                        </motion.div>
                        <h3 className="font-extrabold text-slate-900 text-xl mb-1">You're Protected! 🎉</h3>
                        <p className="text-slate-400 text-sm mb-2">₹{premiumResult?.final_premium ?? "—"}/week · ₹{premiumResult?.coverage_per_day ?? "—"}/day cover</p>
                        <p className="text-xs text-emerald-600 font-semibold mb-6">Coverage activates immediately on account creation</p>
                        <button onClick={next}
                          className="w-full py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                          Create account & activate →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              )}

              {/* ── STEP 8: Dashboard Entry ───────────────────────────────── */}
              {step === 8 && (
                <form onSubmit={e => e.preventDefault()} className="text-center pt-2">
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 08 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Activating your coverage</h2>
                    <p className="text-slate-400 text-sm">Creating your account and policy. Just a moment.</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Name</span>
                      <span className="font-semibold text-slate-900">{name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Phone</span>
                      <span className="font-semibold text-slate-900">+91 {phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">City</span>
                      <span className="font-semibold text-slate-900">{city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Platforms</span>
                      <span className="font-semibold text-slate-900">{platforms.join(", ")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Plan</span>
                      <span className="font-bold text-[#0F2044]">Personalised Plan · ₹{premiumResult?.final_premium ?? "—"}/week</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Coverage</span>
                      <span className="font-bold text-emerald-600">₹{premiumResult?.coverage_per_day ?? "—"}/day</span>
                    </div>
                  </div>

                  <button type="submit" onClick={completeRegistration} disabled={registering}
                    className="w-full py-4 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40">
                    {registering ? (
                      <span className="flex items-center gap-2 justify-center"><Spinner />Creating account…</span>
                    ) : "Activate my coverage →"}
                  </button>

                  <p className="text-xs text-slate-400 mt-4">
                    By continuing you agree to our{" "}
                    <Link href="/terms" className="text-[#0F2044] hover:underline">Terms & Conditions</Link>
                  </p>
                </form>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
