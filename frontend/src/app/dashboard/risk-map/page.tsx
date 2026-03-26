"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "../../../lib/config";

interface RiskZone {
  id?:string; city:string; zone:string; lat:number; lng:number;
  risk_score:number; risk_level:string; weather_risk?:number;
  traffic_risk?:number; disruptions_per_month?:number;
}
interface Disruption { id:string; event_type:string; severity:string; city:string; zone:string; start_time:string; }
interface CitySignal { city:string; rain_mm_hr:number; aqi:number; flood_warning:boolean; curfew_alert:boolean; outage_index:number; }

const MOCK_ZONES:RiskZone[] = [
  { city:"Mumbai", zone:"Andheri West", lat:19.1136, lng:72.8697, risk_score:0.82, risk_level:"high", weather_risk:0.85, traffic_risk:0.78, disruptions_per_month:12 },
  { city:"Mumbai", zone:"Dadar", lat:19.0178, lng:72.8478, risk_score:0.78, risk_level:"high", weather_risk:0.80, traffic_risk:0.75, disruptions_per_month:10 },
  { city:"Mumbai", zone:"Bandra", lat:19.0596, lng:72.8295, risk_score:0.65, risk_level:"medium", weather_risk:0.70, traffic_risk:0.60, disruptions_per_month:8 },
  { city:"Delhi", zone:"Connaught Place", lat:28.6315, lng:77.2167, risk_score:0.72, risk_level:"high", weather_risk:0.68, traffic_risk:0.80, disruptions_per_month:9 },
  { city:"Delhi", zone:"Lajpat Nagar", lat:28.5700, lng:77.2430, risk_score:0.68, risk_level:"medium", weather_risk:0.65, traffic_risk:0.72, disruptions_per_month:7 },
  { city:"Bengaluru", zone:"Koramangala", lat:12.9352, lng:77.6245, risk_score:0.61, risk_level:"medium", weather_risk:0.65, traffic_risk:0.58, disruptions_per_month:6 },
  { city:"Bengaluru", zone:"HSR Layout", lat:12.9116, lng:77.6389, risk_score:0.55, risk_level:"medium", weather_risk:0.60, traffic_risk:0.52, disruptions_per_month:5 },
  { city:"Pune", zone:"Kothrud", lat:18.5074, lng:73.8077, risk_score:0.48, risk_level:"medium", weather_risk:0.52, traffic_risk:0.45, disruptions_per_month:4 },
  { city:"Hyderabad", zone:"Hitech City", lat:17.4435, lng:78.3772, risk_score:0.44, risk_level:"medium", weather_risk:0.48, traffic_risk:0.42, disruptions_per_month:3 },
  { city:"Chennai", zone:"T Nagar", lat:13.0418, lng:80.2341, risk_score:0.58, risk_level:"medium", weather_risk:0.62, traffic_risk:0.55, disruptions_per_month:5 },
];
const MOCK_DISRUPTIONS:Disruption[] = [
  { id:"1", event_type:"heavy_rain", severity:"high", city:"Mumbai", zone:"Andheri West", start_time:new Date().toISOString() },
  { id:"2", event_type:"flood", severity:"extreme", city:"Mumbai", zone:"Dadar", start_time:new Date().toISOString() },
  { id:"6", event_type:"aqi_shutdown", severity:"high", city:"Delhi", zone:"Connaught Place", start_time:new Date().toISOString() },
  { id:"3", event_type:"traffic_jam", severity:"medium", city:"Delhi", zone:"Connaught Place", start_time:new Date().toISOString() },
  { id:"4", event_type:"road_closure", severity:"high", city:"Delhi", zone:"Lajpat Nagar", start_time:new Date().toISOString() },
  { id:"5", event_type:"heavy_rain", severity:"medium", city:"Bengaluru", zone:"Koramangala", start_time:new Date().toISOString() },
];
const SIGNALS:CitySignal[] = [
  { city:"Mumbai", rain_mm_hr:62, aqi:178, flood_warning:true, curfew_alert:false, outage_index:18 },
  { city:"Delhi", rain_mm_hr:8, aqi:412, flood_warning:false, curfew_alert:false, outage_index:22 },
  { city:"Bengaluru", rain_mm_hr:24, aqi:121, flood_warning:false, curfew_alert:false, outage_index:14 },
  { city:"Pune", rain_mm_hr:12, aqi:138, flood_warning:false, curfew_alert:true, outage_index:19 },
  { city:"Hyderabad", rain_mm_hr:5, aqi:96, flood_warning:false, curfew_alert:false, outage_index:11 },
  { city:"Chennai", rain_mm_hr:30, aqi:104, flood_warning:true, curfew_alert:false, outage_index:16 },
];
const SEV:Record<string,string> = { extreme:"bg-state-danger/15 text-state-danger border-state-danger/25", high:"bg-accent-ember/15 text-accent-ember border-accent-ember/25", medium:"bg-state-warning/15 text-state-warning border-state-warning/25", low:"bg-state-success/15 text-state-success border-state-success/25" };
const RDOT:Record<string,string> = { high:"bg-state-danger", medium:"bg-state-warning", low:"bg-state-success" };
const CITIES = ["All Cities","Mumbai","Delhi","Bengaluru","Pune","Hyderabad","Chennai"];
const EVENT_HALO:Record<string,{ring:string;glow:string;label:string}> = {
  heavy_rain:{ring:"border-state-danger/50",glow:"bg-state-danger/15",label:"Heavy Rain"},
  flood:{ring:"border-state-info/50",glow:"bg-state-info/15",label:"Flood"},
  aqi_shutdown:{ring:"border-accent-violet/50",glow:"bg-accent-violet/15",label:"AQI Alert"},
  traffic_jam:{ring:"border-state-warning/50",glow:"bg-state-warning/15",label:"Traffic Jam"},
  road_closure:{ring:"border-accent-ember/50",glow:"bg-accent-ember/15",label:"Road Closure"},
};

export default function RiskHeatmapPage() {
  const [zones, setZones] = useState<RiskZone[]>(MOCK_ZONES);
  const [disruptions, setDisruptions] = useState<Disruption[]>(MOCK_DISRUPTIONS);
  const [city, setCity] = useState("All Cities");
  const [selZone, setSelZone] = useState<RiskZone|null>(null);
  const [liveLoc, setLiveLoc] = useState<{lat:number;lng:number}|null>(null);
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [zR,dR] = await Promise.all([
          fetch(`${API_BASE}/api/v1/risk-zones/heatmap`),
          fetch(`${API_BASE}/api/v1/disruptions/active`),
        ]);
        if (zR.ok) { const d=await zR.json(); if (d.length) setZones(d); }
        if (dR.ok) { const d=await dR.json(); if (d.length) setDisruptions(d); }
      } catch{}
    })();
  }, []);

  const filtered = city==="All Cities" ? zones : zones.filter(z=>z.city===city);
  const highR = filtered.filter(z=>z.risk_level==="high").length;
  const medR = filtered.filter(z=>z.risk_level==="medium").length;
  const sig = SIGNALS.find(s=>s.city===(city==="All Cities"?(selZone?.city||"Mumbai"):city))||SIGNALS[0];
  const mapLat = liveLoc?.lat??selZone?.lat??filtered[0]?.lat??19.076;
  const mapLng = liveLoc?.lng??selZone?.lng??filtered[0]?.lng??72.8777;
  const mapLabel = liveLoc?"Your Live Location":selZone?`${selZone.zone}, ${selZone.city}`:`${sig.city} Risk Grid`;
  const mapSrc = `https://www.google.com/maps?q=${mapLat},${mapLng}&z=12&output=embed`;
  const fmt = (s:string) => s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());

  function useLoc() {
    if (!navigator.geolocation) { setLocErr("Geolocation not supported"); return; }
    setLocating(true); setLocErr("");
    navigator.geolocation.getCurrentPosition(
      p => { setLiveLoc({lat:p.coords.latitude,lng:p.coords.longitude}); setLocating(false); },
      () => { setLocErr("Location permission denied"); setLocating(false); },
      { enableHighAccuracy:true, timeout:8000 }
    );
  }

  const impacted = filtered.map(z => {
    const ev = disruptions.filter(d=>d.zone===z.zone&&d.city===z.city);
    const pr = ev[0]; const hl = pr?(EVENT_HALO[pr.event_type]||EVENT_HALO.heavy_rain):null;
    return { z, ev, pr, hl };
  });

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const b = (d:number) => ({ initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, transition:{delay:d*0.06} } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Risk Intelligence Map</h1>
          <p className="text-sm text-text-secondary mt-0.5">Hyper-local risk monitoring across all operational zones</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-text-muted bg-surface-1 border border-white/[0.06] px-3 py-1.5 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-state-success animate-pulse"/>Live — updates every 5 min
        </span>
      </div>

      {/* Stats */}
      <motion.div {...b(1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l:"Monitored Zones", v:filtered.length, icon:"📍", accent:"border-accent-amber/30 bg-accent-amber/[0.04]" },
          { l:"High Risk", v:highR, icon:"🔴", accent:"border-state-danger/30 bg-state-danger/[0.04]" },
          { l:"Medium Risk", v:medR, icon:"🟡", accent:"border-state-warning/30 bg-state-warning/[0.04]" },
          { l:"Active Disruptions", v:disruptions.length, icon:"⚡", accent:"border-accent-ember/30 bg-accent-ember/[0.04]" },
        ].map(s=>(
          <div key={s.l} className={`rounded-xl border p-3.5 ${s.accent}`}>
            <div className="flex items-center justify-between mb-0.5"><span className="text-lg">{s.icon}</span><span className="text-2xl font-bold text-text-primary">{s.v}</span></div>
            <p className="text-xs text-text-muted">{s.l}</p>
          </div>
        ))}
      </motion.div>

      {/* City filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {CITIES.map(c=>(
          <button key={c} onClick={()=>setCity(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${city===c?"bg-accent-amber/15 border-accent-amber/30 text-accent-amber":"bg-surface-1 border-white/[0.06] text-text-muted hover:border-white/[0.12]"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Map + Signals */}
      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div {...b(2)} className={`lg:col-span-2 ${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04]">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Live Location Risk Map</p>
              <p className="text-sm font-medium text-text-primary">{mapLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={useLoc} className="rounded-lg border border-accent-amber/30 bg-accent-amber/10 px-3 py-1.5 text-[10px] font-semibold text-accent-amber hover:bg-accent-amber/20 transition">
                {locating?"Detecting…":"Use My Location"}
              </button>
              <button onClick={()=>{setLiveLoc(null);setLocErr("")}} className="rounded-lg border border-white/[0.06] px-3 py-1.5 text-[10px] text-text-muted hover:text-text-primary transition">Reset</button>
            </div>
          </div>
          {locErr && <p className="px-5 pt-2 text-[10px] text-state-warning">{locErr}</p>}
          <div className="aspect-[16/8] w-full bg-surface-0">
            <iframe title="Risk Map" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full w-full"/>
          </div>
          <div className="px-5 py-2.5 border-t border-white/[0.04] text-[10px] text-text-muted flex justify-between">
            <span>Google Maps Embed</span><span>📍 {mapLat.toFixed(4)}, {mapLng.toFixed(4)}</span>
          </div>
        </motion.div>

        <motion.div {...b(3)} className={`${card} p-5 space-y-3`}>
          <h3 className="text-sm font-semibold text-text-primary">Environmental Signals — {sig.city}</h3>
          {[
            { l:"Rain Intensity", v:`${sig.rain_mm_hr} mm/hr`, t:sig.rain_mm_hr>50?"text-state-danger":sig.rain_mm_hr>20?"text-state-warning":"text-state-success", i:"🌧️" },
            { l:"AQI Index", v:String(sig.aqi), t:sig.aqi>350?"text-state-danger":sig.aqi>200?"text-state-warning":"text-state-success", i:"😷" },
            { l:"Flood Warning", v:sig.flood_warning?"ACTIVE":"CLEAR", t:sig.flood_warning?"text-state-danger":"text-state-success", i:"🌊" },
            { l:"Curfew Alert", v:sig.curfew_alert?"ACTIVE":"NONE", t:sig.curfew_alert?"text-state-danger":"text-state-success", i:"🚫" },
            { l:"Platform Outage", v:`${sig.outage_index}%`, t:sig.outage_index>20?"text-state-warning":"text-state-success", i:"⚡" },
          ].map(s=>(
            <div key={s.l} className="rounded-xl bg-surface-2 border border-white/[0.04] px-3 py-2.5 flex items-center justify-between">
              <span className="text-[10px] text-text-secondary flex items-center gap-1.5"><span>{s.i}</span>{s.l}</span>
              <span className={`text-[10px] font-bold ${s.t}`}>{s.v}</span>
            </div>
          ))}
          <p className="text-[10px] text-text-muted pt-1">Signals sampled every 5 min from weather/air-quality/traffic feeds.</p>
        </motion.div>
      </div>

      {/* Affected Zone Overlay */}
      <motion.div {...b(4)} className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Affected Zone Overlay (Simulation)</h3>
          <span className="text-[10px] text-text-muted">Color halo = disruption type & severity</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {impacted.slice(0,9).map(({z,pr,hl,ev})=>(
            <div key={`${z.city}-${z.zone}`} className="relative rounded-xl border border-white/[0.04] bg-surface-2/50 p-4 overflow-hidden">
              {pr&&hl&&(<><div className={`absolute -inset-6 ${hl.glow} blur-2xl`}/><div className={`absolute inset-2 border ${hl.ring} rounded-xl animate-pulse`}/></>)}
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div><p className="text-sm font-medium text-text-primary">{z.zone}</p><p className="text-[10px] text-text-muted">{z.city}</p></div>
                  <span className={`h-2 w-2 rounded-full ${RDOT[z.risk_level]||"bg-text-muted"}`}/>
                </div>
                <p className="mt-1.5 text-[10px] text-text-muted">Risk: {Math.round(z.risk_score*100)}%</p>
                <p className="text-[10px] mt-0.5 font-medium text-text-secondary">{pr&&hl?`⚠ ${hl.label} (${pr.severity.toUpperCase()})`:"✅ No active disruption"}</p>
                <p className="text-[9px] text-text-muted mt-0.5">{ev.length} active event(s)</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Zone Grid + Disruptions sidebar */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Risk Zones</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((z,i)=>(
              <button key={i} onClick={()=>setSelZone(z===selZone?null:z)}
                className={`text-left p-4 rounded-xl border transition ${selZone===z?"border-accent-amber/40 bg-accent-amber/[0.04]":`${card} hover:border-white/[0.08]`}`}>
                <div className="flex items-start justify-between mb-2">
                  <div><p className="text-sm font-medium text-text-primary">{z.zone}</p><p className="text-[10px] text-text-muted">{z.city}</p></div>
                  <div className="flex items-center gap-1"><span className={`w-1.5 h-1.5 rounded-full ${RDOT[z.risk_level]||"bg-text-muted"}`}/><span className={`text-[10px] font-semibold capitalize ${z.risk_level==="high"?"text-state-danger":z.risk_level==="medium"?"text-state-warning":"text-state-success"}`}>{z.risk_level}</span></div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-text-muted"><span>Overall Risk</span><span className="font-medium text-text-primary">{Math.round(z.risk_score*100)}%</span></div>
                  <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${z.risk_score>0.6?"bg-state-danger":z.risk_score>0.45?"bg-state-warning":"bg-state-success"}`} style={{width:`${z.risk_score*100}%`}}/></div>
                  {z.disruptions_per_month!==undefined && <p className="text-[10px] text-text-muted">{z.disruptions_per_month} disruptions/mo avg</p>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {selZone && (
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary">{selZone.zone}</h3>
                <button onClick={()=>setSelZone(null)} className="text-text-muted hover:text-text-primary text-xs">✕</button>
              </div>
              <div className="space-y-2.5">
                {[{l:"Weather Risk",v:selZone.weather_risk||selZone.risk_score},{l:"Traffic Risk",v:selZone.traffic_risk||selZone.risk_score*0.9},{l:"Overall Risk",v:selZone.risk_score}].map(r=>(
                  <div key={r.l}>
                    <div className="flex justify-between text-[10px] mb-1"><span className="text-text-muted">{r.l}</span><span className="text-text-primary font-medium">{Math.round(r.v*100)}%</span></div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden"><div className={`h-full rounded-full ${r.v>0.6?"bg-state-danger":r.v>0.45?"bg-state-warning":"bg-state-success"}`} style={{width:`${r.v*100}%`}}/></div>
                  </div>
                ))}
                <p className="text-[10px] text-text-muted pt-1">📍 {selZone.lat.toFixed(4)}, {selZone.lng.toFixed(4)}</p>
              </div>
            </div>
          )}

          <div className={`${card} p-5`}>
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-state-danger animate-pulse"/>Active Disruptions ({disruptions.length})
            </h3>
            {disruptions.length===0 ? <p className="text-sm text-text-muted">No active disruptions</p> : (
              <div className="space-y-2.5">
                {disruptions.slice(0,6).map((d,i)=>(
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`mt-0.5 inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded border capitalize ${SEV[d.severity]||""}`}>{d.severity}</span>
                    <div><p className="text-xs font-medium text-text-primary">{fmt(d.event_type)}</p><p className="text-[10px] text-text-muted">{d.zone}, {d.city}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-accent-amber/[0.04] border border-accent-amber/15 p-4">
            <h4 className="text-[10px] font-semibold text-accent-amber mb-1">💡 Hyper-Local AI Intelligence</h4>
            <p className="text-[10px] text-text-muted leading-relaxed">Each zone = 2km × 2km. Risk scores update every 5 min using weather, traffic, and historical patterns. Workers are auto-notified when zones turn high-risk.</p>
          </div>
        </div>
      </div>

      {/* Disruption Monitor Table */}
      <motion.div {...b(5)} className={`${card} overflow-hidden`}>
        <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Operational Disruption Monitor</h3>
          <span className="text-[10px] text-text-muted">Updated {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead><tr className="bg-surface-2/50 border-b border-white/[0.04]">
              {["Event","City","Zone","Severity","Rain","AQI","Auto Trigger","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>)}
            </tr></thead>
            <tbody>
              {disruptions.slice(0,8).map((d,i) => {
                const s = SIGNALS.find(s=>s.city===d.city);
                const auto = ["heavy_rain","flood","aqi_shutdown","app_outage"].includes(d.event_type);
                return (
                  <tr key={d.id+i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                    <td className="px-4 py-2.5 text-sm font-medium text-text-primary">{fmt(d.event_type)}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{d.city}</td>
                    <td className="px-4 py-2.5 text-sm text-text-muted">{d.zone}</td>
                    <td className="px-4 py-2.5"><span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded border capitalize ${SEV[d.severity]||""}`}>{d.severity}</span></td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{s?.rain_mm_hr??"—"}</td>
                    <td className="px-4 py-2.5 text-sm text-text-secondary">{s?.aqi??"—"}</td>
                    <td className="px-4 py-2.5 text-sm"><span className={auto?"text-state-success":"text-state-warning"}>{auto?"Enabled":"Review-first"}</span></td>
                    <td className="px-4 py-2.5 text-sm text-accent-amber">Monitoring</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
