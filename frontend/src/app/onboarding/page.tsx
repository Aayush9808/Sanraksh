"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE, API_V1_BASE } from "@/lib/config";

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
  const [fetchingPlatform, setFetchingPlatform] = useState<string | null>(null);
  const [platformEarnings, setPlatformEarnings] = useState<Record<string, number>>({});
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

  // Step 8
  const [registering, setRegistering] = useState(false);

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

  // ── Simulate platform earnings fetch on step 4 ─────────────────────────────
  async function fetchPlatformEarnings(id: string) {
    setFetchingPlatform(id);
    await sleep(1200 + Math.random() * 600);
    setPlatformEarnings(prev => ({ ...prev, [id]: simulateEarnings(id) }));
    setFetchingPlatform(null);
  }

  function togglePlatform(id: string) {
    if (platforms.includes(id)) {
      setPlatforms(p => p.filter(x => x !== id));
      setPlatformEarnings(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      setPlatforms(p => [...p, id]);
      fetchPlatformEarnings(id);
    }
  }

  // ── Premium calculation ────────────────────────────────────────────────────
  async function calculatePremium() {
    setLoading(true);
    try {
      const res = await fetch(`${API_V1_BASE}/premium/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          platform: platforms[0] || "swiggy",
          weekly_earnings_band: earningsBand,
          tenure_months: 0,
          claims_last_30_days: 0,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPremiumResult(data);
        setSelectedPlan(data.recommended_plan || "standard");
      }
    } catch {}
    setLoading(false);
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
    setRegistering(false);
    router.push("/dashboard");
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

  const PLAN_DETAILS: Record<string, { label: string; price: number; cover: number; desc: string }> = {
    lite:     { label: "Lite",     price: 29, cover: 150, desc: "Basic rainfall & outage cover" },
    standard: { label: "Standard", price: 49, cover: 280, desc: "Most popular — all major triggers" },
    pro:      { label: "Pro",      price: 79, cover: 400, desc: "Max coverage including cyclone" },
  };

  const riskColor = (rl: string) =>
    rl === "high" || rl === "very_high" ? "#EF4444" : rl === "medium" ? "#F59E0B" : "#10B981";

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Left sidebar */}
      <div className="hidden lg:flex flex-col w-72 flex-shrink-0 bg-white border-r border-slate-200 px-8 py-10">
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
            <span className="text-white font-black text-sm">GA</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">GigArmor</span>
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
                <span className="text-white font-black text-sm">GA</span>
              </div>
              <span className="font-bold text-slate-900">GigArmor</span>
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
                <div>
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
                  <button onClick={() => { if (validateStep1()) next(); }}
                    className="w-full mt-6 py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                    Continue →
                  </button>
                  <p className="text-center text-slate-400 text-sm mt-5">
                    Already registered? <Link href="/login" className="text-[#0F2044] font-semibold hover:underline">Sign in →</Link>
                  </p>
                </div>
              )}

              {/* ── STEP 2: Aadhaar ──────────────────────────────────────── */}
              {step === 2 && (
                <div>
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
                    <button onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                      ← Back
                    </button>
                    <button
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
                </div>
              )}

              {/* ── STEP 3: OTP ──────────────────────────────────────────── */}
              {step === 3 && (
                <div>
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
                    <button onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                    <button onClick={async () => {
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

                  <button onClick={() => {
                    fetch(`${API_BASE}/api/v1/auth/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) }).catch(() => {});
                  }} className="w-full mt-3 text-center text-sm text-[#0F2044] font-semibold hover:underline">
                    Resend OTP
                  </button>
                </div>
              )}

              {/* ── STEP 4: Platform Linking ──────────────────────────────── */}
              {step === 4 && (
                <div>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 04 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Link your platforms</h2>
                    <p className="text-slate-400 text-sm">Select all platforms you work on. We'll fetch your earnings data.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {PLATFORMS.map(p => {
                      const sel = platforms.includes(p.id);
                      const fetching = fetchingPlatform === p.id;
                      const earnings = platformEarnings[p.id];
                      return (
                        <button key={p.id} type="button" onClick={() => togglePlatform(p.id)}
                          className={`relative flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                            sel ? "border-[#0F2044] bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}>
                          <div className="flex items-center gap-2 w-full">
                            <span className="text-xl">{p.icon}</span>
                            <span className={`font-bold text-sm flex-1 ${sel ? "text-[#0F2044]" : "text-slate-700"}`}>{p.label}</span>
                            {sel && !fetching && !earnings && (
                              <div className="w-5 h-5 rounded-full bg-[#0F2044] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[9px] font-black">✓</span>
                              </div>
                            )}
                          </div>
                          <AnimatePresence>
                            {fetching && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex items-center gap-1.5 text-xs text-slate-400">
                                <Spinner size={12} />
                                <span>Fetching earnings…</span>
                              </motion.div>
                            )}
                            {earnings && !fetching && (
                              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                className="text-xs font-bold text-emerald-600">
                                ₹{earnings.toLocaleString()}/week avg
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      );
                    })}
                  </div>

                  {platforms.length > 0 && (
                    <div className="p-3 bg-[#0F2044]/5 rounded-xl text-xs text-slate-600 font-medium mb-4">
                      {platforms.length} platform{platforms.length > 1 ? "s" : ""} linked
                      {Object.keys(platformEarnings).length > 0 && (
                        <span className="text-emerald-600 font-bold ml-2">
                          · Avg ₹{Math.round(Object.values(platformEarnings).reduce((a, b) => a + b, 0) / Object.values(platformEarnings).length).toLocaleString()}/week
                        </span>
                      )}
                    </div>
                  )}

                  {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

                  <div className="flex gap-3">
                    <button onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                    <button onClick={() => {
                      if (platforms.length === 0) { setErr("Select at least one platform."); return; }
                      if (fetchingPlatform) { setErr("Please wait for earnings to load."); return; }
                      next();
                    }} disabled={!!fetchingPlatform}
                      className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40">
                      Continue →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Premium Calculation ───────────────────────────── */}
              {step === 5 && (
                <div>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 05 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Your personalised premium</h2>
                    <p className="text-slate-400 text-sm">Our AI engine calculates your exact price based on location, platform, and earnings.</p>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Weekly earnings band</label>
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
                            {premiumResult.risk_level.replace("_", " ")}
                          </div>
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
                      Click "Calculate" to see your personalised price
                    </div>
                  )}

                  {err && <p className="text-red-500 text-sm mb-3">{err}</p>}

                  <div className="flex gap-3">
                    <button onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                    {!premiumResult ? (
                      <button onClick={calculatePremium} disabled={loading}
                        className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40">
                        {loading ? <span className="flex items-center gap-2 justify-center"><Spinner />Calculating…</span> : "Calculate my premium →"}
                      </button>
                    ) : (
                      <button onClick={next}
                        className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                        Choose plan →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 6: Plan Selection ────────────────────────────────── */}
              {step === 6 && (
                <div>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 06 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Choose your plan</h2>
                    {premiumResult && (
                      <p className="text-sm text-emerald-600 font-semibold mt-1">
                        AI recommends: <span className="capitalize">{premiumResult.recommended_plan}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-5">
                    {(["lite", "standard", "pro"] as const).map(pid => {
                      const p = PLAN_DETAILS[pid];
                      const sel = selectedPlan === pid;
                      const recommended = premiumResult?.recommended_plan === pid;
                      return (
                        <button key={pid} type="button" onClick={() => setSelectedPlan(pid)}
                          className={`relative w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                            sel ? "border-[#0F2044] bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}>
                          {recommended && (
                            <span className="absolute -top-2.5 left-4 bg-amber-400 text-[#0F2044] text-[10px] font-black px-2 py-0.5 rounded-full">
                              ✦ AI Recommended
                            </span>
                          )}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${sel ? "bg-[#0F2044] text-white" : "bg-slate-100 text-slate-500"}`}>
                            {sel ? "✓" : p.label[0]}
                          </div>
                          <div className="flex-1">
                            <div className={`font-bold ${sel ? "text-[#0F2044]" : "text-slate-800"}`}>{p.label}</div>
                            <div className="text-slate-400 text-xs mt-0.5">{p.desc}</div>
                            <div className="text-xs text-emerald-600 font-semibold mt-1">₹{p.cover}/day payout</div>
                          </div>
                          <div className={`text-right font-extrabold text-xl flex-shrink-0 ${sel ? "text-[#0F2044]" : "text-slate-700"}`}>
                            ₹{p.price}<span className="text-xs font-normal text-slate-400">/wk</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                    <button onClick={next}
                      className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                      Continue with {PLAN_DETAILS[selectedPlan]?.label} →
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 7: Payment ───────────────────────────────────────── */}
              {step === 7 && (
                <div>
                  <div className="mb-7">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step 07 of 08</p>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Payment setup</h2>
                    <p className="text-slate-400 text-sm">First week: ₹{PLAN_DETAILS[selectedPlan]?.price}. Subsequent weeks auto-deducted only when triggered.</p>
                  </div>

                  <AnimatePresence mode="wait">
                    {paymentState === "idle" && (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* Demo card */}
                        <div className="bg-gradient-to-br from-[#0F2044] to-[#1E3A5F] rounded-2xl p-6 text-white mb-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
                          <div className="text-xs font-bold text-blue-300 mb-4">DEMO CARD — for hackathon</div>
                          <div className="font-mono text-xl tracking-widest mb-4">4242  4242  4242  4242</div>
                          <div className="flex justify-between text-sm">
                            <div>
                              <div className="text-blue-300 text-xs">Cardholder</div>
                              <div className="font-semibold">{name.toUpperCase()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-300 text-xs">Expires</div>
                              <div className="font-mono font-semibold">12/28</div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Plan</span>
                            <span className="font-semibold text-slate-800">{PLAN_DETAILS[selectedPlan]?.label}</span>
                          </div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Amount</span>
                            <span className="font-bold text-slate-900">₹{PLAN_DETAILS[selectedPlan]?.price}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Next charge</span>
                            <span className="text-slate-400 text-xs">Only when triggered</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button onClick={back} className="flex-1 py-3.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">← Back</button>
                          <button onClick={processPayment}
                            className="flex-[2] py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                            Pay ₹{PLAN_DETAILS[selectedPlan]?.price} →
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {paymentState === "processing" && (
                      <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-16 gap-5">
                        <div className="w-16 h-16 rounded-full border-4 border-[#0F2044] border-t-transparent animate-spin" />
                        <div className="text-center">
                          <p className="font-bold text-slate-900 text-lg">Processing payment…</p>
                          <p className="text-slate-400 text-sm mt-1">Securing your ₹{PLAN_DETAILS[selectedPlan]?.price}</p>
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
                        <h3 className="font-extrabold text-slate-900 text-xl mb-1">Payment successful!</h3>
                        <p className="text-slate-400 text-sm mb-6">₹{PLAN_DETAILS[selectedPlan]?.price} charged. Your coverage activates on signup.</p>
                        <button onClick={next}
                          className="w-full py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition">
                          Create account & activate →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── STEP 8: Dashboard Entry ───────────────────────────────── */}
              {step === 8 && (
                <div className="text-center pt-2">
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
                      <span className="font-bold text-[#0F2044] capitalize">{selectedPlan} · ₹{PLAN_DETAILS[selectedPlan]?.price}/week</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">Coverage</span>
                      <span className="font-bold text-emerald-600">₹{PLAN_DETAILS[selectedPlan]?.cover}/day</span>
                    </div>
                  </div>

                  <button onClick={completeRegistration} disabled={registering}
                    className="w-full py-4 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40">
                    {registering ? (
                      <span className="flex items-center gap-2 justify-center"><Spinner />Creating account…</span>
                    ) : "Activate my coverage →"}
                  </button>

                  <p className="text-xs text-slate-400 mt-4">
                    By continuing you agree to our{" "}
                    <Link href="/terms" className="text-[#0F2044] hover:underline">Terms & Conditions</Link>
                  </p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
