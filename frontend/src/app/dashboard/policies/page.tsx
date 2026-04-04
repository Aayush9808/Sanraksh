"use client";
import { useState } from "react";

const POLICY_TYPES = [
  { id:"STD", name:"Sanraksh Standard", premium:"₹49/week", workers:11480, payouts_ytd:48200, events:6, status:"active" },
  { id:"PRO", name:"Sanraksh Pro",      premium:"₹79/week", workers:2340,  payouts_ytd:18600, events:9, status:"active" },
  { id:"LITE",name:"Sanraksh Lite",     premium:"₹29/week", workers:380,   payouts_ytd:4800,  events:3, status:"active" },
];
const RULES = [
  { id:"R1", event:"Heavy Rain",   threshold:"IMD Orange/Red Alert",   payout:"₹280/day",  cap:"₹840/7-day",   active:true  },
  { id:"R2", event:"App Outage",   threshold:"Platform down ≥ 4h",     payout:"₹200/inc.", cap:"3/week",        active:true  },
  { id:"R3", event:"Curfew",       threshold:"Govt order ≥ 6h",        payout:"₹350/day",  cap:"₹1,050/7-day", active:true  },
  { id:"R4", event:"AQI Severe",   threshold:"AQI > 400 for 4h",       payout:"₹150/day",  cap:"5 days/week",   active:true  },
  { id:"R5", event:"Cyclone",      threshold:"IMD warning active",      payout:"₹400/day",  cap:"Unlimited",     active:true  },
  { id:"R6", event:"Heat Wave",    threshold:"Temp > 44°C, 4h window",  payout:"₹200/day",  cap:"5 days/week",   active:false },
];

export default function PoliciesPage() {
  const [rules, setRules] = useState(RULES);
  return (
    <div className="max-w-5xl">
      <div className="section-head">
        <div><p className="lbl mb-1">Admin portal</p><h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Policy Engine</h1></div>
        <span className="tag tag-live">{POLICY_TYPES.reduce((a,p)=>a+p.workers,0).toLocaleString()} workers covered</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {POLICY_TYPES.map(p=>(
          <div key={p.id} className={`panel p-5 ${p.id==="PRO"?"panel-amber":""}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-slate-800 font-bold">{p.name}</div>
                <div className="lbl mt-0.5">{p.events} events covered</div>
              </div>
              <span className="tag tag-live">{p.status}</span>
            </div>
            <div className="amber-line mb-3" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-amber font-bold text-lg" style={{letterSpacing:"-0.03em"}}>{p.premium}</div>
                <div className="lbl">premium</div>
              </div>
              <div>
                <div className="text-slate-800 font-bold text-lg">{p.workers.toLocaleString()}</div>
                <div className="lbl">workers</div>
              </div>
              <div className="col-span-2">
                <div className="text-amber font-mono font-bold">₹{p.payouts_ytd.toLocaleString()}</div>
                <div className="lbl">paid YTD</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel overflow-hidden">
        <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
          <p className="lbl mb-1">Coverage rules engine</p>
          <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>Parametric conditions</h2>
        </div>
        <table className="tbl">
          <thead><tr><th>Rule</th><th>Event</th><th>Threshold</th><th>Payout</th><th>Cap</th><th>Status</th></tr></thead>
          <tbody>
            {rules.map(r=>(
              <tr key={r.id}>
                <td><span className="font-mono text-xs text-slate-500">{r.id}</span></td>
                <td><span className="text-slate-600 font-medium">{r.event}</span></td>
                <td className="text-sm">{r.threshold}</td>
                <td><span className="text-amber font-mono font-bold">{r.payout}</span></td>
                <td className="text-sm">{r.cap}</td>
                <td>
                  <button onClick={()=>setRules(prev=>prev.map(x=>x.id===r.id?{...x,active:!x.active}:x))}
                    className={`tag ${r.active?"tag-live":"tag-neutral"} cursor-pointer`}>
                    {r.active?"active":"off"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
