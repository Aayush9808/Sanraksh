"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Policy {
  policy_number?: string;
  status?: string;
  platform?: string;
  city?: string;
  zone?: string;
  weekly_premium?: number;
  total_coverage?: number;
  valid_until?: string;
  total_claims?: number;
  total_paid?: number;
}

const COVERAGE_ITEMS = [
  { name: "Heavy Rain Shield", trigger: "> 50mm/hr", payout: "\u20b9800" },
  { name: "Flood Income Cover", trigger: "IMD flood alert", payout: "\u20b91,200" },
  { name: "Job Loss Cover", trigger: "Account deactivation", payout: "\u20b92,000" },
  { name: "Pollution Shutdown", trigger: "AQI > 400", payout: "\u20b9600" },
  { name: "Curfew / Strike", trigger: "Zone closure order", payout: "\u20b9900" },
  { name: "App Outage Cover", trigger: "Platform down > 3h", payout: "\u20b9500" },
];

export default function MyPolicyPage() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [user, setUser] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawUser = localStorage.getItem("gigarmor_user");
    if (rawUser) setUser(JSON.parse(rawUser));
    const token = localStorage.getItem("gigarmor_token");
    fetch(`${API_BASE}/api/v1/policies/my`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    })
      .then(r => r.json())
      .then(d => setPolicy(d))
      .catch(() => setPolicy({
        policy_number: "GS-MUM-2024-" + Math.floor(Math.random() * 9000 + 1000),
        status: "active",
        platform: user.platform || "Zomato",
        city: user.city || "Mumbai",
        zone: user.zone || "Andheri West",
        weekly_premium: 43,
        total_coverage: 6000,
        valid_until: "2026-12-31",
        total_claims: 3,
        total_paid: 1575,
      }))
      .finally(() => setLoading(false));
  }, []);

  const isActive = policy?.status === "active";

  return (
    <div className="p-6 xl:p-8 max-w-[1200px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-8 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1.5">Worker portal</p>
          <h1 className="text-2xl font-black text-white tracking-tight">My Policy</h1>
        </div>
        {isActive && (
          <div className="flex items-center gap-2">
            <span className="dot-live" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#00FF87]">Active</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <p className="mono-label animate-pulse">Loading policy...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Policy header */}
          <div className="grid md:grid-cols-2 gap-0 border border-[#1a1a1a]">
            <div className="p-6 border-b md:border-b-0 md:border-r border-[#1a1a1a]">
              <p className="mono-label mb-2">Policy number</p>
              <div className="font-mono text-xl font-black text-[#00FF87]">{policy?.policy_number}</div>
            </div>
            <div className="grid grid-cols-3">
              {[
                { label: "Platform", value: policy?.platform || user.platform },
                { label: "City", value: policy?.city || user.city },
                { label: "Zone", value: policy?.zone || user.zone },
              ].map((item, i) => (
                <div key={item.label} className={`p-4 ${i < 2 ? "border-r border-[#1a1a1a]" : ""}`}>
                  <p className="mono-label mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-[#1a1a1a]">
            {[
              { label: "Weekly premium", value: "\u20b9" + (policy?.weekly_premium || 43), accent: false },
              { label: "Total coverage", value: "\u20b9" + (policy?.total_coverage || 6000), accent: true },
              { label: "Claims made", value: policy?.total_claims ?? 0, accent: false },
              { label: "Total received", value: "\u20b9" + (policy?.total_paid || 0), accent: true },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="border-r border-b border-[#1a1a1a] p-5">
                <div className={`font-mono text-2xl font-black tabular-nums leading-none ${s.accent ? "text-[#00FF87]" : "text-white"}`}>
                  {s.value}
                </div>
                <div className="mono-label mt-2">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Coverage breakdown */}
          <div>
            <div className="border-b border-[#1a1a1a] pb-3 mb-0">
              <p className="mono-label">Coverage breakdown</p>
            </div>
            <table className="data-table">
              <thead><tr><th>Coverage type</th><th>Trigger condition</th><th className="text-right">Max payout</th><th className="text-right">Status</th></tr></thead>
              <tbody>
                {COVERAGE_ITEMS.map((c, i) => (
                  <motion.tr key={c.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.04 }}>
                    <td className="text-white text-[13px] font-medium">{c.name}</td>
                    <td className="font-mono text-[11px] text-[#555]">{c.trigger}</td>
                    <td className="font-mono text-[12px] text-[#00FF87] font-bold text-right tabular-nums">{c.payout}</td>
                    <td className="text-right"><span className="font-mono text-[9px] tracking-widest text-[#00FF87]">ACTIVE</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Valid until */}
          <div className="border border-[#1a1a1a] p-5 flex items-center justify-between">
            <div>
              <p className="mono-label mb-1">Policy valid until</p>
              <p className="text-sm font-bold text-white">{policy?.valid_until || "2026-12-31"}</p>
            </div>
            <p className="font-mono text-[10px] tracking-widest uppercase text-[#333]">Auto-renews monthly</p>
          </div>
        </div>
      )}
    </div>
  );
}
