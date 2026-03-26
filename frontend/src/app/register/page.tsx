"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../../lib/config";

const PLATFORMS = ["zomato", "swiggy", "amazon", "zepto", "blinkit", "other"];
const PLATFORM_META: Record<string, { icon: string; color: string }> = {
  zomato: { icon: "🔴", color: "border-red-500/50 bg-red-500/10 text-red-400" },
  swiggy: { icon: "🟠", color: "border-orange-500/50 bg-orange-500/10 text-orange-400" },
  amazon: { icon: "🔵", color: "border-blue-500/50 bg-blue-500/10 text-blue-400" },
  zepto: { icon: "🟣", color: "border-purple-500/50 bg-purple-500/10 text-purple-400" },
  blinkit: { icon: "🟡", color: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400" },
  other: { icon: "⚪", color: "border-slate-500/50 bg-slate-500/10 text-slate-400" },
};
const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai"];
const CITY_ZONES: Record<string, string[]> = {
  Mumbai: ["Andheri West","Bandra","Kurla","Dadar","Lower Parel","Borivali","Malad","Goregaon","Powai","Juhu"],
  Delhi: ["Connaught Place","Lajpat Nagar","Hauz Khas","Saket","Dwarka","Rohini","Janakpuri","Gurugram"],
  Bengaluru: ["Koramangala","Indiranagar","HSR Layout","Whitefield","Marathahalli","Jayanagar","BTM Layout"],
  Pune: ["Kothrud","Viman Nagar","Hadapsar","Wakad","Aundh","Hinjewadi","Baner","Shivajinagar"],
  Hyderabad: ["Hitech City","Gachibowli","Banjara Hills","Jubilee Hills","Secunderabad","Ameerpet"],
  Chennai: ["T Nagar","Anna Nagar","Velachery","Tambaram","OMR","Adyar","Mylapore"],
};

/* ── animated background ── */
function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── step indicator dots ── */
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-1.5 rounded-full transition-all ${i < current ? "bg-cyan-500" : i === current ? "bg-cyan-400" : "bg-slate-700"}`}
          animate={{ width: i === current ? 32 : i < current ? 20 : 12 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        />
      ))}
    </div>
  );
}

/* ── OTP input boxes ── */
function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleKey = useCallback((idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  }, [digits]);

  const handleChange = useCallback((idx: number, char: string) => {
    const d = char.replace(/\D/g, "").slice(0, 1);
    if (!d) return;
    const arr = [...digits];
    arr[idx] = d;
    onChange(arr.join("").replace(/ /g, ""));
    if (idx < 5) refs.current[idx + 1]?.focus();
  }, [digits, onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  }, [onChange]);

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <motion.input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="w-11 h-14 bg-slate-700/50 border border-slate-600 text-white text-xl font-bold text-center rounded-xl
            focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 focus:bg-slate-700 transition-all"
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({ name: "", phone: "", email: "", delivery_platform: "zomato", work_city: "Mumbai", work_zone: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fullPhone = "+91" + form.phone.replace(/\D/g, "");
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: fullPhone }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Registration failed");
      }
      setDemoMode(false);
    } catch (err: unknown) {
      const isNetworkErr = err instanceof TypeError || (err instanceof Error && err.name === "TimeoutError");
      if (!isNetworkErr) {
        setError(err instanceof Error ? err.message : "Registration failed");
        setLoading(false);
        return;
      }
      setDemoMode(true);
    }
    setForm(f => ({ ...f, phone: fullPhone }));
    setStep("otp");
    setLoading(false);
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (demoMode) {
      if (otp !== "123456") {
        setError("Demo OTP is 123456");
        setLoading(false);
        return;
      }
      setSuccess(true);
      localStorage.setItem("gigarmor_token", "demo_token_" + Date.now());
      localStorage.setItem("gigarmor_user", JSON.stringify({
        name: form.name, phone: form.phone, email: form.email,
        platform: form.delivery_platform, city: form.work_city, zone: form.work_zone,
        role: "worker", id: "demo-new-" + Date.now(),
      }));
      setTimeout(() => router.push("/dashboard/my-policy"), 600);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, otp }),
        signal: AbortSignal.timeout(4000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      setSuccess(true);
      localStorage.setItem("gigarmor_token", data.access_token);
      localStorage.setItem("gigarmor_user", JSON.stringify(data.user));
      setTimeout(() => router.push(data.user?.role === "admin" ? "/dashboard" : "/dashboard/my-policy"), 600);
    } catch (err: unknown) {
      const isNetworkErr = err instanceof TypeError || (err instanceof Error && err.name === "TimeoutError");
      if (isNetworkErr && otp === "123456") {
        setSuccess(true);
        localStorage.setItem("gigarmor_token", "demo_token_" + Date.now());
        localStorage.setItem("gigarmor_user", JSON.stringify({
          name: form.name, phone: form.phone, platform: form.delivery_platform,
          city: form.work_city, zone: form.work_zone, role: "worker", id: "demo-" + Date.now(),
        }));
        setTimeout(() => router.push("/dashboard/my-policy"), 600);
      } else {
        setError(isNetworkErr ? "Backend offline — use OTP 123456" : (err instanceof Error ? err.message : "Invalid OTP"));
      }
    } finally {
      setLoading(false);
    }
  }

  const zones = CITY_ZONES[form.work_city] || [];

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
    exit: { opacity: 0, y: -20, scale: 0.96, transition: { duration: 0.2 } },
  };

  const inputClass = "w-full bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-700/60 transition-all";
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      <GlowOrbs />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <motion.div
        className="relative w-full max-w-lg z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* logo */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Link href="/" className="inline-flex items-center gap-3 group">
            <motion.div
              className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30"
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </motion.div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white block leading-tight">GigArmor</span>
              <span className="text-[11px] text-slate-500 tracking-wider uppercase">Get Protected in 2 Minutes</span>
            </div>
          </Link>
        </motion.div>

        {/* main card */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/60 backdrop-blur-xl border border-green-500/30 rounded-3xl p-10 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <motion.path
                    strokeLinecap="round" strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  />
                </svg>
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-1">Account Created!</h2>
              <p className="text-slate-400 text-sm">Setting up your insurance dashboard...</p>
            </motion.div>
          ) : step === "form" ? (
            <motion.div
              key="form"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-cyan-500/5"
            >
              <StepIndicator current={0} total={2} />
              <div className="mb-5">
                <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
                <p className="text-slate-400 text-sm">Join 12,000+ gig workers with smart insurance</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Name & Email */}
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Ravi Kumar"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold border-r border-slate-600 pr-2.5">+91</span>
                      <input
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                        required
                        placeholder="9876543210"
                        className={`${inputClass} pl-14`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email <span className="text-slate-600 normal-case">(optional)</span></label>
                    <input
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="ravi@example.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Platform selection */}
                <div>
                  <label className={labelClass}>Delivery Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map(p => {
                      const meta = PLATFORM_META[p];
                      const selected = form.delivery_platform === p;
                      return (
                        <motion.button
                          key={p}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, delivery_platform: p }))}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${
                            selected ? meta.color : "bg-slate-700/30 border-slate-600/30 text-slate-400 hover:border-slate-500"
                          }`}
                        >
                          <span className="mr-1">{meta.icon}</span> {p === "blinkit" ? "Blinkit" : p.charAt(0).toUpperCase() + p.slice(1)}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* City & Zone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>City</label>
                    <select
                      value={form.work_city}
                      onChange={e => setForm(f => ({ ...f, work_city: e.target.value, work_zone: "" }))}
                      className={inputClass}
                    >
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Zone / Area</label>
                    <select
                      value={form.work_zone}
                      onChange={e => setForm(f => ({ ...f, work_zone: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select zone</option>
                      {zones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl px-4 py-3"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500
                    disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl
                    transition-all duration-200 shadow-lg shadow-cyan-500/25 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Registering...
                    </span>
                  ) : (
                    "Create Account & Verify →"
                  )}
                </motion.button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-5">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">Sign in</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
            >
              <StepIndicator current={1} total={2} />
              <motion.button
                onClick={() => { setStep("form"); setError(""); setOtp(""); }}
                whileHover={{ x: -3 }}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>

              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">Verify your phone</h1>
                <p className="text-slate-400 text-sm">
                  OTP sent to <span className="text-white font-medium">{form.phone}</span>
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`rounded-2xl px-4 py-3 mb-6 ${
                  demoMode ? "bg-amber-500/10 border border-amber-500/20" : "bg-cyan-500/10 border border-cyan-500/20"
                }`}
              >
                <p className={`text-xs font-medium text-center ${demoMode ? "text-amber-400" : "text-cyan-400"}`}>
                  {demoMode ? "Demo Mode — OTP: " : "Demo OTP: "}
                  <span className="text-lg font-bold tracking-[0.3em]">123456</span>
                </p>
              </motion.div>

              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <OTPInput value={otp} onChange={setOtp} />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl px-4 py-3"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500
                    disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl
                    transition-all duration-200 shadow-lg shadow-cyan-500/25 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Start →"
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* trust badges */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { icon: "🛡️", text: "AI-powered protection" },
            { icon: "⚡", text: "< 4 min claims" },
            { icon: "💰", text: "From ₹35/week" },
          ].map(b => (
            <span key={b.text} className="flex items-center gap-1 text-[10px] text-slate-500">
              <span>{b.icon}</span> {b.text}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
