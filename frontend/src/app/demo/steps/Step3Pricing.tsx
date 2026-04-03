"use client";
import { useState } from "react";
import { useDemoContext } from "@/lib/demoContext";
import { calculatePremium } from "@/lib/pricingEngine";

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

const WHY: Record<string, string> = {
  "Risk tier: low":    "You have minimal exposure — low AQI and weather days.",
  "Risk tier: medium": "Moderate exposure detected across weather and AQI metrics.",
  "Risk tier: high":   "High-risk profile due to multiple elevated exposure factors.",
  "Tier 1 city adjustment": "Cities like Delhi, Mumbai carry 10% higher risk premium.",
  "High risk markup": "Risk tier is high — a 10% safety margin is applied.",
  "Safety cap applied": "Premium capped to prevent overcharging.",
};

export function Step3Pricing() {
  const { state, dispatch, nextStep, appendLog } = useDemoContext();
  const [status, setStatus] = useState<"idle" | "running" | "done">(state.premiumResult ? "done" : "idle");

  async function run() {
    if (!state.worker || !state.underwritingResult) return;
    setStatus("running");
    appendLog("Calculating premium...");
    await sleep(700);

    const result = calculatePremium(state.worker, state.underwritingResult);
    appendLog(`Premium calculated — ₹${result.finalPremium}/week`);
    dispatch({ type: "SET_PREMIUM", result });
    setStatus("done");
  }

  const r = state.premiumResult;

  return (
    <div className="space-y-5">
      {status === "idle" && (
        <button onClick={run} className="btn-navy w-full">
          ▶ Calculate Premium
        </button>
      )}

      {status === "running" && (
        <div className="panel-inset p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0F2044] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-slate-600 text-sm font-semibold">Calculating premium...</p>
          <p className="text-slate-400 text-xs">Applying risk factors and city adjustments</p>
        </div>
      )}

      {status === "done" && r && (
        <div className="space-y-4">
          {/* Big number */}
          <div className="panel-navy p-5 flex items-end justify-between">
            <div>
              <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-0.5">Final Premium</p>
              <p className="text-white font-black text-5xl tracking-tight">₹{r.finalPremium}</p>
              <p className="text-blue-300 text-sm mt-1">per week</p>
            </div>
            <div className="text-right">
              <p className="text-blue-300 text-xs">Base: ₹{r.basePremium.toFixed(1)}</p>
              <p className="text-blue-300 text-xs">Adjusted: ₹{r.adjustedPremium.toFixed(1)}</p>
            </div>
          </div>

          {/* Breakdown with explanations */}
          <div className="panel p-4">
            <p className="text-sm font-bold text-slate-700 mb-3">Why this price?</p>
            <ul className="space-y-2">
              {r.breakdown.map((b, i) => (
                <li key={i} className="text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="text-blue-500 text-xs">→</span>
                    <span className="font-semibold">{b}</span>
                  </div>
                  {WHY[b] && (
                    <p className="text-xs text-slate-400 ml-4 mt-0.5">{WHY[b]}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <button onClick={nextStep} className="btn-navy w-full">
            Generate Policy →
          </button>
        </div>
      )}
    </div>
  );
}
