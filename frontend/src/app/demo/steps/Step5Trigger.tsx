"use client";
import { useState } from "react";
import { useDemoContext } from "@/lib/demoContext";
import { checkTrigger } from "@/lib/triggerEngine";
import type { TriggerResult } from "@/lib/triggerEngine";

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function SeverityBadge({ s }: { s: string | null }) {
  if (!s) return null;
  const styles: Record<string, string> = {
    low:    "bg-emerald-100 text-emerald-700 border-emerald-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    high:   "bg-red-100 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${styles[s] ?? styles.medium}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />{s}
    </span>
  );
}

export function Step5Trigger() {
  const { state, dispatch, nextStep, appendLog } = useDemoContext();
  const [status, setStatus] = useState<"idle" | "checking" | "done">(state.triggerResult ? "done" : "idle");

  async function runNatural() {
    if (!state.worker) return;
    setStatus("checking");
    appendLog(`Querying parametric data for ${state.worker.city}...`);
    await sleep(800);

    const result = checkTrigger(state.worker.city as Parameters<typeof checkTrigger>[0]);
    dispatch({ type: "SET_TRIGGER", result });
    appendLog(`Trigger check complete — ${result.trigger ? `ACTIVE ⚡ (${result.triggerType}: ${result.value})` : "No trigger"}`);
    setStatus("done");
  }

  async function runForced() {
    if (!state.worker) return;
    setStatus("checking");
    appendLog("Simulating worst-case parametric trigger...");
    await sleep(700);

    const city = state.worker.city as Parameters<typeof checkTrigger>[0];
    const forced: TriggerResult = {
      city,
      trigger:     true,
      triggerType: city === "Delhi" ? "AQI" : "RAIN",
      value:       city === "Delhi" ? 455 : 135,
      severity:    city === "Delhi" ? "high" : "medium",
      timestamp:   new Date().toISOString(),
      source:      city === "Delhi" ? "SIMULATED_CPCB" : "SIMULATED_WEATHER",
    };
    dispatch({ type: "SET_TRIGGER", result: forced });
    appendLog(`Forced trigger injected — ${forced.triggerType}: ${forced.value} | ${forced.severity} severity`);
    setStatus("done");
  }

  function recheck() {
    dispatch({ type: "SET_TRIGGER", result: null as unknown as TriggerResult });
    dispatch({ type: "SET_PAYOUT", result: null as unknown as any });
    setStatus("idle");
  }

  const r = state.triggerResult;

  return (
    <div className="space-y-5">
      {status === "idle" && (
        <div className="grid grid-cols-2 gap-3">
          <button onClick={runNatural} className="btn-navy">
            🔍 Check Real Trigger
          </button>
          <button
            onClick={runForced}
            className="bg-amber-400 text-[#0F2044] font-bold text-sm px-5 py-3 rounded-xl hover:bg-amber-300 transition-all"
          >
            ⚡ Simulate Trigger
          </button>
        </div>
      )}

      {status === "checking" && (
        <div className="panel-inset p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0F2044] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-slate-600 text-sm font-semibold">Checking parametric data...</p>
          <p className="text-slate-400 text-xs">Querying AQI + weather sensors</p>
        </div>
      )}

      {status === "done" && r && (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${r.trigger ? "bg-amber-50 border-amber-200" : "panel-inset"}`}>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-slate-900">Trigger Status</p>
              {r.trigger ? (
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-100 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  ACTIVE
                </span>
              ) : (
                <span className="text-slate-500 bg-slate-100 border border-slate-200 text-xs font-bold px-3 py-1 rounded-full">
                  NO TRIGGER
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div><p className="lbl mb-0.5">City</p><p className="font-semibold text-slate-800">{r.city}</p></div>
              <div><p className="lbl mb-0.5">Type</p><p className="font-semibold text-slate-800">{r.triggerType ?? "—"}</p></div>
              <div>
                <p className="lbl mb-0.5">Value</p>
                <p className="font-semibold text-slate-800">
                  {r.value === -1 ? "—" : r.triggerType === "AQI" ? `AQI ${r.value}` : `${r.value} mm`}
                </p>
              </div>
              <div><p className="lbl mb-0.5">Severity</p><SeverityBadge s={r.severity} /></div>
              <div className="col-span-2"><p className="lbl mb-0.5">Source</p><p className="text-xs font-mono text-slate-500">{r.source ?? "N/A"}</p></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={recheck}
              className="flex-1 bg-white text-slate-600 font-semibold text-sm px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              ↺ Re-check
            </button>
            <button onClick={nextStep} className="btn-navy flex-1">
              Process Claim →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
