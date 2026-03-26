'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AdminSidebar from '../../../components/AdminSidebar'
import { API_BASE } from '../../../lib/config'

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

interface CitySignal {
  city: string;
  rain_mm_hr: number;
  aqi: number;
  flood_warning: boolean;
  curfew_alert: boolean;
  outage_index: number;
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
  { id:"6", event_type:"aqi_shutdown", severity:"high", city:"Delhi", zone:"Connaught Place", start_time:new Date().toISOString() },
  { id:"3", event_type:"traffic_jam", severity:"medium", city:"Delhi", zone:"Connaught Place", start_time:new Date().toISOString() },
  { id:"4", event_type:"road_closure", severity:"high", city:"Delhi", zone:"Lajpat Nagar", start_time:new Date().toISOString() },
  { id:"5", event_type:"heavy_rain", severity:"medium", city:"Bengaluru", zone:"Koramangala", start_time:new Date().toISOString() },
]

const CITY_SIGNALS: CitySignal[] = [
  { city: "Mumbai",    rain_mm_hr: 62, aqi: 178, flood_warning: true,  curfew_alert: false, outage_index: 18 },
  { city: "Delhi",     rain_mm_hr: 8,  aqi: 412, flood_warning: false, curfew_alert: false, outage_index: 22 },
  { city: "Bengaluru", rain_mm_hr: 24, aqi: 121, flood_warning: false, curfew_alert: false, outage_index: 14 },
  { city: "Pune",      rain_mm_hr: 12, aqi: 138, flood_warning: false, curfew_alert: true,  outage_index: 19 },
  { city: "Hyderabad", rain_mm_hr: 5,  aqi: 96,  flood_warning: false, curfew_alert: false, outage_index: 11 },
  { city: "Chennai",   rain_mm_hr: 30, aqi: 104, flood_warning: true,  curfew_alert: false, outage_index: 16 },
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

const EVENT_HALO: Record<string, { ring: string; glow: string; label: string }> = {
  heavy_rain:  { ring: 'border-red-400/60',  glow: 'bg-red-500/20',    label: 'Heavy Rain' },
  flood:       { ring: 'border-sky-400/70',  glow: 'bg-sky-500/20',    label: 'Flood' },
  aqi_shutdown:{ ring: 'border-purple-400/70', glow: 'bg-purple-500/20', label: 'AQI Alert' },
  curfew:      { ring: 'border-amber-400/70', glow: 'bg-amber-500/20', label: 'Curfew' },
  app_outage:  { ring: 'border-pink-400/70', glow: 'bg-pink-500/20',   label: 'App Outage' },
  traffic_jam: { ring: 'border-yellow-400/70', glow: 'bg-yellow-500/20', label: 'Traffic Jam' },
  road_closure:{ ring: 'border-orange-400/70', glow: 'bg-orange-500/20', label: 'Road Closure' },
}

export default function RiskHeatmapPage() {
  const [zones, setZones] = useState<RiskZone[]>(MOCK_ZONES)
  const [disruptions, setDisruptions] = useState<Disruption[]>(MOCK_DISRUPTIONS)
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null)
  const [liveLocation, setLiveLocation] = useState<{lat: number; lng: number} | null>(null)
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')
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
  const activeSignal = CITY_SIGNALS.find(s => s.city === (selectedCity === 'All Cities' ? (selectedZone?.city || 'Mumbai') : selectedCity)) || CITY_SIGNALS[0]

  const mapLat = liveLocation?.lat ?? selectedZone?.lat ?? filtered[0]?.lat ?? 19.076
  const mapLng = liveLocation?.lng ?? selectedZone?.lng ?? filtered[0]?.lng ?? 72.8777
  const mapLabel = liveLocation ? 'Your Live Location' : selectedZone ? `${selectedZone.zone}, ${selectedZone.city}` : `${activeSignal.city} Risk Grid`
  const mapSrc = `https://www.google.com/maps?q=${mapLat},${mapLng}&z=12&output=embed`
  const impactedZones = filtered.map((zone) => {
    const events = disruptions.filter((d) => d.zone === zone.zone && d.city === zone.city)
    const primary = events[0]
    const halo = primary ? (EVENT_HALO[primary.event_type] || EVENT_HALO.heavy_rain) : null
    return { zone, events, primary, halo }
  })

  const formatEvent = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported in this browser')
      return
    }
    setLocating(true)
    setLocationError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLiveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setLocationError('Location permission denied. Using selected zone instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <AdminSidebar />
      <main className="ml-60 flex-1">
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

        {/* Live Map + Signal Command Center */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-700/60 bg-slate-800/40 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/60">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">Live Location Risk Map</p>
                <p className="text-sm font-semibold text-white">{mapLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={useMyLocation}
                  className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                  {locating ? 'Detecting…' : 'Use My Live Location'}
                </button>
                <button onClick={() => { setLiveLocation(null); setLocationError('') }}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition-colors">
                  Reset
                </button>
              </div>
            </div>
            {locationError && <p className="px-5 pt-3 text-xs text-amber-400">{locationError}</p>}
            <div className="aspect-[16/8] w-full bg-slate-900">
              <iframe
                title="GigArmor Live Risk Map"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
            <div className="px-5 py-3 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
              <span>Map Source: Google Maps Embed</span>
              <span>📍 {mapLat.toFixed(4)}, {mapLng.toFixed(4)}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white">Environmental Signals — {activeSignal.city}</h3>
            {[
              { label: 'Rain Intensity', value: `${activeSignal.rain_mm_hr} mm/hr`, tone: activeSignal.rain_mm_hr > 50 ? 'text-red-400' : activeSignal.rain_mm_hr > 20 ? 'text-amber-400' : 'text-emerald-400', icon: '🌧️' },
              { label: 'AQI Index', value: activeSignal.aqi.toString(), tone: activeSignal.aqi > 350 ? 'text-red-400' : activeSignal.aqi > 200 ? 'text-amber-400' : 'text-emerald-400', icon: '😷' },
              { label: 'Flood Warning', value: activeSignal.flood_warning ? 'ACTIVE' : 'CLEAR', tone: activeSignal.flood_warning ? 'text-red-400' : 'text-emerald-400', icon: '🌊' },
              { label: 'Curfew Alert', value: activeSignal.curfew_alert ? 'ACTIVE' : 'NONE', tone: activeSignal.curfew_alert ? 'text-red-400' : 'text-emerald-400', icon: '🚫' },
              { label: 'Platform Outage', value: `${activeSignal.outage_index}%`, tone: activeSignal.outage_index > 20 ? 'text-amber-400' : 'text-emerald-400', icon: '⚡' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-700/50 bg-slate-900/40 px-3 py-2.5 flex items-center justify-between">
                <span className="text-xs text-slate-300 flex items-center gap-2"><span>{s.icon}</span>{s.label}</span>
                <span className={`text-xs font-bold ${s.tone}`}>{s.value}</span>
              </div>
            ))}
            <p className="text-[11px] text-slate-500 pt-1">Signals are sampled every 5 minutes from weather/air-quality/traffic simulations. High values increase disruption probability and auto-trigger readiness.</p>
          </div>
        </div>

        {/* Zone Impact Overlay Simulation */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Affected Zone Overlay (Simulation)</h3>
            <span className="text-xs text-slate-500">Color halo indicates disruption type and severity</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {impactedZones.slice(0, 9).map(({ zone, primary, halo, events }) => (
              <div key={`${zone.city}-${zone.zone}`} className="relative rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 overflow-hidden">
                {primary && halo && (
                  <>
                    <div className={`absolute -inset-6 ${halo.glow} blur-2xl`} />
                    <div className={`absolute inset-2 border ${halo.ring} rounded-xl animate-pulse`} />
                  </>
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{zone.zone}</p>
                      <p className="text-xs text-slate-500">{zone.city}</p>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${RISK_DOT[zone.risk_level] || 'bg-slate-500'}`} />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">Risk: {Math.round(zone.risk_score * 100)}%</p>
                  <p className="text-xs mt-1 font-medium text-slate-300">
                    {primary && halo ? `⚠ ${halo.label} (${primary.severity.toUpperCase()})` : '✅ No active disruption'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{events.length} active event(s)</p>
                </div>
              </div>
            ))}
          </div>
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

        {/* Disruption Monitor Table */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700/60 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Operational Disruption Monitor</h3>
            <span className="text-xs text-slate-500">Updated {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-slate-900/70 border-b border-slate-700/60">
                  {['Event', 'City', 'Zone', 'Severity', 'Rain (mm/hr)', 'AQI', 'Auto Trigger', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {disruptions.slice(0, 8).map((d, idx) => {
                  const signal = CITY_SIGNALS.find(s => s.city === d.city)
                  const autoTrigger = ['heavy_rain', 'flood', 'aqi_shutdown', 'app_outage'].includes(d.event_type)
                  return (
                    <tr key={d.id + idx} className="border-b border-slate-800/70 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-white">{formatEvent(d.event_type)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{d.city}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{d.zone}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border capitalize ${SEVERITY_COLORS[d.severity] || ''}`}>{d.severity}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">{signal?.rain_mm_hr ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{signal?.aqi ?? '—'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={autoTrigger ? 'text-emerald-400' : 'text-amber-400'}>{autoTrigger ? 'Enabled' : 'Review-first'}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-cyan-400">Monitoring</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}

