"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Claim {
  id: string;
  worker_name?: string;
  platform?: string;
  trigger_type?: string;
  zone?: string;
  amount?: number;
  status?: string;
  created_at?: string;
  fraud_score?: number;
  audit_code?: string;
}

const DEMO_CLAIMS: Claim[] = [
  { id: "CLM-8821", worker_name: "Ravi Kumar", platform: "Zomato", trigger_type: "Heavy Rain", zone: "Andheri West", amount: 800, status: "approved", created_at: "2026-03-27 14:22", fraud_score: 0.06, audit_code: "AUD-7AF2" },
  { id: "CLM-8820", worker_name: "Priya Singh", platform: "Swiggy", trigger_type: "Flood Alert", zone: "Kurla", amount: 1200, status: "approved", created_at: "2026-03-27 14:08", fraud_score: 0.03, audit_code: "AUD-5BC1" },
  { id: "CLM-8819", worker_name: "Amit Rao", platform: "Blinkit", trigger_type: "App Outage", zone: "Bandra", amount: 500, status: "review", created_at: "2026-03-27 13:55", fraud_score: 0.31, audit_code: "AUD-2DE8" },
  { id: "CLM-8818", worker_name: "Neha Patel", platform: "Zepto", trigger_type: "AQI Alert", zone: "Dadar", amount: 600, status: "approved", created_at: "2026-03-27 13:40", fraud_score: 0.09, audit_code: "AUD-4FG3" },
  { id: "CLM-8817", worker_name: "Suresh M.", platform: "Zomato", trigger_type: "Heavy Rain", zone: "Powai", amount: 800, status: "rejected", created_at: "2026-03-27 13:31", fraud_score: 0.78, audit_code: "AUD-9HK6" },
  { id: "CLM-8816", worker_name: "Kavya L.", platform: "Swiggy", trigger_type: "Curfew", zone: "Goregaon", amount: 900, status: "approved", created_at: "2026-03-27 13:18", fraud_score: 0.04, audit_code: "AUD-1MN7" },
  { id: "CLM-8815", worker_name: "Rohit D.", platform: "Zomato", trigger_type: "Heavy Rain", zone: "Malad", amount: 800, status: "review", created_at: "2026-03-27 13:05", fraud_score: 0.24, audit_code: "AUD-3PQ2" },
  { id: "CLM-8814", worker_name: "Arjun B.", platform: "Amazon", trigger_type: "Flood Alert", zone: "Lower Parel", amount: 1200, status: "approved", created_at: "2026-03-27 12:50", fraud_score: 0.07, audit_code: "AUD-6RS9" },
];

const STATUS_MAP = {
  approved: { label: "APPROVED", cls: "text-[#00FF87]" },
  rejected: { label: "REJECTED", cls: "text-[#ff4444]" },
  review: { label: "REVIEW", cls: "text-[#ffaa00]" },
  pending: { label: "PENDING", cls: "text-[#777]" },
} as const;

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "review" | "approved" | "rejected">("all");
  const [selected, setSelected] = useState<Claim | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("gigarmor_token");
    fetch(`${API_BASE}/api/v1/claims/all`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    })
      .then(r => r.json())
      .then(d => setClaims(Array.isArray(d) ? d : DEMO_CLAIMS))
      .catch(() => setClaims(DEMO_CLAIMS))
      .finally(() => setLoading(false));
  }, []);

  async function handleAction(claimId: string, action: "approve" | "reject") {
    setActionLoading(true);
    const token = localStorage.getItem("gigarmor_token");
    try {
      await fetch(`${API_BASE}/api/v1/claims/${claimId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(4000),
      });
    } catch {}
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: action === "approve" ? "approved" : "rejected" } : c));
    setSelected(prev => prev ? { ...prev, status: action === "approve" ? "approved" : "rejected" } : null);
    setActionLoading(false);
  }

  const filtered = filter === "all" ? claims : claims.filter(c => c.status === filter);
  const pendingReview = claims.filter(c => c.status === "review").length;

  return (
    <div className="p-6 xl:p-8 flex gap-6 max-w-[1600px]">
      <div className="flex-1 min-w-0">
        <div className="border-b border-[#1a1a1a] pb-5 mb-6 flex items-end justify-between">
          <div>
            <p className="mono-label mb-1.5">Claim management</p>
            <h1 className="text-2xl font-black text-white tracking-tight">Claims</h1>
          </div>
          {pendingReview > 0 && (
            <div className="flex items-center gap-2">
              <span className="dot-warn" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#ffaa00]">{pendingReview} pending review</span>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 border border-[#1a1a1a] mb-6 w-fit">
          {(["all", "review", "approved", "rejected"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 font-mono text-[10px] tracking-widest uppercase border-r border-[#1a1a1a] last:border-r-0 transition-colors ${
                filter === f ? "bg-[#1a1a1a] text-white" : "text-[#444] hover:text-[#777]"
              }`}>
              {f} {f === "all" ? `(${claims.length})` : `(${claims.filter(c => c.status === f).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center"><p className="mono-label animate-pulse">Loading claims...</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>ID</th><th>Worker</th><th>Platform</th><th>Trigger</th><th>Zone</th><th className="text-right">Amount</th><th className="text-right">Fraud Score</th><th className="text-right">Status</th></tr></thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="cursor-pointer" onClick={() => setSelected(c)}>
                  <td className="font-mono text-[11px] text-[#555]">{c.id}</td>
                  <td className="text-white text-[13px] font-medium">{c.worker_name}</td>
                  <td className="font-mono text-[11px] text-[#555]">{c.platform}</td>
                  <td className="font-mono text-[11px] text-[#555]">{c.trigger_type}</td>
                  <td className="font-mono text-[11px] text-[#555]">{c.zone}</td>
                  <td className="font-mono text-[12px] font-bold text-right tabular-nums text-white">&#8377;{c.amount?.toLocaleString()}</td>
                  <td className="text-right">
                    <span className={`font-mono text-[11px] tabular-nums ${
                      (c.fraud_score || 0) > 0.5 ? "text-[#ff4444]" : (c.fraud_score || 0) > 0.2 ? "text-[#ffaa00]" : "text-[#00FF87]"
                    }`}>{((c.fraud_score || 0) * 100).toFixed(0)}%</span>
                  </td>
                  <td className="text-right">
                    <span className={`font-mono text-[9px] tracking-widest ${STATUS_MAP[c.status as keyof typeof STATUS_MAP]?.cls || "text-[#777]"}`}>
                      {STATUS_MAP[c.status as keyof typeof STATUS_MAP]?.label || (c.status || "").toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            className="w-[320px] shrink-0 border-l border-[#1a1a1a] pl-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="mono-label mb-1">Claim detail</p>
                <div className="font-mono text-sm font-black text-white">{selected.id}</div>
              </div>
              <button onClick={() => setSelected(null)} className="font-mono text-[10px] text-[#444] hover:text-white transition-colors uppercase tracking-widest">Close</button>
            </div>

            <div className="space-y-4 border-t border-[#1a1a1a] pt-5">
              {[
                { label: "Worker", value: selected.worker_name },
                { label: "Platform", value: selected.platform },
                { label: "Trigger", value: selected.trigger_type },
                { label: "Zone", value: selected.zone },
                { label: "Amount", value: "&#8377;" + selected.amount?.toLocaleString() },
                { label: "Filed at", value: selected.created_at },
                { label: "Audit code", value: selected.audit_code },
              ].map(item => (
                <div key={item.label}>
                  <p className="mono-label mb-1">{item.label}</p>
                  <p className="text-sm text-white font-medium" dangerouslySetInnerHTML={{ __html: item.value || "-" }} />
                </div>
              ))}

              <div>
                <p className="mono-label mb-2">Fraud score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1 bg-[#1a1a1a]">
                    <div className={`h-1 transition-all ${(selected.fraud_score || 0) > 0.5 ? "bg-[#ff4444]" : (selected.fraud_score || 0) > 0.2 ? "bg-[#ffaa00]" : "bg-[#00FF87]"}`}
                      style={{ width: `${(selected.fraud_score || 0) * 100}%` }} />
                  </div>
                  <span className="font-mono text-xs text-white">{((selected.fraud_score || 0) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {selected.status === "review" && (
              <div className="border-t border-[#1a1a1a] pt-5 flex gap-3">
                <button onClick={() => handleAction(selected.id, "approve")} disabled={actionLoading}
                  className="flex-1 bg-[#00FF87] text-black font-mono text-[10px] font-bold tracking-widest uppercase py-3 hover:bg-white transition-colors disabled:opacity-40">
                  APPROVE
                </button>
                <button onClick={() => handleAction(selected.id, "reject")} disabled={actionLoading}
                  className="flex-1 border border-[#ff4444] text-[#ff4444] font-mono text-[10px] font-bold tracking-widest uppercase py-3 hover:bg-[#ff4444] hover:text-black transition-all disabled:opacity-40">
                  REJECT
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
