"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ── Counter ────────────────────────────────────────────────────────────────
function Counter({ end, prefix = "", suffix = "", decimals = 0 }: {
  end: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const dur = 1800, step = end / (dur / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(t); } else setVal(start);
    }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString()}{suffix}</span>;
}

// ── Payout Orbit Visualization ─────────────────────────────────────────────
const PAYOUTS = [
  { id:1, amount:"₹280", name:"Rahul K.", platform:"Swiggy",  event:"Rain",    delay:0   },
  { id:2, amount:"₹350", name:"Priya M.", platform:"Zomato",  event:"Curfew",  delay:0.6 },
  { id:3, amount:"₹200", name:"Arjun S.", platform:"Uber",    event:"Outage",  delay:1.2 },
  { id:4, amount:"₹180", name:"Meena R.", platform:"Dunzo",   event:"Flood",   delay:1.8 },
  { id:5, amount:"₹320", name:"Vikram P.",platform:"Swiggy",  event:"Heat",    delay:2.4 },
];

function PayoutOrbit() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % PAYOUTS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Outer rings */}
      {[240, 190, 140, 90].map((r, i) => (
        <motion.div key={i}
          className="absolute rounded-full"
          style={{ width: r * 2, height: r * 2, border: `1px solid rgba(245,158,11,${0.06 + i * 0.04})` }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 30 + i * 8, repeat: Infinity, ease: "linear" }}
        />
      ))}

      {/* Center amber core */}
      <motion.div
        className="absolute w-28 h-28 rounded-full flex items-center justify-center"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(245,158,11,0.05) 60%, transparent 100%)" }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-center">
          <div className="text-amber font-mono text-xs tracking-widest uppercase opacity-70">LIVE</div>
          <div className="text-[#F5F0E8] font-bold text-2xl" style={{ lineHeight: 1 }}>AUTO</div>
          <div className="text-amber font-mono text-xs tracking-widest uppercase opacity-70">PAY</div>
        </div>
      </motion.div>

      {/* Orbiting payout cards */}
      {PAYOUTS.map((p, i) => {
        const angle = (i / PAYOUTS.length) * 2 * Math.PI - Math.PI / 2;
        const rx = 200, ry = 160;
        return (
          <motion.div key={p.id}
            className="absolute"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: p.delay, duration: 0.5 }}
          >
            <motion.div
              animate={{ opacity: active === i ? 1 : 0.35, scale: active === i ? 1 : 0.88 }}
              transition={{ duration: 0.4 }}
              className="panel-amber px-3 py-2 text-left cursor-default"
              style={{ position: "absolute", left: Math.cos(angle) * rx, top: Math.sin(angle) * ry, transform: "translate(-50%,-50%)", minWidth: 120 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="dot dot-live" />
                <span className="lbl-amber">{p.platform}</span>
              </div>
              <div className="text-[#F5F0E8] font-bold text-base" style={{ letterSpacing: "-0.02em" }}>{p.amount}</div>
              <div className="lbl mt-0.5">{p.event} trigger</div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Coverage rows ──────────────────────────────────────────────────────────
const COVERAGES = [
  { event: "Heavy Rain / Flooding",    payout: "₹280/day",      trigger: "IMD Rainfall Warning",    platforms: "All platforms" },
  { event: "App Platform Outage",      payout: "₹200/incident", trigger: "Platform Status API",     platforms: "Swiggy, Zomato, Uber" },
  { event: "Curfew / Section 144",     payout: "₹350/day",      trigger: "Govt. Notification Feed", platforms: "All platforms" },
  { event: "AQI > 400 (Severe)",       payout: "₹150/day",      trigger: "CPCB AQI Feed",           platforms: "All platforms" },
  { event: "Cyclone Warning",          payout: "₹400/day",      trigger: "IMD Cyclone Alert",       platforms: "Coastal regions" },
  { event: "Heat Wave > 44°C",         payout: "₹200/day",      trigger: "Temperature Sensor",      platforms: "All platforms" },
];

const STEPS = [
  { num: "01", title: "Link your platforms", body: "Connect Swiggy, Zomato, Uber, or Dunzo. We verify your active status automatically." },
  { num: "02", title: "Disruption is detected", body: "Our signal network monitors 14 real-time data feeds. When an event hits your zone, we know." },
  { num: "03", title: "You get paid — instantly", body: "No app, no claim form, no call center. Money reaches your account within 4 hours of trigger." },
];

// ── Nav ────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-[#2A2218] bg-[#0A0806]/95 backdrop-blur-sm" : ""}`}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber flex items-center justify-center">
            <span className="text-[#0A0806] font-black text-xs">GS</span>
          </div>
          <span className="text-[#F5F0E8] font-bold text-sm">GigShield</span>
        </div>
        <div className="hidden md:flex items-center gap-7">
          {["Coverage", "How it works", "Platforms", "For partners"].map(t => (
            <span key={t} className="text-sm text-[#6B5C44] hover:text-[#9A8A72] cursor-pointer transition-colors">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="btn-ghost btn-sm text-sm">Sign in</button>
          </Link>
          <Link href="/register">
            <button className="btn-amber btn-sm text-sm">Get protected</button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-[#0A0806] min-h-screen">
      <Nav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="min-h-screen pt-14 grid lg:grid-cols-[1fr_1fr] overflow-hidden">
        {/* Left: Editorial */}
        <div className="flex flex-col justify-center px-8 md:px-14 lg:px-16 py-20">
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <div className="flex items-center gap-2 mb-8">
              <span className="dot dot-live" />
              <span className="lbl-live">Live coverage active</span>
              <span className="lbl ml-2">· 14,200+ workers protected</span>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.1 }}
            className="text-[#F5F0E8] font-extrabold leading-none tracking-tight mb-6"
            style={{ fontSize:"clamp(3.2rem,7vw,6.5rem)", letterSpacing:"-0.04em" }}
          >
            When work stops,<br />
            <span className="text-amber">your income</span><br />
            {"doesn't."}
          </motion.h1>
          <motion.p
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.6, delay:0.3 }}
            className="text-[#9A8A72] text-lg max-w-md mb-10 leading-relaxed"
          >
            Parametric insurance for gig workers. Instant automatic payouts when rain, outages, or curfews disrupt your work — zero paperwork.
          </motion.p>
          <motion.div
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.45 }}
            className="flex flex-wrap gap-3 mb-14"
          >
            <Link href="/register">
              <button className="btn-amber text-base px-7 py-3.5">Start free — ₹0 upfront</button>
            </Link>
            <button className="btn-ghost text-base px-7 py-3.5">See how it works →</button>
          </motion.div>
          {/* Mini stats */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
            className="grid grid-cols-3 gap-0 border border-[#2A2218] rounded-xl overflow-hidden max-w-md"
          >
            {[
              { label:"Avg. payout time", val:"3.8", suffix:"hrs" },
              { label:"Workers covered",  val:"14200", suffix:"+" },
              { label:"Claim approval",   val:"99.2", suffix:"%" },
            ].map((s, i) => (
              <div key={s.label} className={`p-4 ${i < 2 ? "border-r border-[#2A2218]" : ""}`}>
                <div className="text-[#F5F0E8] font-bold text-xl" style={{ letterSpacing:"-0.03em" }}>
                  <Counter end={parseFloat(s.val)} suffix={s.suffix} decimals={s.val.includes(".") ? 1 : 0} />
                </div>
                <div className="lbl mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Orbit visualization */}
        <div className="hidden lg:flex items-center justify-center relative overflow-hidden"
          style={{ background:"radial-gradient(ellipse at center, rgba(245,158,11,0.04) 0%, transparent 70%)" }}
        >
          <div className="w-full h-[600px] relative">
            <PayoutOrbit />
          </div>
        </div>
      </section>

      {/* ── COVERAGE TABLE ────────────────────────────────────────────────── */}
      <section className="px-8 md:px-14 lg:px-20 py-20 border-t border-[#2A2218]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="lbl mb-3">What triggers a payout</p>
              <h2 className="text-[#F5F0E8] font-bold" style={{ fontSize:"clamp(1.8rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1 }}>
                Coverage that actually<br />works in the real world.
              </h2>
            </div>
            <Link href="/register">
              <button className="btn-outline-amber hidden md:flex">See full policy →</button>
            </Link>
          </div>

          <div className="panel overflow-hidden">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Disruption event</th>
                  <th>Your payout</th>
                  <th>Trigger signal</th>
                  <th>Platforms</th>
                </tr>
              </thead>
              <tbody>
                {COVERAGES.map((c, i) => (
                  <motion.tr key={c.event}
                    initial={{ opacity:0, y:8 }} whileInView={{ opacity:1, y:0 }}
                    viewport={{ once:true }} transition={{ delay:i*0.08 }}
                  >
                    <td><span className="text-[#F5F0E8] font-semibold">{c.event}</span></td>
                    <td><span className="text-amber font-mono font-bold">{c.payout}</span></td>
                    <td>{c.trigger}</td>
                    <td><span className="tag-neutral tag">{c.platforms}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="lbl mt-4 text-center">Payouts are automatic — no claim required · Conditions verified against independent data sources</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="px-8 md:px-14 lg:px-20 py-20 border-t border-[#2A2218]">
        <div className="max-w-5xl mx-auto">
          <p className="lbl mb-3">Process</p>
          <h2 className="text-[#F5F0E8] font-bold mb-14" style={{ fontSize:"clamp(1.8rem,4vw,3rem)", letterSpacing:"-0.03em", lineHeight:1 }}>
            Three steps. Then it runs<br />on its own — forever.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.num}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.12 }}
                className="panel p-6"
              >
                <div className="text-amber font-mono text-xs tracking-widest mb-4">{s.num}</div>
                <h3 className="text-[#F5F0E8] font-bold text-lg mb-3" style={{ letterSpacing:"-0.02em" }}>{s.title}</h3>
                <p className="text-[#6B5C44] leading-relaxed text-sm">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM TRUST STRIP ─────────────────────────────────────────── */}
      <section className="px-8 md:px-14 lg:px-20 py-14 border-t border-[#2A2218]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="lbl mb-8">Works with your platform</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Swiggy", "Zomato", "Uber", "Ola", "Dunzo", "Blinkit", "Porter", "Rapido"].map(p => (
              <div key={p} className="panel px-6 py-3 text-[#6B5C44] font-semibold text-sm hover:text-[#9A8A72] hover:border-[#36301E] transition-all cursor-default">
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────────── */}
      <section className="mx-6 my-10 rounded-2xl overflow-hidden"
        style={{ background:"linear-gradient(135deg, #1a1200 0%, #2a1d00 50%, #1a1200 100%)", border:"1px solid rgba(245,158,11,0.25)" }}
      >
        <div className="px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="dot dot-live" />
              <span className="lbl-live">Zero downtime · payouts processing now</span>
            </div>
            <h2 className="text-[#F5F0E8] font-bold" style={{ fontSize:"clamp(1.6rem,3.5vw,2.8rem)", letterSpacing:"-0.03em", lineHeight:1.1 }}>
              Your next disruption<br />is already covered.
            </h2>
          </div>
          <div className="flex flex-col gap-3 min-w-max">
            <Link href="/register">
              <button className="btn-amber text-base px-8 py-4 w-full">Protect my income now</button>
            </Link>
            <p className="lbl text-center">Free to join · No premium upfront</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-8 md:px-14 py-10 border-t border-[#2A2218]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-amber flex items-center justify-center">
              <span className="text-[#0A0806] font-black text-xs">GS</span>
            </div>
            <span className="text-[#4A3E2A] text-sm">GigShield © 2026</span>
          </div>
          <div className="flex gap-6">
            {["Privacy","Terms","Contact","API Docs"].map(t => (
              <span key={t} className="lbl hover:text-[#6B5C44] cursor-pointer transition-colors">{t}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
