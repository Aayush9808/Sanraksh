"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

const PLATFORMS = [
  {id:"swiggy",  label:"Swiggy"},
  {id:"zomato",  label:"Zomato"},
  {id:"uber",    label:"Uber"},
  {id:"ola",     label:"Ola"},
  {id:"dunzo",   label:"Dunzo"},
  {id:"blinkit", label:"Blinkit"},
  {id:"porter",  label:"Porter"},
  {id:"rapido",  label:"Rapido"},
];

const STEPS = [
  { num:1, label:"Personal info",  icon:"01" },
  { num:2, label:"Your platforms", icon:"02" },
  { num:3, label:"Verification",   icon:"03" },
  { num:4, label:"You're covered",icon:"04" },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:"", phone:"", city:"", platforms:[] as string[], otp:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const upd = (k: string, v: unknown) => setForm(p => ({ ...p, [k]:v }));
  const toggleP = (id: string) => upd("platforms",
    form.platforms.includes(id) ? form.platforms.filter(x=>x!==id) : [...form.platforms, id]
  );

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (step === 1) {
      if (!form.name.trim()) { setErr("Please enter your full name."); return; }
      if (form.phone.length < 10) { setErr("Please enter a valid 10-digit mobile number."); return; }
      if (!form.city) { setErr("Please select your city."); return; }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (form.platforms.length === 0) { setErr("Select at least one platform."); return; }
      setLoading(true);
      // Try to call backend — always advance (works offline in demo)
      try {
        await fetch(`${API_BASE}/api/v1/auth/send-otp`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ phone: form.phone }),
        });
      } catch {
        // Backend offline — continue in demo mode
      }
      setLoading(false);
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!form.otp || form.otp.length < 6) { setErr("Please enter the 6-digit OTP."); return; }
      setLoading(true);
      // Try to register via backend — always advance (works offline in demo)
      try {
        const r = await fetch(`${API_BASE}/api/v1/auth/register`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ ...form }),
        });
        if (r.ok) {
          const d = await r.json();
          if (typeof window !== "undefined" && d.access_token) {
            localStorage.setItem("token", d.access_token);
            localStorage.setItem("role", d.role || "worker");
          }
        }
      } catch {
        // Backend offline — set demo session
        if (typeof window !== "undefined") {
          localStorage.setItem("token", "demo-worker-token");
          localStorage.setItem("role", "worker");
        }
      }
      setLoading(false);
      setStep(4);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[360px_1fr] bg-[#0A0806]">

      {/* LEFT — Progress rail */}
      <div className="hidden lg:flex flex-col justify-between px-10 py-12"
        style={{ background:"#14100A", borderRight:"1px solid #2A2218" }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center">
            <span className="text-[#0A0806] font-black text-sm">GS</span>
          </div>
          <span className="text-[#F5F0E8] font-bold">GigShield</span>
        </Link>

        <div>
          <h2 className="text-[#F5F0E8] font-bold text-2xl mb-2" style={{letterSpacing:"-0.03em"}}>
            Get protected<br/>in 3 minutes.
          </h2>
          <p className="text-[#4A3E2A] text-sm mb-10 leading-relaxed">
            Join 14,200+ gig workers with automatic income protection.
          </p>

          <div className="relative">
            <div className="absolute left-[19px] top-5 bottom-5 w-px bg-[#2A2218]" />
            <div className="absolute left-[19px] top-5 w-px bg-amber transition-all duration-700"
              style={{height:`${(Math.min(step,4)-1)/3 * 100}%`}} />
            <div className="space-y-6 relative">
              {STEPS.map(s => (
                <div key={s.num} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold transition-all duration-300 ${
                    step > s.num ? "bg-amber text-[#0A0806]"
                    : step === s.num ? "bg-amber/15 text-amber border border-amber/40"
                    : "bg-[#2A2218] text-[#4A3E2A]"
                  }`}>
                    {step > s.num ? "✓" : s.icon}
                  </div>
                  <div className={`font-semibold text-sm transition-colors ${step >= s.num ? "text-[#F5F0E8]" : "text-[#4A3E2A]"}`}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel-amber px-4 py-3">
          <div className="lbl-amber mb-1">No upfront cost</div>
          <div className="text-[#C8BAA0] text-sm">Premium deducted only when your coverage is triggered. You pay nothing to join.</div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex items-center justify-center px-8 py-16">
        <div className="w-full max-w-md">

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.3}}>

              {/* Mobile progress */}
              <div className="lg:hidden mb-6">
                <div className="flex justify-between mb-2">
                  <span className="lbl">Step {step} of 4</span>
                  <span className="lbl">{STEPS[step-1]?.label}</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{width:`${step/4*100}%`,animation:"none"}} />
                </div>
              </div>

              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-5">
                  <div>
                    <p className="lbl mb-2">Step 01</p>
                    <h2 className="text-[#F5F0E8] font-bold text-2xl mb-1" style={{letterSpacing:"-0.03em"}}>Tell us about yourself.</h2>
                    <p className="text-[#4A3E2A] text-sm mb-6">Basic info to set up your coverage.</p>
                  </div>
                  <div>
                    <label className="field-label">Full name</label>
                    <input className="field" placeholder="As per your ID"
                      value={form.name} onChange={e=>upd("name",e.target.value)} required />
                  </div>
                  <div>
                    <label className="field-label">Mobile number</label>
                    <div className="flex">
                      <span className="field" style={{width:"auto",borderRadius:"8px 0 0 8px",borderRight:"none",padding:"0.75rem 0.875rem",color:"#6B5C44",flexShrink:0}}>+91</span>
                      <input className="field" style={{borderRadius:"0 8px 8px 0"}} placeholder="10-digit number"
                        value={form.phone} onChange={e=>upd("phone",e.target.value.replace(/\D/g,"").slice(0,10))} maxLength={10} required />
                    </div>
                  </div>
                  <div>
                    <label className="field-label">City</label>
                    <select className="field" value={form.city} onChange={e=>upd("city",e.target.value)} required>
                      <option value="">Select your city</option>
                      {["Mumbai","Delhi","Bengaluru","Hyderabad","Chennai","Pune","Kolkata","Ahmedabad"].map(c=>(
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  {err && <p className="text-signal-neg text-sm">{err}</p>}
                  <button type="submit" className="btn-amber w-full py-3.5">Continue →</button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleNext} className="space-y-5">
                  <div>
                    <p className="lbl mb-2">Step 02</p>
                    <h2 className="text-[#F5F0E8] font-bold text-2xl mb-1" style={{letterSpacing:"-0.03em"}}>Which platforms do you work on?</h2>
                    <p className="text-[#4A3E2A] text-sm mb-6">Select all that apply.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS.map(p => (
                      <button key={p.id} type="button" onClick={()=>toggleP(p.id)}
                        className={`py-3 px-4 rounded-lg border font-semibold text-sm transition-all ${
                          form.platforms.includes(p.id)
                            ? "bg-amber/10 border-amber/50 text-amber"
                            : "border-[#2A2218] text-[#4A3E2A] hover:border-[#36301E] hover:text-[#6B5C44]"
                        }`}>
                        {form.platforms.includes(p.id) ? "✓ " : ""}{p.label}
                      </button>
                    ))}
                  </div>
                  {err && <p className="text-signal-neg text-sm">{err}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={()=>setStep(1)} className="btn-ghost flex-1 py-3.5">← Back</button>
                    <button type="submit" disabled={loading} className="btn-amber flex-[2] py-3.5">
                      {loading ? "Sending OTP…" : "Verify phone →"}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleNext} className="space-y-5">
                  <div>
                    <p className="lbl mb-2">Step 03</p>
                    <h2 className="text-[#F5F0E8] font-bold text-2xl mb-1" style={{letterSpacing:"-0.03em"}}>Verify your number.</h2>
                    <p className="text-[#4A3E2A] text-sm mb-1">OTP sent to +91 {form.phone}</p>
                    <p className="lbl mb-6">For demo: use any 6 digits (e.g. 123456)</p>
                  </div>
                  <div>
                    <label className="field-label">6-digit OTP</label>
                    <input className="field text-center text-xl font-mono tracking-widest" placeholder="— — — — — —"
                      value={form.otp} onChange={e=>upd("otp",e.target.value.replace(/\D/g,"").slice(0,6))} maxLength={6} required />
                  </div>
                  {err && <p className="text-signal-neg text-sm">{err}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={()=>setStep(2)} className="btn-ghost flex-1 py-3.5">← Back</button>
                    <button type="submit" disabled={loading} className="btn-amber flex-[2] py-3.5">
                      {loading ? "Verifying…" : "Complete registration →"}
                    </button>
                  </div>
                </form>
              )}

              {step === 4 && (
                <div className="text-center">
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:200,damping:12}}>
                    <div className="w-20 h-20 rounded-full bg-amber/15 border border-amber/30 flex items-center justify-center mx-auto mb-6">
                      <span className="text-amber text-3xl">✓</span>
                    </div>
                  </motion.div>
                  <h2 className="text-[#F5F0E8] font-bold text-2xl mb-2" style={{letterSpacing:"-0.03em"}}>{"You're protected."}</h2>
                  <p className="text-[#6B5C44] text-sm mb-8 leading-relaxed">
                    Coverage is active for {form.platforms.join(", ")} in {form.city}.<br/>
                    Payouts are automatic — {"you'll"} receive them before you even notice the disruption.
                  </p>
                  <Link href="/dashboard">
                    <button className="btn-amber w-full py-3.5">Go to my dashboard →</button>
                  </Link>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          <div className="mt-8 text-center">
            <span className="text-[#4A3E2A] text-sm">Already registered? </span>
            <Link href="/login" className="text-amber text-sm font-semibold hover:text-amber-bright transition-colors">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
