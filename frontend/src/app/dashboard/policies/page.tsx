"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "../../../lib/config";

interface Policy {
  id:string; policy_number:string; user_id:string; worker_name?:string;
  worker_platform?:string; coverage_type?:string; weekly_premium:number;
  status:string; start_date:string; end_date:string;
}

const MOCK: Policy[] = [
  { id:"1", policy_number:"GA-202603-000310", user_id:"u1", worker_name:"Rahul Kumar", worker_platform:"Zomato", coverage_type:"weather", weekly_premium:55.25, status:"active", start_date:"2026-03-01", end_date:"2026-03-29" },
  { id:"2", policy_number:"GA-202603-000260", user_id:"u2", worker_name:"Priya Sharma", worker_platform:"Swiggy", coverage_type:"flood", weekly_premium:51.60, status:"active", start_date:"2026-02-28", end_date:"2026-03-28" },
  { id:"3", policy_number:"GA-202603-000373", user_id:"u3", worker_name:"Amit Singh", worker_platform:"Blinkit", coverage_type:"job_loss", weekly_premium:54.85, status:"active", start_date:"2026-02-20", end_date:"2026-04-17" },
  { id:"4", policy_number:"GA-202602-000145", user_id:"u4", worker_name:"Sneha Patel", worker_platform:"Ola", coverage_type:"weather", weekly_premium:48.00, status:"expired", start_date:"2026-01-01", end_date:"2026-02-28" },
  { id:"5", policy_number:"GA-202603-000189", user_id:"u5", worker_name:"Karan Mehta", worker_platform:"Uber", coverage_type:"curfew", weekly_premium:62.10, status:"active", start_date:"2026-03-05", end_date:"2026-04-02" },
  { id:"6", policy_number:"GA-202603-000421", user_id:"u6", worker_name:"Divya Nair", worker_platform:"Zepto", coverage_type:"pollution", weekly_premium:44.50, status:"active", start_date:"2026-03-07", end_date:"2026-04-04" },
  { id:"7", policy_number:"GA-202602-000098", user_id:"u7", worker_name:"Rohan Gupta", worker_platform:"Swiggy", coverage_type:"weather", weekly_premium:57.75, status:"expired", start_date:"2025-12-01", end_date:"2026-01-28" },
  { id:"8", policy_number:"GA-202603-000502", user_id:"u8", worker_name:"Anita Joshi", worker_platform:"Dunzo", coverage_type:"job_loss", weekly_premium:59.00, status:"active", start_date:"2026-03-08", end_date:"2026-04-05" },
];

const COV:Record<string,string> = { weather:"🌧️ Weather", flood:"🌊 Flood", job_loss:"💼 Job Loss", pollution:"😷 Pollution", curfew:"🚫 Curfew", app_outage:"⚡ App Outage" };
const PLAT:Record<string,string> = {
  Zomato:"bg-state-danger/15 text-state-danger border-state-danger/20",
  Swiggy:"bg-accent-ember/15 text-accent-ember border-accent-ember/20",
  Blinkit:"bg-state-warning/15 text-state-warning border-state-warning/20",
  Ola:"bg-state-success/15 text-state-success border-state-success/20",
  Uber:"bg-text-muted/15 text-text-muted border-text-muted/20",
  Zepto:"bg-accent-violet/15 text-accent-violet border-accent-violet/20",
  Dunzo:"bg-accent-lavender/15 text-accent-lavender border-accent-lavender/20",
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(MOCK);
  const [total, setTotal] = useState(450);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState("all");
  const [coverageF, setCoverageF] = useState("all");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/policies/all?limit=100`);
        if (r.ok) { const d = await r.json(); if (d.policies?.length) { setPolicies(d.policies); setTotal(d.total); } }
      } catch{}
    })();
  }, []);

  const filtered = policies.filter(p => {
    const ms = !search || p.policy_number.toLowerCase().includes(search.toLowerCase()) || (p.worker_name||"").toLowerCase().includes(search.toLowerCase());
    const mst = statusF==="all" || p.status===statusF;
    const mc = coverageF==="all" || p.coverage_type===coverageF;
    return ms && mst && mc;
  });

  const active = policies.filter(p=>p.status==="active").length;
  const expired = policies.filter(p=>p.status==="expired").length;
  const revenue = policies.filter(p=>p.status==="active").reduce((s,p)=>s+p.weekly_premium,0);
  const daysLeft = (e:string) => Math.ceil((new Date(e).getTime()-Date.now())/86400000);

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const b = (d:number) => ({ initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, transition:{delay:d*0.06} } as const);
  const sel = "rounded-xl border border-white/[0.06] bg-surface-2 px-3 py-2.5 text-sm text-text-secondary outline-none cursor-pointer focus:border-accent-amber/50";

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Policy Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">All active and historical insurance policies</p>
        </div>
        <button className="rounded-xl bg-accent-amber/15 border border-accent-amber/25 px-4 py-2.5 text-sm font-semibold text-accent-amber hover:bg-accent-amber/25 transition">+ New Policy</button>
      </div>

      {/* KPIs */}
      <motion.div {...b(1)} className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { l:"Total Policies", v:total.toLocaleString(), icon:"📋", accent:"border-accent-amber/30 bg-accent-amber/[0.04]" },
          { l:"Active", v:active.toLocaleString(), icon:"✅", accent:"border-state-success/30 bg-state-success/[0.04]" },
          { l:"Expired", v:expired.toLocaleString(), icon:"⏰", accent:"border-state-warning/30 bg-state-warning/[0.04]" },
          { l:"Weekly Revenue", v:`₹${revenue.toFixed(0)}`, icon:"💰", accent:"border-accent-violet/30 bg-accent-violet/[0.04]" },
        ].map(k=>(
          <div key={k.l} className={`rounded-2xl border p-4 ${k.accent}`}>
            <div className="text-xl mb-1">{k.icon}</div>
            <div className="text-2xl font-black text-text-primary">{k.v}</div>
            <div className="text-sm text-text-secondary">{k.l}</div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div {...b(2)} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search policy # or name…"
            className="w-full rounded-xl border border-white/[0.06] bg-surface-2 py-2.5 pl-9 pr-4 text-sm text-text-primary placeholder-text-muted/40 outline-none focus:border-accent-amber/50 transition" />
        </div>
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} className={sel}>
          <option value="all">All Status</option><option value="active">Active</option><option value="expired">Expired</option>
        </select>
        <select value={coverageF} onChange={e=>setCoverageF(e.target.value)} className={sel}>
          <option value="all">All Coverage</option><option value="weather">🌧️ Weather</option><option value="flood">🌊 Flood</option>
          <option value="job_loss">💼 Job Loss</option><option value="pollution">😷 Pollution</option><option value="curfew">🚫 Curfew</option>
        </select>
        <span className="ml-auto text-xs text-text-muted">{filtered.length} results</span>
      </motion.div>

      {/* Table */}
      <motion.div {...b(3)} className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr className="border-b border-white/[0.04] bg-surface-2/50">
              {["Policy #","Worker","Platform","Coverage","Premium/wk","Status","Valid Until","Days Left"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(p => {
                const days = daysLeft(p.end_date);
                return (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 font-mono text-xs text-accent-amber">{p.policy_number}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-3 text-[10px] font-bold text-text-secondary">{(p.worker_name||"W")[0]}</div>
                        <span className="text-sm font-medium text-text-primary">{p.worker_name||p.user_id.slice(0,8)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{p.worker_platform ? <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PLAT[p.worker_platform]||""}`}>{p.worker_platform}</span> : <span className="text-text-muted text-xs">—</span>}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{p.coverage_type?(COV[p.coverage_type]||p.coverage_type):"—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-text-primary">₹{p.weekly_premium.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${p.status==="active"?"bg-state-success/15 text-state-success border-state-success/25":"bg-surface-2 text-text-muted border-white/[0.06]"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${p.status==="active"?"bg-state-success":"bg-text-muted"}`}/>
                        {p.status[0].toUpperCase()+p.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{new Date(p.end_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td>
                    <td className="px-4 py-3">
                      {days<=0 ? <span className="text-xs text-text-muted">Expired</span>
                       : days<=7 ? <span className="rounded-full bg-state-warning/15 border border-state-warning/25 px-2 py-0.5 text-[10px] font-bold text-state-warning">⚠️ {days}d</span>
                       : <span className="text-xs text-text-muted">{days}d</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length===0 && <div className="py-16 text-center text-text-muted"><p className="text-3xl mb-2">🔍</p><p className="text-sm">No policies match your filters</p></div>}
      </motion.div>
    </motion.div>
  );
}
