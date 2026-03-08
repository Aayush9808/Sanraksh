"use client";

import { useMemo, useState } from "react";

const zoneAdjustments: Record<string, number> = {
  "Mumbai Central": 8,
  "Andheri West": 7,
  "Bandra-Kurla": 9,
  "Pune Kothrud": 5,
  "Delhi NCR": 6,
  "Bengaluru Koramangala": 4,
};

const deliverySeasonal: Record<string, number> = {
  "Food Delivery": 3,
  Grocery: 2,
  "E-commerce": 1,
  "Ride Hailing": 4,
};

export default function HomePage() {
  const [zone, setZone] = useState("Mumbai Central");
  const [deliveryType, setDeliveryType] = useState("Food Delivery");
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const premium = useMemo(() => {
    const base = 40;
    const zoneRisk = zoneAdjustments[zone] ?? 8;
    const seasonal = deliverySeasonal[deliveryType] ?? 3;
    const loyalty = Math.min(5, Math.max(2, Math.round(daysPerWeek * 0.8)));
    const total = base + zoneRisk + seasonal - loyalty;

    return {
      base,
      zoneRisk,
      seasonal,
      loyalty,
      total,
      coverage: total <= 45 ? 700 : total <= 48 ? 800 : 900,
    };
  }, [zone, deliveryType, daysPerWeek]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-black text-white">🛡️ GigShield</a>
          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how-it-works" className="hover:text-white">How it Works</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="/dashboard" className="hover:text-white">Dashboard</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-300">Get Protected →</a>
            <a href="https://github.com/Aayush9808/Guidewire-Temp" target="_blank" rel="noreferrer" className="hidden rounded-xl border border-white/20 px-6 py-3 text-white hover:bg-white/10 sm:inline-flex">GitHub ⭐</a>
          </div>
        </nav>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-violet-950 px-6 py-20">
        <div className="absolute -left-16 -top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl pointer-events-none" />
        <div className="relative mx-auto w-full max-w-7xl">
          <span className="inline-flex rounded-full border border-yellow-300/40 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-200">🏆 Guidewire DEVTrails 2026 — Best Insurtech</span>
          <h1 className="mt-8 text-5xl font-black md:text-7xl">
            <span className="block text-white">Income Protection for</span>
            <span className="block bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">India&apos;s Gig Workers</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">When rain stops your delivery run, GigShield pays you automatically. No forms. No waiting. Just protection that works like you do.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="/dashboard" className="rounded-xl bg-cyan-400 px-6 py-3 text-lg font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-300">Start Free Trial</a>
            <a href="/dashboard" className="rounded-xl border border-white/20 px-6 py-3 text-white hover:bg-white/10">View Dashboard →</a>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 px-6 py-3 text-white hover:bg-white/10">API Docs ↗</a>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              ["⚡", "60 sec", "Average Payout Time"],
              ["💰", "₹40/week", "Starting Premium"],
              ["🛵", "10M+", "Workers Eligible"],
              ["✅", "99.8%", "Auto-Approval Rate"],
            ].map(([icon, value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                <p className="text-2xl">{icon}</p><p className="mt-2 text-2xl font-black text-white">{value}</p><p className="text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-white/10 bg-slate-900/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Simple by design</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Protection in 3 steps</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["01", "bg-cyan-400/20 text-cyan-300", "🔐", "Sign Up in 2 Minutes", "Register via WhatsApp or web. Share your zone and delivery type. Done."],
              ["02", "bg-violet-400/20 text-violet-300", "🌦️", "We Monitor Your Zone", "Real-time weather and disruption signals across 2km×2km micro-zones, 24x7."],
              ["03", "bg-emerald-400/20 text-emerald-300", "💸", "Get Paid Automatically", "Disruption threshold hit? Claim auto-triggered. Money in your account in 60 seconds."],
            ].map(([num, color, icon, title, desc], idx) => (
              <div key={title} className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full font-bold ${color}`}>{num}</div>
                <p className="mt-4 text-3xl">{icon}</p>
                <h3 className="mt-3 text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-slate-400">{desc}</p>
                {idx < 2 && <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-2xl text-slate-500 md:block">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Why workers trust GigShield</p>
        <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Simple, fast, and fair protection</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["🗺️", "Hyperlocal Risk Intelligence", "2km×2km micro-zone mapping. Your premium is based on YOUR street&apos;s risk, not a citywide average.", "Street-level precision ✓", "text-cyan-300"],
            ["⚡", "60-Second Claim Settlement", "Parametric triggers auto-process claims the moment disruption thresholds are crossed. No receipts needed.", "Zero paperwork ✓", "text-emerald-300"],
            ["💎", "Transparent Premium Formula", "See exactly: Base ₹40 + Zone Risk ± Season Factor - Loyalty Discount. No hidden charges.", "Full breakdown ✓", "text-violet-300"],
            ["📱", "WhatsApp-First Design", "Register, check status, and receive your payout entirely over WhatsApp. No app download needed.", "Works on any phone ✓", "text-green-300"],
            ["🤖", "ML Fraud Prevention", "XGBoost model + Isolation Forest anomaly detection protects honest workers from bad actors.", "Smart & fair ✓", "text-blue-300"],
            ["🔔", "Predictive Safety Alerts", "Know 2 hours before rain hits your zone. Plan ahead. Protect your earnings proactively.", "Pre-disruption alerts ✓", "text-amber-300"],
          ].map(([icon, title, desc, badge, badgeColor]) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
              <p className="text-3xl">{icon}</p><h3 className="mt-3 text-xl font-bold text-white">{title}</h3><p className="mt-3 text-slate-400">{desc}</p><p className={`mt-5 text-sm font-semibold ${badgeColor}`}>{badge}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y border-white/10 bg-slate-900/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Know your price upfront</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">Calculate your weekly premium</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <label className="mb-2 block text-sm text-slate-300">Your Zone</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                {Object.keys(zoneAdjustments).map((z) => <option key={z} className="bg-slate-900">{z}</option>)}
              </select>
              <label className="mb-2 mt-5 block text-sm text-slate-300">Delivery Type</label>
              <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white">
                {Object.keys(deliverySeasonal).map((t) => <option key={t} className="bg-slate-900">{t}</option>)}
              </select>
              <label className="mb-2 mt-5 block text-sm text-slate-300">Days per week: {daysPerWeek}</label>
              <input type="range" min={1} max={7} value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))} className="w-full accent-cyan-400" />
            </div>
            <div className="rounded-2xl border border-cyan-400/40 bg-white/5 p-6">
              <h3 className="text-xl font-bold text-white">Your Premium Breakdown</h3>
              <div className="mt-4 space-y-1 text-slate-300">
                <div className="flex justify-between border-b border-white/10 py-3"><span>Base Premium</span><span>₹{premium.base.toFixed(2)}</span></div>
                <div className="flex justify-between border-b border-white/10 py-3"><span>Zone Risk Adjustment</span><span>+ ₹{premium.zoneRisk.toFixed(2)}</span></div>
                <div className="flex justify-between border-b border-white/10 py-3"><span>Seasonal Factor</span><span>+ ₹{premium.seasonal.toFixed(2)}</span></div>
                <div className="flex justify-between border-b border-white/10 py-3"><span>Loyalty Discount (3 months)</span><span>- ₹{premium.loyalty.toFixed(2)}</span></div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-lg font-bold text-cyan-300"><span>Your Weekly Premium</span><span>₹{premium.total.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold text-cyan-300"><span>Coverage per day</span><span>₹{premium.coverage.toFixed(2)}</span></div>
              </div>
              <a href="/dashboard" className="mt-6 inline-flex w-full justify-center rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-300">Start Protection for ₹{premium.total}/week →</a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Real workers. Real stories.</p>
          <h2 className="mt-3 text-3xl font-black text-white md:text-5xl">They trust GigShield</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["RK", "bg-cyan-400/20 text-cyan-300", "Rahul Kumar", "Swiggy Delivery Partner, Mumbai", "Ek baar baarish mein 3 din kaam nahi hua. GigShield ne ₹2,400 seedha account mein diye. Ek form nahi bhara, ek call nahi ki. Bas paisa aa gaya."],
              ["PS", "bg-violet-400/20 text-violet-300", "Priya Sharma", "Zomato Partner, Pune", "Premium sirf ₹43/week hai. Pehle socha fraud hoga. Ab 8 mahine ho gaye, 3 baar claim mila. Sab automatic. GigShield best hai."],
              ["AS", "bg-emerald-400/20 text-emerald-300", "Amit Singh", "Ola Driver, Delhi NCR", "WhatsApp pe hi sab ho jaata hai. Bank app bhi nahi kholna padta. Baarish ka alert aata hai pehle, phir disruption hone pe payment bhi aa jaati hai."],
            ].map(([initials, avatar, name, role, quote]) => (
              <article key={name} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full font-bold ${avatar}`}>{initials}</div>
                <h3 className="mt-4 text-lg font-bold text-white">{name}</h3>
                <p className="text-sm text-slate-400">{role}</p>
                <p className="mt-3 text-amber-300">⭐⭐⭐⭐⭐</p>
                <p className="mt-3 text-slate-300">“{quote}”</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-10 text-center md:p-16">
          <h2 className="text-3xl font-black text-white md:text-5xl">Ready to protect your income?</h2>
          <p className="mt-4 text-slate-300">Join 10,000+ gig workers who never worry about bad weather days.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/dashboard" className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/25 hover:bg-cyan-300">Start Free Trial</a>
            <a href="https://github.com/Aayush9808/Guidewire-Temp" target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 px-6 py-3 text-white hover:bg-white/10">Open GitHub Project ↗</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xl font-black text-white">🛡️ GigShield</p><p className="text-slate-400">Parametric insurance built for India&apos;s hardest workers.</p></div>
          <div className="flex flex-wrap gap-4 text-slate-300">
            <a href="/dashboard" className="hover:text-white">Dashboard</a>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-white">API Docs</a>
            <a href="https://github.com/Aayush9808/Guidewire-Temp" target="_blank" rel="noreferrer" className="hover:text-white">GitHub</a>
            <a href="#" className="hover:text-white">About</a>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-slate-400">Guidewire DEVTrails 2026 • GigShield • Built for India&apos;s gig workforce</p>
      </footer>
    </div>
  );
}
