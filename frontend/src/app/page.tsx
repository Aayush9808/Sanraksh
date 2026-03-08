"use client";

import { useState } from "react";

const stats = [
  { icon: "⚡", value: "60 sec",   label: "Average Payout Time" },
  { icon: "💰", value: "₹40/wk",  label: "Starting Premium" },
  { icon: "🛵", value: "10M+",    label: "Workers Eligible" },
  { icon: "✅", value: "99.8%",   label: "Auto-Approval Rate" },
];

const features = [
  { icon: "🗺️", title: "Hyperlocal Risk Intelligence",  badge: "Street-level precision ✓", badgeColor: "bg-cyan-400/20 text-cyan-300 border-cyan-300/30",    desc: "2km×2km micro-zone mapping. Your premium is based on YOUR street's risk, not a citywide average." },
  { icon: "⚡", title: "60-Second Claim Settlement",    badge: "Zero paperwork ✓",          badgeColor: "bg-emerald-400/20 text-emerald-300 border-emerald-300/30", desc: "Parametric triggers auto-process claims the moment disruption thresholds are crossed. No receipts needed." },
  { icon: "💎", title: "Transparent Premium Formula",  badge: "Full breakdown ✓",          badgeColor: "bg-violet-400/20 text-violet-300 border-violet-300/30",  desc: "See exactly: Base ₹40 + Zone Risk ± Season Factor - Loyalty Discount. No hidden charges." },
  { icon: "📱", title: "WhatsApp-First Design",        badge: "Works on any phone ✓",      badgeColor: "bg-green-400/20 text-green-300 border-green-300/30",      desc: "Register, check status, and receive your payout entirely over WhatsApp. No app download needed." },
  { icon: "🤖", title: "ML Fraud Prevention",          badge: "Smart & fair ✓",            badgeColor: "bg-blue-400/20 text-blue-300 border-blue-300/30",         desc: "XGBoost model + Isolation Forest anomaly detection protects honest workers from bad actors." },
  { icon: "🔔", title: "Predictive Safety Alerts",     badge: "Pre-disruption alerts ✓",   badgeColor: "bg-amber-400/20 text-amber-300 border-amber-300/30",      desc: "Know 2 hours before rain hits your zone. Plan ahead. Protect your earnings proactively." },
];

const steps = [
  { num: "01", color: "bg-cyan-400 text-slate-950",    icon: "🔐", title: "Sign Up in 2 Minutes",   desc: "Register via WhatsApp or web. Share your zone and delivery type. Done." },
  { num: "02", color: "bg-violet-400 text-slate-950",  icon: "🌦️", title: "We Monitor Your Zone",   desc: "Real-time weather and disruption signals across 2km×2km micro-zones, 24x7." },
  { num: "03", color: "bg-emerald-400 text-slate-950", icon: "💸", title: "Get Paid Automatically", desc: "Disruption threshold hit? Claim auto-triggered. Money in your account in 60 seconds." },
];

const testimonials = [
  { initials: "RK", color: "bg-cyan-400/20 text-cyan-300",      name: "Rahul Kumar",  role: "Swiggy Delivery Partner, Mumbai",  quote: "Ek baar baarish mein 3 din kaam nahi hua. GigShield ne 2,400 rupee seedha account mein diye. Ek form nahi bhara, ek call nahi ki. Bas paisa aa gaya." },
  { initials: "PS", color: "bg-violet-400/20 text-violet-300",  name: "Priya Sharma", role: "Zomato Partner, Pune",              quote: "Premium sirf 43 rupee/week hai. Pehle socha fraud hoga. Ab 8 mahine ho gaye, 3 baar claim mila. Sab automatic. GigShield best hai." },
  { initials: "AS", color: "bg-emerald-400/20 text-emerald-300",name: "Amit Singh",   role: "Ola Driver, Delhi NCR",            quote: "WhatsApp pe hi sab ho jaata hai. Bank app bhi nahi kholna padta. Baarish ka alert aata hai pehle, phir payment bhi aa jaati hai." },
];

export default function Home() {
  const [days, setDays] = useState(5);
  const base = 40, zone = 8, seasonal = 3, loyalty = 5;
  const total = base + zone + seasonal - loyalty;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-black text-white">Shield GigShield</a>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex">
            <a href="#features"   className="hover:text-white transition-colors">Features</a>
            <a href="#how"        className="hover:text-white transition-colors">How it Works</a>
            <a href="#calculator" className="hover:text-white transition-colors">Pricing</a>
            <a href="/dashboard"  className="hover:text-white transition-colors">Dashboard</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/25">Get Protected</a>
            <a href="https://github.com/Aayush9808/Guidewire-Temp" target="_blank" rel="noreferrer" className="hidden rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors sm:inline-flex">GitHub</a>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-blue-950 via-slate-950 to-violet-950">
        <div className="pointer-events-none absolute -top-24 -left-16 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow-300/40 bg-yellow-400/10 px-5 py-2 text-sm font-semibold text-yellow-200">
            Guidewire DEVTrails 2026 - Best Insurtech Submission
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            <span className="text-white">Income Protection for</span>
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">India Gig Workers</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-300 md:text-xl">
            When rain stops your delivery run, GigShield pays you automatically. No forms. No waiting. Just protection that works like you do.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a href="/dashboard" className="rounded-xl bg-cyan-400 px-8 py-4 text-base font-bold text-slate-950 shadow-lg shadow-cyan-500/30 hover:bg-cyan-300 transition-colors">Start Free Trial</a>
            <a href="/dashboard" className="rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors">View Dashboard</a>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 transition-colors">API Docs</a>
          </div>
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-300/40">
                <div className="text-2xl">{s.icon}</div>
                <div className="mt-2 text-2xl font-extrabold text-cyan-200">{s.value}</div>
                <div className="mt-1 text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-b border-white/10 bg-slate-900/50 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Simple by design</p>
          <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">Protection in 3 steps</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.num} className="relative rounded-2xl border border-white/10 bg-white/5 p-8 text-left shadow-lg shadow-black/20 hover:border-white/20 transition-all">
                <span className={"inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black " + step.color}>{step.num}</span>
                <div className="mt-4 text-4xl">{step.icon}</div>
                <h3 className="mt-4 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-slate-300 text-sm leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && <span className="absolute -right-4 top-1/2 hidden -translate-y-1/2 text-2xl text-slate-600 md:block">-&gt;</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Why workers trust GigShield</p>
          <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">Simple, fast, and fair</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((f) => (
              <article key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 transition-all hover:-translate-y-1 hover:border-white/20">
                <div className="text-4xl">{f.icon}</div>
                <h3 className="mt-4 text-xl font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{f.desc}</p>
                <span className={"mt-4 inline-block rounded-full border px-3 py-1 text-xs font-bold " + f.badgeColor}>{f.badge}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="border-y border-white/10 bg-slate-900/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Know your price upfront</p>
          <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">Calculate your weekly premium</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/20">
              <h3 className="mb-6 text-lg font-bold text-white">Your Details</h3>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Your Zone</label>
                  <select className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none">
                    {["Mumbai Central","Andheri West","Bandra-Kurla","Pune Kothrud","Delhi NCR","Bengaluru Koramangala"].map(z=><option key={z}>{z}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">Delivery Type</label>
                  <select className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none">
                    {["Food Delivery","Grocery","E-commerce","Ride Hailing"].map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 flex justify-between text-sm font-semibold text-slate-300">Days per week <span className="text-cyan-300">{days} days</span></label>
                  <input type="range" min={1} max={7} value={days} onChange={e=>setDays(Number(e.target.value))} className="w-full accent-cyan-400" />
                  <div className="mt-1 flex justify-between text-xs text-slate-500"><span>1</span><span>7</span></div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-8 shadow-lg shadow-black/20">
              <h3 className="mb-6 text-lg font-bold text-white">Your Premium Breakdown</h3>
              <div className="space-y-1">
                {[["Base Premium","Rs."+base+".00","text-slate-200"],["Zone Risk Adjustment","+ Rs."+zone+".00","text-red-300"],["Seasonal Factor","+ Rs."+seasonal+".00","text-amber-300"],["Loyalty Discount",`- Rs.${loyalty}.00`,"text-emerald-300"]].map(([label,val,color])=>(
                  <div key={label} className="flex items-center justify-between border-b border-white/10 py-3 text-sm">
                    <span className="text-slate-300">{label}</span>
                    <span className={"font-bold " + color}>{val}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 text-lg">
                  <span className="font-black text-white">Your Weekly Premium</span>
                  <span className="text-2xl font-black text-cyan-300">Rs.{total}.00</span>
                </div>
                <div className="flex items-center justify-between pb-2 text-sm">
                  <span className="text-slate-400">Coverage per disruption day</span>
                  <span className="font-bold text-white">Rs.800.00</span>
                </div>
              </div>
              <a href="/dashboard" className="mt-6 block w-full rounded-xl bg-cyan-400 py-4 text-center font-bold text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/25">
                Start Protection for Rs.{total}/week
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Real workers. Real stories.</p>
          <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">They trust GigShield</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/20 hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <span className={"flex h-10 w-10 items-center justify-center rounded-full text-sm font-black " + t.color}>{t.initials}</span>
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-amber-300">5 stars</div>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">{t.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/50 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-10 md:p-16">
            <h2 className="text-4xl font-black text-white md:text-5xl">Ready to protect your income?</h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-300">Join 10,000+ gig workers who never worry about bad weather days.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a href="/dashboard" className="rounded-xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/25">Start Free Trial</a>
              <a href="https://github.com/Aayush9808/Guidewire-Temp" target="_blank" rel="noreferrer" className="rounded-xl border border-white/30 px-8 py-4 font-semibold text-white hover:bg-white/10 transition-colors">Open GitHub Project</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-slate-950 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xl font-black text-white">GigShield</p>
              <p className="mt-1 text-sm text-slate-400">Protecting India gig workforce, one policy at a time.</p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">API Docs</a>
              <a href="https://github.com/Aayush9808/Guidewire-Temp" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <a href="/dashboard/claims" className="hover:text-white transition-colors">Claims</a>
              <a href="/dashboard/analytics" className="hover:text-white transition-colors">Analytics</a>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
            Guidewire DEVTrails 2026 - GigShield - Built for India gig workforce
          </div>
        </div>
      </footer>
    </div>
  );
}
