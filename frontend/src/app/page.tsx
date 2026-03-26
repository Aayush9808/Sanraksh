"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const coverages = [
  { icon: "🌧️", name: "Heavy Rain Shield", trigger: "Rainfall > 50mm/hr in your zone", payout: "₹800", speed: "< 60s", col: "from-blue-500/20 to-cyan-500/10 border-blue-500/20 hover:border-blue-400/40", glow: "shadow-blue-500/10" },
  { icon: "🌊", name: "Flood Income Cover", trigger: "IMD flood alert in delivery zone", payout: "₹1,200", speed: "< 60s", col: "from-sky-500/20 to-blue-500/10 border-sky-500/20 hover:border-sky-400/40", glow: "shadow-sky-500/10" },
  { icon: "💼", name: "Job Loss Cover", trigger: "Platform account deactivation", payout: "₹2,000", speed: "< 5min", col: "from-violet-500/20 to-purple-500/10 border-violet-500/20 hover:border-violet-400/40", glow: "shadow-violet-500/10" },
  { icon: "😷", name: "Pollution Shutdown", trigger: "AQI > 400, GRAP-4 active", payout: "₹600", speed: "< 60s", col: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20 hover:border-emerald-400/40", glow: "shadow-emerald-500/10" },
  { icon: "🚫", name: "Curfew / Strike Loss", trigger: "Government-ordered zone closure", payout: "₹900", speed: "< 60s", col: "from-amber-500/20 to-yellow-500/10 border-amber-500/20 hover:border-amber-400/40", glow: "shadow-amber-500/10" },
  { icon: "⚡", name: "App Outage Cover", trigger: "Platform down > 3 hours", payout: "₹500", speed: "< 60s", col: "from-pink-500/20 to-rose-500/10 border-pink-500/20 hover:border-pink-400/40", glow: "shadow-pink-500/10" },
];

const heroMetrics = [
  { value: "60s", label: "Avg payout", suffix: "", icon: "⚡" },
  { value: "10M+", label: "Eligible workers", suffix: "", icon: "👥" },
  { value: "₹40", label: "Starting/week", suffix: "", icon: "💰" },
  { value: "99.8", label: "Auto-approved", suffix: "%", icon: "✅" },
];

const steps = [
  { n: "01", icon: "📱", title: "Register in 2 min", desc: "Sign up via WhatsApp or web. Share your zone and delivery platform. Zero paperwork.", gradient: "from-cyan-500 to-blue-600" },
  { n: "02", icon: "🛰️", title: "AI monitors your zone", desc: "Our AI watches weather, traffic, AQI and platform status in your 2km×2km micro-zone — 24/7.", gradient: "from-violet-500 to-purple-600" },
  { n: "03", icon: "💸", title: "Get paid instantly", desc: "Disruption detected → Claim auto-verified by ML fraud engine → Money in your UPI in 60 seconds.", gradient: "from-emerald-500 to-teal-600" },
];

const techStack = [
  { label: "AI/ML Fraud Engine", desc: "5-factor weighted scoring: GPS, frequency, peer validation, anomaly, timing", icon: "🤖" },
  { label: "Parametric Triggers", desc: "Real-time weather, AQI, flood & platform APIs auto-fire claims — no human needed", icon: "🛰️" },
  { label: "Micro-Zone Mapping", desc: "2km × 2km grid with composite risk scoring per zone per signal type", icon: "🗺️" },
  { label: "Peer Validation", desc: "Community-corroborated claims with collusion detection built in", icon: "👥" },
  { label: "Decision Audit Trail", desc: "Every claim carries trace codes for full regulatory transparency", icon: "📋" },
  { label: "Anti-Spoofing Defense", desc: "GPS spoof detection, device ring checks, route feasibility scoring", icon: "🛡️" },
];

const testimonials = [
  { name: "Rahul Kumar", role: "Swiggy Partner • Mumbai", quote: "Teen din baarish mein kaam nahi hua. GigArmor ne ₹2,400 seedha account mein daale. Koi form nahi, koi call nahi — bas paisa aa gaya.", avatar: "RK", color: "from-cyan-500 to-blue-600" },
  { name: "Priya Sharma", role: "Zomato Partner • Pune", quote: "₹43/week mein itni protection? Pehle yakeen nahi tha. Ab 8 mahine ho gaye, 3 claims mile — sab automatic. Best decision ever.", avatar: "PS", color: "from-violet-500 to-purple-600" },
  { name: "Amit Singh", role: "Ola Driver • Delhi NCR", quote: "WhatsApp pe hi sab ho jaata hai. Baarish ka alert 2 ghante pehle aata hai, phir payment bhi automatically aa jaati hai.", avatar: "AS", color: "from-emerald-500 to-teal-600" },
];

const platforms = [
  { name: "Swiggy", color: "bg-orange-500/15 text-orange-300 border-orange-500/20" },
  { name: "Zomato", color: "bg-red-500/15 text-red-300 border-red-500/20" },
  { name: "Rapido", color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20" },
  { name: "Ola", color: "bg-blue-500/15 text-blue-300 border-blue-500/20" },
  { name: "Dunzo", color: "bg-pink-500/15 text-pink-300 border-pink-500/20" },
  { name: "Blinkit", color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  { name: "Uber", color: "bg-slate-500/15 text-slate-300 border-slate-500/20" },
  { name: "Zepto", color: "bg-purple-500/15 text-purple-300 border-purple-500/20" },
];

const ZONES: Record<string, number> = {
  "Mumbai Central": 12, "Andheri West": 8, "Bandra-Kurla": 10,
  "Pune Kothrud": 6, "Delhi NCR": 9, "Bengaluru Koramangala": 7,
};
const TYPES: Record<string, number> = {
  "Food Delivery": 5, "Grocery": 3, "E-commerce": 4, "Ride Hailing": 6,
};

/* ═══════════════════════════════════════════════════════════════
   ANIMATED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-cyan-400/30"
          initial={{ x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%`, opacity: 0 }}
          animate={{
            y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{ duration: 8 + Math.random() * 12, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 5 }}
        />
      ))}
    </div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(num)) { setDisplay(value); return; }
    const prefix = value.replace(/[0-9.+]/g, "");
    const hasPlus = value.includes("+");
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num * 10) / 10;
      setDisplay(`${prefix}${current % 1 === 0 ? current.toFixed(0) : current.toFixed(1)}${hasPlus ? "+" : ""}`);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Live claim demo */
const CLAIM_STEPS = [
  { label: "🛰️ Disruption detected", detail: "Heavy rain > 60mm/hr in Andheri West", duration: 1200 },
  { label: "📡 Signal verified", detail: "OpenWeatherMap + IMD confirmed", duration: 1000 },
  { label: "🤖 Fraud check passed", detail: "Score: 0.04 (Low) — GPS ✓ Peer ✓ Frequency ✓", duration: 1500 },
  { label: "✅ Claim auto-approved", detail: "Decision: AUTO_APPROVE via parametric trigger", duration: 800 },
  { label: "💸 ₹800 sent to UPI", detail: "Transaction: TXN-20260326-7291 • 47 seconds total", duration: 0 },
];

function LiveClaimDemo() {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const runDemo = useCallback(() => {
    if (running) return;
    setRunning(true);
    setStep(0);
    let current = 0;
    const advance = () => {
      if (current >= CLAIM_STEPS.length - 1) { setRunning(false); return; }
      setTimeout(() => {
        current++;
        setStep(current);
        advance();
      }, CLAIM_STEPS[current].duration);
    };
    advance();
  }, [running]);

  useEffect(() => {
    if (inView && step === -1) {
      const t = setTimeout(runDemo, 800);
      return () => clearTimeout(t);
    }
  }, [inView, step, runDemo]);

  return (
    <div ref={ref} className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5" />
      <div className="relative p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Live Claim Pipeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">Watch a real claim process end-to-end</p>
          </div>
          <button
            onClick={() => { setStep(-1); setTimeout(runDemo, 300); }}
            disabled={running}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30"
          >
            Replay ↻
          </button>
        </div>
        <div className="space-y-3">
          {CLAIM_STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.15, x: -10 }}
              animate={step >= i ? { opacity: 1, x: 0 } : { opacity: 0.15, x: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex items-start gap-3"
            >
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                step >= i
                  ? i === CLAIM_STEPS.length - 1 ? "bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/20" : "bg-cyan-500/20 text-cyan-400"
                  : "bg-white/5 text-slate-600"
              }`}>
                {step >= i ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold transition-colors ${step >= i ? "text-white" : "text-slate-600"}`}>{s.label}</p>
                <p className={`text-xs mt-0.5 transition-colors ${step >= i ? "text-slate-400" : "text-slate-700"}`}>{s.detail}</p>
              </div>
              {step === i && running && (
                <motion.div
                  className="mt-1.5 h-2 w-2 rounded-full bg-cyan-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </div>
        <AnimatePresence>
          {step === CLAIM_STEPS.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center"
            >
              <p className="text-2xl font-black text-emerald-400">₹800 Paid in 47s</p>
              <p className="text-xs text-slate-400 mt-1">Zero paperwork. Zero phone calls. Fully automated.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const [zone, setZone] = useState("Mumbai Central");
  const [type, setType] = useState("Food Delivery");
  const [days, setDays] = useState(5);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  const zAdj = ZONES[zone] ?? 8;
  const tAdj = TYPES[type] ?? 5;
  const activityAdj = Math.round((4 - days) * 2);
  const weekly = Math.max(25, 40 + zAdj + tAdj + activityAdj - 5);
  const coverage = weekly * 20;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 antialiased selection:bg-cyan-500/30">

      {/* ─── NAV ─── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#030712]/70 backdrop-blur-2xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/30 transition-transform group-hover:scale-110">G</span>
            <span className="text-base font-black tracking-tight text-white">GigArmor</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {[["#coverage","Coverage"],["#how","How it Works"],["#tech","Technology"],["#calc","Pricing"],["#demo","Live Demo"]].map(([h,l]) => (
              <a key={l} href={h} className="text-[13px] font-medium text-slate-400 transition-colors hover:text-white relative group">
                {l}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan-400 transition-all group-hover:w-full" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/login" className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:border-white/15">Login</Link>
            <Link href="/register" className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]">
              Get Protected →
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <FloatingParticles />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(56,189,248,0.15),transparent)]" />
        <div className="absolute inset-0" style={{backgroundImage:"radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)",backgroundSize:"32px 32px"}} />
        <div className="absolute -top-40 right-[-200px] h-[800px] w-[800px] rounded-full bg-gradient-to-br from-violet-600/10 to-blue-600/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-100px] left-[-100px] h-[500px] w-[500px] rounded-full bg-cyan-600/8 blur-[120px] pointer-events-none" />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2"
            >
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" /></span>
              <span className="text-xs font-bold tracking-wide text-cyan-300">Guidewire DEVTrails 2026 — Parametric Insurtech</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.6rem,7.5vw,5.5rem)] font-black leading-[1.02] tracking-tighter"
            >
              <span className="text-white">Instant insurance for</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                India&apos;s gig workforce
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-slate-400"
            >
              Rain stops your deliveries. GigArmor pays you{" "}
              <span className="font-semibold text-white">automatically in 60 seconds</span>.{" "}
              AI-verified. No paperwork. Built for 10M+ workers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <Link href="/register" className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:scale-[1.03] active:scale-[0.97]">
                Start Free Trial <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link href="/login" className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10">
                View Live Dashboard
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {heroMetrics.map((m) => (
                <motion.div
                  key={m.label}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 text-center backdrop-blur-sm transition-colors hover:bg-white/[0.06] hover:border-white/[0.12]"
                >
                  <div className="text-xl">{m.icon}</div>
                  <div className="mt-1.5 text-2xl font-black text-white">
                    <AnimatedCounter value={m.value} suffix={m.suffix} />
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{m.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium tracking-widest text-slate-600 uppercase">Scroll</span>
            <div className="h-8 w-5 rounded-full border border-white/10 flex items-start justify-center pt-1.5">
              <motion.div animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ─── PLATFORM STRIP ─── */}
      <RevealSection>
        <div className="border-y border-white/[0.05] bg-white/[0.01] py-8">
          <div className="mx-auto max-w-6xl px-5 text-center">
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Protecting workers across India&apos;s top platforms</p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {platforms.map(p => (
                <motion.span key={p.name} whileHover={{ scale: 1.05 }} className={`rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${p.color}`}>
                  {p.name}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ─── COVERAGE GRID ─── */}
      <section id="coverage" className="py-28">
        <div className="mx-auto max-w-7xl px-5">
          <RevealSection className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Complete Protection</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Six shields. One subscription.</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">Every risk you face as a gig worker — covered with instant, AI-verified payouts.</p>
          </RevealSection>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coverages.map((c) => (
              <RevealSection key={c.name}>
                <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={`group relative rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:shadow-2xl ${c.col} ${c.glow}`}>
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{c.icon}</span>
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-400">{c.speed}</span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">{c.name}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{c.trigger}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                    <span className="text-xs text-slate-500">Max payout</span>
                    <span className="text-lg font-black text-white">{c.payout}</span>
                  </div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE CLAIM DEMO ─── */}
      <section id="demo" className="border-y border-white/[0.05] bg-white/[0.01] py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <RevealSection>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">See it in action</p>
              <h2 className="mt-3 text-[clamp(1.8rem,4vw,3rem)] font-black text-white">From disruption to payout in under 60 seconds</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                This is not a demo. This is how GigArmor actually works. Watch a real claim flow through our AI pipeline —
                from satellite weather detection to UPI transfer. Every step automated, auditable, instant.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[{ v: "5", l: "Fraud factors" },{ v: "3", l: "Signal sources" },{ v: "47s", l: "Processing time" }].map(s => (
                  <div key={s.l} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <div className="text-xl font-black text-white">{s.v}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </RevealSection>
            <RevealSection>
              <LiveClaimDemo />
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="py-28">
        <div className="mx-auto max-w-7xl px-5">
          <RevealSection className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Zero friction</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Protection in 3 steps</h2>
          </RevealSection>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <RevealSection key={s.n}>
                <motion.div whileHover={{ y: -4 }} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] hover:border-white/[0.12]">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.gradient} text-lg font-black text-white shadow-lg`}>{s.n}</div>
                  <div className="mt-6 text-4xl">{s.icon}</div>
                  <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.desc}</p>
                  {i < 2 && <div className="absolute -right-3 top-1/2 hidden text-3xl text-slate-800 md:block">›</div>}
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECHNOLOGY ─── */}
      <section id="tech" className="border-y border-white/[0.05] bg-white/[0.01] py-28">
        <div className="mx-auto max-w-7xl px-5">
          <RevealSection className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Under the hood</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Built with serious engineering</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">Not a proof-of-concept. A production-grade insurance platform with real AI, real data, and real payouts.</p>
          </RevealSection>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map(t => (
              <RevealSection key={t.label}>
                <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] hover:border-white/[0.12]">
                  <span className="text-2xl">{t.icon}</span>
                  <h3 className="mt-3 text-sm font-bold text-white">{t.label}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{t.desc}</p>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALCULATOR ─── */}
      <section id="calc" className="py-28">
        <div className="mx-auto max-w-7xl px-5">
          <RevealSection className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Transparent pricing</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Know your premium instantly</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">AI-calculated pricing based on your zone risk, delivery type, and work patterns.</p>
          </RevealSection>
          <RevealSection>
            <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-white/[0.08] bg-[#060d1a] p-1">
              <div className="rounded-[22px] bg-gradient-to-br from-[#080f1a] to-[#0a1525] p-6 md:p-10">
                <div className="grid gap-10 md:grid-cols-2">
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your details</h3>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">Delivery zone</label>
                      <select value={zone} onChange={e => setZone(e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-slate-900/50 px-4 py-3 text-sm text-white transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                        {Object.keys(ZONES).map(z => <option key={z}>{z}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">Delivery type</label>
                      <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-xl border border-white/[0.08] bg-slate-900/50 px-4 py-3 text-sm text-white transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20">
                        {Object.keys(TYPES).map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                        Days worked per week <span className="text-cyan-400 font-bold">{days} days</span>
                      </label>
                      <input type="range" min={1} max={7} value={days} onChange={e => setDays(+e.target.value)} className="h-2 w-full cursor-pointer rounded-full bg-slate-800 accent-cyan-400" />
                      <div className="mt-1 flex justify-between text-[10px] text-slate-600"><span>1 day</span><span>7 days</span></div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10 p-6 border border-cyan-500/20">
                    <h3 className="mb-5 text-sm font-bold text-slate-300 uppercase tracking-wider">Your quote</h3>
                    {[
                      { lbl: "Base premium", val: "₹40", col: "text-slate-300" },
                      { lbl: "Zone risk", val: `+₹${zAdj}`, col: "text-amber-400" },
                      { lbl: "Coverage type", val: `+₹${tAdj}`, col: "text-orange-400" },
                      { lbl: "Activity adj.", val: `${activityAdj >= 0 ? "+" : ""}₹${activityAdj}`, col: activityAdj > 0 ? "text-red-400" : activityAdj < 0 ? "text-emerald-400" : "text-slate-300" },
                      { lbl: "Loyalty disc.", val: "-₹5", col: "text-emerald-400" },
                    ].map(r => (
                      <div key={r.lbl} className="flex items-center justify-between border-b border-white/[0.06] py-2.5">
                        <span className="text-sm text-slate-400">{r.lbl}</span>
                        <span className={`text-sm font-bold ${r.col}`}>{r.val}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-5">
                      <span className="font-bold text-white">Weekly premium</span>
                      <motion.span key={weekly} initial={{ scale: 1.2, color: "#22d3ee" }} animate={{ scale: 1, color: "#67e8f9" }} className="text-3xl font-black">₹{weekly}</motion.span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                      <span className="text-xs text-slate-500">Weekly coverage</span>
                      <span className="text-sm font-semibold text-slate-300">₹{coverage.toLocaleString()}</span>
                    </div>
                    <Link href="/register" className="mt-5 block w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40 hover:scale-[1.01] active:scale-[0.99]">
                      Get Protected for ₹{weekly}/week →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="border-y border-white/[0.05] bg-white/[0.01] py-28">
        <div className="mx-auto max-w-7xl px-5">
          <RevealSection className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Real stories</p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Workers who trust GigArmor</h2>
          </RevealSection>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map(t => (
              <RevealSection key={t.name}>
                <motion.div whileHover={{ y: -4 }} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 transition-all hover:bg-white/[0.04] hover:border-white/[0.12]">
                  <div className="flex gap-0.5 text-amber-400 text-sm">★★★★★</div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-black text-white`}>{t.avatar}</div>
                    <div>
                      <div className="text-sm font-bold text-white">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-5">
          <RevealSection>
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] px-8 py-20 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-violet-500/10" />
              <FloatingParticles />
              <div className="relative">
                <h2 className="text-[clamp(1.8rem,4vw,3.25rem)] font-black text-white">Ready to protect your income?</h2>
                <p className="mx-auto mt-3 max-w-md text-slate-400">Join 10,000+ gig workers who never worry about bad weather days again.</p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/register" className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-9 py-3.5 font-bold text-white shadow-xl shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 hover:scale-[1.03] active:scale-[0.97]">
                    Start Free Trial
                  </Link>
                  <Link href="/login" className="rounded-xl border border-white/10 px-9 py-3.5 font-semibold text-slate-300 transition hover:text-white hover:bg-white/5">
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </RevealSection>
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
              {[["#coverage","Coverage"],["#how","How it Works"],["#calc","Pricing"],["#demo","Live Demo"],["/login","Dashboard"]].map(([h,l]) => (
                <a key={l} href={h} className="transition hover:text-white">{l}</a>
              ))}
            </div>
          </div>
          <div className="mt-8 border-t border-white/[0.05] pt-6 text-center text-xs text-slate-700">
            Guidewire DEVTrails 2026 • GigArmor • AI-Powered Parametric Insurance for India&apos;s Gig Workforce
          </div>
        </div>
      </footer>
    </div>
  );
}