"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

const MOCK_POLICY = {
  id: "POL-2024-8821",
  status: "active",
  plan: "GigShield Standard",
  platforms: ["Swiggy", "Zomato", "Uber"],
  city: "Mumbai",
  coverage_days_left: 287,
  total_coverage: 365,
  total_earned: 2840,
  claims_this_month: 3,
  next_review: "Apr 1, 2026",
};

const PAYOUTS = [
  { id:"P-001", date:"Mar 24, 2026", event:"Heavy Rain",   amount:280, status:"paid",    trigger:"IMD Red Alert" },
  { id:"P-002", date:"Mar 18, 2026", event:"App Outage",   amount:200, status:"paid",    trigger:"Swiggy down 5h" },
  { id:"P-003", date:"Mar 10, 2026", event:"Curfew",       amount:350, status:"paid",    trigger:"Municipal order" },
  { id:"P-004", date:"Feb 28, 2026", event:"Heat Wave",    amount:200, status:"paid",    trigger:"Temp > 44°C" },
  { id:"P-005", date:"Feb 14, 2026", event:"Heavy Rain",   amount:280, status:"paid",    trigger:"IMD Orange Alert" },
];

const COVERAGES = [
  { event:"Heavy rainfall / flooding", payout:"₹280/day",      likelihood:0.72, status:"active" },
  { event:"Platform app outage",       payout:"₹200/incident", likelihood:0.45, status:"active" },
  { event:"Curfew / lockdown",         payout:"₹350/day",      likelihood:0.12, status:"active" },
  { event:"AQI > 400 severe",          payout:"₹150/day",      likelihood:0.28, status:"active" },
  { event:"Cyclone warning",           payout:"₹400/day",      likelihood:0.08, status:"active" },
  { event:"Heat wave > 44°C",          payout:"₹200/day",      likelihood:0.35, status:"active" },
];

function LikelihoodBar({ v }: { v:number }) {
  const c = v>0.6?"#EF4444":v>0.35?"#F59E0B":"#10B981";
  return (
    <div className="flex items-center gap-2">
      <div className="prog-track" style={{width:80}}>
        <div className="prog-fill" style={{width:`${v*100}%`,background:c,animation:"none"}} />
      </div>
      <span className="font-mono text-xs" style={{color:c}}>{(v*100).toFixed(0)}%</span>
    </div>
  );
}

export default function MyPolicyPage() {
  const [policy, setPolicy] = useState(MOCK_POLICY);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/workers/me/policy`, {
      headers: { Authorization: `Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}` }
    }).then(r=>r.ok?r.json():null).then(d=>{ if(d) setPolicy(d); }).catch(()=>{});
  }, []);

  const pct = Math.round((policy.coverage_days_left / policy.total_coverage) * 100);

  return (
    <div className="max-w-5xl">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Worker portal</p>
          <h1 className="text-[#F5F0E8] font-bold text-xl" style={{letterSpacing:"-0.03em"}}>My Insurance Policy</h1>
        </div>
        <span className="tag tag-live">Active</span>
      </div>

      {/* Top: policy overview + stats */}
      <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 mb-6">
        {/* Policy card */}
        <div className="panel p-5">
          <p className="lbl mb-3">Policy details</p>
          <div className="text-[#F5F0E8] font-bold text-lg mb-1">{policy.plan}</div>
          <p className="lbl mb-4">{policy.id}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B5C44]">City</span>
              <span className="text-[#C8BAA0] font-medium">{policy.city}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B5C44]">Platforms</span>
              <div className="flex gap-1.5">
                {policy.platforms.map(p=><span key={p} className="tag tag-neutral">{p}</span>)}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#6B5C44]">Review date</span>
              <span className="text-[#C8BAA0]">{policy.next_review}</span>
            </div>
          </div>
        </div>

        {/* Coverage ring */}
        <div className="panel p-5 flex flex-col items-center justify-center">
          <p className="lbl mb-4">Coverage remaining</p>
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#2A2218" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${2*Math.PI*40}`}
                initial={{ strokeDashoffset: 2*Math.PI*40 }}
                animate={{ strokeDashoffset: 2*Math.PI*40*(1-pct/100) }}
                transition={{ duration:1.2, ease:"easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[#F5F0E8] font-bold text-2xl" style={{letterSpacing:"-0.04em"}}>{pct}%</div>
              <div className="lbl text-center">{policy.coverage_days_left}d left</div>
            </div>
          </div>
        </div>

        {/* Lifetime stats */}
        <div className="panel p-5 flex flex-col gap-4">
          <div>
            <p className="lbl mb-1">Total earned</p>
            <div className="text-amber-DEFAULT font-extrabold text-3xl" style={{letterSpacing:"-0.04em"}}>₹{policy.total_earned.toLocaleString()}</div>
          </div>
          <div className="div-h" />
          <div>
            <p className="lbl mb-1">Claims this month</p>
            <div className="text-[#F5F0E8] font-bold text-2xl" style={{letterSpacing:"-0.03em"}}>{policy.claims_this_month}</div>
          </div>
        </div>
      </div>

      {/* Coverage matrix */}
      <div className="panel overflow-hidden mb-6">
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
          <p className="lbl mb-1">What triggers your payout</p>
          <h2 className="text-[#F5F0E8] font-bold" style={{letterSpacing:"-0.02em"}}>Coverage matrix</h2>
        </div>
        <table className="tbl">
          <thead><tr><th>Event</th><th>Your payout</th><th>Trigger likelihood</th><th>Status</th></tr></thead>
          <tbody>
            {COVERAGES.map(c => (
              <tr key={c.event}>
                <td><span className="text-[#C8BAA0] font-medium">{c.event}</span></td>
                <td><span className="text-amber-DEFAULT font-mono font-bold">{c.payout}</span></td>
                <td><LikelihoodBar v={c.likelihood} /></td>
                <td><span className="tag tag-live">{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payout history */}
      <div className="panel overflow-hidden">
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
          <p className="lbl mb-1">Payment history</p>
          <h2 className="text-[#F5F0E8] font-bold" style={{letterSpacing:"-0.02em"}}>Past payouts</h2>
        </div>
        <table className="tbl">
          <thead><tr><th>Date</th><th>Event</th><th>Trigger</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {PAYOUTS.map(p => (
              <tr key={p.id}>
                <td className="font-mono text-xs">{p.date}</td>
                <td><span className="text-[#C8BAA0] font-medium">{p.event}</span></td>
                <td className="text-sm">{p.trigger}</td>
                <td><span className="text-amber-DEFAULT font-mono font-bold">₹{p.amount}</span></td>
                <td><span className="tag tag-live">{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
