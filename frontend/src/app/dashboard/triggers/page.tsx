"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "../../../lib/config";

const DISRUPTIONS = [
  { id: "heavy_rain", icon: "🌧️", label: "Heavy Rainfall", severity: "HIGH", city: "Mumbai",
    desc: "Rainfall > 60mm/hr detected via IMD API. Delivery halted across zone.",
    affected: 142, zones: ["Andheri West","Bandra-Kurla","Jogeshwari"],
    trigger: "Rain > 50mm/hr for 2 consecutive hours", payout: 800,
    autoFire: true, badge: "bg-state-info/15 text-state-info" },
  { id: "flood", icon: "🌊", label: "Zone Flooding", severity: "CRITICAL", city: "Mumbai",
    desc: "IMD Flood alert for low-lying delivery zones. Roads impassable.",
    affected: 89, zones: ["Powai","Thane West","Kurla"],
    trigger: "Flood warning issued by municipal corp", payout: 1200,
    autoFire: true, badge: "bg-accent-violet/15 text-accent-violet" },
  { id: "pollution", icon: "😷", label: "AQI Shutdown (GRAP-4)", severity: "HIGH", city: "Delhi",
    desc: "AQI > 400 in Delhi NCR. GRAP-4 restrictions halting outdoor delivery.",
    affected: 203, zones: ["Delhi NCR","Noida","Gurugram"],
    trigger: "AQI > 400 sustained for 4 hours", payout: 600,
    autoFire: true, badge: "bg-state-warning/15 text-state-warning" },
  { id: "curfew", icon: "🚫", label: "Curfew / Strike", severity: "MEDIUM", city: "Pune",
    desc: "Section 144 imposed in zone. Delivery activity suspended.",
    affected: 67, zones: ["Pune Central","Shivaji Nagar"],
    trigger: "Govt curfew order issued (API + news NLP)", payout: 900,
    autoFire: false, badge: "bg-state-danger/15 text-state-danger" },
  { id: "app_outage", icon: "⚡", label: "Platform App Outage", severity: "MEDIUM", city: "Mumbai",
    desc: "Swiggy platform down > 3 hours. Workers unable to receive orders.",
    affected: 311, zones: ["All Zones"],
    trigger: "Platform API returns 503 for > 3 hours", payout: 500,
    autoFire: true, badge: "bg-accent-amber/15 text-accent-amber" },
];

const SEV_TONE: Record<string,string> = {
  CRITICAL: "bg-state-danger/15 text-state-danger border-state-danger/25",
  HIGH:     "bg-state-warning/15 text-state-warning border-state-warning/25",
  MEDIUM:   "bg-state-info/15 text-state-info border-state-info/25",
};

type TriggerState = "idle"|"scanning"|"triggered"|"processing"|"paid";
type BackendRun = { disruption_id:string; created_claims:number; auto_paid_count:number; review_count:number; rejected_count:number; total_payout:number; };

export default function TriggersPage() {
  const [active, setActive] = useState(DISRUPTIONS[0]);
  const [ts, setTs] = useState<TriggerState>("idle");
  const [countdown, setCountdown] = useState(60);
  const [claimsProcessed, setClaimsProcessed] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  const [targetClaims, setTargetClaims] = useState(DISRUPTIONS[0].affected);
  const [expectedPayout, setExpectedPayout] = useState(DISRUPTIONS[0].affected * DISRUPTIONS[0].payout);
  const [engineSrc, setEngineSrc] = useState<"backend"|"simulation">("simulation");
  const [backendSum, setBackendSum] = useState<BackendRun|null>(null);
  const [log, setLog] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  function addLog(m:string) { setLog(p=>[...p, `${new Date().toLocaleTimeString()} — ${m}`]); }
  useEffect(()=>{ if(logRef.current) logRef.current.scrollTop=logRef.current.scrollHeight; },[log]);

  async function runSim() {
    setLog([]); setClaimsProcessed(0); setTotalPayout(0); setCountdown(60); setBackendSum(null);
    if(timerRef.current)clearInterval(timerRef.current);
    setTs("scanning"); setEngineSrc("backend"); addLog("Connecting to Phase 2 automation engine...");
    try {
      const payload = { city:active.city, zone:active.zones[0], event_type: active.id==="pollution"?"severe_pollution":active.id==="app_outage"?"market_closure":active.id, severity:active.severity==="CRITICAL"?"extreme":active.severity.toLowerCase(), strict_mode:true, affected_radius_km:2, limit_workers:400 };
      const res = await fetch(`${API_BASE}/api/v1/phase2/simulate-disruption`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),signal:AbortSignal.timeout(7000)});
      if(!res.ok) throw new Error("unavailable");
      const d=await res.json(); const cc=Number(d.created_claims??0); const po=Number(d.total_payout??0);
      setBackendSum({ disruption_id:String(d.disruption_id??""), created_claims:cc, auto_paid_count:Number(d.auto_paid_count??0), review_count:Number(d.review_count??0), rejected_count:Number(d.rejected_count??0), total_payout:po });
      setTargetClaims(Math.max(cc,1)); setExpectedPayout(Math.max(po,1));
      addLog(`Disruption: ${String(d.disruption_id).slice(0,8)}...`); addLog(`Claims: ${cc}`); addLog(`Auto:${d.auto_paid_count} Review:${d.review_count} Reject:${d.rejected_count}`); addLog(`Payout: ₹${po.toLocaleString()}`);
      setTs("processing"); setClaimsProcessed(cc); setTotalPayout(po); setCountdown(Number(d.estimated_settlement_seconds??45));
      setTimeout(()=>{setTs("paid");addLog("✅ Phase 2 complete");},1200);
      return;
    } catch{ addLog("Backend unavailable. Local fallback."); runLocal(); }
  }

  function runLocal() {
    setTs("scanning"); setEngineSrc("simulation"); setBackendSum(null); setLog([]); setClaimsProcessed(0); setTotalPayout(0); setCountdown(60); setTargetClaims(active.affected); setExpectedPayout(active.affected*active.payout);
    addLog(`Scanning zone: ${active.zones[0]}`);
    setTimeout(()=>addLog(`${active.icon} ${active.label} confirmed — ${active.severity}`),800);
    setTimeout(()=>addLog(`Trigger: ${active.trigger}`),1600);
    setTimeout(()=>addLog(`${active.affected} workers identified`),2400);
    setTimeout(()=>{setTs("triggered");addLog("✅ Parametric trigger FIRED");},3200);
    setTimeout(()=>addLog("🤖 AI fraud: 0 anomalies"),4000);
    setTimeout(()=>addLog("🤖 GPS: all workers in zone"),4800);
    setTimeout(()=>{setTs("processing");addLog("💸 Initiating UPI payout…");},6400);
    let proc=0; const bi=setInterval(()=>{ const batch=Math.min(Math.floor(Math.random()*20)+5,active.affected-proc); proc+=batch; setClaimsProcessed(proc); setTotalPayout(proc*active.payout); addLog(`💰 ₹${(batch*active.payout).toLocaleString()} to ${batch} workers`); if(proc>=active.affected){clearInterval(bi);setTs("paid");addLog(`✅ COMPLETE — ₹${(active.affected*active.payout).toLocaleString()} paid`);} },1200);
    setTimeout(()=>{ let c=60;timerRef.current=setInterval(()=>{c--;setCountdown(c);if(c<=0&&timerRef.current)clearInterval(timerRef.current);},1000);},6400);
  }

  function reset() { setTs("idle"); setLog([]); setClaimsProcessed(0); setTotalPayout(0); setCountdown(60); setTargetClaims(active.affected); setExpectedPayout(active.affected*active.payout); setEngineSrc("simulation"); setBackendSum(null); if(timerRef.current)clearInterval(timerRef.current); }
  const pct = expectedPayout>0?Math.min((totalPayout/expectedPayout)*100,100):0;
  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const b = (d:number) => ({initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, transition:{delay:d*0.06}} as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{opacity:0}} animate={{opacity:1}}>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">⚡ Live Disruption Triggers</h1>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-accent-amber/30 bg-accent-amber/10 px-3 py-1 text-[10px] text-accent-amber">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-amber" /> Engine: {engineSrc==="backend"?"Phase 2 API":"Local fallback"}
        </div>
        <p className="mt-1 text-sm text-text-secondary">Real-time parametric engine. Disruption → claims auto-fired → instant payout.</p>
      </div>

      {/* Live badges */}
      <motion.div {...b(1)} className="flex gap-2 flex-wrap">
        {DISRUPTIONS.filter(d=>d.autoFire).map(d=>(
          <span key={d.id} className={`flex items-center gap-2 rounded-full border border-white/[0.06] px-3 py-1.5 text-[10px] font-semibold ${d.badge}`}>
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" /> {d.icon} {d.label} — {d.affected} workers
          </span>
        ))}
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Disruption selector */}
        <motion.div {...b(2)} className="lg:col-span-1 space-y-3">
          <h2 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Disruption</h2>
          {DISRUPTIONS.map(d=>(
            <button key={d.id} onClick={()=>{setActive(d);reset()}}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${active.id===d.id?"border-accent-amber/40 bg-accent-amber/[0.06]":"border-white/[0.04] bg-surface-1 hover:bg-white/[0.04]"}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{d.icon}</span>
                <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${SEV_TONE[d.severity]}`}>{d.severity}</span>
              </div>
              <p className="font-semibold text-text-primary text-sm">{d.label}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{d.affected} workers · ₹{d.payout}</p>
              {d.autoFire && <span className="mt-2 inline-flex items-center gap-1 text-[9px] text-state-success"><span className="h-1 w-1 rounded-full bg-state-success animate-pulse"/>Auto-trigger</span>}
            </button>
          ))}
        </motion.div>

        {/* Simulation panel */}
        <motion.div {...b(3)} className="lg:col-span-2 space-y-5">
          {/* Details card */}
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{active.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{active.label}</h2>
                  <p className="text-xs text-text-secondary">{active.desc}</p>
                </div>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${SEV_TONE[active.severity]}`}>{active.severity}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v:String(active.affected), l:"Workers Affected", c:"text-text-primary" },
                { v:`₹${active.payout}`, l:"Per Worker", c:"text-accent-amber" },
                { v:`₹${(active.affected*active.payout/1000).toFixed(1)}K`, l:"Total Disbursed", c:"text-state-success" },
              ].map(s=>(
                <div key={s.l} className="rounded-xl bg-surface-2/60 p-3 text-center">
                  <p className={`text-xl font-black ${s.c}`}>{s.v}</p><p className="text-[10px] text-text-muted">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-surface-2/60 px-4 py-3">
              <p className="text-[10px] text-text-muted mb-1">Parametric Trigger Condition</p>
              <p className="text-sm font-mono text-accent-amber">{active.trigger}</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
          {ts==="idle" && (
            <motion.button key="run" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} onClick={runSim}
              className="w-full rounded-2xl bg-gradient-to-r from-accent-amber to-accent-ember py-4 text-base font-bold text-surface-0 shadow-xl shadow-accent-amber/20 transition-all">
              🚀 Simulate Disruption + Auto-Trigger Claims
            </motion.button>
          )}

          {ts!=="idle" && (
            <motion.div key="progress" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} className={`${card} p-5 space-y-5`}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-text-primary">
                  {ts==="scanning"&&"🛰️ Scanning Zone…"}
                  {ts==="triggered"&&"⚡ Trigger Fired!"}
                  {ts==="processing"&&"💸 Processing Payouts…"}
                  {ts==="paid"&&"✅ All Claims Paid!"}
                </h3>
                {ts==="paid"&&<button onClick={reset} className="text-[10px] text-text-muted hover:text-text-primary transition">Reset</button>}
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-text-muted mb-2">
                  <span>{claimsProcessed} / {targetClaims} claims</span><span>{pct.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-accent-amber to-state-success transition-all duration-500" style={{width:`${pct}%`}}/>
                </div>
              </div>
              {(ts==="processing"||ts==="paid") && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-state-success/20 bg-state-success/10 p-4 text-center">
                    <p className="text-2xl font-black text-state-success">₹{totalPayout.toLocaleString()}</p>
                    <p className="text-[10px] text-text-muted">Total Disbursed</p>
                  </div>
                  <div className="rounded-xl border border-accent-amber/20 bg-accent-amber/10 p-4 text-center">
                    <p className="text-2xl font-black text-accent-amber">{ts==="paid"?"✓":countdown+"s"}</p>
                    <p className="text-[10px] text-text-muted">{ts==="paid"?"Completed":"Avg payout time"}</p>
                  </div>
                </div>
              )}
              {backendSum && (
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg bg-state-success/10 px-3 py-2 text-state-success">Auto: {backendSum.auto_paid_count}</div>
                  <div className="rounded-lg bg-state-warning/10 px-3 py-2 text-state-warning">Review: {backendSum.review_count}</div>
                  <div className="rounded-lg bg-state-danger/10 px-3 py-2 text-state-danger">Rejected: {backendSum.rejected_count}</div>
                </div>
              )}
              <div>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">System Log</p>
                <div ref={logRef} className="h-40 overflow-y-auto rounded-xl bg-surface-0 border border-white/[0.04] p-3 space-y-1 font-mono">
                  {log.map((l,i)=><p key={i} className="text-[11px] text-state-success">{l}</p>)}
                  {(ts==="scanning"||ts==="processing")&&<p className="text-[11px] text-text-muted animate-pulse">▋</p>}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* How it works */}
          <motion.div {...b(4)} className={`${card} p-5`}>
            <h3 className="text-[10px] font-bold text-text-muted mb-4 uppercase tracking-wider">How Parametric Triggers Work</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {["🛰️ Weather/AQI","→","📐 Threshold","→","🤖 AI Fraud","→","✅ Approve","→","💸 UPI"].map((s,i)=>(
                s==="→" ? <span key={i} className="text-text-muted text-lg">→</span> :
                <span key={i} className="text-xs text-text-secondary">{s}</span>
              ))}
            </div>
            <p className="mt-4 text-[10px] text-text-muted">Zero manual intervention. Claims trigger and pay automatically when parametric conditions are met.</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
