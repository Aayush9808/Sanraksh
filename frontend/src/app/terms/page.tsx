"use client";
import Link from "next/link";

const PLANS = [
  {
    name: "GigArmor Lite",
    price: "₹29/week",
    triggers: ["Heavy rain (≥ 8 mm/hr in your zone)", "Platform outage (≥ 2 hours)"],
    payout: "₹280 per qualifying event",
    cap: "Up to 3 events/week",
    waitPeriod: "24 hours after policy activation",
    exclusions: ["Self-reported incidents without data confirmation", "Events outside registered zone"],
  },
  {
    name: "GigArmor Standard",
    price: "₹49/week",
    triggers: ["Heavy rain (≥ 6 mm/hr)", "Platform outage (≥ 1.5 hours)", "Government-declared curfew", "AQI > 300 (Severe)"],
    payout: "₹420 per qualifying event",
    cap: "Up to 5 events/week",
    waitPeriod: "12 hours after policy activation",
    exclusions: ["Events not corroborated by official data feeds", "Duplicate claims in same event window"],
  },
  {
    name: "GigArmor Pro",
    price: "₹79/week",
    triggers: ["Heavy rain (≥ 5 mm/hr)", "Platform outage (≥ 1 hour)", "Curfew", "AQI > 250", "Heat wave (≥ 42°C)", "Cyclone / extreme weather advisory"],
    payout: "₹840 per qualifying event",
    cap: "Up to 7 events/week",
    waitPeriod: "Instant — 0-hour wait",
    exclusions: ["Fraudulent GPS spoofing", "Claims submitted after 7-day event window"],
  },
];

const SECTIONS = [
  {
    title: "1. Introduction",
    body: `These Terms and Conditions ("Terms") govern your use of GigArmor, a parametric income protection platform operated for gig workers ("you", "worker") by GigArmor ("we", "us"). By registering or activating a policy, you agree to these Terms in full. If you do not agree, do not use the platform.`,
  },
  {
    title: "2. What is Parametric Insurance?",
    body: `GigArmor uses parametric (index-based) income protection. This means payouts are triggered automatically when a pre-defined measurable event (e.g., rain exceeding a threshold, platform downtime) is confirmed by an independent data feed — not by your individual claim. You do not need to file a claim. Payouts are issued within 24–72 hours of confirmed event data, depending on your plan.`,
  },
  {
    title: "3. Eligibility",
    body: `You must be at least 18 years old, registered as a delivery or gig service partner on at least one supported platform (Swiggy, Zomato, Uber, Ola, Blinkit, Dunzo, Zepto, or similar), and have a valid Indian mobile number and UPI ID or bank account for payout receipt. GigArmor does not cover vehicle damage, health incidents, accidents, or any form of non-income loss.`,
  },
  {
    title: "4. Policy Activation & Coverage Period",
    body: `Coverage begins after the applicable waiting period from activation. Weekly policies automatically expire after 7 days and must be renewed to continue coverage. Policies are non-transferable. Coverage applies only to your registered zone (city/area) as declared at time of registration.`,
  },
  {
    title: "5. Covered Events (Triggers)",
    body: `Qualifying triggers are determined solely by verified third-party data sources including the India Meteorological Department (IMD), platform status APIs, Central Pollution Control Board (CPCB) AQI feeds, and government gazette notifications. GigArmor reserves the right to update trigger thresholds with 7-day advance notice.`,
  },
  {
    title: "6. Payout Process",
    body: `When a qualifying trigger is confirmed by data, payouts are automatically credited to your registered UPI ID or bank account within 24–72 hours. No paperwork, photos, or claim submission is required. Payouts are in Indian Rupees and are subject to applicable taxes as per Indian law. GigArmor may withhold payouts if fraud is detected (see Section 8).`,
  },
  {
    title: "7. Exclusions",
    body: `GigArmor does NOT cover: (a) physical injuries or accidents, (b) vehicle damage or repair costs, (c) health or life insurance events, (d) income loss from personal reasons unrelated to a qualifying disruption event, (e) events in zones other than your registered area, (f) duplicate payout claims for the same event window, or (g) any loss arising from your own negligence or misconduct.`,
  },
  {
    title: "8. Fraud Prevention & AI Monitoring",
    body: `GigArmor employs AI-based fraud detection that monitors GPS patterns, device reuse, route feasibility, and peer-event correlation. If our system detects a high-risk fraud signal (risk score ≥ 75%), your claim will be blocked and sent to an investigation queue. Payouts may be delayed or denied if fraud is confirmed. Attempting to manipulate GPS data or file false claims may result in permanent account suspension and legal action.`,
  },
  {
    title: "9. Premium Deduction",
    body: `The weekly premium is deducted from your registered payment method at policy activation. If payment fails, coverage lapses immediately. Premiums are non-refundable once the coverage period has begun. A pro-rated refund may be issued for unused days only in cases of documented technical errors by GigArmor.`,
  },
  {
    title: "10. Cancellation & Renewal",
    body: `You may cancel auto-renewal at any time before the next billing cycle from your dashboard. Cancellation takes effect at the end of the current coverage week. GigArmor may terminate your policy if fraudulent activity is confirmed or if you breach these Terms. Upon termination, pending legitimate payouts (if any) will still be processed.`,
  },
  {
    title: "11. Data & Privacy",
    body: `GigArmor collects your phone number, zone, platform registrations, and UPI/bank details for the sole purpose of operating the coverage and processing payouts. We do not sell your data to third parties. Location data is used only for zone verification and fraud detection. For full details, refer to our Privacy Policy.`,
  },
  {
    title: "12. Dispute Resolution",
    body: `All disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka, India. Disputes will first be attempted to be resolved through our internal support process (see Support page) before escalation. GigArmor's decision on trigger confirmation, fraud flags, and payout denial is final subject to the dispute review period.`,
  },
  {
    title: "13. Changes to Terms",
    body: `GigArmor reserves the right to modify these Terms at any time. Material changes will be communicated via registered mobile number with at least 7 days' notice. Continued use of the platform after changes constitutes acceptance.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center px-4 sm:px-6">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0F2044] flex items-center justify-center">
              <span className="text-white font-black text-xs">GA</span>
            </div>
            <span className="font-bold text-slate-900 tracking-tight">GigArmor</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">← Back to home</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-wider mb-4">
            Legal document
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Terms & Conditions</h1>
          <p className="text-slate-500">Last updated: March 2026 · Effective from plan activation</p>
        </div>

        {/* Intro callout */}
        <div className="bg-[#0F2044] rounded-2xl p-6 mb-10 text-white">
          <p className="text-base font-semibold leading-relaxed">
            GigArmor is a <span className="text-amber-400">parametric income protection platform</span> — not traditional insurance. Payouts are triggered automatically by verified external data (weather, platform APIs, government alerts). No claim forms, no paperwork, no waiting room.
          </p>
        </div>

        {/* Plan comparison */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Plan Coverage Details</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => (
              <div key={plan.name} className={`rounded-2xl border p-5 ${i === 1 ? "border-[#0F2044] bg-[#0F2044]/5 shadow-md" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{plan.name}</h3>
                    <span className="text-2xl font-extrabold text-[#0F2044]">{plan.price}</span>
                  </div>
                  {i === 1 && <span className="text-[10px] font-bold bg-amber-400 text-[#0F2044] px-2 py-0.5 rounded-full uppercase">Popular</span>}
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Triggers covered</p>
                    <ul className="space-y-1">
                      {plan.triggers.map(t => (
                        <li key={t} className="flex gap-2 text-slate-700">
                          <span className="text-emerald-500 font-bold mt-0.5 shrink-0">✓</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payout per event</span>
                      <span className="font-bold text-slate-900">{plan.payout}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Weekly cap</span>
                      <span className="font-bold text-slate-900">{plan.cap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Wait period</span>
                      <span className="font-bold text-slate-900">{plan.waitPeriod}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1.5">Not covered</p>
                    <ul className="space-y-1">
                      {plan.exclusions.map(e => (
                        <li key={e} className="flex gap-2 text-slate-500 text-xs">
                          <span className="text-red-400 font-bold shrink-0">✕</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full terms */}
        <div className="space-y-6">
          {SECTIONS.map(s => (
            <div key={s.title} className="border-b border-slate-100 pb-6">
              <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">Questions? <Link href="/support" className="text-[#0F2044] font-semibold hover:underline">Contact our support team →</Link></p>
          <Link href="/register" className="bg-[#0F2044] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#1E3A5F] transition-all">
            Get protected now →
          </Link>
        </div>
      </div>
    </div>
  );
}
