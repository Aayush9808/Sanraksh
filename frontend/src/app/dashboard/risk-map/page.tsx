"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { API_BASE } from "@/lib/config";

const DEMO_ZONES = [
  { zone: "Andheri West", lat: 19.136, lng: 72.826, risk: 0.82, active_workers: 243, claims_today: 12, type: "Heavy Rain" },
  { zone: "Bandra-Kurla", lat: 19.065, lng: 72.868, risk: 0.68, active_workers: 187, claims_today: 8, type: "Flooding" },
  { zone: "Koramangala", lat: 12.935, lng: 77.624, risk: 0.91, active_workers: 312, claims_today: 18, type: "Flooding" },
  { zone: "Saket, Delhi", lat: 28.524, lng: 77.207, risk: 0.44, active_workers: 156, claims_today: 4, type: "AQI Alert" },
  { zone: "Hitech City", lat: 17.445, lng: 78.380, risk: 0.35, active_workers: 98, claims_today: 2, type: "App Outage" },
  { zone: "T Nagar", lat: 13.042, lng: 80.234, risk: 0.25, active_workers: 77, claims_today: 1, type: "Curfew" },
  { zone: "Kothrud, Pune", lat: 18.508, lng: 73.807, risk: 0.57, active_workers: 134, claims_today: 6, type: "Heavy Rain" },
];

const RISK_COLOR = (r: number) => r >= 0.75 ? "#ff4444" : r >= 0.5 ? "#ffaa00" : "#00FF87";

export default function RiskMapPage() {
  const [selected, setSelected] = useState<typeof DEMO_ZONES[0] | null>(null);
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ zones: typeof DEMO_ZONES; onSelect: (z: typeof DEMO_ZONES[0]) => void }> | null>(null);

  useEffect(() => {
    import("@/components/RiskMapLeaflet").then(m => setMapComponent(() => m.default)).catch(() => {});
  }, []);

  const sorted = [...DEMO_ZONES].sort((a, b) => b.risk - a.risk);

  return (
    <div className="p-6 xl:p-8 max-w-[1600px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-8 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1.5">Geospatial intelligence</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Risk Map</h1>
        </div>
        <div className="flex items-center gap-6">
          {[["HIGH", "#ff4444"], ["MED", "#ffaa00"], ["LOW", "#00FF87"]].map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: color as string }} />
              <span className="mono-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_320px] gap-6">
        {/* Zone list */}
        <div>
          <div className="border-b border-[#1a1a1a] pb-3 mb-0">
            <p className="mono-label">Zone risk matrix — {DEMO_ZONES.length} zones monitored</p>
          </div>
          <table className="data-table">
            <thead><tr><th>Zone</th><th>Trigger type</th><th className="text-right">Workers</th><th className="text-right">Claims today</th><th>Risk score</th></tr></thead>
            <tbody>
              {sorted.map((z, i) => (
                <motion.tr key={z.zone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="cursor-pointer" onClick={() => setSelected(z)}>
                  <td className="text-white font-medium">{z.zone}</td>
                  <td className="font-mono text-[11px] text-[#555]">{z.type}</td>
                  <td className="font-mono text-[12px] text-right tabular-nums text-white">{z.active_workers}</td>
                  <td className="font-mono text-[12px] font-bold text-right tabular-nums" style={{ color: RISK_COLOR(z.risk) }}>{z.claims_today}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-[#1a1a1a] max-w-[120px]">
                        <div className="h-1 transition-all" style={{ width: `${z.risk * 100}%`, background: RISK_COLOR(z.risk) }} />
                      </div>
                      <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: RISK_COLOR(z.risk) }}>
                        {(z.risk * 100).toFixed(0)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail */}
        <div className="border-l border-[#1a1a1a] pl-6">
          {selected ? (
            <motion.div key={selected.zone} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="border-b border-[#1a1a1a] pb-3 mb-6 flex items-start justify-between">
                <p className="mono-label">Zone detail</p>
                <button onClick={() => setSelected(null)} className="font-mono text-[10px] text-[#444] hover:text-white transition-colors uppercase tracking-widest">Clear</button>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="mono-label mb-1">Zone</p>
                  <p className="text-base font-bold text-white">{selected.zone}</p>
                </div>
                <div>
                  <p className="mono-label mb-1">Active trigger</p>
                  <p className="text-sm text-white">{selected.type}</p>
                </div>
                <div>
                  <p className="mono-label mb-2">Risk score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[#1a1a1a]">
                      <div className="h-1.5 transition-all" style={{ width: `${selected.risk * 100}%`, background: RISK_COLOR(selected.risk) }} />
                    </div>
                    <span className="font-mono text-lg font-black" style={{ color: RISK_COLOR(selected.risk) }}>
                      {(selected.risk * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mono-label mb-1">Active workers</p>
                    <p className="font-mono text-xl font-black text-white">{selected.active_workers}</p>
                  </div>
                  <div>
                    <p className="mono-label mb-1">Claims today</p>
                    <p className="font-mono text-xl font-black" style={{ color: RISK_COLOR(selected.risk) }}>{selected.claims_today}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mono-label mb-1">Latitude</p>
                    <p className="font-mono text-sm text-white">{selected.lat.toFixed(3)}\u00b0N</p>
                  </div>
                  <div>
                    <p className="mono-label mb-1">Longitude</p>
                    <p className="font-mono text-sm text-white">{selected.lng.toFixed(3)}\u00b0E</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="py-16 text-center">
              <p className="mono-label">Select a zone to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
