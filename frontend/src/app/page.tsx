"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────── DATA */
const COVERAGE = [
  { id: "01", name: "Heavy Rain Shield", trigger: "Rainfall > 50mm/hr in your delivery zone", payout: "\u20b9800", speed: "< 60s" },
  { id: "02", name: "Flood Income Cover", trigger: "IMD flood alert issued for your zone", payout: "\u20b91,200", speed: "< 60s" },
  { id: "03", name: "Job Loss Cover", trigger: "Platform account deactivation detected", payout: "\u20b92,000", speed: "< 5min" },
  { id: "04", name: "Pollution Shutdown", trigger: "AQI > 400, GRAP-4 emergency active", payout: "\u20b9600", speed: "< 60s" },
  { id: "05", name: "Curfew / Strike Loss", trigger: "Government-ordered zone closure verified", payout: "\u20b9900", speed: "< 60s" },
  { id: "06", name: "App Outage Cover", trigger: "Platform downtime exceeds 3 hours", payout: "\u20b9500", speed: "< 60s" },
];

const TICKER_ITEMS = [
  "Ravi K., Mumbai \u2014 \u20b9450 paid",
  "Priya S., Pune \u2014 \u20b9320 paid",
  "Amit J., Delhi \u2014 \u20b9580 paid",
  "Neha R., Bengaluru \u2014 \u20b9410 paid",
  "Suresh M., Hyderabad \u2014 \u20b9620 paid",
  "Kavya P., Chennai \u2014 \u20b9380 paid",
  "Rohit D., Mumbai \u2014 \u20b9510 paid",
  "Meera L., Delhi \u2014 \u20b9290 paid",
  "Arjun B., Bengaluru \u2014 \u20b9750 paid",
];

const HOW = [
  { n: "01", title: "Register in 2 min", body: "Sign up on web or WhatsApp. Share your delivery zone and platform. Zero paperwork required." },
  { n: "02", title: "AI monitors your zone", body: "Our system watches weather, AQI, traffic and platform status across your 2km\u00d72km micro-zone. 24/7, no rest." },
  { n: "03", title: "Get paid when it hits", body: "Disruption detected \u2192 ML engine verifies \u2192 UPI payout in your account. Under 60 seconds, no calls, no claims." },
];

const TECH = [
  { label: "Parametric Triggers", desc: "Real-time weather, AQI, flood and platform APIs auto-fire payouts \u2014 no human approval needed." },
  { label: "ML Fraud Engine", desc: "5-factor weighted scoring: GPS trace, claim frequency, peer validation, anomaly detection, timing analysis." },
  { label: "Micro-Zone Mapping", desc: "2km \u00d7 2km grid with composite risk scoring per zone per signal type, updated every 15 minutes." },
  { label: "Peer Validation", desc: "Community-corroborated claims with built-in collusion detection across delivery networks." },
  { label: "Audit Trail", desc: "Every claim carries trace codes and decision logs for full regulatory transparency." },
  { label: "Anti-Spoofing", desc: "GPS spoof detection, device ring checks, and route feasibility scoring on every claim." },
];

/* ─────────────────────────────────────────────── COMPONENTS */
function CountUp({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const total = 60;
    const step = () => {
      frame++;
      setVal(Math.round((frame / total) * target));
      if (frame < total) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="font-mono text-[10px] tracking-widest uppercase text-[#444] px-8 shrink-0">
            <span className="dot-live mr-3 align-middle" />{item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── NAV */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${scrolled ? "bg-black border-b border-[#1a1a1a]" : "bg-transparent"}`}>
      <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-6 h-6 border border-[#00FF87] flex items-center justify-center">
            <span className="font-mono text-[8px] text-[#00FF87] font-bold">GS</span>
          </div>
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white">GigShield</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {["Coverage", "How it works", "Technology"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="font-mono text-[10px] tracking-widest uppercase text-[#444] hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="font-mono text-[10px] tracking-widest uppercase text-[#444] hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="bg-[#00FF87] text-black font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-white transition-colors">
            Get protected
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ─────────────────────────────────────────────── PAGE */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Nav />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-between pt-12">
        <div className="max-w-[1400px] mx-auto px-6 flex-1 flex flex-col justify-center py-24">
          <div className="max-w-[900px]">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mono-label mb-8"
            >
              Parametric insurance for India&apos;s gig economy
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[clamp(3.5rem,9vw,8rem)] font-black text-white leading-[0.88] tracking-[-0.04em] mb-12"
            >
              Workers<br />deserve<br />enterprise-<br />grade<br />protection.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex flex-wrap gap-x-12 gap-y-6 mb-12 border-t border-[#1a1a1a] pt-8"
            >
              {[
                { value: 12847, label: "Workers active", suffix: "", prefix: "" },
                { value: 4200000, label: "Rupees paid out", suffix: "", prefix: "\u20b9" },
                { value: 60, label: "Seconds avg payout", suffix: "s", prefix: "" },
                { value: 99, label: "Auto-approved", suffix: ".8%", prefix: "" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-mono text-3xl font-black text-white tabular-nums">
                    <CountUp target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <div className="mono-label mt-1.5">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link href="/register" className="bg-[#00FF87] text-black font-mono text-[11px] font-bold tracking-[0.15em] uppercase px-8 py-4 hover:bg-white transition-colors">
                Get protected \u2192
              </Link>
              <Link href="/login" className="border border-[#2a2a2a] text-[#777] font-mono text-[11px] tracking-[0.12em] uppercase px-8 py-4 hover:border-[#555] hover:text-white transition-colors">
                Sign in
              </Link>
              <span className="font-mono text-[10px] text-[#333] tracking-widest uppercase">from \u20b940/week</span>
            </motion.div>
          </div>
        </div>

        <Ticker />
      </section>

      {/* ── COVERAGE ─────────────────────────────────────── */}
      <section id="coverage" className="py-24 max-w-[1400px] mx-auto px-6">
        <div className="border-b border-[#1a1a1a] pb-4 mb-12 flex items-end justify-between">
          <div>
            <p className="mono-label mb-2">What we cover</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-white tracking-tight leading-tight">Coverage plans</h2>
          </div>
          <p className="font-mono text-[10px] text-[#333] tracking-widest uppercase hidden md:block">Disruption \u2192 Trigger \u2192 Payout</p>
        </div>

        <div className="border-t border-[#1a1a1a]">
          {COVERAGE.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start md:items-center gap-6 md:gap-0 py-5 border-b border-[#1a1a1a] group hover:bg-[#0a0a0a] transition-colors px-2"
            >
              <span className="font-mono text-[10px] text-[#2a2a2a] w-8 shrink-0 pt-0.5">{c.id}</span>
              <div className="flex-1 md:grid md:grid-cols-[2fr_3fr_auto_auto] md:items-center md:gap-6">
                <h3 className="text-sm font-semibold text-white group-hover:text-[#00FF87] transition-colors">{c.name}</h3>
                <p className="font-mono text-[11px] text-[#444] mt-1 md:mt-0">{c.trigger}</p>
                <div className="mt-2 md:mt-0 text-right">
                  <div className="font-mono text-sm font-black text-white tabular-nums">{c.payout}</div>
                  <div className="mono-label">payout</div>
                </div>
                <div className="mt-1 md:mt-0 text-right ml-6">
                  <div className="font-mono text-xs text-[#00FF87] font-bold">{c.speed}</div>
                  <div className="mono-label">speed</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-t border-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="border-b border-[#1a1a1a] pb-4 mb-16">
            <p className="mono-label mb-2">The process</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-white tracking-tight leading-tight">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-0 border-l border-[#1a1a1a]">
            {HOW.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border-r border-[#1a1a1a] p-8 md:p-10"
              >
                <div className="font-mono text-[3rem] font-black text-[#1a1a1a] leading-none mb-6">{step.n}</div>
                <h3 className="text-base font-bold text-white mb-3">{step.title}</h3>
                <p className="font-mono text-[11px] text-[#444] leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ────────────────────────────────────── */}
      <section id="technology" className="py-24 border-t border-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="border-b border-[#1a1a1a] pb-4 mb-16">
            <p className="mono-label mb-2">Under the hood</p>
            <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black text-white tracking-tight leading-tight">Technology stack</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-[#1a1a1a]">
            {TECH.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="border-r border-b border-[#1a1a1a] p-6 group hover:bg-[#0a0a0a] transition-colors"
              >
                <h3 className="text-sm font-bold text-white mb-2 group-hover:text-[#00FF87] transition-colors">{t.label}</h3>
                <p className="font-mono text-[11px] text-[#444] leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ──────────────────────────────────────── */}
      <section className="border-t border-[#1a1a1a] py-24">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="border border-[#1a1a1a] p-12 md:p-20 flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
            <div>
              <p className="mono-label mb-6">Join 12,847 protected workers</p>
              <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-black text-white leading-[0.9] tracking-tight">
                Start earning<br />with a safety net.
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
              <Link href="/register" className="bg-[#00FF87] text-black font-mono text-[11px] font-bold tracking-[0.15em] uppercase px-10 py-4 hover:bg-white transition-colors whitespace-nowrap">
                Register now \u2192
              </Link>
              <p className="font-mono text-[10px] text-[#333] tracking-widest uppercase">From \u20b940/week \u2014 cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-[#1a1a1a] py-8">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border border-[#2a2a2a] flex items-center justify-center">
              <span className="font-mono text-[7px] text-[#444] font-bold">GS</span>
            </div>
            <span className="font-mono text-[10px] text-[#333] tracking-widest uppercase">GigShield</span>
          </div>
          <p className="font-mono text-[10px] text-[#2a2a2a] tracking-widest uppercase">
            \u00a9 2026 GigShield \u2014 Parametric insurance for gig workers
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map(l => (
              <span key={l} className="font-mono text-[10px] text-[#333] tracking-widest uppercase cursor-pointer hover:text-[#555] transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
