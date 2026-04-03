"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";

function OtpInput({ value, onChange, onFill }: { value: string; onChange: (v: string) => void; onFill: (completed: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const getInput = (i: number) => containerRef.current?.querySelectorAll<HTMLInputElement>("input")[i];
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const handleKey = useCallback((i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) { onChange(value.slice(0, i) + value.slice(i + 1)); }
      else if (i > 0) { getInput(i - 1)?.focus(); onChange(value.slice(0, i - 1) + value.slice(i)); }
    } else if (e.key === "ArrowLeft" && i > 0) getInput(i - 1)?.focus();
    else if (e.key === "ArrowRight" && i < 5) getInput(i + 1)?.focus();
  }, [digits, value, onChange]);
  const handleChange = useCallback((i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const ch = e.target.value.replace(/\D/g, "").slice(-1);
    const next = value.slice(0, i) + ch + value.slice(i + 1);
    const completed = next.slice(0, 6);
    onChange(completed);
    if (ch && i < 5) setTimeout(() => getInput(i + 1)?.focus(), 0);
    if (ch && i === 5 && completed.length === 6) setTimeout(() => onFill(completed), 80);
  }, [value, onChange, onFill]);
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste) { onChange(paste); if (paste.length === 6) setTimeout(() => onFill(paste), 100); }
    e.preventDefault();
  }, [onChange, onFill]);
  return (
    <div ref={containerRef} className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
          style={{
            width: 48, height: 56, flexShrink: 0,
            background: d ? "#F0F4FF" : "#F8FAFC",
            border: `2px solid ${d ? "#0F2044" : "#94A3B8"}`,
            borderRadius: 10,
            textAlign: "center" as const,
            fontSize: "1.5rem",
            fontWeight: d ? 800 : 500,
            color: "#0F2044",
            outline: "none",
            caretColor: "#F59E0B",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={e => { e.target.select(); e.target.style.borderColor = "#0F2044"; e.target.style.boxShadow = "0 0 0 3px rgba(15,32,68,0.12)"; }}
          onBlur={e => { e.target.style.boxShadow = ""; e.target.style.borderColor = digits[i] ? "#0F2044" : "#94A3B8"; }}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)} />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4" style={{ animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 10) { setErr("Please enter a valid 10-digit number."); return; }
    setErr(""); setLoading(true);
    try {
      await fetch(`${API_BASE}/api/v1/auth/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    } catch {}
    setLoading(false); setStep("otp"); setOtp("");
  }

  async function verifyOtp(e?: React.FormEvent, directOtp?: string) {
    e?.preventDefault();
    const otpToVerify = directOtp ?? otp;
    if (otpToVerify.length < 6) { setErr("Please enter the complete 6-digit OTP."); return; }
    setErr(""); setLoading(true);
    const isAdmin  = phone === "9999000000" && otpToVerify === "000000";
    const isWorker = phone === "9999000001" && otpToVerify === "123456";
    if (isAdmin || isWorker) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", isAdmin ? "demo-admin-token" : "demo-worker-token");
        localStorage.setItem("role", isAdmin ? "admin" : "worker");
        if (isWorker) {
          const { getRandomWorker } = await import("@/lib/workerData");
          localStorage.setItem("sim_worker", JSON.stringify(getRandomWorker()));
        }
      }
      setLoading(false); router.push("/dashboard"); return;
    }
    try {
      const r = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, otp }) });
      if (r.ok) {
        const d = await r.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("token", d.access_token);
          const userRole = d.role || "worker";
          localStorage.setItem("role", userRole);
          if (userRole === "worker") {
            const { getRandomWorker } = await import("@/lib/workerData");
            localStorage.setItem("sim_worker", JSON.stringify(getRandomWorker()));
          }
        }
        router.push("/dashboard");
      } else { setErr("Invalid OTP. Please try again."); }
    } catch { setErr("Connection failed. Please try again."); }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[400px] flex-shrink-0 bg-[#0F2044] px-10 py-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-white font-black text-sm">GA</span>
          </div>
          <span className="text-white font-bold text-lg">GigArmor</span>
        </Link>
        <div>
          <h2 className="text-white font-extrabold text-3xl leading-tight tracking-tight mb-4">Income protection for gig workers.</h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8">Automatic payouts when your earnings are disrupted — rain, app outages, curfews, and more. No claims ever.</p>
          <div className="space-y-4">
            {[
              { icon: "\u26a1", title: "Automatic payouts", desc: "No claim forms. Money arrives on its own." },
              { icon: "\ud83d\udee1\ufe0f", title: "8 platforms covered", desc: "Swiggy, Zomato, Uber, Ola and more." },
              { icon: "\ud83d\udcb8", title: "No upfront cost", desc: "Premium deducted only when triggered." },
            ].map(b => (
              <div key={b.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-sm">{b.icon}</div>
                <div>
                  <div className="text-white font-semibold text-sm">{b.title}</div>
                  <div className="text-blue-300 text-xs mt-0.5">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
          <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1.5">Live payout</div>
          <div className="text-white text-sm font-medium">Rahul K. received <span className="text-amber-400 font-bold">₹280</span> — heavy rain in Andheri</div>
          <div className="text-blue-400 text-xs mt-0.5">4 minutes ago · Swiggy · Mumbai</div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[400px]">

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
                <span className="text-white font-black text-sm">GA</span>
              </div>
              <span className="text-slate-900 font-bold text-lg">GigArmor</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div key="phone" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">Welcome back</h1>
                <p className="text-slate-400 text-sm mb-7">Sign in with your registered mobile number.</p>

                <form onSubmit={sendOtp} className="space-y-4">
                  <div>
                    <label className="field-label">Mobile number</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0F2044] focus-within:ring-2 focus-within:ring-[#0F2044]/10 transition-all shadow-sm bg-white">
                      <span className="inline-flex items-center bg-slate-50 border-r border-slate-200 px-3 text-slate-500 text-sm font-semibold flex-shrink-0">+91</span>
                      <input type="tel" inputMode="numeric" placeholder="10-digit number"
                        className="flex-1 bg-transparent px-3 py-3 text-slate-900 text-sm outline-none"
                        value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErr(""); }}
                        autoFocus required />
                    </div>
                  </div>
                  <AnimatePresence>
                    {err && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm">{err}</motion.p>}
                  </AnimatePresence>
                  <button type="submit" disabled={loading || phone.length < 10} className="btn-navy w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
                    {loading ? <span className="flex items-center gap-2"><Spinner />Sending OTP…</span> : "Send OTP →"}
                  </button>
                </form>

                {/* Demo access */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">Demo access</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: "Worker", phone: "9999000001", otp: "123456", desc: "Delivery worker view" }, { label: "Admin", phone: "9999000000", otp: "000000", desc: "Operations dashboard" }].map(d => (
                      <button key={d.label} onClick={() => { setPhone(d.phone); setErr(""); }}
                        className="text-left p-3 bg-white border border-amber-200 rounded-xl hover:border-amber-400 hover:shadow-sm transition-all group">
                        <div className="text-amber-800 font-bold text-xs group-hover:text-amber-900">{d.label}</div>
                        <div className="text-amber-600 font-mono text-xs mt-0.5">{d.phone}</div>
                        <div className="text-amber-500 text-[10px] mt-0.5">{d.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>
                <button onClick={() => { setStep("phone"); setErr(""); }} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm font-medium mb-7 transition-colors">
                  ← Back
                </button>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1.5">Enter OTP</h1>
                <p className="text-slate-400 text-sm mb-1">Sent to <span className="font-semibold text-slate-700">+91 {phone}</span></p>
                <p className="text-amber-600 text-xs mb-7 font-medium">
                  {phone === "9999000001" ? "Demo OTP: 123456" : phone === "9999000000" ? "Demo OTP: 000000" : "Enter the OTP sent to your phone"}
                </p>
                <form onSubmit={verifyOtp} className="space-y-5">
                  <OtpInput value={otp} onChange={setOtp} onFill={(completed) => verifyOtp(undefined, completed)} />
                  <AnimatePresence>
                    {err && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm text-center">{err}</motion.p>}
                  </AnimatePresence>
                  <button type="submit" disabled={loading || otp.length < 6} className="btn-navy w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed">
                    {loading ? <span className="flex items-center gap-2"><Spinner />Verifying…</span> : "Sign in →"}
                  </button>
                  <p className="text-center">
                    <button type="button" onClick={() => { setStep("phone"); setOtp(""); setErr(""); }} className="text-slate-400 hover:text-slate-600 text-sm transition-colors">
                      Resend OTP
                    </button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <span className="text-slate-400 text-sm">New to GigArmor? </span>
            <Link href="/register" className="text-[#0F2044] font-semibold text-sm hover:underline">Get protected →</Link>
          </div>

          {/* ── Support section ─────────────────────────────────── */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Need help?</h3>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                Having trouble logging in, lost access, or have questions about your policy? Our support team is here for you.
              </p>
              <div className="space-y-2.5 mb-4">
                {[
                  { icon: "📧", label: "Email us", desc: "support@gigarmor.in", href: "mailto:support@gigarmor.in" },
                  { icon: "💬", label: "Live support", desc: "Get help in minutes", href: "/support" },
                  { icon: "📖", label: "FAQs & guides", desc: "Common questions answered", href: "/support" },
                ].map(item => (
                  <Link key={item.label} href={item.href}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 hover:border-[#0F2044]/30 hover:shadow-sm transition-all group">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-800 font-semibold text-xs group-hover:text-[#0F2044] transition-colors">{item.label}</div>
                      <div className="text-slate-400 text-[11px] truncate">{item.desc}</div>
                    </div>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-[#0F2044] transition-colors flex-shrink-0"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 text-[11px] font-semibold">Support team online · Replies within 24 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
