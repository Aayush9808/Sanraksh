"use client";
import { useState, useEffect } from "react";
import { useDemoContext } from "@/lib/demoContext";
import { gigWorkers, getRandomWorker } from "@/lib/workerData";
import { evaluateWorker } from "@/lib/underwritingEngine";
import type { GigWorker } from "@/lib/workerData";

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function Badge({ tier }: { tier: "low" | "medium" | "high" }) {
  const s = { low: "bg-emerald-100 text-emerald-700 border-emerald-200", medium: "bg-amber-100 text-amber-700 border-amber-200", high: "bg-red-100 text-red-700 border-red-200" };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${s[tier]}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{tier} risk</span>;
}

export function Step2Underwriting() {
  const { state, dispatch, nextStep, appendLog } = useDemoContext();
  const [status, setStatus] = useState<"idle" | "running" | "done">(state.underwritingResult ? "done" : "idle");

  async function run() {
    if (!state.workerInput) return;
    setStatus("running");
    appendLog("Running underwriting engine...");
    await sleep(800);

    // Find closest matching worker from our dataset by city + platform, or fall back to random
    const input = state.workerInput;
    const cityMatch = gigWorkers.filter(
      w => w.city.toLowerCase() === input.city.toLowerCase() &&
           w.platform.toLowerCase() === input.platform.toLowerCase()
    );
    const base: GigWorker = cityMatch.length > 0
      ? cityMatch[Math.floor(Math.random() * cityMatch.length)]
      : getRandomWorker();

    // Override with user-entered values
    const worker: GigWorker = {
      ...base,
      name:                      input.name,
      city:                      input.city as GigWorker["city"],
      platform:                  input.platform as GigWorker["platform"],
      hours_per_day:             input.hoursPerDay,
      days_active_last_30:       input.daysActive,
      avg_daily_income:          input.avgDailyIncome,
      total_earnings_last_30_days: input.avgDailyIncome * input.daysActive,
    };

    dispatch({ type: "SET_WORKER", worker });
    appendLog("Evaluating risk factors...");
    await sleep(500);

    const result = evaluateWorker(worker);
    dispatch({ type: "SET_UNDERWRITING", result });
    appendLog(`Underwriting complete — ${result.eligible ? "Eligible ✅" : "Not Eligible ❌"} | Risk: ${result.riskTier}`);
    setStatus("done");
  }

  const r = state.underwritingResult;

  return (
    <div className="space-y-5">
      {status === "idle" && (
        <button onClick={run} className="btn-navy w-full">
          ▶ Run Underwriting Engine
        </button>
      )}

      {status === "running" && (
        <div className="panel-inset p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0F2044] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-slate-600 text-sm font-semibold">Running underwriting...</p>
          <p className="text-slate-400 text-xs">Checking eligibility and risk factors</p>
        </div>
      )}

      {status === "done" && r && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="panel-inset p-3 rounded-xl">
              <p className="lbl mb-1">Eligibility</p>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${r.eligible ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {r.eligible ? "Eligible" : "Not Eligible"}
              </span>
            </div>
            <div className="panel-inset p-3 rounded-xl">
              <p className="lbl mb-1">Risk Score</p>
              <p className="font-extrabold text-2xl text-slate-900">{r.riskScore}</p>
            </div>
            <div className="panel-inset p-3 rounded-xl col-span-2 sm:col-span-1">
              <p className="lbl mb-1">Risk Tier</p>
              <Badge tier={r.riskTier} />
            </div>
          </div>

          <div className="panel p-4">
            <p className="text-sm font-bold text-slate-700 mb-2">Risk Factor Explanation</p>
            {r.explanation.length === 0 ? (
              <p className="text-sm text-slate-400">No elevated risk factors detected.</p>
            ) : (
              <ul className="space-y-1.5">
                {r.explanation.map((e, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-amber-500 text-xs">⚠</span> {e}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button onClick={nextStep} className="btn-navy w-full">
            Proceed to Pricing →
          </button>
        </div>
      )}
    </div>
  );
}
