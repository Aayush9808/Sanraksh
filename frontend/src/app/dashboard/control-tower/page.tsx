"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface QueueHealth { queue_size?: number; oldest_item_age_min?: number; avg_processing_time_s?: number; success_rate?: number; }
interface RunHistoryItem { run_id: string; started_at: string; completed_at?: string; status: string; claims_processed?: number; payouts_issued?: number; total_payout?: number; duration_s?: number; }

const DEMO_HEALTH: QueueHealth = { queue_size: 3, oldest_item_age_min: 8, avg_processing_time_s: 2.4, success_rate: 99.2 };
const DEMO_RUNS: RunHistoryItem[] = [
  { run_id: "RUN-0091", started_at: "2026-03-27 15:00", completed_at: "2026-03-27 15:00:04", status: "completed", claims_processed: 12, payouts_issued: 11, total_payout: 7200, duration_s: 4 },
  { run_id: "RUN-0090", started_at: "2026-03-27 14:45", completed_at: "2026-03-27 14:45:06", status: "completed", claims_processed: 8, payouts_issued: 8, total_payout: 5100, duration_s: 6 },
  { run_id: "RUN-0089", started_at: "2026-03-27 14:30", completed_at: "2026-03-27 14:30:03", status: "completed", claims_processed: 15, payouts_issued: 14, total_payout: 9800, duration_s: 3 },
  { run_id: "RUN-0088", started_at: "2026-03-27 14:15", completed_at: "2026-03-27 14:15:09", status: "failed", claims_processed: 5, payouts_issued: 3, total_payout: 1800, duration_s: 9 },
];

export default function ControlTowerPage() {
  const [health, setHealth] = useState<QueueHealth>(DEMO_HEALTH);
  const [runs, setRuns] = useState<RunHistoryItem[]>(DEMO_RUNS);
  const [running, setRunning] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("gigarmor_token");
    Promise.allSettled([
      fetch(`${API_BASE}/api/v1/phase2/queue-health`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(3000) }).then(r => r.json()),
      fetch(`${API_BASE}/api/v1/phase2/run-history`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(3000) }).then(r => r.json()),
    ]).then(([h, r]) => {
      if (h.status === "fulfilled" && h.value) setHealth(h.value);
      if (r.status === "fulfilled" && Array.isArray(r.value)) setRuns(r.value);
    });
  }, []);

  async function handleRun() {
    setRunning(true);
    setLog(["[SYS] Initiating automation run..."]);
    const token = localStorage.getItem("gigarmor_token");
    try {
      const res = await fetch(`${API_BASE}/api/v1/phase2/control-tower`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      });
      const data = await res.json();
      setLog(prev => [...prev,
        "[OK] Automation run completed",
        `[OK] Claims processed: ${data.claims_processed ?? 0}`,
        `[OK] Payouts issued: ${data.payouts_issued ?? 0}`,
        `[OK] Total payout: \u20b9${(data.total_payout || 0).toLocaleString("en-IN")}`,
      ]);
    } catch {
      setLog(prev => [...prev, "[DEMO] Simulated: 12 claims processed, 11 payouts, \u20b97,200 disbursed"]);
    }
    setRunning(false);
  }

  async function handleSimulate() {
    setSimulating(true);
    setLog(["[SYS] Simulating disruption event..."]);
    const token = localStorage.getItem("gigarmor_token");
    try {
      const res = await fetch(`${API_BASE}/api/v1/phase2/simulate-disruption`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6000),
      });
      const data = await res.json();
      setLog(prev => [...prev, `[OK] Disruption simulated: ${JSON.stringify(data)}`]);
    } catch {
      setLog(prev => [...prev, "[DEMO] Simulated: Heavy Rain alert fired in Andheri West. 43 workers triggered."]);
    }
    setSimulating(false);
  }

  const STATUS = { completed: "text-[#00FF87]", failed: "text-[#ff4444]", running: "text-[#ffaa00]" } as const;

  return (
    <div className="p-6 xl:p-8 max-w-[1400px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-8 flex items-end justify-between">
        <div>
          <p className="mono-label mb-1.5">Operations</p>
          <h1 className="text-2xl font-black text-white tracking-tight">Control Tower</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot-live" />
          <span className="mono-label">Automation engine online</span>
        </div>
      </div>

      {/* Queue health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-[#1a1a1a] mb-8">
        {[
          { label: "Queue size", value: health.queue_size ?? "—", accent: false },
          { label: "Oldest item", value: (health.oldest_item_age_min ?? "—") + " min", accent: false },
          { label: "Avg process time", value: (health.avg_processing_time_s ?? "—") + "s", accent: false },
          { label: "Success rate", value: (health.success_rate ?? "—") + "%", accent: true },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="border-r border-b border-[#1a1a1a] p-5">
            <div className={`font-mono text-2xl font-black tabular-nums leading-none ${s.accent ? "text-[#00FF87]" : "text-white"}`}>{s.value}</div>
            <div className="mono-label mt-2">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_380px] gap-8">
        {/* Run history */}
        <div>
          <div className="border-b border-[#1a1a1a] pb-3 mb-0">
            <p className="mono-label">Run history</p>
          </div>
          <table className="data-table">
            <thead><tr><th>Run ID</th><th>Started</th><th className="text-right">Processed</th><th className="text-right">Issued</th><th className="text-right">Payout</th><th className="text-right">Duration</th><th className="text-right">Status</th></tr></thead>
            <tbody>
              {runs.map((r, i) => (
                <motion.tr key={r.run_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td className="font-mono text-[11px] text-[#555]">{r.run_id}</td>
                  <td className="font-mono text-[11px] text-[#444]">{r.started_at}</td>
                  <td className="font-mono text-[12px] text-right tabular-nums text-white">{r.claims_processed ?? "—"}</td>
                  <td className="font-mono text-[12px] text-right tabular-nums text-white">{r.payouts_issued ?? "—"}</td>
                  <td className="font-mono text-[12px] font-bold text-right tabular-nums text-[#00FF87]">&#8377;{(r.total_payout || 0).toLocaleString()}</td>
                  <td className="font-mono text-[11px] text-right tabular-nums text-[#444]">{r.duration_s ?? "—"}s</td>
                  <td className="text-right">
                    <span className={`font-mono text-[9px] tracking-widest ${STATUS[r.status as keyof typeof STATUS] || "text-[#777]"}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controls + terminal */}
        <div className="border-l border-[#1a1a1a] pl-6 space-y-6">
          <div>
            <p className="mono-label mb-4">Actions</p>
            <div className="space-y-3">
              <button onClick={handleRun} disabled={running}
                className="btn-wire" style={{ width: "100%" }}>
                {running ? "RUNNING..." : "RUN AUTOMATION ENGINE \u2192"}
              </button>
              <button onClick={handleSimulate} disabled={simulating}
                className="btn-ghost" style={{ width: "100%" }}>
                {simulating ? "SIMULATING..." : "SIMULATE DISRUPTION EVENT"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {log.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <div className="border border-[#1a1a1a] bg-[#040404] p-4 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto">
                  {log.map((line, i) => (
                    <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={line.startsWith("[OK]") ? "text-[#00FF87]" : line.startsWith("[ERR]") ? "text-[#ff4444]" : "text-[#444]"}>
                      {line}
                    </motion.p>
                  ))}
                  <span className="text-[#444] animate-blink">&#9646;</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
