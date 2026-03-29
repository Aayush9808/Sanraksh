"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Trigger {
  id:string; type:string; zone:string; severity:number; status:string;
  payout:string; started:string; signal:string; workers:number;
}

const PAYOUT_MAP: Record<string, string> = {
  heavy_rain:"₹800/day", extreme_heat:"₹800/day", flood:"₹800/day",
  traffic_jam:"₹400/day", strike:"₹600/day", app_outage:"₹400/inc.",
};
const SIGNAL_MAP: Record<string, string> = {
  heavy_rain:"IMD Orange/Red Alert issued", extreme_heat:"Temp > 42°C for 3+ hours",
  flood:"NDMA flood advisory active", traffic_jam:"Traffic API: blockage > 90 min",
  app_outage:"Platform status: degraded 4h+", strike:"Social media + news signal confirmed",
};

function mapDisruption(d: Record<string,unknown>): Trigger {
  const et = d.event_type as string;
  const start = new Date(d.start_time as string);
  const diffMs = Date.now() - start.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);
  const started = diffH > 24 ? `${Math.floor(diffH/24)}d ago` : diffH > 0 ? `${diffH}h ago` : `${diffM}m ago`;
  return {
    id: d.id as string,
    type: et.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()),
    zone: `${d.zone}, ${d.city}`,
    severity: d.severity === "high" ? 0.85 : d.severity === "medium" ? 0.55 : 0.3,
    status: "active",
    payout: PAYOUT_MAP[et] || "₹800/day",
    started,
    signal: SIGNAL_MAP[et] || "Signal confirmed",
    workers: Math.floor(Math.random() * 250 + 80),
  };
}

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
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Trigger|null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/disruptions/active`, {
      headers:{Authorization:`Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}`}
    }).then(r=>r.ok?r.json():null).then((d:Record<string,unknown>[]|null)=>{
      if(d && Array.isArray(d)) setTriggers(d.map(mapDisruption));
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const COLOR = (s:number) => s>=0.75?"#EF4444":s>=0.45?"#F59E0B":"#10B981";

  return (
    <div className="max-w-5xl">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Signal monitor</p>
          <h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Live Disruption Triggers</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot dot-live" />
          <span className="lbl-live">{triggers.filter(t=>t.status==="active").length} active now</span>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_340px] gap-5">
        {/* Trigger list */}
        <div className="space-y-3">
          {loading ? (
            <div className="panel p-6 text-center lbl">Loading active disruptions…</div>
          ) : triggers.length === 0 ? (
            <div className="panel p-6 text-center lbl">No active disruptions — system is clear</div>
          ) : triggers.map((t, i) => (
            <motion.div key={t.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
              onClick={()=>setSel(sel?.id===t.id?null:t)}
              className="panel p-4 cursor-pointer transition-all hover:border-slate-300"
              style={{ borderLeft:`3px solid ${COLOR(t.severity)}` }}
            >
              <div className="flex items-center gap-4">
                <SeverityRing v={t.severity} color={COLOR(t.severity)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-800 font-bold">{t.type}</span>
                    <span className={`tag ${t.status==="active"?"tag-neg":t.status==="watch"?"tag-warn":"tag-neutral"}`}>{t.status}</span>
                  </div>
                  <div className="lbl mb-1">{t.zone} · Started {t.started}</div>
                  <div className="text-sm text-slate-500">{t.signal}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-amber font-mono font-bold text-sm">{t.payout}</div>
                  <div className="lbl">{t.workers} workers</div>
                </div>
              </div>

              <AnimatePresence>
                {sel?.id === t.id && (
                  <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="panel-amber p-3 text-sm text-slate-600 leading-relaxed">
                        <span className="lbl-amber font-bold block mb-1">Trigger condition met</span>
                        This event meets the parametric conditions in your policy. If it persists, your payout of <strong className="text-amber">{t.payout}</strong> will be processed automatically within 4 hours.
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
                  <span className="text-sm text-slate-500">Max potential payout</span>
                  <span className="text-amber font-mono font-bold">₹880</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-500">Active triggers</span>
                  <span className="text-[#EF4444] font-bold">{triggers.filter(t=>t.status==="active").length}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-500">Watch alerts</span>
                  <span className="text-[#F59E0B] font-bold">{triggers.filter(t=>t.status==="watch").length}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="panel-amber p-4">
            <p className="lbl-amber mb-2">Auto-payout guarantee</p>
            <p className="text-sm text-slate-600 leading-relaxed">When any active trigger meets its threshold, your payout is processed without any action needed from you.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
