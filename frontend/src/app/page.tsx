"use client";

import { useState } from "react";

const coverages = [
  { icon: "🌧️", name: "Heavy Rain Shield",    from: "₹40", col: "border-blue-400/30 from-blue-500/10 to-cyan-500/10",      ico: "bg-blue-500/20 text-blue-300"    },
  { icon: "🌊", name: "Flood Income Cover",   from: "₹35", col: "border-sky-400/30 from-sky-500/10 to-blue-500/10",        ico: "bg-sky-500/20 text-sky-300"      },
  { icon: "💼", name: "Job Loss Cover",       from: "₹60", col: "border-violet-400/30 from-violet-500/10 to-purple-500/10", ico: "bg-violet-500/20 text-violet-300" },
  { icon: "😷", name: "Pollution Shutdown",   from: "₹30", col: "border-emerald-400/30 from-emerald-500/10 to-teal-500/10",  ico: "bg-emerald-500/20 text-emerald-300" },
  { icon: "🚫", name: "Curfew / Strike Loss", from: "₹25", col: "border-amber-400/30 from-amber-500/10 to-yellow-500/10",  ico: "bg-amber-500/20 text-amber-300"   },
  { icon: "⚡", name: "App Outage Cover",     from: "₹20", col: "border-pink-400/30 from-pink-500/10 to-rose-500/10",      ico: "bg-pink-500/20 text-pink-300"    },
];

const heroStats = [
  { v: "60s",   l: "Avg payout time",  i: "⚡" },
  { v: "10M+",  l: "Eligible workers", i: "👥" },
  { v: "₹40",   l: "Starting/week",    i: "💰" },
  { v: "99.8%", l: "Auto-approved",    i: "✅" },
];

const steps = [
  { n: "01", icon: "📱", title: "Register in 2 min",     desc: "Sign up via WhatsApp or web. Share your zone and delivery platform. Done.", color: "bg-cyan-400 text-slate-950"    },
  { n: "02", icon: "🛰️", title: "We watch your zone",    desc: "AI monitors weather, traffic and disruptions in your 2km×2km micro-zone 24/7.", color: "bg-violet-400 text-slate-950" },
  { n: "03", icon: "💸", title: "Get paid instantly",    desc: "Disruption detected? Claim triggers automatically. Money in your account in 60 seconds.", color: "bg-emerald-400 text-slate-950" },
];

const testimonials = [
  { name: "Rahul Kumar",  role: "Swiggy Partner • Mumbai",  init: "RK", bg: "bg-cyan-500",    quote: "Teen din baarish mein kaam nahi hua. GigArmor ne ₹2,400 seedha account mein daale. Koi form nahi, koi call nahi — bas paisa aa gaya." },
  { name: "Priya Sharma", role: "Zomato Partner • Pune",    init: "PS", bg: "bg-violet-500",  quote: "₹43/week mein itni protection? Pehle yakeen nahi tha. Ab 8 mahine ho gaye, 3 claims mile — sab automatic. Best decision ever." },
  { name: "Amit Singh",   role: "Ola Driver • Delhi NCR",   init: "AS", bg: "bg-emerald-500", quote: "WhatsApp pe hi sab ho jaata hai. Baarish ka alert 2 ghante pehle aata hai, phir payment bhi automatically aa jaati hai." },
];

const ZONES: Record<string, number> = {
  "Mumbai Central": 12, "Andheri West": 8, "Bandra-Kurla": 10,
  "Pune Kothrud": 6, "Delhi NCR": 9, "Bengaluru Koramangala": 7,
};
const TYPES: Record<string, number> = {
  "Food Delivery": 5, "Grocery": 3, "E-commerce": 4, "Ride Hailing": 6,
};

export default function Home() {
  const [zone, setZone] = useState("Mumbai Central");
  const [type, setType] = useState("Food Delivery");
  const [days, setDays] = useState(5);

  const zAdj = ZONES[zone] ?? 8;
  const tAdj = TYPES[type] ?? 5;
  const weekly = 40 + zAdj + tAdj - 5;
  const coverage = weekly * 20;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased">

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
          <a href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/30">G</span>
            <span className="text-base font-black tracking-tight text-white">GigArmor</span>
          </a>
          <div className="hidden items-center gap-7 md:flex">
            {[["#coverage","Coverage"],["#how","How it Works"],["#calc","Pricing"],["/dashboard","Dashboard"]].map(([h,l]) => (
              <a key={l} href={h} className="text-sm font-medium text-slate-400 transition-colors hover:text-white">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <a href="https://github.com/Aayush9808/GigArmor" target="_blank" rel="noreferrer"
               className="hidden rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 sm:block">GitHub</a>
            <a href="/login"
               className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5">Login</a>
            <a href="/register"
               className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-blue-500">
              Get Protected
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.18),transparent)]" />
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)",backgroundSize:"28px 28px"}} />
        <div className="absolute -top-20 right-0 h-[700px] w-[700px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-cyan-600/8 blur-[100px] pointer-events-none" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-5 py-2 text-xs font-bold tracking-wide text-yellow-300">
              🏆 Guidewire DEVTrails 2026 — Best Insurtech Submission
            </div>
            <h1 className="text-[clamp(2.8rem,8vw,6rem)] font-black leading-[1.02] tracking-tighter">
              <span className="text-white">Insurance built for</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                India&apos;s gig economy
              </span>
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-400">
              When rain grounds your bike, GigArmor pays you{" "}
              <span className="font-semibold text-white">automatically in 60 seconds</span>.
              No paperwork. No waiting. Built for 10M+ gig workers.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a href="/register"
                 className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:from-cyan-400 hover:to-blue-500">
                Start Free Trial <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
              <a href="/dashboard"
                 className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10">
                View Dashboard
              </a>
              <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer"
                 className="flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-base font-semibold text-slate-400 transition hover:text-white">
                API Docs ↗
              </a>
            </div>
            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {heroStats.map(s => (
                <div key={s.l} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-center transition hover:bg-white/[0.06]">
                  <div className="text-2xl">{s.i}</div>
                  <div className="mt-1.5 text-2xl font-black text-white">{s.v}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PARTNER STRIP ─── */}
      <div className="border-y border-white/[0.05] bg-white/[0.015] py-6">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">Protecting workers across India&apos;s top platforms</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[["bg-orange-500/20 text-orange-300 border-orange-500/20","🍊 Swiggy"],
              ["bg-red-500/20 text-red-300 border-red-500/20","🍕 Zomato"],
              ["bg-yellow-500/20 text-yellow-300 border-yellow-500/20","⚡ Rapido"],
              ["bg-blue-500/20 text-blue-300 border-blue-500/20","🚗 Ola"],
              ["bg-pink-500/20 text-pink-300 border-pink-500/20","📦 Dunzo"],
              ["bg-emerald-500/20 text-emerald-300 border-emerald-500/20","🟢 Blinkit"],
            ].map(([cls, name]) => (
              <span key={name} className={"rounded-full border px-4 py-1.5 text-sm font-bold " + cls}>{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── COVERAGE GRID (PolicyBazaar-style) ─── */}
      <section id="coverage" className="py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">All-in-one protection</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Coverage for every risk you face</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">One subscription. Six shields. Your income is protected no matter what disruption hits.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {coverages.map(c => (
              <div key={c.name}
                   className={"group cursor-pointer rounded-2xl border bg-gradient-to-br p-5 text-center transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl " + c.col}>
                <div className={"mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-2xl " + c.ico}>{c.icon}</div>
                <div className="text-sm font-bold leading-snug text-white">{c.name}</div>
                <div className="mt-1 text-xs text-slate-400">from {c.from}/wk</div>
                <div className="mt-3 text-xs font-semibold text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">Get Quote →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="border-y border-white/[0.05] bg-white/[0.015] py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Designed for simplicity</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Protection in 3 simple steps</h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 transition hover:bg-white/[0.04]">
                <span className={"inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-black " + s.color}>{s.n}</span>
                <div className="mt-5 text-4xl">{s.icon}</div>
                <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                {i < 2 && <span className="absolute -right-2.5 top-10 hidden text-2xl text-slate-700 md:block">›</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALCULATOR (MakeMyTrip-style form) ─── */}
      <section id="calc" className="py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Transparent pricing</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Calculate your weekly premium</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">No hidden fees. Know exactly what you pay and what you get before signing up.</p>
          </div>
          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-white/[0.07] bg-[#060d1a] p-1">
            <div className="rounded-[22px] bg-[#080f1a] p-6 md:p-10">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your details</h3>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-500">Your delivery zone</label>
                    <select value={zone} onChange={e => setZone(e.target.value)}
                            className="w-full rounded-xl border border-white/[0.08] bg-slate-900 px-4 py-3 text-sm text-white transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                      {Object.keys(ZONES).map(z => <option key={z}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-500">Delivery type</label>
                    <select value={type} onChange={e => setType(e.target.value)}
                            className="w-full rounded-xl border border-white/[0.08] bg-slate-900 px-4 py-3 text-sm text-white transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                      {Object.keys(TYPES).map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                      Days worked per week <span className="text-cyan-400 font-bold">{days} days</span>
                    </label>
                    <input type="range" min={1} max={7} value={days} onChange={e => setDays(+e.target.value)}
                           className="h-2 w-full cursor-pointer rounded-full bg-slate-800 accent-cyan-400" />
                    <div className="mt-1 flex justify-between text-xs text-slate-600"><span>1 day</span><span>7 days</span></div>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10 p-6 border border-cyan-500/20">
                  <h3 className="mb-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Your quote</h3>
                  <div>
                    {[
                      ["Base premium",  "₹40",             "text-slate-300"],
                      ["Zone risk",     "+₹" + zAdj,       "text-amber-400"],
                      ["Coverage type", "+₹" + tAdj,       "text-orange-400"],
                      ["Loyalty disc.", "-₹5",             "text-emerald-400"],
                    ].map(([lbl, val, col]) => (
                      <div key={lbl} className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
                        <span className="text-sm text-slate-400">{lbl}</span>
                        <span className={"text-sm font-bold " + col}>{val}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-4">
                      <span className="font-bold text-white">Weekly premium</span>
                      <span className="text-2xl font-black text-cyan-300">₹{weekly}</span>
                    </div>
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs text-slate-500">Weekly coverage</span>
                      <span className="text-sm font-semibold text-slate-300">₹{coverage.toLocaleString()}</span>
                    </div>
                  </div>
                  <a href="/register"
                     className="mt-5 block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:from-cyan-400 hover:to-blue-500">
                    Start Protection for ₹{weekly}/week →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="border-t border-white/[0.05] py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Real stories</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Workers who trust GigArmor</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map(t => (
              <div key={t.name} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 transition hover:bg-white/[0.04]">
                <div className="flex gap-0.5 text-amber-400 text-sm">★★★★★</div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={"flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-black text-white " + t.bg}>{t.init}</div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-xs text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="border-t border-white/[0.05] py-20">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <div className="rounded-3xl border border-white/[0.07] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10 px-8 py-16">
            <h2 className="text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Ready to protect your income?</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-400">Join 10,000+ gig workers who never worry about bad weather days.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="/register"
                 className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-9 py-3.5 font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:from-cyan-400 hover:to-blue-500">
                Start Free Trial
              </a>
              <a href="https://github.com/Aayush9808/GigArmor" target="_blank" rel="noreferrer"
                 className="rounded-xl border border-white/10 px-9 py-3.5 font-semibold text-slate-300 transition hover:text-white">
                View on GitHub ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.05] py-10">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-xs font-black text-white">G</span>
              <span className="font-black text-white">GigArmor</span>
            </div>
            <div className="flex flex-wrap gap-5 text-sm text-slate-500">
              {[["#coverage","Coverage"],["#how","How it Works"],["#calc","Pricing"],["/dashboard","Dashboard"],["/dashboard/claims","Claims"],["/dashboard/analytics","Analytics"],["http://localhost:8000/docs","API Docs"],["https://github.com/Aayush9808/Guidewire-Temp","GitHub"]].map(([h,l]) => (
                <a key={l} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel={h.startsWith("http") ? "noreferrer" : undefined}
                   className="transition hover:text-white">{l}</a>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-white/[0.05] pt-6 text-center text-xs text-slate-700">
            Guidewire DEVTrails 2026 • GigArmor • Built for India&apos;s gig workforce
          </div>
        </div>
      </footer>
    </div>
  );
}
