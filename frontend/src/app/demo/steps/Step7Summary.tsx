"use client";
import { useDemoContext } from "@/lib/demoContext";

export function Step7Summary() {
  const { state, reset } = useDemoContext();
  const { worker, premiumResult, policy, triggerResult, payoutResult } = state;

  function Row({ label, value }: { label: string; value: React.ReactNode }) {
    return (
      <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-800">{value}</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="rounded-2xl bg-[#0F2044] p-6 text-center">
        <div className="text-4xl mb-2">{payoutResult?.status === "SUCCESS" ? "🎉" : "🛡️"}</div>
        <p className="text-white font-extrabold text-2xl mb-1">
          {payoutResult?.status === "SUCCESS" ? "Payout Triggered!" : "Demo Complete"}
        </p>
        <p className="text-blue-300 text-sm">
          {payoutResult?.status === "SUCCESS"
            ? `₹${payoutResult.payoutAmount.toLocaleString("en-IN")} sent to ${worker?.name ?? "worker"} via UPI — no claim form required.`
            : "Full insurance pipeline executed successfully."}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Worker */}
        <div className="panel p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Worker</p>
          <Row label="Name"     value={worker?.name ?? "—"} />
          <Row label="City"     value={worker?.city ?? "—"} />
          <Row label="Platform" value={worker?.platform ?? "—"} />
          <Row label="Risk Tier" value={
            <span className={`capitalize font-bold text-xs px-2 py-0.5 rounded-full border ${
              state.underwritingResult?.riskTier === "low"    ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
              state.underwritingResult?.riskTier === "medium" ? "bg-amber-100 text-amber-700 border-amber-200"       :
                                                                 "bg-red-100 text-red-700 border-red-200"
            }`}>{state.underwritingResult?.riskTier ?? "—"}</span>
          } />
        </div>

        {/* Policy */}
        <div className="panel p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Policy</p>
          <Row label="Plan"          value={policy?.plan ?? "—"} />
          <Row label="Coverage/Day"  value={policy ? `₹${policy.coveragePerDay}` : "—"} />
          <Row label="Triggers"      value={policy?.triggersCovered.join(", ") ?? "—"} />
          <Row label="Weekly Premium" value={premiumResult ? `₹${premiumResult.finalPremium}` : "—"} />
        </div>

        {/* Trigger */}
        <div className="panel p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Trigger</p>
          <Row label="Status"   value={
            triggerResult?.trigger
              ? <span className="text-amber-700 font-bold text-xs bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">Active</span>
              : <span className="text-slate-500 font-bold text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">None</span>
          } />
          <Row label="Type"     value={triggerResult?.triggerType ?? "—"} />
          <Row label="Value"    value={
            !triggerResult?.value || triggerResult.value === -1 ? "—" :
            triggerResult.triggerType === "AQI" ? `AQI ${triggerResult.value}` : `${triggerResult.value} mm`
          } />
          <Row label="Severity" value={<span className="capitalize">{triggerResult?.severity ?? "—"}</span>} />
        </div>

        {/* Payout */}
        <div className="panel p-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Payout</p>
          <Row label="Status" value={
            payoutResult?.status === "SUCCESS"
              ? <span className="text-emerald-700 font-bold text-xs bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">Success</span>
              : <span className="text-red-700 font-bold text-xs bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">Failed</span>
          } />
          <Row label="Amount" value={
            payoutResult?.status === "SUCCESS"
              ? <span className="text-emerald-600 font-extrabold">₹{payoutResult.payoutAmount.toLocaleString("en-IN")}</span>
              : "₹0"
          } />
          <Row label="Method" value="UPI" />
          <Row label="Payout ID" value={<span className="font-mono text-xs truncate max-w-[140px] inline-block text-right">{payoutResult?.payoutId ?? "—"}</span>} />
        </div>
      </div>

      <button onClick={reset} className="w-full bg-white text-slate-700 font-bold border border-slate-200 rounded-xl py-3 hover:bg-slate-50 transition-all">
        ↺ Start New Demo
      </button>
    </div>
  );
}
