"use client";
import { motion } from "framer-motion";

const TERMS = [
  { icon: "🌧️", coverage: "Heavy Rain / Storm", trigger: "Rainfall > 50 mm/hr for 2 consecutive hours in registered zone", payout: "₹800", waiting: "2 hours threshold confirmation", exclusions: "If worker is outside registered zone for full disruption window", docs: "GPS ping + platform activity sync" },
  { icon: "🌊", coverage: "Flooding", trigger: "Municipal flood warning OR API flood-risk index above critical", payout: "₹1,200", waiting: "Immediate on official warning", exclusions: "Localized waterlogging below trigger threshold", docs: "Zone flood bulletin + geolocation match" },
  { icon: "😷", coverage: "AQI Shutdown", trigger: "AQI > 400 with city-level operational restriction", payout: "₹600", waiting: "4-hour sustained AQI breach", exclusions: "No payout if AQI recovers before threshold window", docs: "AQI feed + shift schedule" },
  { icon: "🚫", coverage: "Curfew / Strike", trigger: "Government curfew order / zone closure notification", payout: "₹900", waiting: "Immediate once event is verified", exclusions: "Personal leave or voluntary offline status", docs: "Official notice + app activity trail" },
  { icon: "⚡", coverage: "Platform App Outage", trigger: "Partner platform outage > 3 hours", payout: "₹500", waiting: "3-hour outage confirmation", exclusions: "Worker-side network/device issues", docs: "Platform status logs + worker login records" },
  { icon: "💼", coverage: "Account Deactivation Impact", trigger: "Verified temporary platform deactivation causing income loss", payout: "Up to ₹2,000", waiting: "Manual risk review", exclusions: "Fraud, policy breach, or legal suspension", docs: "Platform deactivation proof + risk review" },
];

const EXCLUSIONS = [
  "Health, life, accident, and vehicle-repair claims are strictly excluded.",
  "No payout for disruptions outside registered policy city/zone unless portability is enabled.",
  "Claims can be rejected for fraud indicators (GPS mismatch, duplicate abuse, fabricated events).",
  "Premium non-payment can pause coverage after grace period.",
  "Policy is for income-loss compensation, not asset or medical compensation.",
];

export default function PolicyTermsPage() {
  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const b = (d: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: d * 0.06 } } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">📘 Policy Terms & Conditions</h1>
          <p className="text-sm text-text-secondary mt-0.5">Coverage activation, trigger logic, payouts, and exclusions.</p>
        </div>
        <span className="rounded-full border border-accent-amber/30 bg-accent-amber/10 px-4 py-2 text-[10px] font-semibold text-accent-amber">Version 1.0 • Weekly Model</span>
      </div>

      <motion.div {...b(1)} className="grid gap-3 md:grid-cols-3">
        {[
          ["Policy Type", "Parametric Income Protection"],
          ["Billing Cycle", "Weekly"],
          ["Payout SLA", "Instant / Auto-processed"],
        ].map(x => (
          <div key={x[0]} className={`${card} p-4`}>
            <p className="text-[10px] text-text-muted">{x[0]}</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{x[1]}</p>
          </div>
        ))}
      </motion.div>

      <motion.div {...b(2)} className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-surface-2/40">
                {["Coverage","Trigger Condition","Payout","Waiting / Validation","Evidence","Key Exclusions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TERMS.map(t => (
                <tr key={t.coverage} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm font-semibold text-text-primary">{t.icon} {t.coverage}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{t.trigger}</td>
                  <td className="px-4 py-3 text-sm font-bold text-accent-amber">{t.payout}</td>
                  <td className="px-4 py-3 text-xs text-text-secondary">{t.waiting}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{t.docs}</td>
                  <td className="px-4 py-3 text-xs text-state-warning">{t.exclusions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-2">
        <motion.div {...b(3)} className="rounded-2xl border border-state-warning/30 bg-state-warning/[0.05] p-5">
          <h2 className="text-sm font-bold text-state-warning">⚠️ Global Exclusions</h2>
          <ul className="mt-3 space-y-2 text-xs text-text-secondary list-disc list-inside">
            {EXCLUSIONS.map(x => <li key={x}>{x}</li>)}
          </ul>
        </motion.div>

        <motion.div {...b(4)} className="rounded-2xl border border-state-success/30 bg-state-success/[0.05] p-5">
          <h2 className="text-sm font-bold text-state-success">✅ Worker Obligations</h2>
          <ul className="mt-3 space-y-2 text-xs text-text-secondary list-disc list-inside">
            <li>Maintain valid profile details and emergency contact.</li>
            <li>Keep location and activity permissions enabled for fraud checks.</li>
            <li>Pay premium on weekly billing cycle to keep coverage active.</li>
            <li>Avoid duplicate/false claims; such activity can terminate policy.</li>
            <li>Use support workflow for manual review scenarios.</li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
