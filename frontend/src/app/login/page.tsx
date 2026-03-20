"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const DEMO_USERS: Record<string, { name: string; role: string; platform: string; city: string }> = {
  "+917000000001": { name: "Raj Demo Worker", role: "worker", platform: "Zomato", city: "Mumbai" },
  "+917000000002": { name: "Priya Demo Admin", role: "admin",  platform: "Swiggy",  city: "Delhi"  },
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

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
      // Network/timeout error → fall back to demo mode silently
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

    // Demo mode — only configured demo numbers + OTP 123456
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
      localStorage.setItem("gigarmor_token", "demo_token_" + Date.now());
      localStorage.setItem("gigarmor_user", JSON.stringify({ ...demoUser, phone, id: "demo-" + phone }));
      router.push(demoUser.role === "admin" ? "/dashboard" : "/dashboard/my-policy");
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
      localStorage.setItem("gigarmor_token", data.access_token);
      localStorage.setItem("gigarmor_user", JSON.stringify(data.user));
      router.push(data.user?.role === "admin" ? "/dashboard" : "/dashboard/my-policy");
    } catch (err: unknown) {
      const isNetworkErr = err instanceof TypeError || (err instanceof Error && err.name === "TimeoutError");
      if (isNetworkErr && otp === "123456") {
        // Backend offline but correct demo OTP → allow in
        const demoUser = DEMO_USERS[phone];
        if (!demoUser) {
          setError("Use +917000000001 (worker) or +917000000002 (admin) with OTP 123456");
          return;
        }
        localStorage.setItem("gigarmor_token", "demo_token_" + Date.now());
        localStorage.setItem("gigarmor_user", JSON.stringify({ ...demoUser, phone, id: "demo-" + phone }));
        router.push(demoUser.role === "admin" ? "/dashboard" : "/dashboard/my-policy");
      } else {
        setError(isNetworkErr ? "Backend offline — use OTP 123456" : (err instanceof Error ? err.message : "Invalid OTP"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "40px 40px"}} />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">GigArmor</span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">AI Parametric Insurance for India&apos;s Gig Workers</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {step === "phone" ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-slate-400 text-sm mb-6">Enter your registered phone number to continue</p>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone.replace("+91", "")}
                      onChange={(e) => setPhone("+91" + e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}
                <button type="submit" disabled={loading || phone.length < 13}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25">
                  {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending...</span> : "Send OTP →"}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center mb-3">🎯 Demo Accounts</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ label: "Worker Demo", phone: "+917000000001" }, { label: "Admin Demo", phone: "+917000000002" }].map((d) => (
                    <button key={d.phone} onClick={() => setPhone(d.phone)}
                      className="text-xs bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg py-2 px-3 transition-colors">
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-center text-slate-500 text-sm mt-6">
                New worker? <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium">Register here</Link>
              </p>
            </>
          ) : (
            <>
              <button onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <h1 className="text-2xl font-bold text-white mb-2">Enter OTP</h1>
              <p className="text-slate-400 text-sm mb-4">OTP sent to <span className="text-white font-medium">{phone}</span></p>
              <div className={`rounded-xl px-4 py-3 mb-6 ${demoMode ? "bg-amber-500/10 border border-amber-500/30" : "bg-cyan-500/10 border border-cyan-500/30"}`}>
                <p className={`text-xs font-medium ${demoMode ? "text-amber-400" : "text-cyan-400"}`}>
                  {demoMode ? "🎯 Demo Mode (backend offline) — OTP: " : "🎯 Demo OTP: "}
                  <span className="text-xl font-bold tracking-widest">123456</span>
                </p>
              </div>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">6-Digit OTP</label>
                  <input type="text" placeholder="123456" value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-bold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    required />
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">{error}</div>}
                <button type="submit" disabled={loading || otp.length < 6}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/25">
                  {loading ? "Verifying..." : "Verify & Login →"}
                </button>
              </form>
            </>
          )}
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          {["🔒 256-bit SSL", "🇮🇳 IRDAI Compliant", "⚡ Instant Claims"].map((b) => (
            <span key={b} className="text-xs text-slate-500">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
