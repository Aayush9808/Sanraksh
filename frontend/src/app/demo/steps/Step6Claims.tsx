"use client";
import { useState } from "react";
import { useDemoContext } from "@/lib/demoContext";
import { processPayout, resetProcessedWorkers } from "@/lib/claimsEngine";
import { logStep } from "@/lib/debugLogger";

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

interface FraudCheck {
  label: string;
  passed: boolean;
  detail: string;
}

export function Step6Claims() {
  const { state, dispatch, nextStep, appendLog } = useDemoContext();
  const [status, setStatus]   = useState<"idle" | "running" | "done">(state.payoutResult ? "done" : "idle");
  const [checks, setChecks]   = useState<FraudCheck[]>([]);

  async function run() {
    if (!state.worker || !state.underwritingResult || !state.triggerResult) return;
    setStatus("running");
    setChecks([]);
    appendLog("Processing claim...");

    const w  = state.worker;
    const ur = state.underwritingResult;
    const tr = state.triggerResult;

    // Animate fraud checks one by one
    const fraudChecks: FraudCheck[] = [
      {
        label:  "City Mismatch",
        passed: w.city === tr.city,
        detail: w.city === tr.city
          ? `Worker city (${w.city}) matches trigger city ✓`
          : `City mismatch: ${w.city} ≠ ${tr.city}`,
      },
      {
        label:  "Activity Threshold",
        passed: w.days_active_last_30 >= 7,
        detail: w.days_active_last_30 >= 7
          ? `${w.days_active_last_30} active days — above minimum ✓`
          : `Only ${w.days_active_last_30} days active — below 7-day threshold`,
      },
      {
        label:  "Duplicate Guard",
        passed: true,
        detail: "No prior payout found for this worker ✓",
      },
      {
        label:  "Underwriting Eligibility",
        passed: ur.eligible,
        detail: ur.eligible
          ? `Worker is eligible (${ur.eligibilityReason}) ✓`
          : `Worker not eligible: ${ur.eligibilityReason}`,
      },
      {
        label:  "Parametric Trigger",
        passed: tr.trigger,
        detail: tr.trigger
          ? `Active trigger detected: ${tr.triggerType} = ${tr.value} ✓`
          : `No current trigger for ${tr.city}`,
      },
    ];

    for (const chk of fraudChecks) {
      await sleep(300);
      setChecks(prev => [...prev, chk]);
    }

    await sleep(400);
    appendLog("All checks complete — processing payout...");

    resetProcessedWorkers();
    const result = processPayout(w, ur, tr);
    dispatch({ type: "SET_PAYOUT", result });
    logStep("Simulation — Claim Processed", {
      status: result.status,
      payoutAmount: result.payoutAmount ?? null,
      reason: result.reason ?? null,
      workerId: w.worker_id,
    });
    if (result.status === "SUCCESS") {
      logStep("Simulation — Payout", {
        amount: `₹${result.payoutAmount}`,
        method: "UPI",
        worker: w.name,
        trigger: tr.triggerType,
      });
    }
    appendLog(`Payout ${result.status}: ${result.status === "SUCCESS" ? `₹${result.payoutAmount} via UPI` : result.reason}`);
    setStatus("done");
  }

  const p = state.payoutResult;

  return (
    <div className="space-y-5">
      {status === "idle" && (
        <button onClick={run} className="btn-navy w-full">
          ▶ Process Claim
        </button>
      )}

      {(status === "running" || status === "done") && checks.length > 0 && (
        <div className="panel p-4">
          <p className="text-sm font-bold text-slate-700 mb-3">Fraud &amp; Eligibility Checks</p>
          <ul className="space-y-2">
            {checks.map((c, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${c.passed ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                  {c.passed ? "✓" : "✗"}
                </span>
                <div>
                  <span className="font-semibold text-slate-800">{c.label}</span>
                  <p className="text-xs text-slate-500 mt-0.5">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === "running" && checks.length < 5 && (
        <div className="panel-inset p-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#0F2044] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-slate-500 text-sm">Running checks...</p>
        </div>
      )}

      {status === "done" && p && (
        <div className="space-y-4">
          <div className={`rounded-2xl border p-5 ${p.status === "SUCCESS" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-slate-900">Payout Result</p>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.status === "SUCCESS" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                {p.status}
              </span>
            </div>
            {p.status === "SUCCESS" ? (
              <p className="text-emerald-700 font-extrabold text-4xl mb-2">₹{p.payoutAmount.toLocaleString("en-IN")}</p>
            ) : null}
            <p className={`text-sm ${p.status === "SUCCESS" ? "text-emerald-700" : "text-red-700"}`}>{p.reason}</p>
            <p className="text-xs text-slate-400 mt-2 font-mono">{p.payoutId}</p>
          </div>

          <button onClick={nextStep} className="btn-navy w-full">
            View Final Summary →
          </button>
        </div>
      )}
    </div>
  );
}
