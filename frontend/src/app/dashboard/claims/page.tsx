"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminSidebar from "../../../components/AdminSidebar";
import { API_BASE } from "../../../lib/config";

type ClaimRow = {
  id: string;
  name: string;
  initials: string;
  zone: string;
  type: string;
  amount: string;
  status: string;
  time: string;
  claim_number: string;
  fraud_score: number;
  decision_reasons: string[];
};

const MOCK_CLAIMS: ClaimRow[] = [
  { id: "C001", name: "Rajesh Kumar",   initials: "RK", zone: "Andheri West",    type: "Weather",  amount: "₹800",   status: "PAID",       time: "2m ago",  claim_number: "CLM-20241208-00001", fraud_score: 0.04, decision_reasons: ["ROUTE_AUTO_PAY", "FRAUD_SCORE_LOW"] },
  { id: "C002", name: "Sunita Kumari",  initials: "SK", zone: "Bandra-Kurla",   type: "Weather",  amount: "₹800",   status: "PAID",       time: "5m ago",  claim_number: "CLM-20241208-00002", fraud_score: 0.07, decision_reasons: ["ROUTE_AUTO_PAY", "LOCATION_MATCH"] },
  { id: "C003", name: "Ajay Patel",     initials: "AP", zone: "Pune Central",   type: "Weather",  amount: "₹800",   status: "PROCESSING", time: "8m ago",  claim_number: "CLM-20241208-00003", fraud_score: 0.32, decision_reasons: ["ROUTE_MANUAL_REVIEW", "FRAUD_SCORE_MEDIUM"] },
  { id: "C004", name: "Meera Sharma",   initials: "MS", zone: "Delhi NCR",      type: "Flood",    amount: "₹800",   status: "REVIEW",     time: "12m ago", claim_number: "CLM-20241208-00004", fraud_score: 0.45, decision_reasons: ["ROUTE_MANUAL_REVIEW", "WEAK_PEER_CORROBORATION"] },
  { id: "C005", name: "Deepak Raut",    initials: "DR", zone: "Koramangala",    type: "Weather",  amount: "₹800",   status: "PAID",       time: "15m ago", claim_number: "CLM-20241208-00005", fraud_score: 0.11, decision_reasons: ["ROUTE_AUTO_PAY", "FRAUD_SCORE_LOW"] },
  { id: "C006", name: "Priya Singh",    initials: "PS", zone: "Andheri East",   type: "Weather",  amount: "₹800",   status: "PAID",       time: "22m ago", claim_number: "CLM-20241208-00006", fraud_score: 0.05, decision_reasons: ["ROUTE_AUTO_PAY", "PEER_CORROBORATION_OK"] },
  { id: "C007", name: "Kiran Naik",     initials: "KN", zone: "Thane West",     type: "Weather",  amount: "₹800",   status: "PROCESSING", time: "31m ago", claim_number: "CLM-20241208-00007", fraud_score: 0.28, decision_reasons: ["ROUTE_MANUAL_REVIEW", "MODERATE_30D_CLAIM_FREQUENCY"] },
  { id: "C008", name: "Rahul Desai",    initials: "RD", zone: "Bandra West",    type: "Weather",  amount: "₹800",   status: "REVIEW",     time: "45m ago", claim_number: "CLM-20241208-00008", fraud_score: 0.41, decision_reasons: ["ROUTE_MANUAL_REVIEW", "FRAUD_SCORE_MEDIUM"] },
  { id: "C009", name: "Fatima Sheikh",  initials: "FS", zone: "Jogeshwari",     type: "Weather",  amount: "₹800",   status: "PAID",       time: "1h ago",  claim_number: "CLM-20241208-00009", fraud_score: 0.08, decision_reasons: ["ROUTE_AUTO_PAY", "HIGH_EVENT_CONFIDENCE"] },
  { id: "C010", name: "Santosh Yadav",  initials: "SY", zone: "Powai",          type: "Weather",  amount: "₹800",   status: "PAID",       time: "1h ago",  claim_number: "CLM-20241208-00010", fraud_score: 0.03, decision_reasons: ["ROUTE_AUTO_PAY", "FRAUD_SCORE_LOW"] },
];

const avatarColors: Record<string, string> = {
  RK: "bg-cyan-400/20 text-cyan-300", SK: "bg-violet-400/20 text-violet-300",
  AP: "bg-emerald-400/20 text-emerald-300", MS: "bg-pink-400/20 text-pink-300",
  DR: "bg-amber-400/20 text-amber-300", PS: "bg-blue-400/20 text-blue-300",
  KN: "bg-teal-400/20 text-teal-300", RD: "bg-orange-400/20 text-orange-300",
  FS: "bg-rose-400/20 text-rose-300", SY: "bg-indigo-400/20 text-indigo-300",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-emerald-400/20 text-emerald-300 border border-emerald-300/30",
    PROCESSING: "bg-amber-400/20 text-amber-300 border border-amber-300/30",
    PENDING: "bg-amber-400/20 text-amber-300 border border-amber-300/30",
    REVIEW: "bg-red-400/20 text-red-300 border border-red-300/30",
    REJECTED: "bg-red-400/20 text-red-300 border border-red-300/30",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${map[status] ?? ""}`}>{status}</span>;
}

export default function ClaimsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [allClaims, setAllClaims] = useState<ClaimRow[]>(MOCK_CLAIMS);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadClaims() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/claims/all?limit=50`);
        if (res.ok) {
          const data = await res.json();
          if (data.claims?.length) {
            setAllClaims(data.claims.map((c: any, i: number) => ({
              id: c.id, name: c.worker_name || "Worker", initials: (c.worker_name || "W").split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0,2),
              zone: c.zone || "—", type: "Weather", amount: `₹${c.amount || 800}`,
              status: c.status?.toUpperCase() || "PAID", time: c.created_at ? new Date(c.created_at).toLocaleDateString() : "—",
              claim_number: c.claim_number, fraud_score: c.fraud_score || 0,
              decision_reasons: c.decision_reasons || [],
            })));
          }
        }
      } catch {}
      setLoading(false);
    }
    loadClaims();
  }, []);

  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/v1/claims/${id}/approve`, { method: "PUT" });
      if (res.ok) {
        setAllClaims(prev => prev.map(c => c.id === id ? { ...c, status: "PAID" } : c));
      }
    } catch {}
    setApprovingId(null);
  }

  async function handleReject(id: string) {
    setApprovingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/v1/claims/${id}/reject`, { method: "PUT" });
      if (res.ok) {
        setAllClaims(prev => prev.map(c => c.id === id ? { ...c, status: "REJECTED" } : c));
      }
    } catch {}
    setApprovingId(null);
  }

  const filters = [
    { label: "All",      count: allClaims.length },
    { label: "PAID",     count: allClaims.filter(c => c.status === "PAID").length },
    { label: "PENDING",  count: allClaims.filter(c => c.status === "PENDING" || c.status === "PROCESSING").length },
    { label: "REVIEW",   count: allClaims.filter(c => c.status === "REVIEW").length },
  ];

  const filtered = activeFilter === "All" ? allClaims
    : activeFilter === "PENDING" ? allClaims.filter(c => c.status === "PENDING" || c.status === "PROCESSING")
    : allClaims.filter(c => c.status === activeFilter);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-60 flex-1 px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <a href="/dashboard" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
              ← Dashboard
            </a>
            <h1 className="text-4xl font-black text-white">Claims Management</h1>
            <p className="mt-1 text-slate-400">Review, approve, and track all worker claims in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300">
              Total Today: ₹18,400
            </div>
            <button className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              Export CSV ↗
            </button>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                activeFilter === f.label
                  ? "border border-cyan-300/30 bg-cyan-400/20 text-cyan-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {f.label === "All" ? "All" : f.label.charAt(0) + f.label.slice(1).toLowerCase()}{" "}
              <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">{f.count}</span>
            </button>
          ))}
        </motion.div>

        {/* Claims Table */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/20">
          <div className="border-b border-white/10 px-6 py-4">
            <h2 className="font-bold text-white">
              {filtered.length} claim{filtered.length !== 1 ? "s" : ""} — {activeFilter === "All" ? "all statuses" : activeFilter.toLowerCase()}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["ID", "Worker", "Zone", "Type", "Amount", "Status", "Audit", "Time", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((claim) => (
                  <tr key={claim.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 text-sm font-mono text-cyan-300">#{claim.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${avatarColors[claim.initials]}`}>
                          {claim.initials}
                        </span>
                        <span className="text-sm font-semibold text-white">{claim.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-300">{claim.zone}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">{claim.type}</td>
                    <td className="px-4 py-4 text-sm font-bold text-white">{claim.amount}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {claim.decision_reasons.slice(0, 2).map((reason) => (
                          <span key={reason} className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">
                            {reason.replaceAll("_", " ")}
                          </span>
                        ))}
                        {claim.decision_reasons.length > 2 && (
                          <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">
                            +{claim.decision_reasons.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">{claim.time}</td>
                    <td className="px-4 py-4">
                      {claim.status === "REVIEW" ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(claim.id)} disabled={approvingId === claim.id}
                            className="rounded-lg border border-emerald-300/30 bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300 transition-colors hover:bg-emerald-400/30 disabled:opacity-60">
                            Approve
                          </button>
                          <button onClick={() => handleReject(claim.id)} disabled={approvingId === claim.id}
                            className="rounded-lg border border-red-300/30 bg-red-400/20 px-3 py-1 text-xs font-bold text-red-300 transition-colors hover:bg-red-400/30 disabled:opacity-60">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total Claims", value: "23", color: "text-white" },
            { label: "Paid",         value: "18", color: "text-emerald-300" },
            { label: "Processing",   value: "3",  color: "text-amber-300" },
            { label: "Under Review", value: "2",  color: "text-red-300" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center shadow-lg shadow-black/20">
              <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="mt-1 text-sm text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
