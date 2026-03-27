"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Trigger {
  id: string;
  type: string;
  zone: string;
  triggered_at: string;
  status: string;
  payout_amount?: number;
  details?: string;
}

const DEMO_TRIGGERS: Trigger[] = [
  { id: "TRG-0034", type: "Heavy Rain", zone: "Andheri West", triggered_at: "2026-03-26 14:22", status: "paid", payout_amount: 800, details: "Rainfall 58mm/hr — exceeded threshold" },
  { id: "TRG-0031", type: "App Outage", zone: "Andheri West", triggered_at: "2026-03-20 11:05", status: "paid", payout_amount: 500, details: "Zomato platform down 4.2 hours" },
  { id: "TRG-0027", type: "Flood Alert", zone: "Kurla", triggered_at: "2026-03-15 09:30", status: "rejected", details: "IMD alert not applicable to registered zone" },
  { id: "TRG-0022", type: "Heavy Rain", zone: "Andheri West", triggered_at: "2026-03-08 16:45", status: "paid", payout_amount: 800, details: "Rainfall 62mm/hr" },
  { id: "TRG-0018", type: "Pollution", zone: "Andheri West", triggered_at: "2026-02-28 07:00", status: "review", details: "AQI 412 — under review" },
];

const STATUS_MAP = {
  paid: { label: "PAID", cls: "text-[#00FF87]" },
  rejected: { label: "REJECTED", cls: "text-[#ff4444]" },
  review: { label: "REVIEW", cls: "text-[#ffaa00]" },
  pending: { label: "PENDING", cls: "text-[#777]" },
} as const;

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gigarmor_token");
    fetch(`${API_BASE}/api/v1/triggers/my`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    })
      .then(r => r.json())
      .then(d => setTriggers(Array.isArray(d) ? d : DEMO_TRIGGERS))
      .catch(() => setTriggers(DEMO_TRIGGERS))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = triggers.filter(t => t.status === "paid").reduce((s, t) => s + (t.payout_amount || 0), 0);
  const countPaid = triggers.filter(t => t.status === "paid").length;

  return (
    <div className="p-6 xl:p-8 max-w-[1200px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-8 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1.5">Claim history</p>
          <h1 className="text-2xl font-black text-white tracking-tight">My Triggers</h1>
        </div>
        <div className="text-right hidden md:block">
          <div className="font-mono text-xl font-black text-[#00FF87] tabular-nums">\u20b9{totalPaid.toLocaleString("en-IN")}</div>
          <div className="mono-label">total received</div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-0 border-t border-l border-[#1a1a1a] mb-8">
        {[
          { label: "Total triggers", value: triggers.length, accent: false },
          { label: "Paid claims", value: countPaid, accent: true },
          { label: "Total received", value: "\u20b9" + totalPaid.toLocaleString("en-IN"), accent: true },
        ].map((s, i) => (
          <div key={s.label} className="border-r border-b border-[#1a1a1a] p-5">
            <div className={`font-mono text-2xl font-black tabular-nums leading-none ${s.accent ? "text-[#00FF87]" : "text-white"}`}>{s.value}</div>
            <div className="mono-label mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center"><p className="mono-label animate-pulse">Loading triggers...</p></div>
      ) : (
        <div>
          <div className="border-b border-[#1a1a1a] pb-3 mb-0">
            <p className="mono-label">Trigger log</p>
          </div>
          <table className="data-table">
            <thead><tr><th>ID</th><th>Type</th><th>Zone</th><th>Date &amp; Time</th><th>Details</th><th className="text-right">Amount</th><th className="text-right">Status</th></tr></thead>
            <tbody>
              {triggers.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td className="font-mono text-[11px] text-[#555]">{t.id}</td>
                  <td className="text-white text-[13px] font-medium">{t.type}</td>
                  <td className="font-mono text-[11px] text-[#555]">{t.zone}</td>
                  <td className="font-mono text-[11px] text-[#444]">{t.triggered_at}</td>
                  <td className="font-mono text-[11px] text-[#444] max-w-[200px]">{t.details}</td>
                  <td className="font-mono text-[12px] font-bold text-right tabular-nums text-white">
                    {t.payout_amount ? "\u20b9" + t.payout_amount : "\u2014"}
                  </td>
                  <td className="text-right">
                    <span className={`font-mono text-[9px] tracking-widest ${STATUS_MAP[t.status as keyof typeof STATUS_MAP]?.cls || "text-[#777]"}`}>
                      {STATUS_MAP[t.status as keyof typeof STATUS_MAP]?.label || t.status.toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {triggers.length === 0 && (
            <div className="py-16 text-center border-b border-[#1a1a1a]">
              <p className="mono-label">No triggers yet</p>
              <p className="font-mono text-[10px] text-[#2a2a2a] mt-2">Triggers fire automatically when disruptions are detected in your zone</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
