"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SIGNALS = [
  { id:"SIG-001", type:"Velocity anomaly",   worker:"WRK-005", score:0.91, detail:"21 claims in 60 days — 9× cohort avg", time:"2h ago",   status:"escalated" },
  { id:"SIG-002", type:"Location spoofing",  worker:"WRK-012", score:0.78, detail:"GPS coords match but cell tower 28km off", time:"5h ago", status:"reviewing" },
  { id:"SIG-003", type:"Claim timing",       worker:"WRK-031", score:0.62, detail:"Claims filed within 2min of alert — bot-like", time:"1d ago", status:"reviewing" },
  { id:"SIG-004", type:"Pattern clustering", worker:"WRK-008", score:0.57, detail:"3 workers, same device fingerprint", time:"1d ago", status:"monitoring" },
  { id:"SIG-005", type:"Cross-platform dup", worker:"WRK-019", score:0.44, detail:"Claimed Rain on Swiggy + Ola same 4h window", time:"2d ago", status:"resolved" },
];

const scoreColor = (s:number) => s>0.75?"#EF4444":s>0.5?"#F59E0B":"#60A5FA";
const statusCls  = (s:string) => ({escalated:"tag-neg",reviewing:"tag-warn",monitoring:"tag-info",resolved:"tag-neutral"}[s]||"tag-neutral");

export default function ThreatDefensePage() {
  const [active, setActive] = useState<typeof SIGNALS[0]|null>(null);
  return (
    <div className="max-w-5xl">
      <div className="section-head">
        <div><p className="lbl mb-1">Admin portal</p><h1 className="text-[#F5F0E8] font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Threat Defense</h1></div>
        <div className="flex gap-2">
          <span className="tag tag-neg">1 escalated</span>
          <span className="tag tag-warn">2 reviewing</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          {label:"Anomalies detected",  val:"23",    sub:"last 30 days",  accent:"#EF4444"},
          {label:"Flagged workers",     val:"7",     sub:"under watch",   accent:"#F59E0B"},
          {label:"Fraud prevented (₹)", val:"28,400",sub:"YTD savings",   accent:"#10B981"},
        ].map(k=>(
          <div key={k.label} className="panel p-4">
            <div className="lbl mb-2">{k.label}</div>
            <div className="font-extrabold text-2xl mb-1" style={{color:k.accent,letterSpacing:"-0.04em"}}>{k.val}</div>
            <div className="lbl">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
          <p className="lbl mb-0.5">Real-time signal queue</p>
          <h2 className="text-[#F5F0E8] font-bold" style={{letterSpacing:"-0.02em"}}>Active fraud signals</h2>
        </div>
        <div className="divide-y divide-[#2A2218]">
          {SIGNALS.map(s=>(
            <div key={s.id}>
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#180F06] transition-colors"
                onClick={()=>setActive(active?.id===s.id?null:s)}>
                {/* Score ring */}
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{border:`2px solid ${scoreColor(s.score)}`,background:`${scoreColor(s.score)}18`}}>
                  <span className="font-mono font-bold text-sm" style={{color:scoreColor(s.score)}}>{(s.score*100).toFixed(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[#C8BAA0] font-medium text-sm">{s.type}</span>
                    <span className={`tag ${statusCls(s.status)}`}>{s.status}</span>
                  </div>
                  <div className="lbl">{s.worker} · {s.time}</div>
                </div>
                <div className="w-4 h-4 text-[#4A3E2A]" style={{transform:active?.id===s.id?"rotate(90deg)":"none",transition:"transform 0.2s"}}>▶</div>
              </div>
              <AnimatePresence>
                {active?.id===s.id && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                    style={{overflow:"hidden"}}>
                    <div className="px-5 pb-4 pt-2">
                      <div className="panel-inset p-4">
                        <div className="text-sm text-[#9A8A72] mb-3">{s.detail}</div>
                        <div className="mb-3">
                          <div className="lbl mb-1.5">Risk index</div>
                          <div className="prog-track">
                            <div className="prog-fill" style={{width:`${s.score*100}%`,background:scoreColor(s.score),animation:"none"}} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-amber btn-sm">Escalate</button>
                          <button className="btn-ghost btn-sm">Mark resolved</button>
                          <button className="btn-ghost btn-sm">View worker</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
