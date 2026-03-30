"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { API_BASE } from "@/lib/config";
import type { Zone } from "@/components/RiskMapLeaflet";

const RiskMapLeaflet = dynamic(()=>import("@/components/RiskMapLeaflet"),{ssr:false,loading:()=>(
  <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">Loading map…</div>
)});

const FALLBACK_ZONES: Zone[] = [
  { zone:"Mumbai Central",  lat:18.94, lng:72.83, risk:0.82, active_workers:2840, claims_today:14, type:"Rain, AQI" },
  { zone:"Bengaluru South", lat:12.90, lng:77.59, risk:0.61, active_workers:1920, claims_today:8,  type:"Outage"    },
  { zone:"Delhi NCR",       lat:28.66, lng:77.21, risk:0.74, active_workers:3200, claims_today:21, type:"AQI, Rain" },
  { zone:"Hyderabad East",  lat:17.39, lng:78.49, risk:0.38, active_workers:1140, claims_today:3,  type:"Heat wave" },
  { zone:"Chennai North",   lat:13.08, lng:80.27, risk:0.55, active_workers:980,  claims_today:6,  type:"Cyclone"   },
  { zone:"Pune Metro",      lat:18.52, lng:73.85, risk:0.29, active_workers:740,  claims_today:2,  type:"Rain"      },
];
const rc = (v:number) => v>0.7?"#EF4444":v>0.5?"#F59E0B":"#10B981";

export default function RiskMapPage() {
  const [mapZones, setMapZones] = useState<Zone[]>(FALLBACK_ZONES);
  const [selZone, setSelZone] = useState<Zone|null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    fetch(`${API_BASE}/api/v1/risk-zones/heatmap`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.ok ? r.json() : null)
      .then(d => {
        if (Array.isArray(d) && d.length > 0) {
          setMapZones(d.map((z: Zone) => ({
            ...z,
            risk: z.risk_score ?? z.risk ?? 0.5,
          })));
        }
      }).catch(() => {});
  }, []);

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
        {/* Live Leaflet map */}
        <div className="panel overflow-hidden" style={{minHeight:400}}>
          <RiskMapLeaflet zones={mapZones} onSelect={setSelZone} />
        </div>
        {/* Zone sidebar */}
        <div className="panel overflow-y-auto self-start" style={{maxHeight:"calc(100vh - 180px)"}}>
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <p className="lbl mb-0.5">Active disruption zones</p>
            <h2 className="text-slate-800 font-bold" style={{letterSpacing:"-0.02em"}}>{mapZones.length} zones tracked</h2>
          </div>
          <div className="divide-y divide-[#2A2218]">
            {mapZones.map(z => {
              const riskVal = z.risk ?? z.risk_score ?? 0.5;
              const isSelected = selZone?.zone === z.zone;
              return (
                <div key={z.zone}
                  className={`px-4 py-3.5 cursor-pointer transition-colors ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                  onClick={() => setSelZone(isSelected ? null : z)}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-slate-600 font-medium text-sm">{z.zone}</div>
                      <div className="lbl">{z.city || z.type || "—"}</div>
                    </div>
                    <span className="font-mono font-bold text-sm" style={{color:rc(riskVal)}}>{(riskVal*100).toFixed(0)}%</span>
                  </div>
                  <div className="prog-track mb-2">
                    <div className="prog-fill" style={{width:`${riskVal*100}%`,background:rc(riskVal),animation:"none"}} />
                  </div>
                  <div className="flex gap-3">
                    {z.active_workers !== undefined && <span className="lbl">{z.active_workers.toLocaleString()} workers</span>}
                    {z.disruptions_per_month !== undefined && <span className="lbl">{z.disruptions_per_month} disruptions/mo</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
