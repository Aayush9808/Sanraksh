"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Signal {
  id: string;
  claim_number: string;
  worker_name: string;
  zone: string;
  amount: number;
  status: string;
  fraud_score: number;
  created_at: string;
  age_minutes: number;
  decision_reasons: string[];
}

const scoreColor = (s:number) => s>0.75?"#EF4444":s>0.5?"#F59E0B":"#60A5FA";
const statusCls  = (s:string) => ({pending:"tag-warn",paid:"tag-live",rejected:"tag-neg"}[s as "pending"|"paid"|"rejected"]||"tag-neutral");

function formatAge(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function ThreatDefensePage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [active, setActive] = useState<Signal|null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ anomalies: 0, flagged: 0, prevented: 0 });

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    fetch(`${API_BASE}/api/v1/phase2/review-queue?limit=20`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.claims) {
          setSignals(d.claims);
          const highFraud = d.claims.filter((c: Signal) => c.fraud_score >= 0.75).length;
          const prevented = d.claims.reduce((sum: number, c: Signal) => sum + (c.fraud_score > 0.6 ? c.amount : 0), 0);
          setStats({ anomalies: d.count || d.claims.length, flagged: highFraud, prevented: Math.round(prevented) });
        }
      }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const escalated = signals.filter(s => s.fraud_score >= 0.75).length;
  const reviewing = signals.filter(s => s.fraud_score >= 0.4 && s.fraud_score < 0.75).length;

  return (
    <div className="max-w-5xl">
      <div className="section-head">
        <div><p className="lbl mb-1">Admin portal</p><h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Threat Defense</h1></div>
        <div className="flex gap-2">
          {escalated > 0 && <span className="tag tag-neg">{escalated} escalated</span>}
          {reviewing > 0 && <span className="tag tag-warn">{reviewing} reviewing</span>}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          {label:"Anomalies in queue",  val: String(stats.anomalies),  sub:"pending review",      accent:"#EF4444"},
          {label:"High-risk flags",     val: String(stats.flagged),    sub:"fraud score ≥0.75", accent:"#F59E0B"},
          {label:"Fraud prevented (₹)", val:stats.prevented.toLocaleString(), sub:"flagged claims", accent:"#10B981"},
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
          <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>Active fraud signals</h2>
        </div>
        {loading ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">Loading fraud signals…</div>
        ) : signals.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400 text-sm">No pending review signals</div>
        ) : (
          <div className="divide-y divide-[#2A2218]">
            {signals.map(s=>(
              <div key={s.id}>
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={()=>setActive(active?.id===s.id?null:s)}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{border:`2px solid ${scoreColor(s.fraud_score)}`,background:`${scoreColor(s.fraud_score)}18`}}>
                    <span className="font-mono font-bold text-sm" style={{color:scoreColor(s.fraud_score)}}>{(s.fraud_score*100).toFixed(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-600 font-medium text-sm">{s.worker_name}</span>
                      <span className={`tag ${statusCls(s.status)}`}>{s.status}</span>
                    </div>
                    <div className="lbl">{s.claim_number} · {s.zone} · {formatAge(s.age_minutes)}</div>
                  </div>
                  <div className="text-slate-400 text-xs font-mono font-bold">₹{s.amount.toFixed(0)}</div>
                  <div className="w-4 h-4 text-slate-500" style={{transform:active?.id===s.id?"rotate(90deg)":"none",transition:"transform 0.2s"}}>▶</div>
                </div>
                <AnimatePresence>
                  {active?.id===s.id && (
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                      style={{overflow:"hidden"}}>
                      <div className="px-5 pb-4 pt-2">
                        <div className="panel-inset p-4">
                          <div className="text-sm text-slate-500 mb-3">
                            Decision codes: {s.decision_reasons.join(", ") || "—"}
                          </div>
                          <div className="mb-3">
                            <div className="lbl mb-1.5">Fraud score</div>
                            <div className="prog-track">
                              <div className="prog-fill" style={{width:`${s.fraud_score*100}%`,background:scoreColor(s.fraud_score),animation:"none"}} />
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
        )}
      </div>
    </div>
  );
}
