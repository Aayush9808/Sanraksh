"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "../../../lib/config";

type Severity = "high"|"extreme"|"medium";
type Playbook = { id:string; name:string; summary:string; payload:{ city:string; zone:string; event_type:string; severity:Severity; strict_mode:boolean; affected_radius_km:number; limit_workers:number; }; };
type Metrics = { window:string; active_disruptions:number; disruptions_24h:number; claims_24h:number; paid_24h:number; review_24h:number; rejected_24h:number; auto_approval_rate:number; avg_fraud_score:number; total_paid_24h:number; };
type ReviewClaim = { id:string; claim_number:string; worker_name:string; zone:string; amount:number; status:string; created_at:string; age_minutes:number; fraud_score:number; decision_reasons:string[]; };
type SimResult = { disruption_id:string; created_claims:number; auto_paid_count:number; review_count:number; rejected_count:number; total_payout:number; };
type RunItem = { id:string; city:string; zone:string; event_type:string; severity:string; created_at:string; created_claims:number; auto_paid_count:number; review_count:number; rejected_count:number; total_payout:number; avg_fraud_score:number; signal_confidence:number; top_reasons:{reason:string;count:number}[]; };
type QueueHealth = { queue_size:number; warning_count:number; breach_count:number; avg_age_minutes:number; breach_rate_pct:number; projected_clear_minutes:number; };
type PH = "live"|"fallback";

const PLAYBOOKS:Playbook[] = [
  { id:"monsoon-surge", name:"Monsoon Surge", summary:"Mumbai heavy rain with strict automation.", payload:{ city:"Mumbai", zone:"Andheri West", event_type:"heavy_rain", severity:"high", strict_mode:true, affected_radius_km:2, limit_workers:400 } },
  { id:"pollution-shutdown", name:"AQI Shutdown", summary:"Delhi severe pollution wave.", payload:{ city:"Delhi", zone:"Delhi NCR", event_type:"severe_pollution", severity:"extreme", strict_mode:true, affected_radius_km:3, limit_workers:300 } },
  { id:"platform-outage", name:"Platform Outage", summary:"Pune app outage.", payload:{ city:"Pune", zone:"Pune Central", event_type:"market_closure", severity:"medium", strict_mode:true, affected_radius_km:2.5, limit_workers:250 } },
];

const FB_METRICS:Metrics = { window:"24h", active_disruptions:3, disruptions_24h:8, claims_24h:146, paid_24h:120, review_24h:18, rejected_24h:8, auto_approval_rate:82.2, avg_fraud_score:0.214, total_paid_24h:96400 };
const FB_TREND = [{ day:"Mon",claims:18,payout:14400 },{ day:"Tue",claims:22,payout:17600 },{ day:"Wed",claims:31,payout:24800 },{ day:"Thu",claims:26,payout:20800 },{ day:"Fri",claims:19,payout:15200 },{ day:"Sat",claims:35,payout:28000 },{ day:"Sun",claims:24,payout:19200 }];

function fmtCur(v:number) { return `₹${Math.round(v).toLocaleString("en-IN")}`; }
function fmtReason(r:string) { return r.toLowerCase().split("_").map(c=>c[0].toUpperCase()+c.slice(1)).join(" "); }
function slaTone(m:number) { return m>=30?"text-state-danger":m>=15?"text-state-warning":"text-state-success"; }
function statusTone(s:string) { const u=s.toUpperCase(); if(u==="PENDING"||u==="PROCESSING"||u==="REVIEW") return "bg-state-warning/15 text-state-warning border-state-warning/25"; if(u==="REJECTED") return "bg-state-danger/15 text-state-danger border-state-danger/25"; return "bg-state-success/15 text-state-success border-state-success/25"; }

export default function ControlTowerPage() {
  const [metrics, setMetrics] = useState<Metrics>(FB_METRICS);
  const [trend, setTrend] = useState(FB_TREND);
  const [queue, setQueue] = useState<ReviewClaim[]>([]);
  const [runs, setRuns] = useState<RunItem[]>([]);
  const [qH, setQH] = useState<QueueHealth|null>(null);
  const [selRunId, setSelRunId] = useState<string|null>(null);
  const [ph, setPH] = useState<{metrics:PH;queue:PH;trend:PH;runs:PH}>({metrics:"live",queue:"live",trend:"live",runs:"live"});
  const [refreshing, setRefreshing] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rowActId, setRowActId] = useState<string|null>(null);
  const [runningPb, setRunningPb] = useState<string|null>(null);
  const [lastResult, setLastResult] = useState<SimResult|null>(null);
  const [status, setStatus] = useState("Control Tower is live.");

  async function loadMetrics() { const r=await fetch(`${API_BASE}/api/v1/phase2/control-tower`); if(!r.ok) throw 0; setMetrics(await r.json()); }
  async function loadQueue() {
    const r=await fetch(`${API_BASE}/api/v1/phase2/review-queue?limit=100`); if(!r.ok) throw 0;
    const d=await r.json();
    setQueue((d.claims||[]).map((c:any)=>({ id:c.id, claim_number:c.claim_number||c.id, worker_name:c.worker_name||"Worker", zone:c.zone||"-", amount:Number(c.amount||0), status:(c.status||"PENDING").toUpperCase(), created_at:c.created_at||new Date().toISOString(), age_minutes:Number(c.age_minutes||0), fraud_score:Number(c.fraud_score||0), decision_reasons:c.decision_reasons||[] })).sort((a:ReviewClaim,b:ReviewClaim)=>b.age_minutes-a.age_minutes));
  }
  async function loadTrend() { const r=await fetch(`${API_BASE}/api/v1/analytics/claims-summary?days=7`); if(!r.ok) throw 0; const d=await r.json(); if(Array.isArray(d)&&d.length) setTrend(d.map((p:any,i:number)=>({day:p.day||`D${i+1}`,claims:Number(p.claims||0),payout:Number(p.payout||0)}))); }
  async function loadQH() { const r=await fetch(`${API_BASE}/api/v1/phase2/queue-health`); if(!r.ok) throw 0; setQH(await r.json()); }
  async function loadRuns() { const r=await fetch(`${API_BASE}/api/v1/phase2/run-history?limit=8`); if(!r.ok) throw 0; const d=await r.json(); setRuns(d.runs||[]); }

  async function refreshAll() {
    setRefreshing(true);
    const [mR,qR,tR,rR] = await Promise.allSettled([loadMetrics(),Promise.all([loadQueue(),loadQH()]),loadTrend(),loadRuns()]);
    setPH({ metrics:mR.status==="fulfilled"?"live":"fallback", queue:qR.status==="fulfilled"?"live":"fallback", trend:tR.status==="fulfilled"?"live":"fallback", runs:rR.status==="fulfilled"?"live":"fallback" });
    const ok=[mR,qR,tR,rR].filter(r=>r.status==="fulfilled").length;
    setStatus(ok===4?"All panels refreshed.":ok===0?"Backend unavailable. Showing fallback.":"Partial response. Some panels in fallback.");
    setRefreshing(false);
  }

  useEffect(()=>{ refreshAll(); }, []);
  useEffect(()=>{ if(!selRunId&&runs.length) setSelRunId(runs[0].id); }, [runs, selRunId]);

  async function handleApprove(limit:number) {
    setApproving(true);
    try { const r=await fetch(`${API_BASE}/api/v1/phase2/review-queue/approve?limit=${limit}`,{method:"POST"}); if(!r.ok)throw 0; const d=await r.json(); setStatus(`Approved ${d.approved_count} claims (${fmtCur(d.total_paid)}).`); await refreshAll(); } catch{ setStatus("Approval failed."); } finally{ setApproving(false); }
  }

  async function queueAct(id:string, action:"approve"|"reject") {
    setRowActId(id);
    try { const r=await fetch(`${API_BASE}/api/v1/claims/${id}/${action}`,{method:"PUT"}); if(!r.ok) throw 0; setQueue(p=>p.filter(c=>c.id!==id)); setStatus(`Claim ${action}d.`); await loadMetrics(); } catch{ setStatus(`Failed to ${action} claim.`); } finally{ setRowActId(null); }
  }

  async function runPlaybook(pb:Playbook) {
    setRunningPb(pb.id);
    try {
      const r=await fetch(`${API_BASE}/api/v1/phase2/simulate-disruption`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pb.payload)});
      if(!r.ok) throw 0; const d=await r.json();
      setLastResult({ disruption_id:d.disruption_id, created_claims:Number(d.created_claims||0), auto_paid_count:Number(d.auto_paid_count||0), review_count:Number(d.review_count||0), rejected_count:Number(d.rejected_count||0), total_payout:Number(d.total_payout||0) });
      const ni:RunItem = { id:String(d.disruption_id), city:pb.payload.city, zone:pb.payload.zone, event_type:pb.payload.event_type, severity:pb.payload.severity, created_at:new Date().toISOString(), created_claims:Number(d.created_claims||0), auto_paid_count:Number(d.auto_paid_count||0), review_count:Number(d.review_count||0), rejected_count:Number(d.rejected_count||0), total_payout:Number(d.total_payout||0), avg_fraud_score:0, signal_confidence:0, top_reasons:[] };
      setRuns(p=>[ni,...p].slice(0,8)); setSelRunId(ni.id);
      setStatus(`${pb.name} executed. ${d.created_claims} claims generated.`); await refreshAll();
    } catch{ setStatus(`${pb.name} failed.`); } finally{ setRunningPb(null); }
  }

  const backlog = useMemo(()=>Math.round((metrics.review_24h/Math.max(metrics.claims_24h,1))*100),[metrics]);
  const sla = useMemo(()=>{ let w=0,br=0,ta=0; for(const c of queue){ const a=Math.max(0,c.age_minutes); ta+=a; if(a>=30)br++; else if(a>=15)w++; } return{w,br,avg:queue.length?Math.round(ta/queue.length):0}; },[queue]);
  const trendMax = useMemo(()=>Math.max(...trend.map(p=>p.claims),1),[trend]);
  const selRun = useMemo(()=>runs.find(r=>r.id===selRunId)||null,[runs,selRunId]);
  const runRates = useMemo(()=>{ if(!selRun||selRun.created_claims<=0) return{a:0,r:0,j:0}; const b=selRun.created_claims; return{a:Math.round((selRun.auto_paid_count/b)*100),r:Math.round((selRun.review_count/b)*100),j:Math.round((selRun.rejected_count/b)*100)}; },[selRun]);
  const projClear = useMemo(()=>qH?qH.projected_clear_minutes:queue.length===0?0:Math.max(5,Math.ceil(queue.length/25)*5),[qH,queue.length]);
  const breachPct = useMemo(()=>qH?Math.round(qH.breach_rate_pct):queue.length===0?0:Math.round((sla.br/queue.length)*100),[qH,sla.br,queue.length]);

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const b = (d:number) => ({ initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, transition:{delay:d*0.06} } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{opacity:0}} animate={{opacity:1}}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Control Tower</h1>
          <p className="text-sm text-text-secondary mt-0.5">Portfolio view, queue controls, and simulation playbooks</p>
        </div>
        <button onClick={()=>refreshAll()} disabled={refreshing}
          className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm font-medium text-text-secondary hover:bg-white/5 disabled:opacity-50 transition">
          {refreshing?"Refreshing…":"Refresh"}
        </button>
      </div>

      {/* Panel health */}
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        {(["metrics","queue","trend","runs"] as const).map(p=>(
          <span key={p} className={`rounded-full border px-2.5 py-0.5 font-medium ${ph[p]==="live"?"border-state-success/25 bg-state-success/10 text-state-success":"border-state-warning/25 bg-state-warning/10 text-state-warning"}`}>{p}: {ph[p]}</span>
        ))}
        <span className="ml-2 text-text-muted">{status}</span>
      </div>

      {/* Top 5 KPIs */}
      <motion.div {...b(1)} className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          { l:"Active Disruptions", v:String(metrics.active_disruptions), s:`${metrics.disruptions_24h} in ${metrics.window}`, t:"border-state-danger/30 bg-state-danger/[0.04]" },
          { l:"Claims (24h)", v:String(metrics.claims_24h), s:`${metrics.paid_24h} paid`, t:"border-accent-amber/30 bg-accent-amber/[0.04]" },
          { l:"In Review", v:String(metrics.review_24h), s:`${backlog}% backlog`, t:"border-state-warning/30 bg-state-warning/[0.04]" },
          { l:"Auto Approval", v:`${metrics.auto_approval_rate}%`, s:`Avg fraud ${metrics.avg_fraud_score}`, t:"border-accent-violet/30 bg-accent-violet/[0.04]" },
          { l:"Paid (24h)", v:fmtCur(metrics.total_paid_24h), s:`${metrics.rejected_24h} rejected`, t:"border-state-success/30 bg-state-success/[0.04]" },
        ].map(c=>(
          <div key={c.l} className={`rounded-2xl border p-3.5 ${c.t}`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{c.l}</p>
            <p className="mt-1.5 text-xl font-black text-text-primary">{c.v}</p>
            <p className="mt-0.5 text-[10px] text-text-muted">{c.s}</p>
          </div>
        ))}
      </motion.div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {[
          { l:"Breach Rate", v:`${breachPct}%`, s:"Share of queue in SLA breach." },
          { l:"Projected Clear", v:`${projClear} min`, s:"Est. at 25 claims/sweep." },
          { l:"Latest Auto Rate", v:`${runRates.a}%`, s:"From selected playbook run." },
        ].map(c=>(
          <div key={c.l} className={`${card} p-4`}>
            <p className="text-[10px] uppercase tracking-wide text-text-muted">{c.l}</p>
            <p className="mt-1.5 text-xl font-black text-text-primary">{c.v}</p>
            <p className="mt-0.5 text-[10px] text-text-muted">{c.s}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Review Queue */}
        <motion.div {...b(2)} className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Review Queue SLA</h2>
            <div className="flex gap-2">
              {[10,25].map(n=>(
                <button key={n} onClick={()=>handleApprove(n)} disabled={approving}
                  className="rounded-lg bg-state-success/10 border border-state-success/20 px-3 py-1 text-[10px] font-semibold text-state-success hover:bg-state-success/20 disabled:opacity-50 transition">
                  {approving?"…":`Approve ${n}`}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mb-3 text-[10px]">
            <div className={`${card} px-3 py-2`}><p className="text-text-muted">Queue</p><p className="text-lg font-bold text-text-primary">{qH?.queue_size??queue.length}</p></div>
            <div className="rounded-xl bg-state-warning/10 border border-state-warning/20 px-3 py-2"><p className="text-state-warning">Warning 15m+</p><p className="text-lg font-bold text-state-warning">{qH?.warning_count??sla.w}</p></div>
            <div className="rounded-xl bg-state-danger/10 border border-state-danger/20 px-3 py-2"><p className="text-state-danger">Breach 30m+</p><p className="text-lg font-bold text-state-danger">{qH?.breach_count??sla.br}</p></div>
          </div>
          <p className="text-[10px] text-text-muted mb-2">Avg age: {qH?.avg_age_minutes??sla.avg} min</p>
          <div className="max-h-[320px] overflow-auto rounded-xl border border-white/[0.04]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-1 text-[10px] text-text-muted">
                <tr><th className="px-2.5 py-2 text-left">Claim</th><th className="px-2.5 py-2 text-left">Worker</th><th className="px-2.5 py-2 text-left">Fraud</th><th className="px-2.5 py-2 text-left">SLA</th><th className="px-2.5 py-2 text-left">Status</th><th className="px-2.5 py-2 text-left">Action</th></tr>
              </thead>
              <tbody>
                {queue.slice(0,30).map(c=>(
                  <tr key={c.id} className="border-t border-white/[0.03] text-text-secondary">
                    <td className="px-2.5 py-2 font-mono text-[10px] text-accent-amber">{c.claim_number}</td>
                    <td className="px-2.5 py-2"><p className="font-medium text-text-primary">{c.worker_name}</p><p className="text-[9px] text-text-muted">{c.zone}</p></td>
                    <td className="px-2.5 py-2 text-[10px]">{(c.fraud_score*100).toFixed(1)}%</td>
                    <td className={`px-2.5 py-2 text-[10px] font-semibold ${slaTone(c.age_minutes)}`}>{c.age_minutes}m</td>
                    <td className="px-2.5 py-2"><span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${statusTone(c.status)}`}>{c.status}</span></td>
                    <td className="px-2.5 py-2">
                      <div className="flex gap-1">
                        <button onClick={()=>queueAct(c.id,"approve")} disabled={rowActId===c.id} className="rounded bg-state-success/15 px-1.5 py-0.5 text-[9px] font-bold text-state-success disabled:opacity-50">✓</button>
                        <button onClick={()=>queueAct(c.id,"reject")} disabled={rowActId===c.id} className="rounded bg-state-danger/15 px-1.5 py-0.5 text-[9px] font-bold text-state-danger disabled:opacity-50">✗</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Claims Trend */}
        <motion.div {...b(3)} className={`${card} p-5`}>
          <h2 className="text-sm font-semibold text-text-primary mb-3">7-Day Claims Trend</h2>
          <div className="space-y-2">
            {trend.map(t=>(
              <div key={t.day} className="flex items-center gap-3">
                <span className="w-10 text-[10px] text-text-muted">{t.day}</span>
                <div className="flex-1 h-5 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent-amber to-accent-violet transition-all" style={{width:`${(t.claims/trendMax)*100}%`}}/>
                </div>
                <span className="w-16 text-right text-[10px] font-semibold text-text-primary">{t.claims} / {fmtCur(t.payout)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Playbooks */}
      <motion.div {...b(4)} className={`${card} p-5`}>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Simulation Playbooks</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLAYBOOKS.map(pb=>(
            <div key={pb.id} className={`rounded-xl border border-white/[0.04] bg-surface-2/50 p-4`}>
              <h3 className="text-sm font-semibold text-text-primary">{pb.name}</h3>
              <p className="text-[10px] text-text-muted mt-1 mb-3">{pb.summary}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[pb.payload.city,pb.payload.zone,pb.payload.event_type.replace(/_/g," "),pb.payload.severity].map(t=>(
                  <span key={t} className="rounded-full bg-surface-1 border border-white/[0.04] px-2 py-0.5 text-[9px] text-text-muted">{t}</span>
                ))}
              </div>
              <button onClick={()=>runPlaybook(pb)} disabled={runningPb!==null}
                className="w-full rounded-lg bg-gradient-to-r from-accent-amber to-accent-ember py-2 text-xs font-semibold text-surface-0 disabled:opacity-50 transition shadow-lg shadow-accent-amber/10">
                {runningPb===pb.id?"Running…":"Execute Playbook"}
              </button>
            </div>
          ))}
        </div>
        {lastResult && (
          <div className="mt-4 rounded-xl bg-state-success/10 border border-state-success/20 p-4">
            <p className="text-xs font-semibold text-state-success mb-2">Last Simulation Result</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5 text-[10px] text-text-secondary">
              <div>Claims: <span className="font-bold text-text-primary">{lastResult.created_claims}</span></div>
              <div>Auto-Paid: <span className="font-bold text-state-success">{lastResult.auto_paid_count}</span></div>
              <div>Review: <span className="font-bold text-state-warning">{lastResult.review_count}</span></div>
              <div>Rejected: <span className="font-bold text-state-danger">{lastResult.rejected_count}</span></div>
              <div>Payout: <span className="font-bold text-text-primary">{fmtCur(lastResult.total_payout)}</span></div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Run History */}
      <motion.div {...b(5)} className={`${card} p-5`}>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Run History</h2>
        {runs.length===0 ? <p className="text-sm text-text-muted">No simulation runs yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead><tr className="border-b border-white/[0.04] text-[10px] text-text-muted uppercase tracking-wider">
                {["Run","City / Zone","Event","Severity","Claims","Auto","Review","Reject","Payout"].map(h=><th key={h} className="px-3 py-2 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {runs.map(r=>(
                  <tr key={r.id} onClick={()=>setSelRunId(r.id)} className={`border-b border-white/[0.03] cursor-pointer transition ${selRunId===r.id?"bg-accent-amber/[0.04]":"hover:bg-white/[0.02]"}`}>
                    <td className="px-3 py-2 font-mono text-[10px] text-accent-amber">{String(r.id).slice(0,8)}</td>
                    <td className="px-3 py-2 text-xs text-text-primary">{r.city} / {r.zone}</td>
                    <td className="px-3 py-2 text-xs text-text-secondary capitalize">{r.event_type?.replace(/_/g," ")}</td>
                    <td className="px-3 py-2 text-xs capitalize text-text-secondary">{r.severity}</td>
                    <td className="px-3 py-2 text-xs font-semibold text-text-primary">{r.created_claims}</td>
                    <td className="px-3 py-2 text-xs text-state-success">{r.auto_paid_count}</td>
                    <td className="px-3 py-2 text-xs text-state-warning">{r.review_count}</td>
                    <td className="px-3 py-2 text-xs text-state-danger">{r.rejected_count}</td>
                    <td className="px-3 py-2 text-xs font-semibold text-text-primary">{fmtCur(r.total_payout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
