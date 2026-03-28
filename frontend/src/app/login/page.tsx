"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

const LIVE_FEED = [
  { worker:"Rahul K.",  amount:"₹280", event:"Rain alert — Mumbai", time:"2m ago" },
  { worker:"Priya M.",  amount:"₹350", event:"Curfew — Ahmedabad", time:"5m ago" },
  { worker:"Arjun S.",  amount:"₹200", event:"App outage — Zomato", time:"9m ago" },
  { worker:"Meena R.",  amount:"₹180", event:"Flood warning — Pune", time:"14m ago" },
  { worker:"Vikram P.", amount:"₹320", event:"Heat wave — Delhi",   time:"18m ago" },
];

function PayoutFeed() {
  return (
    <div className="space-y-2 mt-6">
      {LIVE_FEED.map((p, i) => (
        <motion.div key={p.worker}
          initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
          transition={{ delay: 0.6 + i*0.12, duration:0.4 }}
          className="flex items-center justify-between panel-amber px-3.5 py-2.5"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="dot dot-live" style={{width:5,height:5}} />
              <span className="text-[#F5F0E8] text-xs font-semibold">{p.worker}</span>
            </div>
            <div className="lbl mt-0.5">{p.event}</div>
          </div>
          <div className="text-right">
            <div className="text-amber-DEFAULT font-mono font-bold text-sm">{p.amount}</div>
            <div className="lbl">{p.time}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone"|"otp">("phone");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await fetch(`${API_BASE}/api/v1/auth/send-otp`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ phone }),
      });
      setStep("otp");
    } catch { setErr("Failed to send OTP. Try again."); }
    finally { setLoading(false); }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ phone, otp }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("token", d.access_token);
        localStorage.setItem("role", d.role || "worker");
      }
      window.location.href = "/dashboard";
    } catch { setErr("Invalid OTP. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[44%_56%]">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between px-12 py-10 relative overflow-hidden"
        style={{ background:"linear-gradient(160deg, #0E0A04 0%, #1a1200 100%)", borderRight:"1px solid #2A2218" }}
      >
        {/* Ambient glow */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full pointer-events-none"
          style={{ background:"radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)" }} />

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.5}}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-DEFAULT flex items-center justify-center">
              <span className="text-[#0A0806] font-black text-sm">GS</span>
            </div>
            <span className="text-[#F5F0E8] font-bold">GigShield</span>
          </Link>
        </motion.div>

        <div className="relative z-10">
          <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.6}}>
            <p className="lbl mb-4">Payouts processed right now</p>
            <div className="mb-2">
              <span className="text-[#F5F0E8] font-extrabold" style={{fontSize:"3.5rem",lineHeight:0.88,letterSpacing:"-0.05em"}}>₹1.24Cr</span>
            </div>
            <p className="text-[#6B5C44] text-sm mb-6">paid out this month across 14,200 workers</p>
          </motion.div>
          <PayoutFeed />
        </div>

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}>
          <div className="panel-amber px-4 py-3 flex gap-3 items-start">
            <div className="w-1 h-8 rounded-full bg-amber-DEFAULT flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-[#F5F0E8] text-sm font-semibold mb-0.5">Demo credentials</div>
              <div className="lbl">Worker: +91 9999000001 · OTP: 123456</div>
              <div className="lbl">Admin: &nbsp; +91 9999000000 · OTP: 000000</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT FORM ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center px-8 py-16 bg-[#0A0806]">
        <div className="w-full max-w-sm">

          <Link href="/" className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-7 h-7 rounded-lg bg-amber-DEFAULT flex items-center justify-center">
              <span className="text-[#0A0806] font-black text-xs">GS</span>
            </div>
            <span className="text-[#F5F0E8] font-bold text-sm">GigShield</span>
          </Link>

          <motion.div key={step} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.35}}>
            <p className="lbl mb-2">{step === "phone" ? "Sign in" : "Verification"}</p>
            <h1 className="text-[#F5F0E8] font-bold text-2xl mb-1" style={{letterSpacing:"-0.03em"}}>
              {step === "phone" ? "Welcome back." : "Check your phone."}
            </h1>
            <p className="text-[#6B5C44] text-sm mb-8">
              {step === "phone" ? "Enter your registered mobile number." : `OTP sent to +91 ${phone}. Valid for 10 min.`}
            </p>

            <form onSubmit={step === "phone" ? sendOtp : verifyOtp} className="space-y-4">
              {step === "phone" ? (
                <div>
                  <label className="field-label">Mobile number</label>
                  <div className="flex">
                    <span className="field" style={{width:"auto",borderRadius:"8px 0 0 8px",borderRight:"none",padding:"0.75rem 0.875rem",color:"#6B5C44",flexShrink:0}}>+91</span>
                    <input className="field" style={{borderRadius:"0 8px 8px 0"}} placeholder="Enter 10-digit number"
                      value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} maxLength={10} required />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="field-label">6-digit OTP</label>
                  <input className="field text-center text-xl font-mono tracking-widest" placeholder="— — — — — —"
                    value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} maxLength={6} required />
                </div>
              )}

              {err && <p className="text-signal-neg text-sm">{err}</p>}

              <button type="submit" disabled={loading} className="btn-amber w-full py-3.5">
                {loading ? "Please wait…" : step === "phone" ? "Send OTP →" : "Verify & Sign in →"}
              </button>
            </form>

            {step === "otp" && (
              <button onClick={()=>setStep("phone")} className="w-full text-center text-[#4A3E2A] text-sm mt-4 hover:text-[#6B5C44] transition-colors">
                ← Change number
              </button>
            )}

            <div className="mt-8 pt-6 border-t border-[#2A2218] text-center">
              <span className="text-[#4A3E2A] text-sm">New worker? </span>
              <Link href="/register" className="text-amber-DEFAULT text-sm font-semibold hover:text-amber-bright transition-colors">
                Create account →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
