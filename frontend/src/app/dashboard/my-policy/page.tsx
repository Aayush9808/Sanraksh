"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

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

interface PolicyData {
  policy_number?: string;
  status?: string;
  coverage_type?: string;
  start_date?: string;
  end_date?: string;
  weekly_premium?: number;
  coverage_amount?: number;
}

interface ClaimData {
  id: string;
  claim_number: string;
  event_type?: string;
  claim_amount?: number;
  status?: string;
  claim_date?: string;
  payout_transaction_id?: string;
  fraud_score?: number;
}

export default function MyPolicyPage() {
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [hasPolicy, setHasPolicy] = useState(false);
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    const h = { Authorization: `Bearer ${token}` };

    fetch(`${API_BASE}/api/v1/workers/me/policy`, { headers: h })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.has_policy && d.policy) {
          setHasPolicy(true);
          setPolicy(d.policy);
        }
      }).catch(() => {});

    fetch(`${API_BASE}/api/v1/workers/me/claims`, { headers: h })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (Array.isArray(d)) {
          setClaims(d);
          const earned = d
            .filter((c: ClaimData) => c.status === "paid")
            .reduce((sum: number, c: ClaimData) => sum + (c.claim_amount || 0), 0);
          setTotalEarned(Math.round(earned));
        }
      }).catch(() => {});
  }, []);

  // Compute coverage days remaining
  const today = new Date();
  const endDate = policy?.end_date ? new Date(policy.end_date) : null;
  const coverageDaysLeft = endDate ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86400000)) : 0;
  const startDate = policy?.start_date ? new Date(policy.start_date) : null;
  const totalCoverage = (endDate && startDate)
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)
    : 365;
  const pct = totalCoverage > 0 ? Math.round((coverageDaysLeft / totalCoverage) * 100) : 0;

  const paidClaims = claims.filter(c => c.status === "paid").length;

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  };

  const statusTag = (s?: string) => {
    if (!s) return "tag-neutral";
    if (s === "paid") return "tag-live";
    if (s === "pending") return "tag-warn";
    if (s === "rejected") return "tag-neg";
    return "tag-neutral";
  };

  return (
    <div className="max-w-5xl">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Worker portal</p>
          <h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>My Insurance Policy</h1>
        </div>
        <span className={`tag ${hasPolicy ? "tag-live" : "tag-neutral"}`}>{hasPolicy ? "Active" : "No policy"}</span>
      </div>

      {/* Top: policy overview + stats */}
      <div className="grid md:grid-cols-[1fr_1fr_auto] gap-4 mb-6">
        {/* Policy card */}
        <div className="panel p-5">
          <p className="lbl mb-3">Policy details</p>
          <div className="text-slate-800 font-bold text-lg mb-1">
            {policy ? `GigArmor ${policy.coverage_type === "income_loss_only" ? "Standard" : "Pro"}` : "—"}
          </div>
          <p className="lbl mb-4">{policy?.policy_number || "—"}</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Weekly premium</span>
              <span className="text-slate-600 font-medium">₹{policy?.weekly_premium?.toFixed(0) || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Coverage</span>
              <span className="text-slate-600 font-medium">₹{policy?.coverage_amount?.toLocaleString() || "—"}/day</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Expires</span>
              <span className="text-slate-600">{formatDate(policy?.end_date)}</span>
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
              <div className="text-slate-800 font-bold text-2xl" style={{letterSpacing:"-0.04em"}}>{pct}%</div>
              <div className="lbl text-center">{coverageDaysLeft}d left</div>
            </div>
          </div>
        </div>

        {/* Lifetime stats */}
        <div className="panel p-5 flex flex-col gap-4">
          <div>
            <p className="lbl mb-1">Total earned</p>
            <div className="text-amber font-extrabold text-3xl" style={{letterSpacing:"-0.04em"}}>₹{totalEarned.toLocaleString()}</div>
          </div>
          <div className="div-h" />
          <div>
            <p className="lbl mb-1">Paid claims</p>
            <div className="text-slate-800 font-bold text-2xl" style={{letterSpacing:"-0.03em"}}>{paidClaims}</div>
          </div>
        </div>
      </div>

      {/* Coverage matrix */}
      <div className="panel overflow-hidden mb-6">
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
          <p className="lbl mb-1">What triggers your payout</p>
          <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>Coverage matrix</h2>
        </div>
        <table className="tbl">
          <thead><tr><th>Event</th><th>Your payout</th><th>Trigger likelihood</th><th>Status</th></tr></thead>
          <tbody>
            {COVERAGES.map(c => (
              <tr key={c.event}>
                <td><span className="text-slate-600 font-medium">{c.event}</span></td>
                <td><span className="text-amber font-mono font-bold">{c.payout}</span></td>
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
          <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>
            Past payouts {claims.length > 0 ? `(${claims.length})` : ""}
          </h2>
        </div>
        {claims.length === 0 ? (
          <div className="px-5 py-8 text-center text-slate-400 text-sm">No claims yet</div>
        ) : (
          <table className="tbl">
            <thead><tr><th>Claim #</th><th>Date</th><th>Event</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {claims.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs">{c.claim_number}</td>
                  <td className="font-mono text-xs">{formatDate(c.claim_date)}</td>
                  <td><span className="text-slate-600 font-medium">{c.event_type || "—"}</span></td>
                  <td><span className="text-amber font-mono font-bold">₹{(c.claim_amount || 0).toFixed(0)}</span></td>
                  <td><span className={`tag ${statusTag(c.status)}`}>{c.status || "—"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
