"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface DashStats {
  total_workers?: number;
  active_policies?: number;
  claims_today?: number;
  total_paid_today?: number;
  pending_review?: number;
  auto_approved_pct?: number;
  active_disruptions?: number;
}

const DEMO_STATS: DashStats = {
  total_workers: 12847,
  active_policies: 9341,
  claims_today: 34,
  total_paid_today: 15600,
  pending_review: 3,
  auto_approved_pct: 99.8,
  active_disruptions: 2,
};

const DEMO_RECENT = [
  { id: "CLM-8821", worker: "Ravi Kumar", platform: "Zomato", trigger: "Heavy Rain", zone: "Andheri West", amount: 450, status: "approved", ts: "2 min ago" },
  { id: "CLM-8820", worker: "Priya Singh", platform: "Swiggy", trigger: "Flood Alert", zone: "Kurla", amount: 1200, status: "approved", ts: "8 min ago" },
  { id: "CLM-8819", worker: "Amit Rao", platform: "Blinkit", trigger: "App Outage", zone: "Bandra", amount: 500, status: "review", ts: "15 min ago" },
  { id: "CLM-8818", worker: "Neha Patel", platform: "Zepto", trigger: "AQI Alert", zone: "Dadar", amount: 600, status: "approved", ts: "22 min ago" },
  { id: "CLM-8817", worker: "Suresh M.", platform: "Zomato", trigger: "Heavy Rain", zone: "Powai", amount: 800, status: "rejected", ts: "31 min ago" },
  { id: "CLM-8816", worker: "Kavya L.", platform: "Swiggy", trigger: "Curfew", zone: "Goregaon", amount: 900, status: "approved", ts: "45 min ago" },
];

const DEMO_DISRUPTIONS = [
  { zone: "Andheri West, Mumbai", type: "Heavy Rain", severity: "HIGH", active_since: "14:22", workers: 243 },
  { zone: "Koramangala, Bengaluru", type: "Flooding", severity: "CRT", active_since: "13:55", workers: 87 },
];

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashStats>(DEMO_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gigarmor_token");
    fetch(`${API_BASE}/api/v1/analytics/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const STATUS = {
    approved: { label: "APPROVED", color: "text-[#00FF87]" },
    review: { label: "REVIEW", color: "text-[#ffaa00]" },
    rejected: { label: "REJECTED", color: "text-[#ff4444]" },
  } as const;

  const SEV = {
    HIGH: "text-[#ffaa00]",
    CRT: "text-[#ff4444]",
    MED: "text-[#777]",
  } as const;

  return (
    <div className="p-6 xl:p-8 max-w-[1600px]">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] pb-5 mb-8 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1.5">Operations dashboard</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot-live" />
          <span className="mono-label">Live data</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-0 border-t border-l border-[#1a1a1a] mb-8">
        {[
          { label: "Total workers", value: stats.total_workers?.toLocaleString("en-IN"), accent: false },
          { label: "Active policies", value: stats.active_policies?.toLocaleString("en-IN"), accent: false },
          { label: "Claims today", value: stats.claims_today, accent: false },
          { label: "Paid today", value: "\u20b9" + (stats.total_paid_today?.toLocaleString("en-IN") || 0), accent: true },
          { label: "Pending review", value: stats.pending_review, accent: stats.pending_review ? true : false },
          { label: "Auto-approved", value: (stats.auto_approved_pct || 0) + "%", accent: true },
          { label: "Active disruptions", value: stats.active_disruptions, accent: stats.active_disruptions ? true : false },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="border-r border-b border-[#1a1a1a] p-5">
            <div className={`font-mono text-2xl font-black tabular-nums leading-none ${s.accent ? "text-[#00FF87]" : "text-white"}`}>
              {loading ? <span className="text-[#2a2a2a]">—</span> : s.value}
            </div>
            <div className="mono-label mt-2">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        {/* Recent claims */}
        <div>
          <div className="border-b border-[#1a1a1a] pb-3 mb-0 flex items-center justify-between">
            <p className="mono-label">Recent claims</p>
            <a href="/dashboard/claims" className="font-mono text-[10px] tracking-widest uppercase text-[#00FF87] hover:text-white transition-colors">
              View all \u2192
            </a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Worker</th><th>Platform</th><th>Trigger</th>
                <th>Zone</th><th className="text-right">Amount</th><th className="text-right">Status</th><th className="text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_RECENT.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.04 }}>
                  <td className="font-mono text-[11px] text-[#555]">{c.id}</td>
                  <td className="text-white text-[13px]">{c.worker}</td>
                  <td className="font-mono text-[11px] text-[#555]">{c.platform}</td>
                  <td className="font-mono text-[11px] text-[#555]">{c.trigger}</td>
                  <td className="font-mono text-[11px] text-[#555]">{c.zone}</td>
                  <td className="font-mono text-[12px] text-white font-bold text-right tabular-nums">\u20b9{c.amount.toLocaleString()}</td>
                  <td className="text-right">
                    <span className={`font-mono text-[9px] tracking-widest ${STATUS[c.status as keyof typeof STATUS].color}`}>
                      {STATUS[c.status as keyof typeof STATUS].label}
                    </span>
                  </td>
                  <td className="font-mono text-[11px] text-[#333] text-right whitespace-nowrap">{c.ts}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Active disruptions */}
        <div>
          <div className="border-b border-[#1a1a1a] pb-3 mb-0">
            <p className="mono-label">Active disruptions</p>
          </div>
          {DEMO_DISRUPTIONS.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-mono text-[10px] tracking-widest uppercase text-[#333]">No active disruptions</p>
            </div>
          ) : (
            <div className="border-b border-[#1a1a1a]">
              {DEMO_DISRUPTIONS.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                  className="py-4 border-b border-[#1a1a1a] last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-semibold text-white">{d.type}</div>
                      <div className="font-mono text-[11px] text-[#444] mt-0.5">{d.zone}</div>
                    </div>
                    <span className={`font-mono text-[9px] tracking-widest font-bold ${SEV[d.severity as keyof typeof SEV] || "text-[#777]"}`}>
                      {d.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-mono text-[11px] text-[#555]">{d.workers} workers affected</div>
                    </div>
                    <div className="ml-auto">
                      <div className="mono-label">Since {d.active_since}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
