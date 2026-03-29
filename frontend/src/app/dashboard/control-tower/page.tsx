"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

const ENGINE_STATUS = [
  { name:"Signal Ingestion",    status:"running", latency:"142ms", processed:14820 },
  { name:"Fraud Scorer",        status:"running", latency:"38ms",  processed:12400 },
  { name:"Payout Dispatcher",   status:"running", latency:"91ms",  processed:9840  },
  { name:"IMD Poller",          status:"running", latency:"2.4s",  processed:480   },
  { name:"Platform Connector",  status:"degraded",latency:"1.8s",  processed:1240  },
  { name:"Notification Engine", status:"running", latency:"56ms",  processed:8920  },
];
const QUEUE = [
  { id:"Q-001", type:"Rain → Payout",     workers:280, status:"ready",      eta:"instant" },
  { id:"Q-002", type:"Fraud review",      workers:3,   status:"pending",    eta:"manual"  },
  { id:"Q-003", type:"Platform re-check", workers:120, status:"scheduled",  eta:"15m"     },
];
const INIT_LOGS = [
  "[12:41:02] ✓ IMD signal received — ORANGE ALERT Mumbai",
  "[12:41:04] ✓ Geo-match: 1,840 workers within flood polygon",
  "[12:41:05] ✓ Policy check: 1,760 workers have Rain coverage",
  "[12:41:06] ✓ Cooldown check: 1,612 eligible (wait period clear)",
  "[12:41:07] ✓ Fraud scorer: 1,605 passed (7 flagged for review)",
  "[12:41:08] → Dispatching ₹280 × 1,605 workers = ₹449,400",
  "[12:41:09] ✓ Payout batch ACK by payment gateway",
];

export default function ControlTowerPage() {
  const [logs, setLogs] = useState(INIT_LOGS);
  const [running, setRunning] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const runEngine = async () => {
    setRunning(true);
    const ts = ()=>`[${new Date().toLocaleTimeString("en-GB")}]`;
    const append = (msg:string) => setLogs(prev=>[...prev, msg]);
    append(`${ts()} ▶  Manual engine run triggered`);
    await new Promise(r=>setTimeout(r,600)); append(`${ts()} ✓ Polling disruption sources…`);
    await new Promise(r=>setTimeout(r,900)); append(`${ts()} ✓ 3 active alerts found`);
    await new Promise(r=>setTimeout(r,500)); append(`${ts()} ✓ Evaluating 14,200 workers`);
    await new Promise(r=>setTimeout(r,700)); append(`${ts()} ✓ 892 eligible for payout`);
    await new Promise(r=>setTimeout(r,400)); append(`${ts()} → Dispatching batch…`);
    await new Promise(r=>setTimeout(r,800)); append(`${ts()} ✓ DONE — ₹2,49,760 dispatched`);
    setRunning(false);
  };

  useEffect(()=>{
    if(logRef.current) logRef.current.scrollTop=logRef.current.scrollHeight;
  },[logs]);

  const sc = (s:string) => ({running:"text-emerald-400",degraded:"text-amber",stopped:"text-red-400"}[s]||"text-gray-400");

  return (
    <div className="max-w-[1400px]">
      <div className="section-head">
        <div><p className="lbl mb-1">Admin portal</p><h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Control Tower</h1></div>
        <button className="btn-amber" onClick={runEngine} disabled={running}>
          {running?"Running…":"▶  Run engine now"}
        </button>
      </div>

      <div className="grid xl:grid-cols-[1fr_400px] gap-5 mb-5">
        {/* Engine services */}
        <div className="panel overflow-hidden">
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <p className="lbl mb-0.5">Automation services</p>
            <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>Engine health</h2>
          </div>
          <div className="divide-y divide-[#2A2218]">
            {ENGINE_STATUS.map(s=>(
              <div key={s.name} className="flex items-center gap-4 px-5 py-3.5">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status==="running"?"bg-emerald-400":s.status==="degraded"?"bg-amber":"bg-red-400"}`}
                  style={{boxShadow:s.status==="running"?"0 0 6px #10B981":s.status==="degraded"?"0 0 6px #F59E0B":"none"}} />
                <div className="flex-1">
                  <div className="text-slate-600 text-sm font-medium">{s.name}</div>
                  <div className="lbl">{s.processed.toLocaleString()} events processed</div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-sm font-bold ${sc(s.status)}`}>{s.status}</div>
                  <div className="lbl">{s.latency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue */}
        <div className="panel overflow-hidden">
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <p className="lbl mb-0.5">Pending actions</p>
            <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>Dispatch queue</h2>
          </div>
          <div className="divide-y divide-[#2A2218]">
            {QUEUE.map(q=>(
              <div key={q.id} className="px-5 py-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-slate-600 font-medium text-sm">{q.type}</div>
                    <div className="lbl">{q.workers} workers · ETA: {q.eta}</div>
                  </div>
                  <span className={`tag ${q.status==="ready"?"tag-live":q.status==="pending"?"tag-warn":"tag-neutral"}`}>{q.status}</span>
                </div>
                {q.status==="ready" && (
                  <button className="btn-amber btn-sm mt-1">Dispatch now</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live log terminal */}
      <div className="panel overflow-hidden">
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <p className="lbl mb-0.5">Engine log</p>
            <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>Execution trace</h2>
          </div>
          <button className="btn-ghost btn-sm" onClick={()=>setLogs(INIT_LOGS)}>Clear</button>
        </div>
        <div ref={logRef} style={{background:"#070503",padding:"1.25rem",height:260,overflowY:"auto",fontFamily:"var(--font-mono)"}}>
          {logs.map((l,i)=>{
            const color=l.includes("✓")?"#10B981":l.includes("→")?"#F59E0B":l.includes("▶")?"#60A5FA":"#4A3E2A";
            return <div key={i} className="text-xs mb-1.5 leading-relaxed" style={{color}}>{l}</div>;
          })}
          {running && (
            <div className="text-xs text-slate-500 mt-1">
              <span className="animate-pulse">▋</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
