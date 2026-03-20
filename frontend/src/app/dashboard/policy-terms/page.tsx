"use client";
import Link from "next/link";

const TERMS = [
  {
    icon: "🌧️",
    coverage: "Heavy Rain / Storm",
    trigger: "Rainfall > 50 mm/hr for 2 consecutive hours in registered zone",
    payout: "₹800",
    waiting: "2 hours threshold confirmation",
    exclusions: "If worker is outside registered zone for full disruption window",
    docs: "GPS ping + platform activity sync",
  },
  {
    icon: "🌊",
    coverage: "Flooding",
    trigger: "Municipal flood warning OR API flood-risk index above critical",
    payout: "₹1,200",
    waiting: "Immediate on official warning",
    exclusions: "Localized waterlogging below trigger threshold",
    docs: "Zone flood bulletin + geolocation match",
  },
  {
    icon: "😷",
    coverage: "AQI Shutdown",
    trigger: "AQI > 400 with city-level operational restriction",
    payout: "₹600",
    waiting: "4-hour sustained AQI breach",
    exclusions: "No payout if AQI recovers before threshold window",
    docs: "AQI feed + shift schedule",
  },
  {
    icon: "🚫",
    coverage: "Curfew / Strike",
    trigger: "Government curfew order / zone closure notification",
    payout: "₹900",
    waiting: "Immediate once event is verified",
    exclusions: "Personal leave or voluntary offline status",
    docs: "Official notice + app activity trail",
  },
  {
    icon: "⚡",
    coverage: "Platform App Outage",
    trigger: "Partner platform outage > 3 hours",
    payout: "₹500",
    waiting: "3-hour outage confirmation",
    exclusions: "Worker-side network/device issues",
    docs: "Platform status logs + worker login records",
  },
  {
    icon: "💼",
    coverage: "Account Deactivation Impact",
    trigger: "Verified temporary platform deactivation causing income loss",
    payout: "Up to ₹2,000",
    waiting: "Manual risk review",
    exclusions: "Fraud, policy breach, or legal suspension",
    docs: "Platform deactivation proof + risk review",
  },
];

const EXCLUSIONS = [
  "Health, life, accident, and vehicle-repair claims are strictly excluded.",
  "No payout for disruptions outside registered policy city/zone unless portability is enabled.",
  "Claims can be rejected for fraud indicators (GPS mismatch, duplicate abuse, fabricated events).",
  "Premium non-payment can pause coverage after grace period.",
  "Policy is for income-loss compensation, not asset or medical compensation.",
];

export default function PolicyTermsPage() {
  return (
    <div className="flex min-h-screen bg-[#060d1a] text-slate-100">
      <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-white/[0.06] bg-[#060d1a]">
        <div className="border-b border-white/[0.06] px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-slate-950">G</span>
            <span className="text-lg font-black tracking-tight text-white">GigArmor</span>
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Worker Portal</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {[
            { href: "/dashboard/my-policy", icon: "🛡️", label: "My Policy" },
            { href: "/dashboard/triggers", icon: "⚡", label: "Live Alerts" },
            { href: "/dashboard/policy-terms", icon: "📘", label: "Policy Terms", active: true },
            { href: "/dashboard/profile", icon: "👤", label: "Profile" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                item.active
                  ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-60 flex-1 px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-widest text-slate-500">GigArmor / Policy Terms</p>
            <h1 className="text-3xl font-black text-white">📘 Worker Policy Terms & Conditions</h1>
            <p className="mt-1 text-sm text-slate-400">Clear rules for coverage activation, trigger logic, payouts, and exclusions.</p>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300">Version 1.0 • Weekly Model</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Policy Type", "Parametric Income Protection"],
            ["Billing Cycle", "Weekly"],
            ["Payout SLA", "Instant / Auto-processed"],
          ].map((x) => (
            <div key={x[0]} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">{x[0]}</p>
              <p className="mt-1 text-base font-semibold text-white">{x[1]}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                  {[
                    "Coverage",
                    "Trigger Condition",
                    "Indicative Payout",
                    "Waiting / Validation",
                    "Required Evidence",
                    "Key Exclusions",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TERMS.map((t) => (
                  <tr key={t.coverage} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-white">{t.icon} {t.coverage}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{t.trigger}</td>
                    <td className="px-4 py-3 text-sm font-bold text-cyan-300">{t.payout}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{t.waiting}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{t.docs}</td>
                    <td className="px-4 py-3 text-sm text-amber-300">{t.exclusions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <h2 className="text-lg font-bold text-amber-300">⚠️ Global Exclusions</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc list-inside">
              {EXCLUSIONS.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <h2 className="text-lg font-bold text-emerald-300">✅ Worker Obligations</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300 list-disc list-inside">
              <li>Maintain valid profile details and emergency contact.</li>
              <li>Keep location and activity permissions enabled for fraud checks.</li>
              <li>Pay premium on weekly billing cycle to keep coverage active.</li>
              <li>Avoid duplicate/false claims; such activity can terminate policy.</li>
              <li>Use support workflow for manual review scenarios.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
