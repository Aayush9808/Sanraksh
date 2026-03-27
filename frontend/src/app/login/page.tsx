"use client";
import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

const DEMO_USERS: Record<string, { name: string; role: string; platform: string; city: string }> = {
  "+917000000001": { name: "Raj Demo Worker", role: "worker", platform: "Zomato", city: "Mumbai" },
  "+917000000002": { name: "Admin Demo", role: "admin", platform: "Swiggy", city: "Delhi" },
};

function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleKey = useCallback((idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) refs.current[idx - 1]?.focus();
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
    <div className="flex gap-3" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className="w-12 h-14 bg-transparent border border-[#2a2a2a] focus:border-[#00FF87] text-white text-lg font-mono font-bold text-center outline-none transition-colors"
        />
      ))}
    </div>
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
  const fullPhone = "+91" + phone.replace(/\D/g, "");

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Login failed"); }
      setDemoMode(false);
    } catch (err: unknown) {
      const isNet = err instanceof TypeError || (err instanceof Error && err.name === "TimeoutError");
      if (!isNet) { setError(err instanceof Error ? err.message : "Login failed"); setLoading(false); return; }
      setDemoMode(true);
    }
    setStep("otp"); setLoading(false);
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    if (demoMode) {
      if (otp !== "123456") { setError("Demo OTP is 123456"); setLoading(false); return; }
      const demo = DEMO_USERS[fullPhone] || { name: "Demo Worker", role: "worker", platform: "Zomato", city: "Mumbai" };
      setSuccess(true);
      localStorage.setItem("gigarmor_token", "demo_token_" + Date.now());
      localStorage.setItem("gigarmor_user", JSON.stringify({ ...demo, phone: fullPhone, id: "demo-" + Date.now() }));
      setTimeout(() => router.push(demo.role === "admin" ? "/dashboard" : "/dashboard/my-policy"), 600);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, otp }),
        signal: AbortSignal.timeout(4000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      setSuccess(true);
      localStorage.setItem("gigarmor_token", data.access_token);
      localStorage.setItem("gigarmor_user", JSON.stringify(data.user));
      setTimeout(() => router.push(data.user?.role === "admin" ? "/dashboard" : "/dashboard/my-policy"), 600);
    } catch (err: unknown) {
      const isNet = err instanceof TypeError || (err instanceof Error && err.name === "TimeoutError");
      if (isNet && otp === "123456") {
        setSuccess(true);
        const demo = DEMO_USERS[fullPhone] || { name: "Demo Worker", role: "worker", platform: "Zomato", city: "Mumbai" };
        localStorage.setItem("gigarmor_token", "demo_token_" + Date.now());
        localStorage.setItem("gigarmor_user", JSON.stringify({ ...demo, phone: fullPhone, id: "demo-" + Date.now() }));
        setTimeout(() => router.push(demo.role === "admin" ? "/dashboard" : "/dashboard/my-policy"), 600);
      } else {
        setError(isNet ? "Backend offline — use OTP 123456" : (err instanceof Error ? err.message : "Invalid OTP"));
      }
    } finally { setLoading(false); }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 border border-[#00FF87] flex items-center justify-center mx-auto mb-6">
            <svg className="w-7 h-7 text-[#00FF87]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <motion.path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} />
            </svg>
          </div>
          <p className="mono-label mb-2">Authentication successful</p>
          <h2 className="text-xl font-bold text-white">Redirecting to dashboard...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="hidden lg:flex w-[42%] flex-col justify-between border-r border-[#1a1a1a] p-12 xl:p-16">
        <Link href="/" className="flex items-center gap-3 group w-fit">
          <div className="w-8 h-8 border border-[#00FF87] flex items-center justify-center transition-colors group-hover:bg-[#00FF87]/10">
            <span className="font-mono text-[10px] text-[#00FF87] font-bold">GS</span>
          </div>
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-white">GigShield</span>
        </Link>

        <div>
          <p className="mono-label mb-8">System access</p>
          <h1 className="text-[clamp(2.5rem,4vw,4rem)] font-black text-white leading-[0.9] tracking-tight mb-10">
            Welcome<br/>back.
          </h1>

          <div className="border-t border-[#1a1a1a] pt-8 space-y-6">
            <div>
              <p className="mono-label mb-3">Demo credentials</p>
              <div className="space-y-2">
                {[
                  { role: "Worker", phone: "+91 70000 00001", hint: "Raj Demo, Zomato, Mumbai" },
                  { role: "Admin", phone: "+91 70000 00002", hint: "Admin access, all routes" },
                ].map(d => (
                  <div key={d.role} className="border border-[#1a1a1a] p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="mono-label">{d.role}</span>
                      <span className="font-mono text-[10px] text-[#00FF87]">OTP: 123456</span>
                    </div>
                    <p className="font-mono text-xs text-[#444]">{d.phone}</p>
                    <p className="font-mono text-[10px] text-[#333] mt-0.5">{d.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] pt-6">
              <div className="flex gap-8">
                <div><div className="font-mono text-xl font-black text-[#00FF87]">99.8%</div><div className="mono-label mt-1">auto-approved</div></div>
                <div><div className="font-mono text-xl font-black text-white">60s</div><div className="mono-label mt-1">avg payout</div></div>
                <div><div className="font-mono text-xl font-black text-white">24/7</div><div className="mono-label mt-1">monitoring</div></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="mono-label mb-2">Step {step === "phone" ? "01" : "02"} of 02</p>
          <div className="h-px bg-[#1a1a1a]">
            <motion.div className="h-px bg-[#00FF87]" animate={{ width: step === "phone" ? "50%" : "100%" }} transition={{ duration: 0.5 }} />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 xl:p-16 bg-[#080808]">
        <div className="w-full max-w-[400px]">
          <Link href="/" className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-7 h-7 border border-[#00FF87] flex items-center justify-center">
              <span className="font-mono text-[9px] text-[#00FF87] font-bold">GS</span>
            </div>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-white">GigShield</span>
          </Link>

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div key="phone" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <div className="mb-10">
                  <p className="mono-label mb-2">01 — Identification</p>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to GigShield</h2>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-8">
                  <div>
                    <label className="field-label">Phone Number</label>
                    <div className="flex items-end border-b border-[#2a2a2a] focus-within:border-[#00FF87] transition-colors">
                      <span className="font-mono text-sm text-[#444] pb-3 pr-2 shrink-0">+91</span>
                      <input
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        required placeholder="9876543210"
                        className="flex-1 bg-transparent text-white py-3 outline-none text-base placeholder:text-[#2a2a2a]"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="font-mono text-[10px] tracking-widest uppercase text-[#ff4444]">
                        ERROR: {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading || phone.length < 10} className="btn-wire">
                    {loading ? "SENDING OTP..." : "SEND OTP \u2192"}
                  </button>
                </form>

                <p className="mt-6 font-mono text-[10px] tracking-widest uppercase text-[#444] text-center">
                  New here?{" "}
                  <Link href="/register" className="text-[#00FF87] hover:text-white transition-colors">Create account</Link>
                </p>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <button onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
                  className="flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-[#444] hover:text-white mb-10 transition-colors">
                  \u2190 Back
                </button>

                <div className="mb-10">
                  <p className="mono-label mb-2">02 — Verification</p>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Enter your OTP</h2>
                  <p className="font-mono text-xs text-[#444] mt-2">
                    Sent to <span className="text-white">{fullPhone}</span>
                  </p>
                </div>

                <div className="border border-[#1a1a1a] p-4 mb-8">
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#444]">
                    {demoMode ? "DEMO MODE — OTP: " : "DEMO OTP: "}
                    <span className="text-[#00FF87] tracking-[0.4em] font-bold text-sm">123456</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-8">
                  <OTPInput value={otp} onChange={setOtp} />

                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="font-mono text-[10px] tracking-widest uppercase text-[#ff4444]">
                        ERROR: {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading || otp.length < 6} className="btn-wire">
                    {loading ? "VERIFYING..." : "SIGN IN \u2192"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
