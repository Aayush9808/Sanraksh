"use client";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { motion } from "framer-motion";
import { API_BASE } from "../../lib/config";

const MOCK_CLAIMS_DATA = [
  { day: "Mon", claims: 8,  payout: 6400  },
  { day: "Tue", claims: 12, payout: 9600  },
  { day: "Wed", claims: 23, payout: 18400 },
  { day: "Thu", claims: 17, payout: 13600 },
  { day: "Fri", claims: 9,  payout: 7200  },
  { day: "Sat", claims: 31, payout: 24800 },
  { day: "Sun", claims: 14, payout: 11200 },
];

const MOCK_POLICY_MIX = [
  { name: "Weather",  value: 42, color: "#f59e0b" },
  { name: "Flood",    value: 20, color: "#8b5cf6" },
  { name: "Job Loss", value: 21, color: "#a78bfa" },
  { name: "Curfew",   value: 10, color: "#34d399" },
  { name: "Pollution", value: 7, color: "#ef4444" },
];

const activity = [
  { dot: "bg-accent-amber",   text: "Heavy rain alert — Andheri West (Zone 7)",        time: "2 min ago"  },
  { dot: "bg-state-success",  text: "12 claims auto-approved — ₹9,600 disbursed",       time: "5 min ago"  },
  { dot: "bg-accent-violet",  text: "New worker: Rahul Kumar, Bandra-Kurla",            time: "10 min ago" },
  { dot: "bg-accent-lavender",text: "Fraud alert cleared — Priya Sharma verified",      time: "18 min ago" },
  { dot: "bg-state-success",  text: "Claim #CLM-20241208-00041 paid — Amit Singh",      time: "24 min ago" },
];

const MOCK_RECENT_CLAIMS = [
  { id: "C-2045", name: "Vikram Nair",  type: "Weather", amount: "800", status: "PAID",       sc: "bg-state-success/15 text-state-success border-state-success/25" },
  { id: "C-2044", name: "Sunita Devi",  type: "Weather", amount: "800", status: "PROCESSING", sc: "bg-state-warning/15 text-state-warning border-state-warning/25" },
  { id: "C-2043", name: "Raju Mehtani", type: "Flood",   amount: "800", status: "REVIEW",     sc: "bg-state-danger/15 text-state-danger border-state-danger/25" },
  { id: "C-2042", name: "Priya Sharma", type: "Weather", amount: "800", status: "PAID",       sc: "bg-state-success/15 text-state-success border-state-success/25" },
  { id: "C-2041", name: "Amit Singh",   type: "Weather", amount: "800", status: "PAID",       sc: "bg-state-success/15 text-state-success border-state-success/25" },
];

function fmt(n: number): string {
  if (n >= 100000) return (n / 100000).toFixed(1) + "L";
  if (n >= 1000)   return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function statusClass(s: string): string {
  if (s === "paid")    return "bg-state-success/15 text-state-success border-state-success/25";
  if (s === "pending") return "bg-state-warning/15 text-state-warning border-state-warning/25";
  return "bg-state-danger/15 text-state-danger border-state-danger/25";
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ total_users: 1247, active_policies: 1089, claims_today: 23, total_payout_amount: 274000, automation_rate: 94.2, claims_review: 8 });
  const [claimsData, setClaimsData] = useState(MOCK_CLAIMS_DATA);
  const [policyMix, setPolicyMix]   = useState(MOCK_POLICY_MIX);
  const [recentClaims, setRecentClaims] = useState(MOCK_RECENT_CLAIMS);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, summaryRes, mixRes, claimsRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/analytics/dashboard`),
          fetch(`${API_BASE}/api/v1/analytics/claims-summary?days=7`),
          fetch(`${API_BASE}/api/v1/analytics/policy-mix`),
          fetch(`${API_BASE}/api/v1/claims/all?limit=5`),
        ]);
        if (dashRes.ok)    setStats(await dashRes.json());
        if (summaryRes.ok) { const d = await summaryRes.json(); if (d.length) setClaimsData(d); }
        if (mixRes.ok)     { const d = await mixRes.json(); if (d.length) setPolicyMix(d); }
        if (claimsRes.ok) {
          const d = await claimsRes.json();
          if (d.claims?.length) {
            setRecentClaims(d.claims.slice(0, 5).map((c: any) => ({
              id: c.claim_number, name: c.worker_name || "Worker",
              type: "Weather", amount: c.amount?.toString() || "800",
              status: c.status?.toUpperCase() || "PAID",
              sc: statusClass(c.status || ""),
            })));
          }
        }
      } catch { /* use mock data */ }
    }
    loadData();
  }, []);

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const b = (d: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d * 0.06 } } as const);

  const kpis = [
    { val: fmt(stats.total_users),         label: "Total Workers",   sub: "registered",      t: "border-accent-amber/30 bg-accent-amber/[0.04]" },
    { val: fmt(stats.active_policies),      label: "Active Policies", sub: `${Math.round(stats.active_policies / Math.max(stats.total_users, 1) * 100)}% coverage`, t: "border-accent-violet/30 bg-accent-violet/[0.04]" },
    { val: stats.claims_today.toString(),   label: "Claims Today",    sub: `${stats.claims_review} in review`, t: "border-state-warning/30 bg-state-warning/[0.04]" },
    { val: `₹${fmt(stats.total_payout_amount)}`, label: "Total Payouts", sub: `${stats.automation_rate}% automated`, t: "border-state-success/30 bg-state-success/[0.04]" },
  ];

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-secondary mt-0.5">Portfolio overview, claims metrics, and live activity</p>
      </div>

      {/* KPI row */}
      <motion.div {...b(1)} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...b(i + 1)} whileHover={{ y: -3 }} className={`rounded-2xl border p-4 ${k.t}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{k.label}</p>
            <p className="mt-1.5 text-2xl font-black text-text-primary">{k.val}</p>
            <p className="mt-0.5 text-[10px] text-text-muted">{k.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Area chart */}
        <motion.div {...b(5)} className={`lg:col-span-2 ${card} p-5`}>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Claims This Week</h3>
              <p className="text-[10px] text-text-muted">Daily claims processed + payout value</p>
            </div>
            <span className="rounded-full bg-accent-amber/10 border border-accent-amber/25 px-2.5 py-1 text-[10px] font-semibold text-accent-amber">+28% vs last week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={claimsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="claimsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: "#6b7994", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7994", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, padding: "8px 12px" }} labelStyle={{ color: "#8a94a8", marginBottom: 4 }} itemStyle={{ color: "#f59e0b" }} />
              <Area type="monotone" dataKey="claims" stroke="#f59e0b" strokeWidth={2} fill="url(#claimsGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div {...b(6)} className={`${card} p-5`}>
          <h3 className="mb-0.5 text-sm font-semibold text-text-primary">Policy Mix</h3>
          <p className="mb-3 text-[10px] text-text-muted">Active policies by type</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={policyMix} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                {policyMix.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0d1221", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {policyMix.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-text-muted">{p.name}</span>
                </div>
                <span className="font-semibold text-text-secondary">{p.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Recent claims table */}
        <motion.div {...b(7)} className={`lg:col-span-2 ${card} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Recent Claims</h3>
            <a href="/dashboard/claims" className="text-[10px] font-semibold text-accent-amber hover:text-accent-gold transition">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04] text-left">
                  {["ID","Worker","Type","Amount","Status"].map(h=>(
                    <th key={h} className="pb-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentClaims.map(c => (
                  <tr key={c.id} className="border-b border-white/[0.03] transition hover:bg-white/[0.02]">
                    <td className="py-3 font-mono text-xs text-text-muted">{c.id}</td>
                    <td className="py-3 text-sm font-medium text-text-primary">{c.name}</td>
                    <td className="py-3 text-xs text-text-secondary hidden sm:table-cell">{c.type}</td>
                    <td className="py-3 text-sm font-bold text-text-primary">₹{c.amount}</td>
                    <td className="py-3"><span className={"rounded-full border px-2 py-0.5 text-[10px] font-bold " + c.sc}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Activity feed */}
        <motion.div {...b(8)} className={`${card} p-5`}>
          <h3 className="mb-4 text-sm font-semibold text-text-primary">Live Activity</h3>
          <div>
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5 border-b border-white/[0.04] py-3 last:border-0">
                <span className={"mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full " + a.dot} />
                <div>
                  <p className="text-xs leading-relaxed text-text-secondary">{a.text}</p>
                  <p className="mt-0.5 text-[10px] text-text-muted">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ["/dashboard/workers", "Workers"],
              ["/dashboard/claims", "Claims"],
              ["/dashboard/analytics", "Analytics"],
            ].map(([href, label]) => (
              <a key={href} href={href}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-2 py-2 text-center text-[10px] font-medium text-text-muted transition hover:bg-white/[0.07] hover:text-text-primary">
                {label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
