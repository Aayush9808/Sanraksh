"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

type Claim = {
  id:string; worker:string; zone:string; gpsJumpKm:number;
  deviceReuseCount:number; routeFeasible:boolean; peerMatch:number;
  riskScore:number; decision:"AUTO_PAY"|"REVIEW"|"BLOCK";
};

const BASE:Claim[] = [
  { id:"CLM-MC-001", worker:"Rahul Kumar", zone:"Andheri West", gpsJumpKm:0.6, deviceReuseCount:1, routeFeasible:true, peerMatch:9, riskScore:0.12, decision:"AUTO_PAY" },
  { id:"CLM-MC-002", worker:"Priya Sharma", zone:"Dadar", gpsJumpKm:52, deviceReuseCount:7, routeFeasible:false, peerMatch:1, riskScore:0.89, decision:"BLOCK" },
  { id:"CLM-MC-003", worker:"Amit Singh", zone:"Bandra-Kurla", gpsJumpKm:1.2, deviceReuseCount:1, routeFeasible:true, peerMatch:7, riskScore:0.21, decision:"AUTO_PAY" },
  { id:"CLM-MC-004", worker:"Meera Joshi", zone:"Andheri West", gpsJumpKm:31, deviceReuseCount:5, routeFeasible:false, peerMatch:0, riskScore:0.84, decision:"BLOCK" },
  { id:"CLM-MC-005", worker:"Vikram Nair", zone:"Delhi NCR", gpsJumpKm:3.1, deviceReuseCount:2, routeFeasible:true, peerMatch:3, riskScore:0.48, decision:"REVIEW" },
  { id:"CLM-MC-006", worker:"Sunita Devi", zone:"Koramangala", gpsJumpKm:0.5, deviceReuseCount:1, routeFeasible:true, peerMatch:8, riskScore:0.17, decision:"AUTO_PAY" },
];

export default function ThreatDefensePage() {
  const [strict, setStrict] = useState(true);
  const [ring, setRing] = useState(4);

  const claims = useMemo(() => BASE.map(c => {
    const sig = (c.gpsJumpKm>10?1:0)+(c.deviceReuseCount>=ring?1:0)+(!c.routeFeasible?1:0)+(c.peerMatch<=1?1:0);
    const adj = strict ? Math.min(0.99, c.riskScore+sig*0.06) : Math.max(0, c.riskScore-0.1);
    let dec:Claim["decision"] = "AUTO_PAY";
    if (adj>=0.75) dec="BLOCK"; else if (adj>=0.40) dec="REVIEW";
    return { ...c, riskScore:Number(adj.toFixed(2)), decision:dec };
  }), [strict, ring]);

  const st = useMemo(() => {
    const t=claims.length, bl=claims.filter(c=>c.decision==="BLOCK").length, rv=claims.filter(c=>c.decision==="REVIEW").length, au=claims.filter(c=>c.decision==="AUTO_PAY").length;
    return { t, bl, rv, au, fr:Math.round((bl/Math.max(t,1))*100) };
  }, [claims]);

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04] p-5";
  const b = (d:number) => ({ initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, transition:{delay:d*0.06} } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{opacity:0}} animate={{opacity:1}}>
      {/* Alert banner */}
      <motion.div {...b(0)} className="rounded-2xl border border-state-danger/30 bg-state-danger/10 p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-state-danger">Adversarial Event Mode</p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">Threat Defense Console</h1>
        <p className="mt-1 text-sm text-text-secondary">Anti-spoofing response against GPS manipulation rings while preserving fast payout for genuine workers.</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[
          ["Claims Inflow",st.t,"📥","border-accent-amber/30 bg-accent-amber/[0.04]"],
          ["Auto Payout",st.au,"✅","border-state-success/30 bg-state-success/[0.04]"],
          ["Review Queue",st.rv,"🕵️","border-state-warning/30 bg-state-warning/[0.04]"],
          ["Blocked",st.bl,"⛔","border-state-danger/30 bg-state-danger/[0.04]"],
          ["Fraud Ring Rate",`${st.fr}%`,"🧠","border-accent-violet/30 bg-accent-violet/[0.04]"],
        ].map(([l,v,ico,cls],i) => (
          <motion.div key={String(l)} {...b(i+1)} className={`rounded-xl border p-3.5 ${cls}`}>
            <div className="flex items-center justify-between"><span className="text-lg">{ico}</span><span className="text-xl font-black text-text-primary">{v}</span></div>
            <p className="mt-0.5 text-[10px] text-text-muted">{l}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Control Panel */}
        <motion.div {...b(6)} className={`${card} lg:col-span-1`}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Control Panel</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Strict Anti-Spoof Mode</span>
              <button onClick={()=>setStrict(v=>!v)} className={`rounded-full px-3 py-1 text-[10px] font-bold ${strict?"bg-state-danger/20 text-state-danger":"bg-surface-2 text-text-muted"}`}>{strict?"ON":"OFF"}</button>
            </label>
            <div>
              <p className="mb-1.5 text-[10px] text-text-muted">Device Ring Threshold: {ring}</p>
              <input type="range" min={2} max={8} value={ring} onChange={e=>setRing(Number(e.target.value))} className="w-full accent-accent-amber" />
            </div>
            <ul className="space-y-1.5 text-[11px] text-text-muted">
              <li>• Teleport jumps &gt; 10 km treated as spoof signals</li>
              <li>• High device reuse indicates coordinated fraud rings</li>
              <li>• Low peer-event match reduces trust</li>
              <li>• Route infeasibility increases risk sharply</li>
            </ul>
          </div>
        </motion.div>

        {/* Decision Matrix */}
        <motion.div {...b(7)} className={`${card} lg:col-span-2 overflow-x-auto`}>
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Claim Decision Matrix (Live Simulation)</h2>
          <table className="w-full min-w-[860px]">
            <thead><tr className="border-b border-white/[0.04] text-[10px] uppercase tracking-wider text-text-muted">
              {["Claim ID","Worker","Zone","GPS Jump","Device Reuse","Route","Peer Match","Risk","Decision"].map(h=><th key={h} className="px-3 py-2">{h}</th>)}
            </tr></thead>
            <tbody>
              {claims.map(c=>(
                <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                  <td className="px-3 py-2.5 font-mono text-[10px] text-accent-amber">{c.id}</td>
                  <td className="px-3 py-2.5 text-sm text-text-primary">{c.worker}</td>
                  <td className="px-3 py-2.5 text-sm text-text-secondary">{c.zone}</td>
                  <td className={`px-3 py-2.5 text-sm ${c.gpsJumpKm>10?"text-state-danger":"text-text-secondary"}`}>{c.gpsJumpKm} km</td>
                  <td className={`px-3 py-2.5 text-sm ${c.deviceReuseCount>=ring?"text-state-danger":"text-text-secondary"}`}>{c.deviceReuseCount}</td>
                  <td className={`px-3 py-2.5 text-sm ${c.routeFeasible?"text-state-success":"text-state-danger"}`}>{c.routeFeasible?"Feasible":"Impossible"}</td>
                  <td className={`px-3 py-2.5 text-sm ${c.peerMatch<=1?"text-state-warning":"text-text-secondary"}`}>{c.peerMatch}</td>
                  <td className="px-3 py-2.5 text-sm font-semibold text-text-primary">{Math.round(c.riskScore*100)}%</td>
                  <td className="px-3 py-2.5"><span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${c.decision==="BLOCK"?"bg-state-danger/15 text-state-danger border-state-danger/25":c.decision==="REVIEW"?"bg-state-warning/15 text-state-warning border-state-warning/25":"bg-state-success/15 text-state-success border-state-success/25"}`}>{c.decision}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Risk Tier + Ring Attack */}
      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div {...b(8)} className={card}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Risk-Tier Routing</h3>
          <div className="space-y-2 text-sm">
            <p className="rounded-lg bg-state-success/10 border border-state-success/20 px-3 py-2 text-state-success">Low (0-39%): Instant auto payout</p>
            <p className="rounded-lg bg-state-warning/10 border border-state-warning/20 px-3 py-2 text-state-warning">Medium (40-74%): Soft-friction review</p>
            <p className="rounded-lg bg-state-danger/10 border border-state-danger/20 px-3 py-2 text-state-danger">High (75-100%): Block + investigation</p>
          </div>
        </motion.div>
        <motion.div {...b(9)} className={card}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Ring Attack Indicators</h3>
          <ul className="space-y-1.5 text-sm text-text-secondary list-disc list-inside">
            <li>Same device/network reused across multiple claims</li>
            <li>Synchronized claim timestamps from weak-history accounts</li>
            <li>Location movement impossible for route-time window</li>
            <li>Claims not matching real weather/disruption signals</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
