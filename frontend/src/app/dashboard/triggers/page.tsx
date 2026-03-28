"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

const MOCK_TRIGGERS = [
  { id:"TRG-001", type:"Heavy Rain",    zone:"Andheri West",   severity:0.82, status:"active",   payout:"₹280/day",  started:"2h ago",  signal:"IMD Red Alert issued",       workers:243 },
  { id:"TRG-002", type:"App Outage",    zone:"Zomato — Mumbai",severity:0.68, status:"active",   payout:"₹200/inc.", started:"45m ago", signal:"Status API: degraded 4h+",   workers:187 },
  { id:"TRG-003", type:"AQI Alert",     zone:"Delhi NCR",      severity:0.44, status:"watch",    payout:"₹150/day",  started:"30m ago", signal:"CPCB AQI: 395 (borderline)", workers:156 },
  { id:"TRG-004", type:"Cyclone Watch", zone:"Marina, Chennai", severity:0.91, status:"active",  payout:"₹400/day",  started:"6h ago",  signal:"IMD Cyclone Advisory",       workers:312 },
  { id:"TRG-005", type:"Heat Wave",     zone:"Hyderabad",      severity:0.35, status:"resolved", payout:"₹200/day",  started:"1d ago",  signal:"Temp below threshold",       workers:98  },
];

function SeverityRing({ v, color }: { v:number; color:string }) {
  const r = 22, c = 2*Math.PI*r;
  return (
    <svg width={56} height={56} viewBox="0 0 56 56" className="-rotate-90">
      <circle cx={28} cy={28} r={r} fill="none" stroke="#2A2218" strokeWidth={4} />
      <motion.circle cx={28} cy={28} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeLinecap="round" strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c*(1-v) }}
        transition={{ duration:1, ease:"easeOut" }}
      />
      <text x={28} y={32} textAnchor="middle" style={{rotate:"90deg"}} fill={color} fontSize={11} fontWeight={700} transform="rotate(90,28,28)">
        {Math.round(v*100)}%
      </text>
    </svg>
  );
}

export default function TriggersPage() {
  const [triggers, setTriggers] = useState(MOCK_TRIGGERS);
  const [sel, setSel] = useState<typeof MOCK_TRIGGERS[0]|null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/triggers/active`, {
      headers:{Authorization:`Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}`}
    }).then(r=>r.ok?r.json():null).then(d=>{if(d?.triggers)setTriggers(d.triggers);}).catch(()=>{});
  }, []);

  const COLOR = (s:number) => s>=0.75?"#EF4444":s>=0.45?"#F59E0B":"#10B981";

  return (
    <div className="max-w-5xl">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Signal monitor</p>
          <h1 className="text-[#F5F0E8] font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Live Disruption Triggers</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot dot-live" />
          <span className="lbl-live">{triggers.filter(t=>t.status==="active").length} active now</span>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_340px] gap-5">
        {/* Trigger list */}
        <div className="space-y-3">
          {triggers.map((t, i) => (
            <motion.div key={t.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
              onClick={()=>setSel(sel?.id===t.id?null:t)}
              className="panel p-4 cursor-pointer transition-all hover:border-[#36301E]"
              style={{ borderLeft:`3px solid ${COLOR(t.severity)}` }}
            >
              <div className="flex items-center gap-4">
                <SeverityRing v={t.severity} color={COLOR(t.severity)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[#F5F0E8] font-bold">{t.type}</span>
                    <span className={`tag ${t.status==="active"?"tag-neg":t.status==="watch"?"tag-warn":"tag-neutral"}`}>{t.status}</span>
                  </div>
                  <div className="lbl mb-1">{t.zone} · Started {t.started}</div>
                  <div className="text-sm text-[#6B5C44]">{t.signal}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-amber-DEFAULT font-mono font-bold text-sm">{t.payout}</div>
                  <div className="lbl">{t.workers} workers</div>
                </div>
              </div>

              <AnimatePresence>
                {sel?.id === t.id && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-[#2A2218]">
                      <div className="panel-amber p-3 text-sm text-[#C8BAA0] leading-relaxed">
                        <span className="lbl-amber font-bold block mb-1">Trigger condition met</span>
                        This event meets the parametric conditions in your policy. If it persists, your payout of <strong className="text-amber-DEFAULT">{t.payout}</strong> will be processed automatically within 4 hours.
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Side summary */}
        <div className="space-y-4">
          <div className="panel p-5">
            <p className="lbl mb-3">Your exposure today</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[#6B5C44]">Max potential payout</span>
                  <span className="text-amber-DEFAULT font-mono font-bold">₹880</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[#6B5C44]">Active triggers</span>
                  <span className="text-[#EF4444] font-bold">{triggers.filter(t=>t.status==="active").length}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[#6B5C44]">Watch alerts</span>
                  <span className="text-[#F59E0B] font-bold">{triggers.filter(t=>t.status==="watch").length}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="panel-amber p-4">
            <p className="lbl-amber mb-2">Auto-payout guarantee</p>
            <p className="text-sm text-[#C8BAA0] leading-relaxed">When any active trigger meets its threshold, your payout is processed without any action needed from you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
