"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
const RiskMapLeaflet = dynamic(()=>import("@/components/RiskMapLeaflet"),{ssr:false,loading:()=>(
  <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">Loading map…</div>
)});

const MAP_ZONES = [
  { zone:"Mumbai Central",  lat:18.94, lng:72.83, risk:0.82, active_workers:2840, claims_today:14, type:"Rain, AQI" },
  { zone:"Bengaluru South", lat:12.90, lng:77.59, risk:0.61, active_workers:1920, claims_today:8,  type:"Outage"    },
  { zone:"Delhi NCR",       lat:28.66, lng:77.21, risk:0.74, active_workers:3200, claims_today:21, type:"AQI, Rain" },
  { zone:"Hyderabad East",  lat:17.39, lng:78.49, risk:0.38, active_workers:1140, claims_today:3,  type:"Heat wave" },
  { zone:"Chennai North",   lat:13.08, lng:80.27, risk:0.55, active_workers:980,  claims_today:6,  type:"Cyclone"   },
  { zone:"Pune Metro",      lat:18.52, lng:73.85, risk:0.29, active_workers:740,  claims_today:2,  type:"Rain"      },
];
const ZONES = [
  { zone:"Mumbai Central",   city:"Mumbai",    risk:0.82, workers:2840, active_claims:14, events:"Rain, AQI" },
  { zone:"Bengaluru South",  city:"Bengaluru", risk:0.61, workers:1920, active_claims:8,  events:"Outage"    },
  { zone:"Delhi NCR",        city:"Delhi",     risk:0.74, workers:3200, active_claims:21, events:"AQI, Rain" },
  { zone:"Hyderabad East",   city:"Hyderabad", risk:0.38, workers:1140, active_claims:3,  events:"Heat wave" },
  { zone:"Chennai North",    city:"Chennai",   risk:0.55, workers:980,  active_claims:6,  events:"Cyclone"   },
  { zone:"Pune Metro",       city:"Pune",      risk:0.29, workers:740,  active_claims:2,  events:"Rain"      },
];
const rc = (v:number) => v>0.7?"#EF4444":v>0.5?"#F59E0B":"#10B981";

export default function RiskMapPage() {
  const [selZone, setSelZone] = useState<typeof MAP_ZONES[0]|null>(null);
  return (
    <div className="max-w-[1400px] h-full">
      <div className="section-head">
        <div><p className="lbl mb-1">Admin portal</p><h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Risk Map</h1></div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="lbl">High</span></div>
          <div className="flex gap-2 items-center"><div className="w-2 h-2 rounded-full bg-amber" /><span className="lbl">Med</span></div>
          <div className="flex gap-2 items-center"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="lbl">Low</span></div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-5" style={{height:"calc(100vh - 180px)"}}>
        {/* Map */}
        <div className="panel overflow-hidden" style={{minHeight:400}}>
          <RiskMapLeaflet zones={MAP_ZONES} onSelect={setSelZone} />
        </div>
        {/* Zone table */}
        <div className="panel overflow-hidden self-start">
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <p className="lbl mb-0.5">Active disruption zones</p>
            <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>6 zones tracked</h2>
          </div>
          <div className="divide-y divide-[#2A2218]">
            {ZONES.map(z=>(
              <div key={z.zone} className="px-4 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="text-slate-600 font-medium text-sm">{z.zone}</div>
                    <div className="lbl">{z.events}</div>
                  </div>
                  <span className="font-mono font-bold text-sm" style={{color:rc(z.risk)}}>{(z.risk*100).toFixed(0)}%</span>
                </div>
                <div className="prog-track mb-2">
                  <div className="prog-fill" style={{width:`${z.risk*100}%`,background:rc(z.risk),animation:"none"}} />
                </div>
                <div className="flex gap-3">
                  <span className="lbl">{z.workers.toLocaleString()} workers</span>
                  <span className="lbl">{z.active_claims} claims</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
