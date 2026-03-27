"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Policy {
  id: string;
  worker_name?: string;
  platform?: string;
  city?: string;
  zone?: string;
  weekly_premium?: number;
  total_coverage?: number;
  status?: string;
  valid_until?: string;
}

const DEMO: Policy[] = [
  { id: "POL-0091", worker_name: "Ravi Kumar", platform: "Zomato", city: "Mumbai", zone: "Andheri West", weekly_premium: 43, total_coverage: 6000, status: "active", valid_until: "2026-12-31" },
  { id: "POL-0090", worker_name: "Priya Singh", platform: "Swiggy", city: "Mumbai", zone: "Kurla", weekly_premium: 43, total_coverage: 6000, status: "active", valid_until: "2026-12-31" },
  { id: "POL-0087", worker_name: "Neha Patel", platform: "Zepto", city: "Delhi", zone: "Saket", weekly_premium: 43, total_coverage: 6000, status: "paused", valid_until: "2026-11-15" },
  { id: "POL-0085", worker_name: "Suresh M.", platform: "Zomato", city: "Bengaluru", zone: "Koramangala", weekly_premium: 43, total_coverage: 6000, status: "active", valid_until: "2026-12-31" },
];

const STATUS = { active: "text-[#00FF87]", paused: "text-[#ffaa00]", expired: "text-[#ff4444]" } as const;

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gigarmor_token");
    fetch(`${API_BASE}/api/v1/policies/all`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    })
      .then(r => r.json())
      .then(d => setPolicies(Array.isArray(d) ? d : DEMO))
      .catch(() => setPolicies(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const active = policies.filter(p => p.status === "active").length;

  return (
    <div className="p-6 xl:p-8 max-w-[1400px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-6 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1.5">Policy management</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Policies</h1>
        </div>
        <div className="flex gap-8">
          <div className="text-right">
            <div className="font-mono text-xl font-black text-white">{policies.length}</div>
            <div className="mono-label">total issued</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xl font-black text-[#00FF87]">{active}</div>
            <div className="mono-label">active</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><p className="mono-label animate-pulse">Loading policies...</p></div>
      ) : (
        <table className="data-table">
          <thead><tr><th>Policy ID</th><th>Worker</th><th>Platform</th><th>City / Zone</th><th className="text-right">Premium/wk</th><th className="text-right">Coverage</th><th>Valid until</th><th className="text-right">Status</th></tr></thead>
          <tbody>
            {policies.map((p, i) => (
              <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                <td className="font-mono text-[11px] text-[#555]">{p.id}</td>
                <td className="text-white text-[13px] font-medium">{p.worker_name}</td>
                <td className="font-mono text-[11px] text-[#555]">{p.platform}</td>
                <td className="font-mono text-[11px] text-[#555]">{p.city}{p.zone ? ` / ${p.zone}` : ""}</td>
                <td className="font-mono text-[12px] text-right tabular-nums text-white">&#8377;{p.weekly_premium}</td>
                <td className="font-mono text-[12px] font-bold text-right tabular-nums text-[#00FF87]">&#8377;{p.total_coverage?.toLocaleString()}</td>
                <td className="font-mono text-[11px] text-[#444]">{p.valid_until}</td>
                <td className="text-right">
                  <span className={`font-mono text-[9px] tracking-widest ${STATUS[p.status as keyof typeof STATUS] || "text-[#777]"}`}>
                    {(p.status || "").toUpperCase()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
