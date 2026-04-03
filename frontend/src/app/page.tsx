"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";

function Count({ end, prefix = "", suffix = "" }: { end: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = end / (1800 / 16);
    const t = setInterval(() => {
      n += step;
      if (n >= end) { setV(end); clearInterval(t); } else setV(n);
    }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{Math.floor(v).toLocaleString()}{suffix}</span>;
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg width={10} height={10} viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-slate-500 text-sm leading-relaxed">{children}</span>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
        <span className="font-semibold text-slate-800 text-sm pr-4">{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          className="text-slate-400 text-xl flex-shrink-0 font-light">+</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
            <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const PLANS = [
  {
    name: "GigArmor Lite", tag: "1 platform", price: "₹29", period: "week",
    desc: "Protect your primary gig income stream",
    features: ["1 platform (Swiggy, Zomato, Uber, etc.)", "₹200/day weather & rain cover", "₹200/incident app outage cover", "SMS + email alerts", "Weekly auto-debit on trigger"],
    cta: "Start Lite →", featured: false,
  },
  {
    name: "GigArmor Standard", tag: "3 platforms · Most popular", price: "₹49", period: "week",
    desc: "Complete protection for active gig workers",
    features: ["3 platforms covered", "₹280/day weather & curfew cover", "₹200/incident app outage", "Bandh & strike protection", "Instant payout (< 4 hrs)", "WhatsApp + SMS alerts"],
    cta: "Start Standard →", featured: true,
  },
  {
    name: "GigArmor Pro", tag: "All platforms", price: "₹79", period: "week",
    desc: "Total protection across every platform",
    features: ["All 8 platforms covered", "₹350/day max income cover", "AQI, flood & cyclone triggers", "Instant payout (< 2 hrs)", "Dedicated support manager", "Family notification alerts"],
    cta: "Start Pro →", featured: false,
  },
];

const FAQS = [
  { q: "How does automatic payout work?", a: "GigArmor monitors weather APIs, platform status, and government alerts 24/7. When a qualifying event hits your registered zone, payouts trigger automatically — no claim required." },
  { q: "When do I receive the money?", a: "Standard Shield: within 4 hours of trigger. Max Shield: within 2 hours. Money goes directly to your registered bank account via IMPS." },
  { q: "What events trigger a payout?", a: "Heavy rainfall, platform app outages (>30 min), government curfews, flooding alerts, extreme heat, poor AQI days, and declared bandhs or strikes in your registered city." },
  { q: "Is there any waiting period?", a: "No. Coverage activates the moment you complete registration. You are protected from day one, immediately." },
  { q: "Can I switch plans later?", a: "Yes. You can upgrade or change your plan at any time from your dashboard. Changes take effect immediately." },
  { q: "Which platforms are supported?", a: "Swiggy, Zomato, Uber, Ola, Dunzo, Blinkit, Porter, and Rapido. More platforms added regularly." },
];

const TRIGGERS = [
  { icon: "\ud83c\udf27\ufe0f", label: "Heavy Rain", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { icon: "\ud83d\udcf5", label: "App Outage", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { icon: "\ud83d\udeab", label: "Curfew/Bandh", color: "bg-red-50 border-red-200 text-red-700" },
  { icon: "\ud83c\udf0a", label: "Flooding", color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  { icon: "\ud83c\udf21\ufe0f", label: "Extreme Heat", color: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  { icon: "\ud83d\udca8", label: "Poor AQI", color: "bg-purple-50 border-purple-200 text-purple-700" },
];

const TESTIMONIALS = [
  { name: "Rahul Kumar", role: "Delivery Partner · Swiggy", city: "Mumbai", text: "App went down for 3 hours on a Saturday night. By Sunday morning, ₹600 was already in my account. I did not file anything.", amount: "₹600", event: "App Outage" },
  { name: "Priya Mistry", role: "Delivery Partner · Zomato", city: "Bengaluru", text: "Heavy rain kept me home for 2 days. Got a message saying ₹560 deposited. No calls, no forms. It just happened.", amount: "₹560", event: "Heavy Rain" },
  { name: "Arjun Sharma", role: "Driver Partner · Uber", city: "Delhi", text: "Curfew was declared and I could not drive all day. Got an SMS that ₹350 was initiated within 90 minutes of the announcement.", amount: "₹350", event: "Curfew" },
];

const LIVE_PAYOUTS = [
  { name: "Rahul K.", platform: "Swiggy", city: "Mumbai", amount: "₹280", event: "rain trigger", time: "4m ago" },
  { name: "Priya M.", platform: "Zomato", city: "Bengaluru", amount: "₹560", event: "rain trigger", time: "11m ago" },
  { name: "Arjun S.", platform: "Uber", city: "Delhi", amount: "₹350", event: "curfew trigger", time: "18m ago" },
];

export default function LandingPage() {
  const [phone, setPhone] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [liveIdx, setLiveIdx] = useState(0);
  const [quotePhone, setQuotePhone] = useState("");
  const [quotePlatform, setQuotePlatform] = useState("");
  const [quoteEarnings, setQuoteEarnings] = useState("");
  const [quoteSent, setQuoteSent] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

  function handleQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!quotePhone || quotePhone.length < 10) return;
    setQuoteLoading(true);
    setTimeout(() => { setQuoteLoading(false); setQuoteSent(true); }, 1000);
  }

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLiveIdx(i => (i + 1) % LIVE_PAYOUTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const lp = LIVE_PAYOUTS[liveIdx];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* NAVBAR */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? "bg-white/96 backdrop-blur shadow-sm border-b border-slate-200/70" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#0F2044] flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-tight">GA</span>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">GigArmor</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {[["#how", "How it works"], ["#plans", "Plans"], ["#about", "About"], ["#faq", "FAQ"], ["#help", "Customer Care"]].map(([href, label]) => (
              <a key={href} href={href} className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">{label}</a>
            ))}
            <Link href="/support" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Support</Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Terms</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:inline-flex text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all">Sign in</Link>
            <Link href="/register">
              <button className="bg-[#0F2044] text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-[#1E3A5F] transition-all hover:shadow-md">Get protected →</button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-white via-slate-50/60 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-[1fr_440px] gap-16 items-center">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                Automatic income protection for gig workers
              </div>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}
              className="text-5xl sm:text-6xl font-extrabold text-slate-900 leading-[1.04] tracking-tight mb-5">
              Your income.<br /><span className="text-[#0F2044]">Protected.</span><br /><span className="text-amber-500">Automatically.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.12 }}
              className="text-slate-500 text-lg leading-relaxed mb-8 max-w-[460px]">
              When platforms crash, rain hits, or curfews happen — your payout lands in your bank account automatically. No claims. No paperwork. No waiting.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }} className="flex flex-col gap-3 mb-10">
              <CheckItem>Works with Swiggy, Zomato, Uber, Ola, Dunzo, Blinkit, Porter & Rapido</CheckItem>
              <CheckItem>Triggered by real-world data — not your claim</CheckItem>
              <CheckItem>No upfront cost. Premium only when disruptions occur.</CheckItem>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}
              className="flex items-center gap-8 flex-wrap">
              {[{ end: 14200, suffix: "+", label: "Workers protected" }, { end: 240, prefix: "₹", suffix: "L+", label: "Paid out this month" }, { end: 98, suffix: "%", label: "Payout success rate" }].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    <Count end={s.end} prefix={s.prefix || ""} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.14 }}>
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-[#0F2044] flex items-center justify-center">
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">Get protected today</div>
                  <div className="text-xs text-slate-400">Setup takes under 3 minutes</div>
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile number</label>
                <div className="flex shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0F2044] focus-within:ring-2 focus-within:ring-[#0F2044]/10 transition-all">
                  <span className="inline-flex items-center bg-slate-50 border-r border-slate-200 px-3 text-slate-500 text-sm font-semibold flex-shrink-0">+91</span>
                  <input type="tel" inputMode="numeric"
                    className="flex-1 bg-white px-3 py-2.5 text-slate-900 text-sm outline-none"
                    placeholder="Your 10-digit number"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>
              </div>
              <Link href={phone.length === 10 ? `/onboarding?phone=${phone}` : "/onboarding"}>
                <button className="w-full bg-[#0F2044] text-white font-bold py-3.5 rounded-xl hover:bg-[#1E3A5F] transition-all hover:shadow-lg text-sm">
                  Check my coverage →
                </button>
              </Link>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[{ icon: "\ud83d\udee1\ufe0f", label: "No claim forms" }, { icon: "\u26a1", label: "Instant payout" }, { icon: "₹0", label: "No upfront cost" }].map(b => (
                  <div key={b.label} className="text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xl mb-1">{b.icon}</div>
                    <div className="text-[10px] font-semibold text-slate-500 leading-tight">{b.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-center mt-4">Trusted by 14,200+ gig workers across India</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={liveIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}
                className="mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <div className="flex-1 text-xs text-emerald-700 font-medium">
                  <span className="font-bold">{lp.name}</span> ({lp.platform} · {lp.city}) received{" "}
                  <span className="font-bold">{lp.amount}</span> — {lp.event}
                </div>
                <span className="text-xs text-emerald-500 flex-shrink-0 font-semibold">{lp.time}</span>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="lbl mb-3">Simple 3-step process</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">How GigArmor works</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto">From registration to payout, everything is automatic. You focus on your work.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", icon: "\ud83d\udcf1", title: "Register in 3 minutes", desc: "Enter your details, pick your platforms, verify your phone. Done. Coverage activates instantly." },
              { n: "02", icon: "\ud83d\udd0d", title: "We monitor 24/7", desc: "GigArmor tracks weather data, platform uptime, and government alerts across your registered zones all the time." },
              { n: "03", icon: "\ud83d\udcb8", title: "Payout lands automatically", desc: "Qualifying event detected, payout initiated, money in your bank. No action needed on your part." },
            ].map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}
                className="text-center p-6">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-5 text-3xl shadow-sm">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">{s.n}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TRIGGER EVENTS */}
      <section className="py-14 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">What triggers your payout?</h2>
            <p className="text-slate-400 mt-2 text-sm">Real disruptions. Real data. Automatic payouts.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {TRIGGERS.map((t, i) => (
              <motion.div key={t.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -2, scale: 1.02 }}
                className={`rounded-xl border p-3.5 text-center cursor-default transition-all ${t.color}`}>
                <div className="text-2xl mb-1.5">{t.icon}</div>
                <div className="text-xs font-bold">{t.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="lbl mb-3">Flexible coverage</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Choose your protection</h2>
            <p className="text-slate-400 mt-3 max-w-md mx-auto">No upfront payment. Premium deducted only when disruptions trigger your coverage.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                className={`relative rounded-2xl p-7 flex flex-col gap-5 border ${p.featured ? "bg-[#0F2044] border-[#1E3A5F] shadow-2xl shadow-[#0F2044]/20" : "bg-white border-slate-200 shadow-sm"}`}>
                {p.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-[#0F2044] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">Most Popular</span>
                  </div>
                )}
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${p.featured ? "text-blue-300" : "text-slate-400"}`}>{p.tag}</span>
                  <h3 className={`text-xl font-bold mt-1 mb-1 ${p.featured ? "text-white" : "text-slate-900"}`}>{p.name}</h3>
                  <p className={`text-sm ${p.featured ? "text-blue-200" : "text-slate-500"}`}>{p.desc}</p>
                </div>
                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-extrabold tracking-tight ${p.featured ? "text-white" : "text-slate-900"}`}>{p.price}</span>
                  <span className={`text-sm mb-1 ${p.featured ? "text-blue-300" : "text-slate-400"}`}>/{p.period}</span>
                </div>
                <div className="flex flex-col gap-2.5 flex-1">
                  {p.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2.5">
                      <span className={`flex-shrink-0 font-bold mt-0.5 ${p.featured ? "text-amber-400" : "text-emerald-500"}`}>✓</span>
                      <span className={`text-sm ${p.featured ? "text-blue-100" : "text-slate-600"}`}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/onboarding">
                  <button className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${p.featured ? "bg-amber-400 text-[#0F2044] hover:bg-amber-300 hover:shadow-lg" : "bg-[#0F2044] text-white hover:bg-[#1E3A5F] hover:shadow-md"}`}>
                    {p.cta}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-8 leading-relaxed">All plans include automatic trigger detection · direct bank transfer · zone monitoring · email & SMS alerts</p>
        </div>
      </section>

      {/* TRUST NUMBERS */}
      <section className="py-14 bg-[#0F2044]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{ end: 14200, suffix: "+", label: "Workers protected" }, { end: 98, suffix: "%", label: "Payout success rate" }, { end: 4, suffix: " hrs", label: "Average payout time" }, { end: 6800, prefix: "₹", suffix: "", label: "Avg. annual benefit" }].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  <Count end={s.end} prefix={s.prefix || ""} suffix={s.suffix} />
                </div>
                <div className="text-blue-300 text-xs font-medium mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="stories" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="lbl mb-3">Real gig workers, real payouts</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">What workers say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -3 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <svg key={si} width={14} height={14} viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <div className="font-semibold text-slate-800 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role} · {t.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-600 text-sm">{t.amount} received</div>
                    <div className="text-xs text-slate-400">{t.event}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="lbl mb-3">Common questions</div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Frequently asked</h2>
          </div>
          <div className="flex flex-col gap-2">
            {FAQS.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <FaqItem q={f.q} a={f.a} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="lbl mb-3">Our mission</div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-5">Built for the people who keep India moving</h2>
              <p className="text-slate-600 leading-relaxed mb-5">India's 15 million gig workers — delivery partners, ride-hail drivers, freelancers — form the backbone of the digital economy. Yet they are the first to lose income when a storm, power cut, app crash, or curfew hits. No employer. No safety net. No recourse.</p>
              <p className="text-slate-600 leading-relaxed mb-6">GigArmor exists to change that. We built the country's first parametric income protection product for gig workers — automatic, data-driven payouts that arrive before the worker even realizes they need help.</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { val: "14,200+", label: "Workers protected" },
                  { val: "₹89L+", label: "Payouts disbursed" },
                  { val: "< 72h", label: "Average payout time" },
                  { val: "8", label: "Platforms integrated" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="text-2xl font-extrabold text-[#0F2044]">{s.val}</div>
                    <div className="text-slate-500 text-sm mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0F2044] rounded-3xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6 text-amber-400">How GigArmor is different</h3>
              <div className="space-y-5">
                {[
                  { icon: "⚡", title: "No claims, ever", desc: "Traditional insurance makes you prove your loss. GigArmor pays automatically when our data confirms the event happened in your zone." },
                  { icon: "🛰️", title: "Verified by real data", desc: "IMD weather APIs, platform status feeds, CPCB AQI, and government alerts — not self-reporting. No fraud, no delays." },
                  { icon: "📆", title: "Weekly, not annual", desc: "Gig workers live week-to-week. So do we. Start, pause, or cancel with no long-term lock-in." },
                  { icon: "🔒", title: "AI fraud protection", desc: "Our scoring engine protects the fund from fraud rings — so genuine workers always get paid first." },
                ].map(f => (
                  <div key={f.title} className="flex gap-4">
                    <span className="text-2xl mt-0.5 flex-shrink-0">{f.icon}</span>
                    <div>
                      <div className="font-bold text-white mb-1">{f.title}</div>
                      <div className="text-blue-300 text-sm leading-relaxed">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GET A QUOTE / STILL CONFUSED */}
      <section id="quote" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: messaging */}
            <div>
              <div className="lbl mb-3">Personalised guidance</div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Still confused? Let's figure it out together.</h2>
              <p className="text-slate-600 leading-relaxed mb-6">Tell us about yourself and we'll recommend the right plan for your earnings, city, and platforms. No pressure, no spam — just a quick callback from our team.</p>
              <div className="space-y-4">
                {[
                  { icon: "📋", title: "Get a personalised recommendation", desc: "We'll match you with the plan that fits your average weekly earnings and risk profile." },
                  { icon: "☎️", title: "Free callback within 2 hours", desc: "A real person will call you to walk through your options — in Hindi, Tamil, Telugu, or English." },
                  { icon: "🔓", title: "Zero commitment", desc: "Getting a quote is free. You decide whether to activate after speaking with us." },
                ].map(f => (
                  <div key={f.title} className="flex gap-4">
                    <span className="text-xl mt-0.5 flex-shrink-0">{f.icon}</span>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{f.title}</div>
                      <div className="text-slate-500 text-sm leading-relaxed">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right: quote form */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              {quoteSent ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">We'll call you soon!</h3>
                  <p className="text-slate-500 text-sm">Expect a call within 2 business hours. We'll recommend the best plan for you.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleQuote} className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Get your free quote</h3>
                  <p className="text-slate-500 text-sm mb-4">Takes 30 seconds. No account needed.</p>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Mobile number</label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#0F2044] focus-within:ring-2 focus-within:ring-[#0F2044]/10 transition-all bg-white">
                      <span className="inline-flex items-center bg-slate-50 border-r border-slate-200 px-3 text-slate-500 text-sm font-semibold flex-shrink-0">+91</span>
                      <input type="tel" inputMode="numeric" placeholder="10-digit number"
                        className="flex-1 bg-transparent px-3 py-3 text-slate-900 text-sm outline-none"
                        value={quotePhone} onChange={e => setQuotePhone(e.target.value.replace(/\D/g, "").slice(0, 10))} required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Primary platform</label>
                    <select value={quotePlatform} onChange={e => setQuotePlatform(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#0F2044] bg-white">
                      <option value="">Select platform</option>
                      {["Swiggy", "Zomato", "Uber", "Ola", "Blinkit", "Dunzo", "Zepto", "Rapido", "Other"].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Average weekly earnings</label>
                    <select value={quoteEarnings} onChange={e => setQuoteEarnings(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 outline-none focus:border-[#0F2044] bg-white">
                      <option value="">Select range</option>
                      {["Under ₹2,000", "₹2,000 – ₹4,000", "₹4,000 – ₹7,000", "₹7,000 – ₹12,000", "Above ₹12,000"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <button type="submit" disabled={quoteLoading || quotePhone.length < 10}
                    className="w-full py-3.5 bg-[#0F2044] text-white font-bold text-sm rounded-xl hover:bg-[#1E3A5F] transition disabled:opacity-40 disabled:cursor-not-allowed">
                    {quoteLoading ? "Sending…" : "Request free callback →"}
                  </button>
                  <p className="text-center text-xs text-slate-400">Or <Link href="/onboarding" className="text-[#0F2044] font-semibold hover:underline">sign up directly</Link> — takes 3 minutes.</p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER CARE */}
      <section id="help" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="lbl mb-3">We&apos;re here for you</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Customer Care &amp; Support</h2>
            <p className="text-slate-400 mt-3 max-w-lg mx-auto">Have a question about your coverage, payout, or account? Reach out any time — no login required.</p>
          </div>
          {/* Contact channels */}
          <div className="grid sm:grid-cols-3 gap-5 mb-12">
            {[
              { icon: "📧", title: "Email Support", value: "support@gigarmor.in", sub: "We reply within 24 hours", href: "mailto:support@gigarmor.in" },
              { icon: "📞", title: "Request a Callback", value: "Free callback in 2 hours", sub: "Hindi · Tamil · Telugu · English", href: "#quote" },
              { icon: "💬", title: "Live Chat Support", value: "Visit our Support Center", sub: "FAQs, guides & contact form", href: "/support" },
            ].map((c, i) => (
              <motion.a key={c.title} href={c.href} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}
                className="block bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[#0F2044]/20 transition-all group cursor-pointer">
                <span className="text-3xl block mb-4">{c.icon}</span>
                <h3 className="font-bold text-slate-900 text-base mb-1 group-hover:text-[#0F2044] transition-colors">{c.title}</h3>
                <p className="text-[#0F2044] font-semibold text-sm mb-1">{c.value}</p>
                <p className="text-slate-400 text-xs">{c.sub}</p>
              </motion.a>
            ))}
          </div>
          {/* Quick help topics */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { icon: "₹", label: "Payout not received?", desc: "Check your payout status and troubleshoot delays." },
              { icon: "🛡️", label: "Policy questions", desc: "Plan coverage, upgrades, cancellations & renewals." },
              { icon: "👤", label: "Account & login help", desc: "Can't log in? Lost access? We'll help you recover." },
              { icon: "⚙️", label: "Technical issues", desc: "App bugs, errors, or something not working right." },
            ].map((t, i) => (
              <motion.div key={t.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg mb-3">{t.icon}</div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{t.label}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
          {/* CTA */}
          <div className="text-center">
            <Link href="/support">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="bg-[#0F2044] text-white font-bold text-sm px-8 py-3.5 rounded-xl hover:bg-[#1E3A5F] transition-all hover:shadow-lg inline-flex items-center gap-2">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Go to Support Center →
              </motion.button>
            </Link>
            <p className="text-slate-400 text-xs mt-3">No account needed · Available 7 days a week</p>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-20 bg-[#0F2044]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">Ready to protect your income?</h2>
          <p className="text-blue-300 mb-8 leading-relaxed">Join 14,200+ gig workers who get paid automatically when disruptions hit.</p>
          <Link href="/onboarding">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="bg-amber-400 text-[#0F2044] font-bold text-base px-10 py-4 rounded-xl hover:bg-amber-300 transition-all hover:shadow-2xl">
              Get protected in 3 minutes →
            </motion.button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 bg-[#060E1E] border-t border-[#1E3A5F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1E3A5F] flex items-center justify-center">
              <span className="text-white font-black text-xs">GA</span>
            </div>
            <span className="text-slate-500 text-sm font-medium">GigArmor</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <Link href="/login" className="hover:text-slate-400 transition-colors">Login</Link>
            <Link href="/onboarding" className="hover:text-slate-400 transition-colors">Register</Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <Link href="/support" className="hover:text-slate-400 transition-colors">Support</Link>
            <span>© 2026 GigArmor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
