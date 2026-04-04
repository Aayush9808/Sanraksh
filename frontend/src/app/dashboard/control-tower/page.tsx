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

const SCENARIOS = [
  { city:"Mumbai",    zone:"Andheri West",    event_type:"heavy_rain",    severity:"high"   },
  { city:"Delhi",     zone:"Connaught Place", event_type:"traffic_jam",   severity:"medium" },
  { city:"Bengaluru", zone:"Koramangala",     event_type:"extreme_heat",  severity:"medium" },
  { city:"Pune",      zone:"Kothrud",         event_type:"heavy_rain",    severity:"high"   },
  { city:"Hyderabad", zone:"Banjara Hills",   event_type:"extreme_heat",  severity:"high"   },
];

const INIT_LOGS = [
  "[system] Sanraksh automation engine v2.0 — ready",
  "[system] Signal sources: IMD API, OpenWeather, Platform Status",
  "[system] Fraud scorer: ML model loaded (XGBoost v1.4)",
  "[system] Payout dispatcher: connected to payment gateway",
  "[system] All systems nominal — awaiting trigger",
];

export default function ControlTowerPage() {
  const [logs, setLogs] = useState(INIT_LOGS);
  const [running, setRunning] = useState(false);
  const [scenario, setScenario] = useState(0);
  const [lastResult, setLastResult] = useState<Record<string,unknown>|null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const ts = () => `[${new Date().toLocaleTimeString("en-GB")}]`;
  const append = (msg:string) => setLogs(prev=>[...prev, msg]);

  const runEngine = async () => {
    setRunning(true);
    const s = SCENARIOS[scenario];
    append(`${ts()} ▶  Engine run triggered — ${s.event_type.replace(/_/g," ")} in ${s.city}`);
    append(`${ts()} ✓ Polling disruption sources…`);
    await new Promise(r=>setTimeout(r,600));
    append(`${ts()} ✓ Signal confirmed: ${s.event_type.toUpperCase()} — ${s.severity} severity`);
    await new Promise(r=>setTimeout(r,400));
    append(`${ts()} ✓ Geo-matching workers in ${s.zone}, ${s.city}…`);
    await new Promise(r=>setTimeout(r,500));

    try {
      const res = await fetch(`${API_BASE}/api/v1/phase2/simulate-disruption`, {
        method:"POST",
        headers:{"Content-Type":"application/json",Authorization:`Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}`},
        body: JSON.stringify({city:s.city, zone:s.zone, event_type:s.event_type, severity:s.severity, strict_mode:false}),
      });
      const data = await res.json();
      setLastResult(data);
      append(`${ts()} ✓ Policy check: ${data.targeted_workers} workers targeted`);
      await new Promise(r=>setTimeout(r,300));
      append(`${ts()} ✓ Fraud scoring complete — avg score: ${(data.avg_fraud_score*100).toFixed(0)}%`);
      await new Promise(r=>setTimeout(r,400));
      if(data.auto_paid_count > 0) append(`${ts()} → AUTO-PAY: ${data.auto_paid_count} claims × ₹800 = ₹${data.total_payout.toLocaleString()}`);
      if(data.review_count > 0) append(`${ts()} ⚠ REVIEW: ${data.review_count} claims flagged for manual check`);
      if(data.rejected_count > 0) append(`${ts()} ✗ REJECTED: ${data.rejected_count} claims (fraud detected)`);
      if(data.decision_trace_samples?.length > 0) {
        const ex = data.decision_trace_samples[0];
        append(`${ts()} · Example: ${ex.claim_number} → ${ex.status.toUpperCase()} (fraud: ${(ex.fraud_score*100).toFixed(0)}%)`);
      }
      append(`${ts()} ✓ DONE — settlement estimated in ${data.estimated_settlement_seconds}s`);
    } catch {
      append(`${ts()} ✗ Engine error — check backend connection`);
    }
    setRunning(false);
    setScenario(i => (i+1) % SCENARIOS.length);
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

        {/* Last Run Result */}
        <div className="panel overflow-hidden">
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <p className="lbl mb-0.5">Last simulation result</p>
            <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>Engine output</h2>
          </div>
          {lastResult ? (
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["Workers targeted", lastResult.targeted_workers],
                  ["Auto-paid", lastResult.auto_paid_count],
                  ["Under review", lastResult.review_count],
                  ["Total payout", `₹${Number(lastResult.total_payout).toLocaleString()}`],
                ] as [string, unknown][]).map(([k,v])=>(
                  <div key={k} className="panel-inset p-3 text-center">
                    <div className="text-amber font-bold text-lg">{String(v)}</div>
                    <div className="lbl text-xs mt-0.5">{k}</div>
                  </div>
                ))}
              </div>
              <div className="panel-inset p-3">
                <div className="lbl mb-1">Signal confidence</div>
                <div className="prog-track">
                  <div className="prog-fill" style={{width:`${Number(lastResult.signal_confidence)*100}%`,animation:"none"}} />
                </div>
                <div className="text-right lbl mt-1">{(Number(lastResult.signal_confidence)*100).toFixed(0)}%</div>
              </div>
              <div className="panel-inset p-3">
                <div className="lbl mb-1">Settlement time</div>
                <div className="text-slate-800 font-bold">{String(lastResult.estimated_settlement_seconds)}s</div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="lbl mb-2">No run yet</div>
              <div className="text-sm text-slate-400">Click &quot;Run engine now&quot; to simulate a disruption</div>
            </div>
          )}
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
            const color=l.includes("✓")?"#10B981":l.includes("→")?"#F59E0B":l.includes("▶")?"#60A5FA":l.includes("✗")?"#EF4444":l.includes("⚠")?"#F59E0B":"#4A3E2A";
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
