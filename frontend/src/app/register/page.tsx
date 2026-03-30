"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

const PLATFORMS = [
  { id: "swiggy",  label: "Swiggy",   icon: "\ud83d\uded2" },
  { id: "zomato",  label: "Zomato",   icon: "\ud83c\udf55" },
  { id: "uber",    label: "Uber",     icon: "\ud83d\ude95" },
  { id: "ola",     label: "Ola",      icon: "\ud83d\ude96" },
  { id: "dunzo",   label: "Dunzo",    icon: "\ud83d\udce6" },
  { id: "blinkit", label: "Blinkit",  icon: "\u26a1" },
  { id: "porter",  label: "Porter",   icon: "\ud83d\ude9a" },
  { id: "rapido",  label: "Rapido",   icon: "\ud83c\udfc1" },
];

const PLANS = [
  { id: "lite",     label: "Lite",     price: 29,  cover: 150, desc: "Basic rainfall & outage cover" },
  { id: "standard", label: "Standard", price: 49,  cover: 280, desc: "Most popular — all major triggers" },
  { id: "pro",      label: "Pro",      price: 79,  cover: 400, desc: "Maximum coverage including cyclone" },
];

const STEPS = ["Personal info", "Your platforms", "Choose plan", "Verification", "Protected"];

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
    onChange(next.slice(0, 6));
    if (ch && i < 5) setTimeout(() => getInput(i + 1)?.focus(), 0);
    const completed = next.slice(0, 6);
    if (ch && i === 5) setTimeout(() => { onChange(completed); onFill(completed); }, 80);
  }, [value, onChange, onFill]);
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste) { onChange(paste.padEnd(6, "").slice(0, 6)); if (paste.length === 6) setTimeout(() => onFill(paste), 100); }
    e.preventDefault();
  }, [onChange, onFill]);
  return (
    <div ref={containerRef} className="flex gap-2.5" onPaste={handlePaste}>
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

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", city: "", platforms: [] as string[], plan: "standard", otp: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const upd = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const toggleP = (id: string) => upd("platforms", form.platforms.includes(id) ? form.platforms.filter(x => x !== id) : [...form.platforms, id]);

  async function handleNext(e: React.FormEvent, directOtp?: string) {
    e.preventDefault(); setErr("");
    if (step === 1) {
      if (!form.name.trim()) { setErr("Please enter your full name."); return; }
      if (form.phone.length < 10) { setErr("Please enter a valid 10-digit mobile number."); return; }
      if (!form.city) { setErr("Please select your city."); return; }
      setStep(2); return;
    }
    if (step === 2) {
      if (form.platforms.length === 0) { setErr("Please select at least one platform."); return; }
      setStep(3); return;
    }
    if (step === 3) {
      // Plan selection — send OTP then move to verification
      setLoading(true);
      try { await fetch(`${API_BASE}/api/v1/auth/send-otp`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: form.phone }) }); } catch {}
      setLoading(false); setStep(4); return;
    }
    if (step === 4) {
      const otpToVerify = directOtp ?? form.otp;
      if (!otpToVerify || otpToVerify.length < 6) { setErr("Please enter the complete 6-digit OTP."); return; }
      setLoading(true);
      try {
        const r = await fetch(`${API_BASE}/api/v1/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, otp: otpToVerify }) });
        if (r.ok) {
          const d = await r.json();
          if (typeof window !== "undefined" && d.access_token) { localStorage.setItem("token", d.access_token); localStorage.setItem("role", d.role || "worker"); }
        }
      } catch {
        if (typeof window !== "undefined") { localStorage.setItem("token", "demo-worker-token"); localStorage.setItem("role", "worker"); }
      }
      setLoading(false); setStep(5);
    }
  }

  const progress = ((step - 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Left sidebar - progress */}
      <div className="hidden lg:flex flex-col w-[320px] flex-shrink-0 bg-white border-r border-slate-200 px-8 py-10">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
            <span className="text-white font-black text-sm">GA</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">GigArmor</span>
        </Link>

        <div className="flex-1">
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight mb-1">Get protected</h2>
          <p className="text-slate-400 text-sm mb-8">in under 3 minutes.</p>

          {/* Steps */}
          <div className="relative">
            <div className="absolute left-4 top-6 bottom-6 w-px bg-slate-200" />
            <div className="absolute left-4 top-6 w-px bg-[#0F2044] transition-all duration-700"
              style={{ height: `${progress}%` }} />
            <div className="space-y-8 relative">
              {STEPS.map((label, i) => {
                const num = i + 1;
                const isDone = step > num;
                const isActive = step === num;
                return (
                  <div key={label} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300 ${
                      isDone ? "bg-emerald-500 text-white" : isActive ? "bg-[#0F2044] text-white ring-4 ring-[#0F2044]/15" : "bg-white border-2 border-slate-200 text-slate-400"
                    }`}>
                      {isDone ? "✓" : num}
                    </div>
                    <div className={`text-sm font-semibold transition-colors ${isActive ? "text-slate-900" : isDone ? "text-emerald-600" : "text-slate-400"}`}>
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-amber-700 text-xs font-bold uppercase tracking-wide mb-1">No upfront cost</div>
          <p className="text-amber-600 text-xs leading-relaxed">Premium deducted only when your coverage is triggered. Register for free.</p>
        </div>
      </div>

      {/* Right - form */}
      <div className="flex-1 flex items-start justify-center px-4 py-10 md:px-10">
        <div className="w-full max-w-[520px]">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
                <span className="text-white font-black text-sm">GA</span>
              </div>
              <span className="font-bold text-slate-900">GigArmor</span>
            </Link>
            <span className="text-sm text-slate-400 font-medium">Step {step} of 5</span>
          </div>

          {/* Mobile progress bar */}
          <div className="lg:hidden mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">{STEPS[step - 1]}</span>
              <span className="text-xs text-slate-400">{step}/5</span>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${progress}%`, animation: "none" }} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28 }}>

              {/* STEP 1 - Personal info */}
              {step === 1 && (
                <form onSubmit={handleNext}>
                  <div className="mb-7">
                    <div className="lbl mb-2">Step 01</div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Tell us about yourself</h2>
                    <p className="text-slate-400 text-sm">Basic details to set up your coverage.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="field-label">Full name</label>
                      <input className="field" placeholder="As on your Aadhaar" value={form.name} onChange={e => upd("name", e.target.value)} required />
                    </div>
                    <div>
                      <label className="field-label">Mobile number</label>
                      <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0F2044] focus-within:ring-2 focus-within:ring-[#0F2044]/10 transition-all bg-white">
                        <span className="inline-flex items-center bg-slate-50 border-r border-slate-200 px-3 text-slate-500 text-sm font-semibold flex-shrink-0">+91</span>
                        <input type="tel" inputMode="numeric" className="flex-1 bg-transparent px-3 py-3 text-slate-900 text-sm outline-none" placeholder="10-digit number"
                          value={form.phone} onChange={e => upd("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} required />
                      </div>
                    </div>
                    <div>
                      <label className="field-label">City</label>
                      <select className="field" value={form.city} onChange={e => upd("city", e.target.value)} required>
                        <option value="">Select your city</option>
                        {["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <AnimatePresence>
                    {err && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm mt-3">{err}</motion.p>}
                  </AnimatePresence>
                  <button type="submit" className="btn-navy w-full py-3.5 mt-6">Continue →</button>
                </form>
              )}

              {/* STEP 2 - Platforms */}
              {step === 2 && (
                <form onSubmit={handleNext}>
                  <div className="mb-7">
                    <div className="lbl mb-2">Step 02</div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Which platforms do you work on?</h2>
                    <p className="text-slate-400 text-sm">Select all that apply. More platforms = more protection.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS.map(p => {
                      const selected = form.platforms.includes(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => toggleP(p.id)}
                          className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 font-semibold text-sm transition-all text-left ${
                            selected ? "border-[#0F2044] bg-blue-50 text-[#0F2044]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}>
                          <span className="text-lg">{p.icon}</span>
                          <span>{p.label}</span>
                          <AnimatePresence>
                            {selected && (
                              <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.15 }}
                                className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#0F2044] flex items-center justify-center">
                                <span className="text-white text-[8px] font-black">✓</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      );
                    })}
                  </div>
                  {form.platforms.length > 0 && (
                    <div className="mt-3 text-xs text-emerald-600 font-semibold">{form.platforms.length} platform{form.platforms.length > 1 ? "s" : ""} selected</div>
                  )}
                  <AnimatePresence>
                    {err && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm mt-3">{err}</motion.p>}
                  </AnimatePresence>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 py-3.5">← Back</button>
                    <button type="submit" disabled={loading} className="btn-navy flex-[2] py-3.5 disabled:opacity-40">
                      {loading ? <span className="flex items-center gap-2 justify-center"><Spinner />Sending OTP…</span> : "Verify phone →"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3 - Plan selection */}
              {step === 3 && (
                <form onSubmit={handleNext}>
                  <div className="mb-7">
                    <div className="lbl mb-2">Step 03</div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Choose your plan</h2>
                    <p className="text-slate-400 text-sm">Pay only when a trigger fires. Cancel anytime.</p>
                  </div>
                  <div className="space-y-3">
                    {PLANS.map(p => {
                      const selected = form.plan === p.id;
                      return (
                        <button key={p.id} type="button" onClick={() => upd("plan", p.id)}
                          className={`relative w-full flex items-center gap-4 p-4 rounded-xl border-2 font-semibold text-sm transition-all text-left ${
                            selected ? "border-[#0F2044] bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                          }`}>
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${selected ? "bg-[#0F2044] text-white" : "bg-slate-100 text-slate-500"}`}>
                            {selected ? "✓" : p.label[0]}
                          </div>
                          <div className="flex-1">
                            <div className={`font-bold ${selected ? "text-[#0F2044]" : "text-slate-800"}`}>{p.label}</div>
                            <div className="text-slate-400 text-xs font-normal mt-0.5">{p.desc} · ₹{p.cover}/day payout</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`font-extrabold text-lg ${selected ? "text-[#0F2044]" : "text-slate-700"}`}>₹{p.price}</div>
                            <div className="text-slate-400 text-xs">/week</div>
                          </div>
                          {p.id === "standard" && (
                            <span className="absolute -top-2 left-4 bg-amber-400 text-[#0F2044] text-[10px] font-black px-2 py-0.5 rounded-full">Popular</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1 py-3.5">← Back</button>
                    <button type="submit" disabled={loading} className="btn-navy flex-[2] py-3.5 disabled:opacity-40">
                      {loading ? <span className="flex items-center gap-2 justify-center"><Spinner />Sending OTP…</span> : "Continue →"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4 - OTP */}
              {step === 4 && (
                <form onSubmit={handleNext}>
                  <div className="mb-7">
                    <div className="lbl mb-2">Step 04</div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Verify your number</h2>
                    <p className="text-slate-400 text-sm mb-1">OTP sent to <span className="font-semibold text-slate-700">+91 {form.phone}</span></p>
                    <p className="text-amber-600 text-xs font-medium">For demo: enter any 6 digits</p>
                  </div>
                  <div className="mb-5">
                    <label className="field-label mb-3">6-digit OTP</label>
                    <OtpInput value={form.otp} onChange={v => upd("otp", v)}
                      onFill={(completed) => handleNext({ preventDefault: () => {} } as React.FormEvent, completed)} />
                  </div>
                  <AnimatePresence>
                    {err && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm">{err}</motion.p>}
                  </AnimatePresence>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setStep(3)} className="btn-ghost flex-1 py-3.5">← Back</button>
                    <button type="submit" disabled={loading} className="btn-navy flex-[2] py-3.5 disabled:opacity-40">
                      {loading ? <span className="flex items-center gap-2 justify-center"><Spinner />Verifying…</span> : "Complete registration →"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 5 - Success */}
              {step === 5 && (
                <div className="text-center pt-4">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                    className="mx-auto mb-6 w-24 h-24 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
                      <motion.path d="M10 24L20 35L38 13" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }} />
                    </svg>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">{"You\'re protected."}</h2>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                      <span className="font-semibold text-slate-800">{PLANS.find(p=>p.id===form.plan)?.label} plan</span> active for {form.platforms.join(", ")} in {form.city}.
                      Payouts happen automatically — no action needed.
                    </p>
                    <div className="bg-[#0F2044] rounded-2xl p-5 text-left mb-6">
                      <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">What happens next</div>
                      {["GigArmor monitors weather, strikes & platform outages 24/7", "You get notified when a trigger occurs in your zone", "Payout transfers to your bank automatically"].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5 mb-2 last:mb-0">
                          <span className="text-amber-400 font-bold flex-shrink-0">→</span>
                          <span className="text-blue-100 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/dashboard">
                      <button className="btn-navy w-full py-3.5">Go to my dashboard →</button>
                    </Link>
                  </motion.div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {step < 5 && (
            <div className="mt-8 pt-6 border-t border-slate-200 text-center">
              <span className="text-slate-400 text-sm">Already registered? </span>
              <Link href="/login" className="text-[#0F2044] font-semibold text-sm hover:underline">Sign in →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
