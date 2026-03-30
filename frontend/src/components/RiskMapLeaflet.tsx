"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix missing default marker icons in Webpack / Next.js builds
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface Zone {
  zone: string;
  lat: number;
  lng: number;
  risk: number;
  active_workers?: number;
  claims_today?: number;
  type?: string;
  city?: string;
  risk_score?: number;
  risk_level?: string;
  color?: string;
  weather_risk?: number;
  traffic_risk?: number;
  disruptions_per_month?: number;
}

interface Props {
  zones: Zone[];
  onSelect: (z: Zone) => void;
}

const RISK_COLOR = (r: number) =>
  r >= 0.75 ? "#EF4444" : r >= 0.5 ? "#F59E0B" : "#10B981";

function FitBounds({ zones }: { zones: Zone[] }) {
  const map = useMap();
  useEffect(() => {
    if (zones.length > 0) {
      const bounds = L.latLngBounds(zones.map(z => [z.lat, z.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, zones]);
  return null;
}

export default function RiskMapLeaflet({ zones, onSelect }: Props) {
  const normalizedZones: Zone[] = zones.map(z => ({
    ...z,
    risk: z.risk ?? z.risk_score ?? 0.5,
  }));

  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ width: "100%", height: "100%", minHeight: 400 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {normalizedZones.map((z, i) => {
        const riskVal = z.risk;
        const color = RISK_COLOR(riskVal);
        const radius = 14 + riskVal * 18;
        return (
          <CircleMarker
            key={`${z.zone}-${i}`}
            center={[z.lat, z.lng]}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.45, weight: 2 }}
            eventHandlers={{ click: () => onSelect(z) }}
          >
            <Popup>
              <div style={{ minWidth: 180, fontFamily: "sans-serif" }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {z.zone || z.city}
                </div>
                <div style={{ color, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {(riskVal * 100).toFixed(0)}% risk
                </div>
                {z.active_workers !== undefined && (
                  <div style={{ fontSize: 12, color: "#64748B" }}>{z.active_workers.toLocaleString()} workers</div>
                )}
                {z.claims_today !== undefined && (
                  <div style={{ fontSize: 12, color: "#64748B" }}>{z.claims_today} claims today</div>
                )}
                {z.disruptions_per_month !== undefined && (
                  <div style={{ fontSize: 12, color: "#64748B" }}>{z.disruptions_per_month} disruptions/month</div>
                )}
                {z.weather_risk !== undefined && (
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                    Weather risk: {(z.weather_risk * 100).toFixed(0)}%
                  </div>
                )}
                {z.type && (
                  <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{z.type}</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      <FitBounds zones={normalizedZones} />
    </MapContainer>
  );
}
