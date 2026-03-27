"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Threat {
  id: string;
  type: string;
  worker_id?: string;
  worker_name?: string;
  score: number;
  flags: string[];
  status: string;
  detected_at: string;
}

const DEMO_THREATS: Threat[] = [
  { id: "THR-0021", type: "GPS Spoofing", worker_id: "W-5512", worker_name: "Unknown", score: 0.91, flags: ["GPS mismatch", "Route infeasible"], status: "blocked", detected_at: "2026-03-27 15:12" },
  { id: "THR-0020", type: "Frequency Abuse", worker_id: "W-3341", worker_name: "Aryan K.", score: 0.76, flags: ["Claims/week > 3x average", "Multiple zones"], status: "flagged", detected_at: "2026-03-27 14:02" },
  { id: "THR-0019", type: "Device Ring", worker_id: "W-7821", worker_name: "Demo User", score: 0.83, flags: ["Shared device fingerprint", "Coordinated timing"], status: "blocked", detected_at: "2026-03-27 11:45" },
  { id: "THR-0018", type: "Collusion Cluster", worker_id: "GRP-001", worker_name: "3-worker cluster", score: 0.69, flags: ["Simultaneous claims", "Same zone", "Peer overlap"], status: "review", detected_at: "2026-03-26 20:30" },
];

const STATUS = { blocked: "text-[#ff4444]", flagged: "text-[#ffaa00]", review: "text-[#4d9eff]" } as const;

export default function ThreatDefensePage() {
  const [threats, setThreats] = useState<Threat[]>(DEMO_THREATS);
  const [loading, setLoading] = useState(false);

  const highRisk = threats.filter(t => t.score >= 0.75).length;

  return (
    <div className="p-6 xl:p-8 max-w-[1400px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-8 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1.5">Fraud prevention</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Threat Defense</h1>
        </div>
        {highRisk > 0 && (
          <div className="flex items-center gap-2">
            <span className="dot-neg" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#ff4444]">{highRisk} high-risk threats</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-0 border-t border-l border-[#1a1a1a] mb-8">
        {[
          { label: "Total threats", value: threats.length, accent: false },
          { label: "Blocked today", value: threats.filter(t => t.status === "blocked").length, accent: false },
          { label: "High-risk score", value: highRisk, accent: true },
        ].map((s, i) => (
          <div key={s.label} className="border-r border-b border-[#1a1a1a] p-5">
            <div className={`font-mono text-2xl font-black tabular-nums leading-none ${s.accent ? "text-[#ff4444]" : "text-white"}`}>{s.value}</div>
            <div className="mono-label mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Threats table */}
      <div>
        <div className="border-b border-[#1a1a1a] pb-3 mb-0">
          <p className="mono-label">Active threats</p>
        </div>
        <div className="border-b border-[#1a1a1a]">
          {threats.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="border-b border-[#1a1a1a] py-5 grid md:grid-cols-[140px_1fr_200px_120px] gap-4 items-start">
              <div>
                <div className="font-mono text-[11px] text-[#555] mb-1">{t.id}</div>
                <div className="font-mono text-[11px] text-[#333]">{t.detected_at}</div>
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-1">{t.type}</div>
                <div className="font-mono text-[11px] text-[#555] mb-2">{t.worker_name} ({t.worker_id})</div>
                <div className="flex flex-wrap gap-1.5">
                  {t.flags.map(f => (
                    <span key={f} className="font-mono text-[9px] tracking-wide uppercase border border-[#2a2a2a] text-[#555] px-2 py-0.5">{f}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex-1 h-1 bg-[#1a1a1a]">
                    <div className={`h-1 ${t.score >= 0.75 ? "bg-[#ff4444]" : t.score >= 0.5 ? "bg-[#ffaa00]" : "bg-[#00FF87]"}`}
                      style={{ width: `${t.score * 100}%` }} />
                  </div>
                  <span className={`font-mono text-xs font-bold tabular-nums ${t.score >= 0.75 ? "text-[#ff4444]" : t.score >= 0.5 ? "text-[#ffaa00]" : "text-[#00FF87]"}`}>
                    {(t.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mono-label">Risk score</div>
              </div>
              <div className="text-right md:text-left">
                <span className={`font-mono text-[9px] tracking-widest font-bold ${STATUS[t.status as keyof typeof STATUS] || "text-[#777]"}`}>
                  {t.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
