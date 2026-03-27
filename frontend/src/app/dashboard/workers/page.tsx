"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Worker {
  id: string;
  name?: string;
  phone?: string;
  platform?: string;
  city?: string;
  zone?: string;
  policy_status?: string;
  total_claims?: number;
  joined_at?: string;
}

const DEMO_WORKERS: Worker[] = [
  { id: "W001", name: "Ravi Kumar", phone: "+91 98765 43210", platform: "Zomato", city: "Mumbai", zone: "Andheri West", policy_status: "active", total_claims: 3, joined_at: "2025-09-12" },
  { id: "W002", name: "Priya Singh", phone: "+91 87654 32109", platform: "Swiggy", city: "Mumbai", zone: "Kurla", policy_status: "active", total_claims: 1, joined_at: "2025-10-08" },
  { id: "W003", name: "Amit Rao", phone: "+91 76543 21098", platform: "Blinkit", city: "Mumbai", zone: "Bandra", policy_status: "active", total_claims: 0, joined_at: "2025-11-15" },
  { id: "W004", name: "Neha Patel", phone: "+91 65432 10987", platform: "Zepto", city: "Delhi", zone: "Saket", policy_status: "paused", total_claims: 2, joined_at: "2025-08-03" },
  { id: "W005", name: "Suresh M.", phone: "+91 54321 09876", platform: "Zomato", city: "Bengaluru", zone: "Koramangala", policy_status: "active", total_claims: 5, joined_at: "2025-07-21" },
  { id: "W006", name: "Kavya L.", phone: "+91 43210 98765", platform: "Swiggy", city: "Pune", zone: "Kothrud", policy_status: "active", total_claims: 2, joined_at: "2025-12-01" },
];

const STATUS_MAP = {
  active: { label: "ACTIVE", cls: "text-[#00FF87]" },
  paused: { label: "PAUSED", cls: "text-[#ffaa00]" },
  suspended: { label: "SUSPENDED", cls: "text-[#ff4444]" },
} as const;

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("gigarmor_token");
    fetch(`${API_BASE}/api/v1/users/all`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    })
      .then(r => r.json())
      .then(d => setWorkers(Array.isArray(d) ? d : DEMO_WORKERS))
      .catch(() => setWorkers(DEMO_WORKERS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = workers.filter(w =>
    !search || [w.name, w.phone, w.platform, w.city, w.zone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 xl:p-8 max-w-[1400px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="mono-label mb-1.5">Worker registry</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Workers</h1>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="font-mono text-xl font-black text-white">{workers.length.toLocaleString("en-IN")}</div>
            <div className="mono-label">total registered</div>
          </div>
          <div>
            <div className="font-mono text-xl font-black text-[#00FF87]">{workers.filter(w => w.policy_status === "active").length.toLocaleString("en-IN")}</div>
            <div className="mono-label">active policies</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="field-label">Search workers</label>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name, phone, platform, city..."
          className="field max-w-[420px]" />
      </div>

      {loading ? (
        <div className="py-20 text-center"><p className="mono-label animate-pulse">Loading workers...</p></div>
      ) : (
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Platform</th><th>City / Zone</th><th className="text-right">Claims</th><th>Joined</th><th className="text-right">Policy</th></tr></thead>
          <tbody>
            {filtered.map((w, i) => (
              <motion.tr key={w.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <td className="font-mono text-[11px] text-[#555]">{w.id}</td>
                <td className="text-white text-[13px] font-medium">{w.name}</td>
                <td className="font-mono text-[11px] text-[#555]">{w.phone}</td>
                <td className="font-mono text-[11px] text-[#555]">{w.platform}</td>
                <td className="font-mono text-[11px] text-[#555]">{w.city}{w.zone ? ` / ${w.zone}` : ""}</td>
                <td className="font-mono text-[12px] text-right tabular-nums text-white">{w.total_claims ?? 0}</td>
                <td className="font-mono text-[11px] text-[#444]">{w.joined_at}</td>
                <td className="text-right">
                  <span className={`font-mono text-[9px] tracking-widest ${STATUS_MAP[w.policy_status as keyof typeof STATUS_MAP]?.cls || "text-[#777]"}`}>
                    {STATUS_MAP[w.policy_status as keyof typeof STATUS_MAP]?.label || (w.policy_status || "").toUpperCase()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}

      {filtered.length === 0 && !loading && (
        <div className="py-12 text-center border-b border-[#1a1a1a]">
          <p className="mono-label">No workers found matching &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  );
}
