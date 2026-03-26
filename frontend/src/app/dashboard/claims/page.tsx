"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "../../../lib/config";

type ClaimRow = {
  id: string; name: string; initials: string; zone: string; type: string;
  amount: string; status: string; time: string; claim_number: string;
  fraud_score: number; decision_reasons: string[];
};

const MOCK: ClaimRow[] = [
  { id:"C001", name:"Rajesh Kumar", initials:"RK", zone:"Andheri West", type:"Weather", amount:"₹800", status:"PAID", time:"2m ago", claim_number:"CLM-20241208-00001", fraud_score:0.04, decision_reasons:["ROUTE_AUTO_PAY","FRAUD_SCORE_LOW"] },
  { id:"C002", name:"Sunita Kumari", initials:"SK", zone:"Bandra-Kurla", type:"Weather", amount:"₹800", status:"PAID", time:"5m ago", claim_number:"CLM-20241208-00002", fraud_score:0.07, decision_reasons:["ROUTE_AUTO_PAY","LOCATION_MATCH"] },
  { id:"C003", name:"Ajay Patel", initials:"AP", zone:"Pune Central", type:"Weather", amount:"₹800", status:"PROCESSING", time:"8m ago", claim_number:"CLM-20241208-00003", fraud_score:0.32, decision_reasons:["ROUTE_MANUAL_REVIEW","FRAUD_SCORE_MEDIUM"] },
  { id:"C004", name:"Meera Sharma", initials:"MS", zone:"Delhi NCR", type:"Flood", amount:"₹800", status:"REVIEW", time:"12m ago", claim_number:"CLM-20241208-00004", fraud_score:0.45, decision_reasons:["ROUTE_MANUAL_REVIEW","WEAK_PEER_CORROBORATION"] },
  { id:"C005", name:"Deepak Raut", initials:"DR", zone:"Koramangala", type:"Weather", amount:"₹800", status:"PAID", time:"15m ago", claim_number:"CLM-20241208-00005", fraud_score:0.11, decision_reasons:["ROUTE_AUTO_PAY","FRAUD_SCORE_LOW"] },
  { id:"C006", name:"Priya Singh", initials:"PS", zone:"Andheri East", type:"Weather", amount:"₹800", status:"PAID", time:"22m ago", claim_number:"CLM-20241208-00006", fraud_score:0.05, decision_reasons:["ROUTE_AUTO_PAY","PEER_CORROBORATION_OK"] },
  { id:"C007", name:"Kiran Naik", initials:"KN", zone:"Thane West", type:"Weather", amount:"₹800", status:"PROCESSING", time:"31m ago", claim_number:"CLM-20241208-00007", fraud_score:0.28, decision_reasons:["ROUTE_MANUAL_REVIEW","MODERATE_30D_CLAIM_FREQUENCY"] },
  { id:"C008", name:"Rahul Desai", initials:"RD", zone:"Bandra West", type:"Weather", amount:"₹800", status:"REVIEW", time:"45m ago", claim_number:"CLM-20241208-00008", fraud_score:0.41, decision_reasons:["ROUTE_MANUAL_REVIEW","FRAUD_SCORE_MEDIUM"] },
  { id:"C009", name:"Fatima Sheikh", initials:"FS", zone:"Jogeshwari", type:"Weather", amount:"₹800", status:"PAID", time:"1h ago", claim_number:"CLM-20241208-00009", fraud_score:0.08, decision_reasons:["ROUTE_AUTO_PAY","HIGH_EVENT_CONFIDENCE"] },
  { id:"C010", name:"Santosh Yadav", initials:"SY", zone:"Powai", type:"Weather", amount:"₹800", status:"PAID", time:"1h ago", claim_number:"CLM-20241208-00010", fraud_score:0.03, decision_reasons:["ROUTE_AUTO_PAY","FRAUD_SCORE_LOW"] },
];

const AVATAR: Record<string,string> = {
  RK:"bg-accent-amber/20 text-accent-amber", SK:"bg-accent-violet/20 text-accent-violet",
  AP:"bg-state-success/20 text-state-success", MS:"bg-state-danger/20 text-state-danger",
  DR:"bg-accent-ember/20 text-accent-ember", PS:"bg-accent-lavender/20 text-accent-lavender",
  KN:"bg-state-info/20 text-state-info", RD:"bg-accent-gold/20 text-accent-gold",
  FS:"bg-state-warning/20 text-state-warning", SY:"bg-accent-violet/20 text-accent-violet",
};

function Badge({ status }: { status: string }) {
  const m: Record<string,string> = {
    PAID:"bg-state-success/15 text-state-success border-state-success/25",
    PROCESSING:"bg-state-warning/15 text-state-warning border-state-warning/25",
    PENDING:"bg-state-warning/15 text-state-warning border-state-warning/25",
    REVIEW:"bg-state-danger/15 text-state-danger border-state-danger/25",
    REJECTED:"bg-state-danger/15 text-state-danger border-state-danger/25",
  };
  return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${m[status]??""}`}>{status}</span>;
}

export default function ClaimsPage() {
  const [filter, setFilter] = useState("All");
  const [claims, setClaims] = useState<ClaimRow[]>(MOCK);
  const [actingId, setActingId] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/claims/all?limit=50`);
        if (r.ok) {
          const d = await r.json();
          if (d.claims?.length) setClaims(d.claims.map((c:any) => ({
            id:c.id, name:c.worker_name||"Worker",
            initials:(c.worker_name||"W").split(" ").map((s:string)=>s[0]).join("").toUpperCase().slice(0,2),
            zone:c.zone||"—", type:"Weather", amount:`₹${c.amount||800}`,
            status:c.status?.toUpperCase()||"PAID", time:c.created_at?new Date(c.created_at).toLocaleDateString():"—",
            claim_number:c.claim_number, fraud_score:c.fraud_score||0, decision_reasons:c.decision_reasons||[],
          })));
        }
      } catch{}
    })();
  }, []);

  async function act(id:string, action:"approve"|"reject") {
    setActingId(id);
    try {
      const r = await fetch(`${API_BASE}/api/v1/claims/${id}/${action}`, { method:"PUT" });
      if (r.ok) setClaims(p => p.map(c => c.id===id ? {...c, status: action==="approve"?"PAID":"REJECTED"} : c));
    } catch{}
    setActingId(null);
  }

  const tabs = [
    { l:"All", n:claims.length },
    { l:"PAID", n:claims.filter(c=>c.status==="PAID").length },
    { l:"PENDING", n:claims.filter(c=>c.status==="PENDING"||c.status==="PROCESSING").length },
    { l:"REVIEW", n:claims.filter(c=>c.status==="REVIEW").length },
  ];
  const list = filter==="All" ? claims
    : filter==="PENDING" ? claims.filter(c=>c.status==="PENDING"||c.status==="PROCESSING")
    : claims.filter(c=>c.status===filter);

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const b = (d:number) => ({ initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, transition:{delay:d*0.06} } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{opacity:0}} animate={{opacity:1}}>
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Claims Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">Review, approve, and track all worker claims</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-state-success/10 border border-state-success/20 px-4 py-2 text-sm font-semibold text-state-success">Today: ₹18,400</span>
          <button className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-text-secondary hover:bg-white/5 transition">Export CSV ↗</button>
        </div>
      </div>

      {/* filter tabs */}
      <motion.div {...b(1)} className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.l} onClick={() => setFilter(t.l)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filter===t.l ? "bg-accent-amber/15 text-accent-amber border border-accent-amber/25" : "text-text-muted hover:bg-white/5"}`}>
            {t.l} <span className="ml-1 text-xs opacity-60">{t.n}</span>
          </button>
        ))}
      </motion.div>

      {/* table */}
      <motion.div {...b(2)} className={`${card} overflow-hidden`}>
        <div className="border-b border-white/[0.04] px-5 py-3">
          <span className="text-sm font-semibold text-text-primary">{list.length} claim{list.length!==1?"s":""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {["ID","Worker","Zone","Type","Amount","Status","Audit","Time","Action"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3.5 font-mono text-xs text-accent-amber">#{c.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${AVATAR[c.initials]||"bg-surface-2 text-text-muted"}`}>{c.initials}</span>
                      <span className="text-sm font-medium text-text-primary">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{c.zone}</td>
                  <td className="px-4 py-3.5 text-sm text-text-secondary">{c.type}</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-text-primary">{c.amount}</td>
                  <td className="px-4 py-3.5"><Badge status={c.status}/></td>
                  <td className="px-4 py-3.5">
                    <div className="flex max-w-[200px] flex-wrap gap-1">
                      {c.decision_reasons.slice(0,2).map(r=>(
                        <span key={r} className="rounded-full border border-white/[0.06] bg-surface-2 px-2 py-0.5 text-[9px] text-text-muted">{r.replaceAll("_"," ")}</span>
                      ))}
                      {c.decision_reasons.length>2 && <span className="text-[9px] text-text-muted">+{c.decision_reasons.length-2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-text-muted">{c.time}</td>
                  <td className="px-4 py-3.5">
                    {c.status==="REVIEW" ? (
                      <div className="flex gap-1.5">
                        <button onClick={()=>act(c.id,"approve")} disabled={actingId===c.id}
                          className="rounded-lg bg-state-success/15 border border-state-success/25 px-2.5 py-1 text-[10px] font-bold text-state-success hover:bg-state-success/25 disabled:opacity-50 transition">Approve</button>
                        <button onClick={()=>act(c.id,"reject")} disabled={actingId===c.id}
                          className="rounded-lg bg-state-danger/15 border border-state-danger/25 px-2.5 py-1 text-[10px] font-bold text-state-danger hover:bg-state-danger/25 disabled:opacity-50 transition">Reject</button>
                      </div>
                    ) : (
                      <button className="rounded-lg border border-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-text-muted hover:bg-white/5 transition">View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* summary cards */}
      <motion.div {...b(3)} className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l:"Total Claims", v:"23", c:"text-text-primary" },
          { l:"Paid", v:"18", c:"text-state-success" },
          { l:"Processing", v:"3", c:"text-state-warning" },
          { l:"Under Review", v:"2", c:"text-state-danger" },
        ].map(s=>(
          <div key={s.l} className={`${card} p-5 text-center`}>
            <div className={`text-3xl font-black ${s.c}`}>{s.v}</div>
            <div className="mt-1 text-xs text-text-muted">{s.l}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
