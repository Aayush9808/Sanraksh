"use client";
import { useState } from "react";
import { useDemoContext } from "@/lib/demoContext";
import type { DemoPolicy } from "@/lib/demoContext";

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export function Step4Policy() {
  const { state, dispatch, nextStep, appendLog } = useDemoContext();
  const [status, setStatus] = useState<"idle" | "generating" | "done">(state.policy ? "done" : "idle");

  async function generate() {
    if (!state.premiumResult || !state.worker) return;
    setStatus("generating");
    appendLog("Generating policy document...");
    await sleep(900);

    const coveragePerDay = Math.round(state.worker.avg_daily_income * 0.3);
    const policy: DemoPolicy = {
      plan:             "Standard",
      coveragePerDay,
      triggersCovered:  ["Heavy Rain", "Poor AQI"],
      issuedAt:         new Date().toISOString(),
    };
    dispatch({ type: "SET_POLICY", policy });
    appendLog(`Policy issued — Standard plan | ₹${coveragePerDay}/day coverage`);
    setStatus("done");
  }

  const p = state.policy;
  const w = state.worker;

  return (
    <div className="space-y-5">
      {status === "idle" && (
        <button onClick={generate} className="btn-navy w-full">
          ▶ Generate Policy
        </button>
      )}

      {status === "generating" && (
        <div className="panel-inset p-6 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#0F2044] border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          <p className="text-slate-600 text-sm font-semibold">Generating policy...</p>
          <p className="text-slate-400 text-xs">Binding coverage terms</p>
        </div>
      )}

      {status === "done" && p && w && (
        <div className="space-y-4">
          {/* Policy card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Header stripe */}
            <div className="bg-[#0F2044] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">GigInsu₹</p>
                <p className="text-white font-extrabold text-lg">Parametric Income Protection</p>
              </div>
              <span className="bg-emerald-400 text-white text-xs font-bold px-3 py-1 rounded-full">ACTIVE</span>
            </div>

            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="lbl mb-1">Policyholder</p>
                <p className="font-bold text-slate-900">{w.name}</p>
              </div>
              <div>
                <p className="lbl mb-1">Plan</p>
                <p className="font-bold text-slate-900">{p.plan}</p>
              </div>
              <div>
                <p className="lbl mb-1">City</p>
                <p className="font-bold text-slate-900">{w.city}</p>
              </div>
              <div>
                <p className="lbl mb-1">Platform</p>
                <p className="font-bold text-slate-900">{w.platform}</p>
              </div>
              <div>
                <p className="lbl mb-1">Coverage/Day</p>
                <p className="font-extrabold text-[#0F2044] text-xl">₹{p.coveragePerDay}</p>
              </div>
              <div>
                <p className="lbl mb-1">Payment Method</p>
                <p className="font-bold text-slate-900">UPI Auto-debit</p>
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 py-3">
              <p className="lbl mb-2">Triggers Covered</p>
              <div className="flex gap-2">
                {p.triggersCovered.map(t => (
                  <span key={t} className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">
                Policy issued: {new Date(p.issuedAt).toLocaleString("en-IN")} &nbsp;·&nbsp; No claim forms required. Payouts are automatic.
              </p>
            </div>
          </div>

          <button onClick={nextStep} className="btn-navy w-full">
            Proceed to Trigger Simulation →
          </button>
        </div>
      )}
    </div>
  );
}
