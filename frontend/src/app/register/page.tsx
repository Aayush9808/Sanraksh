"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { saveUser } from "@/lib/userStore";
import { logStep, logError } from "@/lib/debugLogger";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!name.trim() || name.trim().length < 2) {
      setErr("Please enter your full name.");
      return;
    }
    if (phone.length < 10) {
      setErr("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const newUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: `${phone}@sanraksh.local`,
        createdAt: new Date().toISOString(),
      };
      saveUser(newUser);
      logStep("Signup Complete", { userId: newUser.id, name: newUser.name, email: newUser.email });
      router.push("/onboarding");
    } catch (err) {
      logError("Failed to save user on signup", err);
      setErr("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="hidden lg:flex flex-col w-[320px] flex-shrink-0 bg-white border-r border-slate-200 px-8 py-10">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
              <span className="text-white font-black text-sm">SR</span>
          </div>
          <span className="font-bold text-slate-900 text-lg">Sanraksh</span>
        </Link>
        <div className="flex-1">
          <h2 className="font-extrabold text-slate-900 text-xl tracking-tight mb-1">Get protected</h2>
          <p className="text-slate-400 text-sm mb-8">in under 3 minutes.</p>
          <div className="space-y-5">
            {[
              { num: "01", label: "Create account", active: true },
              { num: "02", label: "Complete onboarding", active: false },
              { num: "03", label: "Coverage active", active: false },
            ].map(s => (
              <div key={s.num} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${
                  s.active ? "bg-[#0F2044] text-white ring-4 ring-[#0F2044]/15" : "bg-white border-2 border-slate-200 text-slate-400"
                }`}>
                  {s.num}
                </div>
                <div className={`text-sm font-semibold ${s.active ? "text-slate-900" : "text-slate-400"}`}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="text-amber-700 text-xs font-bold uppercase tracking-wide mb-1">No upfront cost</div>
          <p className="text-amber-600 text-xs leading-relaxed">Premium deducted only when your coverage is triggered. Register for free.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10 md:px-10">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
                <span className="text-white font-black text-sm">SR</span>
              </div>
              <span className="font-bold text-slate-900">Sanraksh</span>
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="mb-8">
              <div className="lbl mb-2">Step 01 of 02</div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Create your account</h2>
              <p className="text-slate-400 text-sm">Quick setup — takes under a minute.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label">Full name</label>
                <input className="field" placeholder="As on your Aadhaar" value={name}
                  onChange={e => setName(e.target.value)} autoFocus required />
              </div>
              <div>
                <label className="field-label">Mobile number</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0F2044] focus-within:ring-2 focus-within:ring-[#0F2044]/10 transition-all bg-white">
                  <span className="inline-flex items-center bg-slate-50 border-r border-slate-200 px-3 text-slate-500 text-sm font-semibold flex-shrink-0">+91</span>
                  <input type="tel" inputMode="numeric" className="flex-1 bg-transparent px-3 py-3 text-slate-900 text-sm outline-none"
                    placeholder="10-digit number" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} required />
                </div>
              </div>
              <AnimatePresence>
                {err && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm">
                    {err}
                  </motion.p>
                )}
              </AnimatePresence>
              <button type="submit" disabled={loading} className="btn-navy w-full py-3.5 mt-2 disabled:opacity-40">
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="w-4 h-4" style={{ animation: "spin 1s linear infinite" }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating account...
                  </span>
                ) : "Continue to onboarding →"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setName("Aayush Kumar");
                  setPhone("9998887776");
                  setErr("");
                }}
                className="w-full mt-2 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:border-slate-400 transition flex items-center justify-center gap-2"
              >
                <span>🎭</span> Use Demo Credentials
              </button>
            </form>
          </motion.div>

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <span className="text-slate-400 text-sm">Already registered? </span>
            <Link href="/login" className="text-[#0F2044] font-semibold text-sm hover:underline">Sign in →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
