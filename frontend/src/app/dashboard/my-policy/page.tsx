"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE } from "../../../lib/config";

const DISRUPTION_TYPES = [
  { id: "heavy_rain",  label: "Heavy Rain / Storm",     icon: "🌧️", desc: "Rain > 50mm in your zone",        premium_add: 0, payout: 800  },
  { id: "flood",       label: "Zone Flooding",           icon: "🌊", desc: "Flood reported in delivery zone",  premium_add: 5, payout: 1200 },
  { id: "pollution",   label: "AQI > 400 Shutdown",      icon: "😷", desc: "Severe pollution, GRAP-4 active",  premium_add: 3, payout: 600  },
  { id: "curfew",      label: "Curfew / Strike",         icon: "🚫", desc: "Zone closure, unable to deliver",  premium_add: 4, payout: 900  },
  { id: "app_outage",  label: "Platform App Outage",     icon: "⚡", desc: "Platform down > 3 hours",          premium_add: 2, payout: 500  },
  { id: "job_loss",    label: "Account Deactivation",    icon: "💼", desc: "Platform removed your account",    premium_add: 8, payout: 2000 },
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
  const riskScore  = (zoneScore * 0.5 + platScore * 0.3 + dayScore * 0.2);
  const base = 30;
  const premium = base + riskScore * 40;
  return Math.round(premium * 100) / 100;
}

type ClaimPhase = "idle" | "detecting" | "verifying" | "approved" | "paid";

interface UserData {
  name: string;
  phone: string;
  platform: string;
  city: string;
  role: string;
  zone?: string;
}

export default function MyPolicyPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [daysPerWeek] = useState(5);
  const [claimType, setClaimType] = useState(DISRUPTION_TYPES[0]);
  const [claimPhase, setClaimPhase] = useState<ClaimPhase>("idle");
  const [countdown, setCountdown] = useState(60);
  const [fraudScore] = useState(() => Math.round(Math.random() * 12 + 2) / 100); // 0.02–0.14
  const [claimHistory] = useState([
    { id: "CLM-20260301-001", type: "Heavy Rain", date: "1 Mar 2026", amount: 800,  status: "PAID" },
    { id: "CLM-20260215-089", type: "Flood",      date: "15 Feb 2026", amount: 1200, status: "PAID" },
    { id: "CLM-20260108-042", type: "Curfew",     date: "8 Jan 2026",  amount: 900,  status: "PAID" },
  ]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("gigarmor_user");
    if (!raw) { router.push("/login"); return; }
    const u = JSON.parse(raw) as UserData;
    setUser(u);
  }, [router]);

  const zone     = user?.zone     ?? "Andheri West";
  const platform = user?.platform ?? "Zomato";
  const weekly   = calcWeeklyPremium(zone, platform, daysPerWeek);
  const coverage = weekly * 20;
  const riskPct  = Math.round((ZONE_RISK[zone] ?? 0.70) * 100);

  const activeDisruption = DISRUPTION_TYPES.find(d => d.id === "heavy_rain");
  const policyEnd = new Date(); policyEnd.setDate(policyEnd.getDate() + 21);

  function startClaim() {
    setClaimPhase("detecting");
    setTimeout(() => setClaimPhase("verifying"), 2000);
    setTimeout(() => setClaimPhase("approved"),  4500);
    setTimeout(() => {
      setClaimPhase("paid");
      let c = 60;
      timerRef.current = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0 && timerRef.current) clearInterval(timerRef.current);
      }, 1000);
    }, 6500);
  }

  function resetClaim() {
    setClaimPhase("idle");
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  if (!user) return (
    <div className="flex min-h-screen items-center justify-center bg-[#060d1a] text-slate-400">
      <p className="animate-pulse">Loading your policy…</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#060d1a] text-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-white/[0.06] bg-[#060d1a]">
        <div className="border-b border-white/[0.06] px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-slate-950">G</span>
            <span className="text-lg font-black tracking-tight text-white">GigArmor</span>
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Worker Portal</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {[
            { href: "/dashboard/my-policy", icon: "🛡️", label: "My Policy",   active: true  },
            { href: "/dashboard/triggers",  icon: "⚡", label: "Live Alerts", active: false },
            { href: "/dashboard/policy-terms", icon: "📘", label: "Policy Terms", active: false },
            { href: "/dashboard/profile", icon: "👤", label: "Profile", active: false },
          ].map(item => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                ${item.active ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-4 space-y-2">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500">{platform}</p>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="w-full rounded-xl border border-white/[0.06] px-3 py-2 text-xs text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-colors text-left">
            Sign out
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs text-slate-500 uppercase tracking-widest">GigArmor / My Policy</p>
            <h1 className="text-3xl font-black text-white">Welcome, {user.name.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-sm text-slate-400">Your income is protected. Here's your coverage dashboard.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">Policy Active</span>
          </div>
        </div>

        {/* Live Zone Alert */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex items-center gap-4">
          <span className="text-3xl">🌧️</span>
          <div className="flex-1">
            <p className="font-bold text-amber-300">Live Alert — Heavy rain detected in {zone}</p>
            <p className="text-sm text-slate-400 mt-0.5">Rainfall &gt; 60mm/hr. Parametric trigger active. You can file a claim now.</p>
          </div>
          <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-300 animate-pulse">LIVE</span>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Weekly Premium",   value: `₹${weekly}`,          icon: "💰", sub: `Zone risk: ${riskPct}%`,     color: "border-cyan-500/20 bg-cyan-500/5" },
            { label: "Weekly Coverage",  value: `₹${coverage.toFixed(0)}`, icon: "🛡️", sub: "Income protected",      color: "border-emerald-500/20 bg-emerald-500/5" },
            { label: "Policy Valid",     value: policyEnd.toLocaleDateString("en-IN",{day:"numeric",month:"short"}), icon: "📅", sub: "21 days left", color: "border-violet-500/20 bg-violet-500/5" },
            { label: "Total Claimed",    value: `₹${claimHistory.reduce((s,c)=>s+c.amount,0).toLocaleString()}`, icon: "💸", sub: `${claimHistory.length} claims paid`, color: "border-amber-500/20 bg-amber-500/5" },
          ].map(k => (
            <div key={k.label} className={`rounded-2xl border p-5 ${k.color}`}>
              <div className="mb-2 text-2xl">{k.icon}</div>
              <div className="text-2xl font-black text-white">{k.value}</div>
              <div className="mt-0.5 text-sm font-medium text-slate-200">{k.label}</div>
              <div className="text-xs text-slate-500">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── File a Claim ── */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <h2 className="mb-1 text-lg font-bold text-white">⚡ File a Claim</h2>
            <p className="mb-5 text-xs text-slate-500">Select the disruption type. AI verifies automatically.</p>

            {claimPhase === "idle" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {DISRUPTION_TYPES.map(d => (
                    <button key={d.id}
                      onClick={() => setClaimType(d)}
                      className={`rounded-xl border p-3 text-left transition-all
                        ${claimType.id === d.id
                          ? "border-cyan-500/50 bg-cyan-500/10 text-white"
                          : "border-white/[0.06] bg-white/[0.01] text-slate-400 hover:border-white/20 hover:text-white"}`}>
                      <div className="text-xl mb-1">{d.icon}</div>
                      <div className="text-xs font-semibold">{d.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Payout: ₹{d.payout}</div>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs text-slate-500 mb-1">Selected disruption</p>
                  <p className="font-semibold text-white">{claimType.icon} {claimType.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{claimType.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Expected payout</span>
                    <span className="text-lg font-black text-cyan-300">₹{claimType.payout}</span>
                  </div>
                </div>
                <button onClick={startClaim}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all">
                  Submit Claim →
                </button>
              </div>
            )}

            {claimPhase === "detecting" && (
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                  <p className="font-semibold text-cyan-300">🛰️ Detecting disruption in {zone}…</p>
                  <p className="text-xs text-slate-500">Querying weather API · Checking OpenWeatherMap</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4 space-y-2">
                  {["Weather API ✓","Zone boundary check ✓","Rainfall threshold…"].map((s,i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className={i < 2 ? "text-emerald-400" : "text-amber-400 animate-pulse"}>●</span> {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {claimPhase === "verifying" && (
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-5xl animate-bounce">🤖</span>
                  <p className="font-semibold text-violet-300">AI Fraud Check Running…</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fraud Detection Results</p>
                  {[
                    { label: "GPS location match",    val: "✅ Verified", color: "text-emerald-400" },
                    { label: "Duplicate claim check", val: "✅ No duplicates", color: "text-emerald-400" },
                    { label: "Anomaly detection",     val: "✅ Normal pattern", color: "text-emerald-400" },
                    { label: "Fraud risk score",      val: `${(fraudScore * 100).toFixed(0)}% (Low)`, color: "text-emerald-400" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-xs">
                      <span className="text-slate-400">{r.label}</span>
                      <span className={r.color}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {claimPhase === "approved" && (
              <div className="space-y-4 py-4">
                <div className="flex flex-col items-center gap-3 text-center">
                  <span className="text-6xl">✅</span>
                  <p className="text-xl font-black text-emerald-300">Claim Approved!</p>
                  <p className="text-sm text-slate-400">Initiating UPI transfer to your registered account</p>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <p className="text-xs text-slate-400">Payout amount</p>
                  <p className="text-4xl font-black text-emerald-300 mt-1">₹{claimType.payout}</p>
                  <p className="text-xs text-slate-500 mt-1">Processing via UPI / IMPS</p>
                </div>
              </div>
            )}

            {claimPhase === "paid" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 p-6 text-center">
                  <p className="text-5xl mb-3">💸</p>
                  <p className="text-2xl font-black text-emerald-300">₹{claimType.payout} Paid!</p>
                  <p className="text-sm text-slate-300 mt-1">Transferred to your UPI in</p>
                  <p className="text-5xl font-black text-white mt-2">{countdown < 0 ? 0 : countdown}s</p>
                  {countdown < 0 && <p className="text-xs text-emerald-400 mt-2">✅ Money in your account</p>}
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Claim ID</span>
                    <span className="font-mono text-cyan-400">CLM-{Date.now().toString().slice(-8)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Disruption</span>
                    <span className="text-white">{claimType.label}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Method</span>
                    <span className="text-white">UPI / IMPS (Simulated)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-400 font-bold">PAID ✓</span>
                  </div>
                </div>
                <button onClick={resetClaim}
                  className="w-full rounded-xl border border-white/[0.08] py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
                  File Another Claim
                </button>
              </div>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Policy Details */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="mb-4 text-lg font-bold text-white">📋 Policy Details</h2>
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
                    <span className="text-xs text-slate-500">{r.label}</span>
                    <span className="text-xs font-semibold text-white">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Premium Breakdown */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="mb-4 text-lg font-bold text-white">🤖 AI Premium Breakdown</h2>
              <div className="space-y-2">
                {[
                  { label: "Base premium",     value: "₹30.00",  color: "text-slate-300" },
                  { label: "Zone flood risk",  value: `+₹${(( ZONE_RISK[zone] ?? 0.70) * 20).toFixed(2)}`, color: "text-amber-400" },
                  { label: "Platform risk",    value: `+₹${((PLATFORM_RISK[platform] ?? 0.65) * 12).toFixed(2)}`, color: "text-orange-400" },
                  { label: "Activity score",   value: `-₹${((1 - daysPerWeek/7) * 8).toFixed(2)}`, color: "text-emerald-400" },
                  { label: "Weekly total",     value: `₹${weekly}`, color: "text-cyan-300 font-black text-base" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center border-b border-white/[0.04] pb-2">
                    <span className="text-xs text-slate-400">{r.label}</span>
                    <span className={`text-xs ${r.color}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-slate-600">Premium recalculated weekly using ML model on zone weather history, platform churn rate, and personal activity.</p>
            </div>

            {/* Claim History */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <h2 className="mb-4 text-lg font-bold text-white">📜 Claim History</h2>
              <div className="space-y-3">
                {claimHistory.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3">
                    <div>
                      <p className="text-xs font-mono text-cyan-400">{c.id}</p>
                      <p className="text-sm font-semibold text-white">{c.type}</p>
                      <p className="text-xs text-slate-500">{c.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-emerald-300">₹{c.amount}</p>
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
