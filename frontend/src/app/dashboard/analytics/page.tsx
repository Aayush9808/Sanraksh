"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "../../../lib/config";

const WEEKS = [
  { label:"Week 1 (Feb 9)", pct:97.2 },
  { label:"Week 2 (Feb 16)", pct:98.5 },
  { label:"Week 3 (Feb 23)", pct:99.1 },
  { label:"Week 4 (Mar 2)", pct:99.8, best:true },
];

const DELIVERY = [
  { type:"Food Delivery", workers:423, pct:60, premium:"₹21,150/wk", color:"bg-accent-amber" },
  { type:"Ride Hailing", workers:287, pct:40, premium:"₹14,350/wk", color:"bg-accent-violet" },
  { type:"Grocery", workers:198, pct:28, premium:"₹9,900/wk", color:"bg-state-success" },
  { type:"E-commerce", workers:181, pct:25, premium:"₹9,050/wk", color:"bg-accent-ember" },
];

function RiskBadge({ risk }:{ risk:string }) {
  const m:Record<string,string> = {
    HIGH:"bg-state-danger/15 text-state-danger border-state-danger/25",
    MEDIUM:"bg-state-warning/15 text-state-warning border-state-warning/25",
    LOW:"bg-state-success/15 text-state-success border-state-success/25",
  };
  return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${m[risk]}`}>{risk}</span>;
}

export default function AnalyticsPage() {
  const [dash, setDash] = useState<Record<string,number>|null>(null);
  const [zones, setZones] = useState<{zone:string;city:string;risk_score:number;risk_level:string}[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [d,h] = await Promise.all([
          fetch(`${API_BASE}/api/v1/analytics/dashboard`).then(r=>r.ok?r.json():null),
          fetch(`${API_BASE}/api/v1/analytics/risk-heatmap`).then(r=>r.ok?r.json():null),
        ]);
        if (d) setDash(d);
        if (h?.length) setZones(h.slice(0,5));
      } catch{}
    })();
  }, []);

  const fmt = (n:number) => n>=100000?`₹${(n/100000).toFixed(1)}L`:n>=1000?`₹${(n/1000).toFixed(1)}K`:String(n);

  const kpis = [
    { icon:"📊", label:"Total Policies", value:dash?String(dash.active_policies??"1,089"):"1,089", sub:"+8.2% MoM", accent:"border-accent-amber/40" },
    { icon:"💰", label:"Premium Collected", value:dash?fmt(Number(dash.total_payout??51200)):"₹51.2K", sub:"Cumulative", accent:"border-state-success/40" },
    { icon:"⚡", label:"Automation Rate", value:dash?`${Number(dash.automation_rate??58).toFixed(1)}%`:"58.1%", sub:"Claims auto-approved", accent:"border-accent-ember/40" },
    { icon:"👷", label:"Active Workers", value:dash?String(dash.total_users??"502"):"502", sub:"Across 6 cities", accent:"border-accent-violet/40" },
  ];

  const riskZones = zones.length ? zones.map(z=>({
    zone:z.zone, city:z.city, risk:z.risk_level?.toUpperCase()??"MEDIUM",
    policies:Math.round(z.risk_score*300), claims:Math.round(z.risk_score*20),
  })) : [
    { zone:"Andheri West", city:"Mumbai", risk:"HIGH", policies:234, claims:18 },
    { zone:"Bandra-Kurla", city:"Mumbai", risk:"MEDIUM", policies:189, claims:7 },
    { zone:"Pune Kothrud", city:"Pune", risk:"HIGH", policies:156, claims:14 },
    { zone:"Delhi NCR", city:"Delhi", risk:"MEDIUM", policies:312, claims:9 },
    { zone:"Koramangala", city:"Bengaluru", risk:"LOW", policies:198, claims:2 },
  ];

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04] p-5";
  const b = (d:number) => ({ initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, transition:{delay:d*0.06} } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{opacity:0}} animate={{opacity:1}}>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Analytics & Insights</h1>
        <p className="text-sm text-text-secondary mt-0.5">Platform performance, risk distribution, and payout intelligence</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k,i) => (
          <motion.div key={k.label} {...b(i+1)} className={`${card} border-l-4 ${k.accent}`}>
            <div className="mb-1.5 text-xl">{k.icon}</div>
            <div className="text-2xl font-black text-text-primary">{k.value}</div>
            <div className="text-sm font-medium text-text-secondary mt-0.5">{k.label}</div>
            <div className="text-xs text-text-muted mt-0.5">{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Automation Trend */}
      <motion.div {...b(5)} className={card}>
        <h2 className="text-sm font-semibold text-text-primary mb-1">Weekly Automation Rate</h2>
        <p className="text-xs text-text-muted mb-4">Percentage of claims auto-approved without manual review</p>
        <div className="space-y-3">
          {WEEKS.map(w => (
            <div key={w.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 text-xs text-text-muted">{w.label}</span>
              <div className="flex-1 h-5 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-accent-amber to-accent-ember transition-all" style={{width:`${w.pct}%`}} />
              </div>
              <span className="w-16 text-right text-xs font-bold text-text-primary">{w.pct}%</span>
              {w.best && <span className="rounded-full bg-state-success/15 border border-state-success/25 px-2 py-0.5 text-[10px] font-bold text-state-success">Best</span>}
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Risk Zones */}
        <motion.div {...b(6)} className={card}>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Top Risk Zones</h2>
          <table className="w-full">
            <thead><tr className="border-b border-white/[0.04]">
              {["Zone","City","Risk","Policies","Claims"].map(h=><th key={h} className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>)}
            </tr></thead>
            <tbody>
              {riskZones.map(z=>(
                <tr key={z.zone} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                  <td className="py-2.5 text-sm font-medium text-text-primary">{z.zone}</td>
                  <td className="py-2.5 text-sm text-text-muted">{z.city}</td>
                  <td className="py-2.5"><RiskBadge risk={z.risk}/></td>
                  <td className="py-2.5 text-sm text-text-secondary">{z.policies}</td>
                  <td className="py-2.5 text-sm font-semibold text-accent-amber">{z.claims}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Premium by Type */}
        <motion.div {...b(7)} className={card}>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Premium by Delivery Type</h2>
          <div className="space-y-4">
            {DELIVERY.map(d=>(
              <div key={d.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-text-primary">{d.type}</span>
                  <span className="text-text-muted">{d.workers} workers · {d.premium}</span>
                </div>
                <div className="h-2.5 rounded-full bg-surface-2 overflow-hidden">
                  <div className={`h-full rounded-full ${d.color}`} style={{width:`${d.pct}%`}} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom 3 summary cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          { title:"💸 Payout Reliability", rows:[["Total Paid This Week","₹18,400"],["Avg. Claim","₹960"],["Fastest Payout","12 seconds"],["Largest Payout","₹6,400"]] },
          { title:"🛡️ Fraud Intelligence", rows:[["Claims Blocked","14"],["Suspicious Patterns","3 flagged"],["False Positive Rate","0.2%"],["Savings Protected","₹12,800"]] },
          { title:"👥 Worker Engagement", rows:[["WhatsApp Users","87%"],["Web Portal Users","13%"],["Repeat Claim Rate","23%"],["Avg. Policy Duration","4.2 months"]] },
        ].map(s=>(
          <motion.div key={s.title} {...b(8)} className={card}>
            <h3 className="text-sm font-semibold text-text-primary mb-3">{s.title}</h3>
            {s.rows.map(([l,v])=>(
              <div key={l} className="flex justify-between border-b border-white/[0.03] py-2 text-xs last:border-0">
                <span className="text-text-muted">{l}</span>
                <span className="font-semibold text-text-primary">{v}</span>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
