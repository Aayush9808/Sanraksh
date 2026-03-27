"use client";
// Leaflet map stub — replace with real react-leaflet implementation if needed
import React from "react";

interface Zone {
  zone: string;
  lat: number;
  lng: number;
  risk: number;
  active_workers: number;
  claims_today: number;
  type: string;
}

interface Props {
  zones: Zone[];
  onSelect: (z: Zone) => void;
}

const RISK_COLOR = (r: number) =>
  r >= 0.75 ? "#ff4444" : r >= 0.5 ? "#ffaa00" : "#00FF87";

export default function RiskMapLeaflet({ zones, onSelect }: Props) {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#080808] border border-[#1a1a1a] flex flex-col items-center justify-center gap-6 p-8">
      <p className="mono-label text-center">Interactive map — install react-leaflet to enable</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full max-w-3xl">
        {zones.map((z) => (
          <button
            key={z.zone}
            onClick={() => onSelect(z)}
            className="text-left p-3 border border-[#1a1a1a] hover:border-[#333] transition-colors"
            style={{ borderLeftColor: RISK_COLOR(z.risk), borderLeftWidth: 3 }}
          >
            <p className="text-white text-xs font-bold mb-1">{z.zone}</p>
            <p className="mono-label">{z.type}</p>
            <p style={{ color: RISK_COLOR(z.risk) }} className="text-xs font-mono font-bold mt-1">
              {Math.round(z.risk * 100)}% risk
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
