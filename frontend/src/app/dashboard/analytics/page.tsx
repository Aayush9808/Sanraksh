"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { API_BASE } from "@/lib/config";

const DEMO_DAILY = [
  { date: "Mar 21", claims: 18, paid: 9400, workers: 11200 },
  { date: "Mar 22", claims: 24, paid: 12800, workers: 11450 },
  { date: "Mar 23", claims: 12, paid: 6200, workers: 11600 },
  { date: "Mar 24", claims: 31, paid: 17200, workers: 11900 },
  { date: "Mar 25", claims: 42, paid: 24100, workers: 12100 },
  { date: "Mar 26", claims: 28, paid: 15800, workers: 12400 },
  { date: "Mar 27", claims: 34, paid: 18600, workers: 12847 },
];

const DEMO_PLATFORM = [
  { platform: "Zomato", claims: 145, workers: 4200 },
  { platform: "Swiggy", claims: 118, workers: 3800 },
  { platform: "Blinkit", claims: 72, workers: 2100 },
  { platform: "Zepto", claims: 54, workers: 1600 },
  { platform: "Amazon", claims: 31, workers: 900 },
  { platform: "Other", claims: 22, workers: 247 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-3">
      <p className="mono-label mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-mono text-xs text-white">{p.name}: <span className="text-[#00FF87]">{typeof p.value === "number" && p.name.includes("paid") ? "\u20b9" + p.value.toLocaleString("en-IN") : p.value.toLocaleString("en-IN")}</span></p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const [daily, setDaily] = useState(DEMO_DAILY);
  const [platform, setPlatform] = useState(DEMO_PLATFORM);
  const [loading, setLoading] = useState(false);

  const totalPaid = daily.reduce((s, d) => s + d.paid, 0);
  const totalClaims = daily.reduce((s, d) => s + d.claims, 0);
  const avgPerClaim = totalClaims ? Math.round(totalPaid / totalClaims) : 0;

  return (
    <div className="p-6 xl:p-8 max-w-[1400px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-8">
        <p className="mono-label mb-1.5">Data insights</p>
        <h1 className="text-2xl font-black text-white tracking-tight">Analytics</h1>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-[#1a1a1a] mb-10">
        {[
          { label: "7-day claims", value: totalClaims, accent: false },
          { label: "7-day paid out", value: "\u20b9" + totalPaid.toLocaleString("en-IN"), accent: true },
          { label: "Avg per claim", value: "\u20b9" + avgPerClaim.toLocaleString("en-IN"), accent: true },
          { label: "Active workers", value: daily[daily.length - 1].workers.toLocaleString("en-IN"), accent: false },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="border-r border-b border-[#1a1a1a] p-5">
            <div className={`font-mono text-2xl font-black tabular-nums leading-none ${s.accent ? "text-[#00FF87]" : "text-white"}`}>{s.value}</div>
            <div className="mono-label mt-2">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-8 mb-8">
        {/* Claims chart */}
        <div>
          <div className="border-b border-[#1a1a1a] pb-3 mb-6">
            <p className="mono-label">7-day claims volume</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "#444", letterSpacing: "0.1em" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#0d0d0d" }} />
              <Bar dataKey="claims" fill="#00FF87" radius={0} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Paid out chart */}
        <div>
          <div className="border-b border-[#1a1a1a] pb-3 mb-6">
            <p className="mono-label">7-day payouts (&#8377;)</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "#444", letterSpacing: "0.1em" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: "var(--font-mono)", fontSize: 9, fill: "#444" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="paid" stroke="#00FF87" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform breakdown */}
      <div>
        <div className="border-b border-[#1a1a1a] pb-3 mb-0">
          <p className="mono-label">Claims by platform</p>
        </div>
        <table className="data-table">
          <thead><tr><th>Platform</th><th className="text-right">Workers</th><th className="text-right">Claims</th><th className="text-right">Claim rate</th><th>Distribution</th></tr></thead>
          <tbody>
            {platform.map((p, i) => {
              const maxClaims = Math.max(...platform.map(x => x.claims));
              return (
                <motion.tr key={p.platform} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td className="text-white font-medium">{p.platform}</td>
                  <td className="font-mono text-[12px] text-right tabular-nums text-[#777]">{p.workers.toLocaleString("en-IN")}</td>
                  <td className="font-mono text-[12px] text-right tabular-nums text-white font-bold">{p.claims}</td>
                  <td className="font-mono text-[12px] text-right tabular-nums text-[#00FF87]">{((p.claims / p.workers) * 100).toFixed(2)}%</td>
                  <td className="py-4 pr-4">
                    <div className="h-1 bg-[#1a1a1a] max-w-[200px]">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(p.claims / maxClaims) * 100}%` }} transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                        className="h-1 bg-[#00FF87]" />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
