"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../../lib/config";

const DEMO_USERS: Record<string, { name: string; role: string; platform: string; city: string }> = {
  "+917000000001": { name: "Raj Demo Worker", role: "worker", platform: "Zomato", city: "Mumbai" },
  "+917000000002": { name: "Priya Demo Admin", role: "admin",  platform: "Swiggy",  city: "Delhi"  },
};

/* ── animated background orbs ── */
function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-cyan-400/5 blur-2xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ── OTP digit input boxes ── */
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

/* ── live stats ticker ── */
function LiveStatsTicker() {
  const stats = [
    { value: "12,400+", label: "Workers protected" },
    { value: "< 4 min", label: "Avg claim time" },
    { value: "₹2.1Cr", label: "Claims paid" },
  ];
  return (
    <motion.div
      className="flex items-center justify-center gap-6 mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      {stats.map((s, i) => (
        <div key={i} className="text-center">
          <div className="text-xs font-bold text-cyan-400">{s.value}</div>
          <div className="text-[10px] text-slate-500">{s.label}</div>
        </div>
      ))}
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [success, setSuccess] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "phone") phoneInputRef.current?.focus();
  }, [step]);

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to send OTP");
      }
      setDemoMode(false);
    } catch (err: unknown) {
      const isNetworkErr = err instanceof TypeError || (err instanceof Error && err.name === "TimeoutError");
      if (!isNetworkErr) {
        setError(err instanceof Error ? err.message : "Failed to send OTP");
        setLoading(false);
        return;
      }
      setDemoMode(true);
    }
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
      const demoUser = DEMO_USERS[phone];
      if (!demoUser) {
        setError("Use +917000000001 (worker) or +917000000002 (admin) with OTP 123456");
        setLoading(false);
        return;
      }
      setSuccess(true);
      localStorage.setItem("gigarmor_token", "demo_token_" + Date.now());
      localStorage.setItem("gigarmor_user", JSON.stringify({ ...demoUser, phone, id: "demo-" + phone }));
      setTimeout(() => router.push(demoUser.role === "admin" ? "/dashboard" : "/dashboard/my-policy"), 600);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
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
        const demoUser = DEMO_USERS[phone];
        if (!demoUser) {
          setError("Use +917000000001 (worker) or +917000000002 (admin) with OTP 123456");
          return;
        }
        setSuccess(true);
        localStorage.setItem("gigarmor_token", "demo_token_" + Date.now());
        localStorage.setItem("gigarmor_user", JSON.stringify({ ...demoUser, phone, id: "demo-" + phone }));
        setTimeout(() => router.push(demoUser.role === "admin" ? "/dashboard" : "/dashboard/my-policy"), 600);
      } else {
        setError(isNetworkErr ? "Backend offline — use OTP 123456" : (err instanceof Error ? err.message : "Invalid OTP"));
      }
    } finally {
      setLoading(false);
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 24 } },
    exit: { opacity: 0, y: -20, scale: 0.96, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      <GlowOrbs />

      {/* grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      <motion.div
        className="relative w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* logo */}
        <motion.div
          className="text-center mb-8"
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
              <span className="text-[11px] text-slate-500 tracking-wider uppercase">Parametric Insurance</span>
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
              <h2 className="text-xl font-bold text-white mb-1">Welcome Back!</h2>
              <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
            </motion.div>
          ) : step === "phone" ? (
            <motion.div
              key="phone"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl
                shadow-cyan-500/5"
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                <p className="text-slate-400 text-sm">Sign in with your phone number to continue</p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Phone Number</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold border-r border-slate-600 pr-3">+91</span>
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      placeholder="9876543210"
                      value={phone.replace("+91", "")}
                      onChange={(e) => setPhone("+91" + e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-slate-700/40 border border-slate-600/50 text-white placeholder-slate-500 rounded-2xl pl-16 pr-4 py-4 text-lg
                        focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:bg-slate-700/60 transition-all"
                      required
                    />
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
                  disabled={loading || phone.length < 13}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500
                    disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl
                    transition-all duration-200 shadow-lg shadow-cyan-500/25 text-sm relative overflow-hidden"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Sending OTP...
                    </span>
                  ) : (
                    "Continue with OTP →"
                  )}
                </motion.button>
              </form>

              {/* demo accounts */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <p className="text-[10px] text-slate-500 text-center mb-3 uppercase tracking-widest">Quick Access — Demo Accounts</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Worker", phone: "+917000000001", icon: "🛵", desc: "Delivery worker view" },
                    { label: "Admin", phone: "+917000000002", icon: "🏢", desc: "Operations admin view" },
                  ].map((d) => (
                    <motion.button
                      key={d.phone}
                      onClick={() => setPhone(d.phone)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`text-left bg-slate-700/30 hover:bg-slate-700/50 border rounded-xl py-3 px-3 transition-all ${
                        phone === d.phone ? "border-cyan-500/50 bg-cyan-500/5" : "border-slate-600/30"
                      }`}
                    >
                      <span className="text-lg">{d.icon}</span>
                      <p className="text-xs font-medium text-slate-300 mt-1">{d.label}</p>
                      <p className="text-[10px] text-slate-500">{d.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              <p className="text-center text-slate-500 text-sm mt-6">
                New here?{" "}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  Create an account
                </Link>
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
              <motion.button
                onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
                whileHover={{ x: -3 }}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>

              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">Verify OTP</h1>
                <p className="text-slate-400 text-sm">
                  Code sent to <span className="text-white font-medium">{phone}</span>
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
                    "Verify & Sign In →"
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* trust badges & stats */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { icon: "🔒", text: "End-to-end encrypted" },
            { icon: "🇮🇳", text: "IRDAI compliant" },
            { icon: "⚡", text: "Instant payouts" },
          ].map(b => (
            <span key={b.text} className="flex items-center gap-1 text-[10px] text-slate-500">
              <span>{b.icon}</span> {b.text}
            </span>
          ))}
        </motion.div>
        <LiveStatsTicker />
      </motion.div>
    </div>
  );
}
