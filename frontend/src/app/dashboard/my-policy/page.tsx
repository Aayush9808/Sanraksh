"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const DISRUPTION_TYPES = [
  { id: "heavy_rain",  label: "Heavy Rain / Storm",   icon: "🌧️", desc: "Rain > 50mm in your zone",        premium_add: 0, payout: 800  },
  { id: "flood",       label: "Zone Flooding",         icon: "🌊", desc: "Flood reported in delivery zone",  premium_add: 5, payout: 1200 },
  { id: "pollution",   label: "AQI > 400 Shutdown",    icon: "😷", desc: "Severe pollution, GRAP-4 active",  premium_add: 3, payout: 600  },
  { id: "curfew",      label: "Curfew / Strike",       icon: "🚫", desc: "Zone closure, unable to deliver",  premium_add: 4, payout: 900  },
  { id: "app_outage",  label: "Platform App Outage",   icon: "⚡", desc: "Platform down > 3 hours",          premium_add: 2, payout: 500  },
  { id: "job_loss",    label: "Account Deactivation",  icon: "💼", desc: "Platform removed your account",    premium_add: 8, payout: 2000 },
];

const ZONE_RISK: Record<string, number> = {
  "Andheri West": 0.82, "Bandra-Kurla": 0.75, "Mumbai Central": 0.79,
  "Thane West": 0.68, "Powai": 0.61, "Delhi NCR": 0.74, "Pune Central": 0.55,
  "Koramangala": 0.58, "Jogeshwari": 0.71, "Bandra West": 0.69,
};

const PLATFORM_RISK: Record<string, number> = {
  Zomato: 0.78, Swiggy: 0.81, Blinkit: 0.65, Zepto: 0.62,
  Uber: 0.55, Ola: 0.57, Dunzo: 0.70, Rapido: 0.60,
};

function calcWeeklyPremium(zone: string, platform: string, daysPerWeek: number): number {
  const zoneScore  = ZONE_RISK[zone]     ?? 0.70;
  const platScore  = PLATFORM_RISK[platform] ?? 0.65;
  const dayScore   = daysPerWeek / 7;
  const riskScore  = zoneScore * 0.5 + platScore * 0.3 + dayScore * 0.2;
  const base = 30;
  return Math.round((base + riskScore * 40) * 100) / 100;
}

type ClaimPhase = "idle" | "detecting" | "verifying" | "approved" | "paid";

interface UserData { name: string; phone: string; platform: string; city: string; role: string; zone?: string; }

export default function MyPolicyPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [daysPerWeek] = useState(5);
  const [claimType, setClaimType] = useState(DISRUPTION_TYPES[0]);
  const [claimPhase, setClaimPhase] = useState<ClaimPhase>("idle");
  const [countdown, setCountdown] = useState(60);
  const [fraudScore] = useState(() => Math.round(Math.random() * 12 + 2) / 100);
  const [claimHistory] = useState([
    { id: "CLM-20260301-001", type: "Heavy Rain", date: "1 Mar 2026", amount: 800,  status: "PAID" },
    { id: "CLM-20260215-089", type: "Flood",      date: "15 Feb 2026", amount: 1200, status: "PAID" },
    { id: "CLM-20260108-042", type: "Curfew",     date: "8 Jan 2026",  amount: 900,  status: "PAID" },
  ]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("gigarmor_user");
    if (!raw) { router.push("/login"); return; }
    setUser(JSON.parse(raw) as UserData);
  }, [router]);

  const zone     = user?.zone     ?? "Andheri West";
  const platform = user?.platform ?? "Zomato";
  const weekly   = calcWeeklyPremium(zone, platform, daysPerWeek);
  const coverage = weekly * 20;
  const riskPct  = Math.round((ZONE_RISK[zone] ?? 0.70) * 100);
  const policyEnd = new Date(); policyEnd.setDate(policyEnd.getDate() + 21);

  function startClaim() {
    setClaimPhase("detecting");
    setTimeout(() => setClaimPhase("verifying"), 2000);
    setTimeout(() => setClaimPhase("approved"),  4500);
    setTimeout(() => {
      setClaimPhase("paid");
      let c = 60;
      timerRef.current = setInterval(() => { c -= 1; setCountdown(c); if (c <= 0 && timerRef.current) clearInterval(timerRef.current); }, 1000);
    }, 6500);
  }
  function resetClaim() { setClaimPhase("idle"); setCountdown(60); if (timerRef.current) clearInterval(timerRef.current); }

  if (!user) return (
    <div className="flex min-h-[60vh] items-center justify-center text-text-muted">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="animate-pulse">Loading your policy…</motion.p>
    </div>
  );

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const b = (d: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d * 0.06 } } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-text-secondary mt-0.5">Your income is protected. Here's your coverage dashboard.</p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-state-success/30 bg-state-success/10 px-4 py-2 text-xs font-semibold text-state-success">
          <span className="h-2 w-2 animate-pulse rounded-full bg-state-success" /> Policy Active
        </span>
      </div>

      {/* Live Zone Alert */}
      <motion.div {...b(1)} className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.06] px-5 py-4 flex items-center gap-4">
        <span className="text-3xl">🌧️</span>
        <div className="flex-1">
          <p className="font-bold text-accent-amber">Live Alert — Heavy rain detected in {zone}</p>
          <p className="text-xs text-text-muted mt-0.5">Rainfall &gt; 60mm/hr. Parametric trigger active. You can file a claim now.</p>
        </div>
        <span className="rounded-full bg-accent-amber/15 border border-accent-amber/30 px-3 py-1 text-[10px] font-bold text-accent-amber animate-pulse">LIVE</span>
      </motion.div>

      {/* KPI row */}
      <motion.div {...b(2)} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: "Weekly Premium",  value: `₹${weekly}`,               sub: `Zone risk: ${riskPct}%`, t: "border-accent-amber/30 bg-accent-amber/[0.04]" },
          { label: "Weekly Coverage", value: `₹${coverage.toFixed(0)}`,  sub: "Income protected",        t: "border-state-success/30 bg-state-success/[0.04]" },
          { label: "Policy Valid",    value: policyEnd.toLocaleDateString("en-IN",{day:"numeric",month:"short"}), sub: "21 days left", t: "border-accent-violet/30 bg-accent-violet/[0.04]" },
          { label: "Total Claimed",   value: `₹${claimHistory.reduce((s,c)=>s+c.amount,0).toLocaleString()}`, sub: `${claimHistory.length} claims paid`, t: "border-state-info/30 bg-state-info/[0.04]" },
        ].map((k, i) => (
          <motion.div key={k.label} whileHover={{ y: -2 }} className={`rounded-2xl border p-4 ${k.t}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{k.label}</p>
            <p className="mt-1.5 text-xl font-black text-text-primary">{k.value}</p>
            <p className="mt-0.5 text-[10px] text-text-muted">{k.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── File a Claim ── */}
        <motion.div {...b(3)} className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-text-primary mb-1">⚡ File a Claim</h2>
          <p className="text-[10px] text-text-muted mb-4">Select the disruption type. AI verifies automatically.</p>

          <AnimatePresence mode="wait">
          {claimPhase === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {DISRUPTION_TYPES.map(d => (
                  <button key={d.id} onClick={() => setClaimType(d)}
                    className={`rounded-xl border p-3 text-left transition-all ${claimType.id === d.id ? "border-accent-amber/50 bg-accent-amber/10 text-text-primary" : "border-white/[0.06] bg-white/[0.01] text-text-muted hover:border-white/20"}`}>
                    <div className="text-xl mb-1">{d.icon}</div>
                    <div className="text-xs font-semibold">{d.label}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Payout: ₹{d.payout}</div>
                  </button>
                ))}
              </div>
              <div className={`${card} p-4`}>
                <p className="text-[10px] text-text-muted mb-1">Selected disruption</p>
                <p className="font-semibold text-text-primary">{claimType.icon} {claimType.label}</p>
                <p className="text-xs text-text-secondary mt-1">{claimType.desc}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">Expected payout</span>
                  <span className="text-lg font-black text-accent-amber">₹{claimType.payout}</span>
                </div>
              </div>
              <button onClick={startClaim}
                className="w-full rounded-xl bg-gradient-to-r from-accent-amber to-accent-ember py-3 font-bold text-surface-0 shadow-lg shadow-accent-amber/20 transition-all hover:shadow-accent-amber/30">
                Submit Claim →
              </button>
            </motion.div>
          )}

          {claimPhase === "detecting" && (
            <motion.div key="detecting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3">
                <div className="h-14 w-14 rounded-full border-4 border-accent-amber/30 border-t-accent-amber animate-spin" />
                <p className="font-semibold text-accent-amber">🛰️ Detecting disruption in {zone}…</p>
                <p className="text-[10px] text-text-muted">Querying weather API · Checking OpenWeatherMap</p>
              </div>
              <div className={`${card} p-4 space-y-2`}>
                {["Weather API ✓","Zone boundary check ✓","Rainfall threshold…"].map((s,i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className={i < 2 ? "text-state-success" : "text-state-warning animate-pulse"}>●</span> {s}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {claimPhase === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3">
                <motion.span className="text-5xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity }}>🤖</motion.span>
                <p className="font-semibold text-accent-violet">AI Fraud Check Running…</p>
              </div>
              <div className={`${card} p-4 space-y-3`}>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Fraud Detection Results</p>
                {[
                  { label: "GPS location match",    val: "✅ Verified",       color: "text-state-success" },
                  { label: "Duplicate claim check", val: "✅ No duplicates",  color: "text-state-success" },
                  { label: "Anomaly detection",     val: "✅ Normal pattern", color: "text-state-success" },
                  { label: "Fraud risk score",      val: `${(fraudScore * 100).toFixed(0)}% (Low)`, color: "text-state-success" },
                ].map((r, i) => (
                  <motion.div key={r.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                    className="flex justify-between text-xs">
                    <span className="text-text-muted">{r.label}</span>
                    <span className={r.color}>{r.val}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {claimPhase === "approved" && (
            <motion.div key="approved" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4 py-4">
              <div className="flex flex-col items-center gap-3 text-center">
                <motion.span className="text-6xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" as const, stiffness: 300, damping: 15 }}>✅</motion.span>
                <p className="text-xl font-black text-state-success">Claim Approved!</p>
                <p className="text-sm text-text-secondary">Initiating UPI transfer to your registered account</p>
              </div>
              <div className="rounded-xl border border-state-success/30 bg-state-success/10 p-4 text-center">
                <p className="text-[10px] text-text-muted">Payout amount</p>
                <p className="text-4xl font-black text-state-success mt-1">₹{claimType.payout}</p>
                <p className="text-[10px] text-text-muted mt-1">Processing via UPI / IMPS</p>
              </div>
            </motion.div>
          )}

          {claimPhase === "paid" && (
            <motion.div key="paid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="rounded-2xl border border-state-success/40 bg-gradient-to-br from-state-success/20 to-accent-amber/10 p-6 text-center">
                <motion.p className="text-5xl mb-3" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>💸</motion.p>
                <p className="text-2xl font-black text-state-success">₹{claimType.payout} Paid!</p>
                <p className="text-sm text-text-secondary mt-1">Transferred to your UPI in</p>
                <p className="text-5xl font-black text-text-primary mt-2">{countdown < 0 ? 0 : countdown}s</p>
                {countdown < 0 && <p className="text-xs text-state-success mt-2">✅ Money in your account</p>}
              </div>
              <div className={`${card} p-4 space-y-2`}>
                {[
                  { l: "Claim ID", v: `CLM-${Date.now().toString().slice(-8)}`, c: "text-accent-amber font-mono" },
                  { l: "Disruption", v: claimType.label, c: "text-text-primary" },
                  { l: "Method", v: "UPI / IMPS (Simulated)", c: "text-text-primary" },
                  { l: "Status", v: "PAID ✓", c: "text-state-success font-bold" },
                ].map(r => (
                  <div key={r.l} className="flex justify-between text-xs">
                    <span className="text-text-muted">{r.l}</span>
                    <span className={r.c}>{r.v}</span>
                  </div>
                ))}
              </div>
              <button onClick={resetClaim}
                className="w-full rounded-xl border border-white/[0.08] py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors">
                File Another Claim
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          {/* Policy Details */}
          <motion.div {...b(4)} className={`${card} p-5`}>
            <h2 className="text-sm font-semibold text-text-primary mb-4">📋 Policy Details</h2>
            <div className="space-y-3">
              {[
                { label: "Policy Number",   value: `GA-2026-${user.phone.slice(-6)}` },
                { label: "Platform",        value: platform },
                { label: "Zone",            value: zone },
                { label: "Coverage Types",  value: "Weather · Flood · Curfew · Job Loss" },
                { label: "Weekly Premium",  value: `₹${weekly}` },
                { label: "Weekly Coverage", value: `₹${coverage.toFixed(0)}` },
                { label: "Valid Until",     value: policyEnd.toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) },
                { label: "AI Risk Score",   value: `${riskPct}% zone risk` },
              ].map(r => (
                <div key={r.label} className="flex justify-between border-b border-white/[0.04] pb-2">
                  <span className="text-[10px] text-text-muted">{r.label}</span>
                  <span className="text-[10px] font-semibold text-text-primary">{r.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Premium Breakdown */}
          <motion.div {...b(5)} className={`${card} p-5`}>
            <h2 className="text-sm font-semibold text-text-primary mb-4">🤖 AI Premium Breakdown</h2>
            <div className="space-y-2">
              {[
                { label: "Base premium",   value: "₹30.00",  color: "text-text-secondary" },
                { label: "Zone flood risk", value: `+₹${((ZONE_RISK[zone] ?? 0.70) * 20).toFixed(2)}`, color: "text-state-warning" },
                { label: "Platform risk",   value: `+₹${((PLATFORM_RISK[platform] ?? 0.65) * 12).toFixed(2)}`, color: "text-accent-ember" },
                { label: "Activity score", value: `-₹${((1 - daysPerWeek/7) * 8).toFixed(2)}`, color: "text-state-success" },
                { label: "Weekly total",   value: `₹${weekly}`, color: "text-accent-amber font-black text-base" },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                  <span className="text-[10px] text-text-muted">{r.label}</span>
                  <span className={`text-xs ${r.color}`}>{r.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[9px] text-text-muted">Premium recalculated weekly using ML model on zone weather history, platform churn rate, and personal activity.</p>
          </motion.div>

          {/* Claim History */}
          <motion.div {...b(6)} className={`${card} p-5`}>
            <h2 className="text-sm font-semibold text-text-primary mb-4">📜 Claim History</h2>
            <div className="space-y-3">
              {claimHistory.map(c => (
                <div key={c.id} className={`flex items-center justify-between rounded-xl bg-surface-2/50 border border-white/[0.04] px-4 py-3`}>
                  <div>
                    <p className="text-[10px] font-mono text-accent-amber">{c.id}</p>
                    <p className="text-sm font-semibold text-text-primary">{c.type}</p>
                    <p className="text-[10px] text-text-muted">{c.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-state-success">₹{c.amount}</p>
                    <span className="rounded-full bg-state-success/15 border border-state-success/25 px-2 py-0.5 text-[9px] font-bold text-state-success">{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
