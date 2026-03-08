"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PLATFORMS = ["zomato", "swiggy", "amazon", "zepto", "blinkit", "other"];
const CITIES = ["Mumbai", "Delhi", "Bengaluru", "Pune", "Hyderabad", "Chennai"];
const CITY_ZONES: Record<string, string[]> = {
  Mumbai: ["Andheri West","Bandra","Kurla","Dadar","Lower Parel","Borivali","Malad","Goregaon","Powai","Juhu"],
  Delhi: ["Connaught Place","Lajpat Nagar","Hauz Khas","Saket","Dwarka","Rohini","Janakpuri","Gurugram"],
  Bengaluru: ["Koramangala","Indiranagar","HSR Layout","Whitefield","Marathahalli","Jayanagar","BTM Layout"],
  Pune: ["Kothrud","Viman Nagar","Hadapsar","Wakad","Aundh","Hinjewadi","Baner","Shivajinagar"],
  Hyderabad: ["Hitech City","Gachibowli","Banjara Hills","Jubilee Hills","Secunderabad","Ameerpet"],
  Chennai: ["T Nagar","Anna Nagar","Velachery","Tambaram","OMR","Adyar","Mylapore"],
};

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [form, setForm] = useState({ name: "", phone: "", email: "", delivery_platform: "zomato", work_city: "Mumbai", work_zone: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoOtp, setDemoOtp] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: "+91" + form.phone.replace(/\D/g,"") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");
      setDemoOtp(data.demo_otp || "123456");
      setForm(f => ({ ...f, phone: "+91" + form.phone.replace(/\D/g,"") }));
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid OTP");
      localStorage.setItem("gigshield_token", data.access_token);
      localStorage.setItem("gigshield_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const zones = CITY_ZONES[form.work_city] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",backgroundSize:"40px 40px"}} />
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">GigShield</span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Register and get protected in 2 minutes</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {step === "form" ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-6">Create Account</h1>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                    <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required placeholder="Ravi Kumar" className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">+91</span>
                      <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value.replace(/\D/g,"").slice(0,10)}))} required placeholder="9876543210" className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email (optional)</label>
                    <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="ravi@example.com" className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors text-sm" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Delivery Platform</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PLATFORMS.map(p => (
                        <button key={p} type="button" onClick={() => setForm(f=>({...f,delivery_platform:p}))}
                          className={`py-2 px-3 rounded-xl text-xs font-medium capitalize border transition-all ${form.delivery_platform===p ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-slate-700/50 border-slate-600 text-slate-400 hover:border-slate-500"}`}>
                          {p === "blinkit" ? "🟡 Blinkit" : p === "zomato" ? "🔴 Zomato" : p === "swiggy" ? "🟠 Swiggy" : p === "amazon" ? "🔵 Amazon" : p === "zepto" ? "🟣 Zepto" : "⚪ Other"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                    <select value={form.work_city} onChange={e => setForm(f=>({...f,work_city:e.target.value,work_zone:""}))} className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors text-sm">
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Zone / Area</label>
                    <select value={form.work_zone} onChange={e => setForm(f=>({...f,work_zone:e.target.value}))} className="w-full bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 transition-colors text-sm">
                      <option value="">Select zone</option>
                      {zones.map(z => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}

                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/25 text-sm">
                  {loading ? "Registering..." : "Register & Get OTP →"}
                </button>
              </form>
              <p className="text-center text-slate-500 text-sm mt-4">
                Already registered? <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium">Login</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => setStep("form")} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <h1 className="text-2xl font-bold text-white mb-2">Verify Phone</h1>
              {demoOtp && (
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-3 mb-6">
                  <p className="text-cyan-400 text-xs font-medium">🎯 Demo Mode — OTP: <span className="text-xl font-bold tracking-widest">{demoOtp}</span></p>
                </div>
              )}
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,"").slice(0,6))} className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-bold focus:outline-none focus:border-cyan-500 transition-colors" required />
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}
                <button type="submit" disabled={loading||otp.length<6} className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/25">
                  {loading ? "Verifying..." : "Verify & Continue →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
