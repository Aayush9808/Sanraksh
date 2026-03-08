'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface RiskZone {
  id?: string; city: string; zone: string;
  lat: number; lng: number;
  risk_score: number; risk_level: string; color?: string;
  weather_risk?: number; traffic_risk?: number;
  disruptions_per_month?: number;
}

interface Disruption {
  id: string; event_type: string; severity: string;
  city: string; zone: string; start_time: string;
}

const MOCK_ZONES: RiskZone[] = [
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
]

const MOCK_DISRUPTIONS: Disruption[] = [
  { id:"1", event_type:"heavy_rain", severity:"high", city:"Mumbai", zone:"Andheri West", start_time:new Date().toISOString() },
  { id:"2", event_type:"flood", severity:"extreme", city:"Mumbai", zone:"Dadar", start_time:new Date().toISOString() },
  { id:"3", event_type:"traffic_jam", severity:"medium", city:"Delhi", zone:"Connaught Place", start_time:new Date().toISOString() },
  { id:"4", event_type:"road_closure", severity:"high", city:"Delhi", zone:"Lajpat Nagar", start_time:new Date().toISOString() },
  { id:"5", event_type:"heavy_rain", severity:"medium", city:"Bengaluru", zone:"Koramangala", start_time:new Date().toISOString() },
]

const SEVERITY_COLORS: Record<string, string> = {
  extreme: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
}
const RISK_DOT: Record<string, string> = {
  high: "bg-red-500", medium: "bg-yellow-500", low: "bg-emerald-500"
}

const CITIES = ["All Cities","Mumbai","Delhi","Bengaluru","Pune","Hyderabad","Chennai"]

export default function RiskHeatmapPage() {
  const [zones, setZones] = useState<RiskZone[]>(MOCK_ZONES)
  const [disruptions, setDisruptions] = useState<Disruption[]>(MOCK_DISRUPTIONS)
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [zRes, dRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/risk-zones/heatmap`),
          fetch(`${API_BASE}/api/v1/disruptions/active`),
        ])
        if (zRes.ok) { const d = await zRes.json(); if (d.length) setZones(d) }
        if (dRes.ok) { const d = await dRes.json(); if (d.length) setDisruptions(d) }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const filtered = selectedCity === 'All Cities' ? zones : zones.filter(z => z.city === selectedCity)
  const highRisk = filtered.filter(z => z.risk_level === 'high').length
  const medRisk = filtered.filter(z => z.risk_level === 'medium').length
  const lowRisk = filtered.filter(z => z.risk_level === 'low').length

  const formatEvent = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
            <span className="text-slate-700">/</span>
            <Link href="/dashboard/policies" className="text-slate-400 hover:text-white transition-colors text-sm">Policies</Link>
            <span className="text-slate-700">/</span>
            <h1 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🗺️</span> Risk Intelligence Map
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live — updates every 5 min
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Monitored Zones", value: filtered.length, icon: "📍", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
            { label: "High Risk", value: highRisk, icon: "🔴", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
            { label: "Medium Risk", value: medRisk, icon: "🟡", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
            { label: "Active Disruptions", value: disruptions.length, icon: "⚡", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* City filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {CITIES.map(c => (
            <button key={c} onClick={() => setSelectedCity(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${selectedCity === c ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500"}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Zone Grid */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Risk Zones</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((zone, i) => (
                <button key={i} onClick={() => setSelectedZone(zone === selectedZone ? null : zone)}
                  className={`text-left p-4 rounded-xl border transition-all ${selectedZone === zone ? "border-cyan-500/50 bg-cyan-500/10" : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold text-sm">{zone.zone}</p>
                      <p className="text-slate-500 text-xs">{zone.city}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${RISK_DOT[zone.risk_level] || "bg-slate-400"}`} />
                      <span className={`text-xs font-semibold capitalize ${zone.risk_level === 'high' ? 'text-red-400' : zone.risk_level === 'medium' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {zone.risk_level}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Overall Risk</span>
                      <span className="font-medium text-white">{Math.round(zone.risk_score * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${zone.risk_score > 0.6 ? 'bg-red-500' : zone.risk_score > 0.45 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                        style={{width: `${zone.risk_score * 100}%`}} />
                    </div>
                    {zone.disruptions_per_month !== undefined && (
                      <p className="text-xs text-slate-500">{zone.disruptions_per_month} disruptions/month avg</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel: Disruptions + Zone Detail */}
          <div className="space-y-4">
            {/* Zone Detail */}
            {selectedZone && (
              <div className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">{selectedZone.zone}</h3>
                  <button onClick={() => setSelectedZone(null)} className="text-slate-500 hover:text-white text-xs">✕</button>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Weather Risk", value: selectedZone.weather_risk || selectedZone.risk_score },
                    { label: "Traffic Risk", value: selectedZone.traffic_risk || selectedZone.risk_score * 0.9 },
                    { label: "Overall Risk", value: selectedZone.risk_score },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{r.label}</span>
                        <span className="text-white font-medium">{Math.round(r.value * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${r.value > 0.6 ? 'bg-red-500' : r.value > 0.45 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                          style={{width: `${r.value * 100}%`}} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-xs text-slate-500">
                    📍 {selectedZone.lat.toFixed(4)}, {selectedZone.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            )}

            {/* Active Disruptions */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Active Disruptions ({disruptions.length})
              </h3>
              {disruptions.length === 0 ? (
                <p className="text-slate-500 text-sm">No active disruptions</p>
              ) : (
                <div className="space-y-3">
                  {disruptions.slice(0, 6).map((d, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`mt-0.5 inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded border capitalize ${SEVERITY_COLORS[d.severity] || ''}`}>
                        {d.severity}
                      </span>
                      <div>
                        <p className="text-white text-xs font-medium">{formatEvent(d.event_type)}</p>
                        <p className="text-slate-500 text-xs">{d.zone}, {d.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-cyan-400 mb-2">💡 Hyper-Local AI Intelligence</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each zone represents a 2km × 2km area. Risk scores update every 5 minutes using weather APIs, traffic data, and historical disruption patterns. Workers are auto-notified when their zone turns high-risk.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

