"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { API_BASE } from "@/lib/config";

function Counter({ end, prefix = "", suffix = "" }: { end: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let n = 0; const step = end / (1400 / 16);
      const t = setInterval(() => { n += step; if (n >= end) { setV(end); clearInterval(t); } else setV(n); }, 16);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <div ref={ref}>{prefix}{end >= 1000 ? Math.floor(v).toLocaleString() : Math.floor(v)}{suffix}</div>;
}

function StatusTag({ s }: { s: string }) {
  const map: Record<string, string> = { approved: "tag-live", review: "tag-warn", rejected: "tag-neg", paid: "tag-live", pending: "tag-warn" };
  return <span className={`tag ${map[s] || "tag-grey"}`}>{s}</span>;
}

function FraudBar({ score }: { score: number }) {
  const color = score > 0.6 ? "#EF4444" : score > 0.3 ? "#F59E0B" : "#10B981";
  return (
    <div className="flex items-center gap-2">
      <div className="prog-track flex-1" style={{ minWidth: 60 }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${score * 100}%`, background: color, animation: "none" }} />
      </div>
      <span className="font-mono text-xs font-semibold" style={{ color }}>{(score * 100).toFixed(0)}%</span>
    </div>
  );
}

// ─── WORKER DASHBOARD ──────────────────────────────────────────────────────
const WORKER_PAYOUTS = [
  { date: "Mar 24, 2026", event: "Heavy Rain",  amount: 280, status: "paid" },
  { date: "Mar 18, 2026", event: "App Outage",  amount: 200, status: "paid" },
  { date: "Mar 10, 2026", event: "Curfew",      amount: 350, status: "paid" },
];

const WORKER_TRIGGERS = [
  { type: "Heavy Rain",  zone: "Andheri West",       payout: "₹280/day", severity: 0.82, status: "active" },
  { type: "App Outage",  zone: "Zomato · Mumbai", payout: "₹200/inc", severity: 0.68, status: "active" },
  { type: "AQI Alert",  zone: "Delhi NCR",            payout: "₹150/day", severity: 0.44, status: "watch" },
];

function SeverityBar({ val }: { val: number }) {
  const color = val >= 0.75 ? "#EF4444" : val >= 0.45 ? "#F59E0B" : "#10B981";
  return <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ background: color }} />;
}

function WorkerHome() {
  return (
    <div className="max-w-4xl">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-[#0F2044] p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Your coverage</p>
          <h1 className="text-white font-extrabold text-xl tracking-tight">GigArmor Standard</h1>
          <p className="text-blue-200 text-sm mt-0.5">POL-2024-8821 · Active till Apr 2027 · ₹49/week</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/triggers"><button className="bg-amber-400 text-[#0F2044] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-amber-300 transition-all">Live triggers</button></Link>
          <Link href="/dashboard/my-policy"><button className="bg-white/10 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all border border-white/20">View policy</button></Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total earned", val: 2840, prefix: "₹", suffix: "", amber: true },
          { label: "Claims this month", val: 3, prefix: "", suffix: "", amber: false },
          { label: "Active triggers", val: 2, prefix: "", suffix: " now", amber: false },
          { label: "Coverage days left", val: 287, prefix: "", suffix: " days", amber: false },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="panel p-4 stat-card">
            <div className="lbl mb-2">{k.label}</div>
            <div className={`font-extrabold text-2xl tracking-tight ${k.amber ? "text-amber-500" : "text-slate-900"}`} style={{ letterSpacing: "-0.03em", lineHeight: 1 }}>
              {k.prefix}<Counter end={k.val} />{k.suffix}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coverage progress */}
      <div className="panel p-4 mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-sm font-semibold text-slate-700">Coverage remaining this month</span>
          <span className="text-sm font-bold text-slate-900">79%</span>
        </div>
        <div className="prog-track">
          <div className="prog-fill" style={{ width: "79%", animation: "none" }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">₹3,160 of ₹4,000 coverage limit remaining</p>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-5">
        {/* Active triggers */}
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <p className="lbl mb-0.5">Signal monitor</p>
              <h2 className="font-bold text-slate-900">Active triggers in your city</h2>
            </div>
            <Link href="/dashboard/triggers" className="text-[#0F2044] text-xs font-bold hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {WORKER_TRIGGERS.map(t => (
              <div key={t.type} className="flex items-stretch gap-0 hover:bg-slate-50 transition-colors">
                <SeverityBar val={t.severity} />
                <div className="flex items-center gap-3 px-4 py-3.5 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-slate-800 text-sm">{t.type}</span>
                      <span className={`tag ${t.status === "active" ? "tag-neg" : "tag-warn"}`}>{t.status}</span>
                    </div>
                    <div className="text-xs text-slate-400">{t.zone}</div>
                  </div>
                  <div className="text-amber-600 font-mono font-bold text-sm flex-shrink-0">{t.payout}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent payouts */}
        <div className="panel overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="lbl mb-0.5">Payment history</p>
            <h2 className="font-bold text-slate-900">Recent payouts</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {WORKER_PAYOUTS.map(p => (
              <div key={p.date} className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{p.event}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{p.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 font-mono font-bold text-sm">₹{p.amount}</div>
                  <StatusTag s={p.status} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100">
            <Link href="/dashboard/my-policy">
              <button className="w-full text-sm text-slate-500 hover:text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-50 transition-colors">Full history →</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────
const CLAIMS_DEMO = [
  { id: "CLM-8821", worker: "Rahul Kumar",  event: "Heavy Rain",    amount: 280, status: "approved", fraud: 0.08, time: "12 min ago" },
  { id: "CLM-8820", worker: "Priya Mistry", event: "App Outage",    amount: 200, status: "review",   fraud: 0.34, time: "28 min ago" },
  { id: "CLM-8819", worker: "Arjun Sharma", event: "Curfew",        amount: 350, status: "approved", fraud: 0.06, time: "41 min ago" },
  { id: "CLM-8818", worker: "Meena Rajan",  event: "Flood Warning", amount: 280, status: "approved", fraud: 0.11, time: "1h ago" },
  { id: "CLM-8817", worker: "Vikram Patil", event: "Heat Wave",     amount: 200, status: "rejected", fraud: 0.82, time: "1.5h ago" },
];

const DISRUPTIONS_DEMO = [
  { zone: "Andheri West, Mumbai",   type: "Heavy Rain",  severity: 0.82, workers: 243, color: "#EF4444" },
  { zone: "Koramangala, Bengaluru", type: "App Outage",  severity: 0.68, workers: 187, color: "#F59E0B" },
  { zone: "Saket, Delhi",           type: "AQI Alert",   severity: 0.44, workers: 156, color: "#F59E0B" },
  { zone: "T.Nagar, Chennai",       type: "Cyclone",     severity: 0.91, workers: 312, color: "#EF4444" },
];

const KPIS = [
  { label: "Active workers",     val: 14200, prefix: "",     suffix: "",    amber: false, delta: "+142 today",    up: true  },
  { label: "Claims today",       val: 84,    prefix: "",     suffix: "",    amber: false, delta: "+12 pending",   up: false },
  { label: "Payout today",       val: 23520, prefix: "₹", suffix: "",  amber: true,  delta: "₹2.4Cr MTD",  up: true  },
  { label: "Disputed claims",    val: 6,     prefix: "",     suffix: "",    amber: false, delta: "2 urgent",      up: false },
  { label: "Active triggers",    val: 12,    prefix: "",     suffix: "",    amber: false, delta: "3 cities",      up: false },
  { label: "Engine uptime",      val: 99,    prefix: "",     suffix: "%",   amber: true,  delta: "\u25cf Operational", up: true  },
];

function AdminHome() {
  const [claims, setClaims] = useState(CLAIMS_DEMO);
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    fetch(`${API_BASE}/api/v1/claims/?limit=5`, { headers: { Authorization: `Bearer ${token || ""}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.claims) setClaims(d.claims); })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-[1400px]">
      {/* Header banner */}
      <div className="rounded-2xl bg-[#0F2044] p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Operations center</p>
          <h1 className="text-white font-extrabold text-xl tracking-tight">Command Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 rounded-xl px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-semibold">All systems operational</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {KPIS.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="panel p-4 stat-card">
            <div className="lbl mb-2">{k.label}</div>
            <div className={`font-extrabold text-2xl tracking-tight mb-1 ${k.amber ? "text-amber-500" : "text-slate-900"}`} style={{ letterSpacing: "-0.03em", lineHeight: 1 }}>
              {k.prefix}<Counter end={k.val} />{k.suffix}
            </div>
            {k.delta && (
              <div className={`text-xs font-semibold ${k.up ? "text-emerald-600" : "text-red-500"}`}>{k.delta}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Claims + Disruptions */}
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        {/* Claims table */}
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <p className="lbl mb-0.5">Recent activity</p>
              <h2 className="font-bold text-slate-900">Claims feed</h2>
            </div>
            <Link href="/dashboard/claims"><button className="btn-ghost btn-sm">View all →</button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl tbl-click">
              <thead>
                <tr><th>Claim ID</th><th>Worker</th><th>Event</th><th>Amount</th><th>Fraud Risk</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <Link key={c.id} href="/dashboard/claims" legacyBehavior>
                    <tr style={{ cursor: "pointer" }}>
                      <td><span className="font-mono text-slate-800 text-xs font-semibold">{c.id}</span></td>
                      <td><span className="font-semibold text-slate-800">{c.worker}</span></td>
                      <td className="text-slate-600">{c.event}</td>
                      <td><span className="text-emerald-600 font-mono font-bold">₹{c.amount}</span></td>
                      <td><FraudBar score={c.fraud} /></td>
                      <td><StatusTag s={c.status} /></td>
                      <td><span className="text-slate-400 text-xs">{c.time}</span></td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active disruptions */}
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <p className="lbl mb-0.5">Signal monitor</p>
              <h2 className="font-bold text-slate-900">Active disruptions</h2>
            </div>
            <div className="dot dot-live" />
          </div>
          <div className="divide-y divide-slate-100">
            {DISRUPTIONS_DEMO.map((d, i) => (
              <motion.div key={d.zone} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-stretch hover:bg-slate-50 transition-colors">
                <div className="w-1.5 flex-shrink-0 rounded-none" style={{ background: d.color }} />
                <div className="px-4 py-3.5 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{d.type}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{d.zone}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-slate-800 text-sm">{d.workers}</div>
                      <div className="text-xs text-slate-400">workers</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="prog-track">
                      <div style={{ height: "100%", borderRadius: 999, width: `${d.severity * 100}%`, background: d.color, animation: "none" }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100">
            <Link href="/dashboard/triggers">
              <button className="w-full text-sm text-slate-500 hover:text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-50 transition-colors">All triggers →</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [role, setRole] = useState("worker");
  useEffect(() => {
    const r = typeof window !== "undefined" ? localStorage.getItem("role") : "";
    if (r) setRole(r);
  }, []);
  return role === "admin" ? <AdminHome /> : <WorkerHome />;
}
