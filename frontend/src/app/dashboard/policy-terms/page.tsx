"use client";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    id: "01",
    title: "Policy Overview",
    content: "GigShield provides parametric income protection insurance for registered gig workers in India. Coverage is trigger-based: when predefined conditions are met and verified by our AI engine, payouts are automatically initiated. No claim forms are required.",
  },
  {
    id: "02",
    title: "Eligibility",
    content: "Any active delivery partner registered with Swiggy, Zomato, Blinkit, Zepto, Amazon, or other partner platforms in covered cities is eligible. Registration requires a valid Indian mobile number and active delivery account.",
  },
  {
    id: "03",
    title: "Trigger Conditions",
    content: "Each coverage type has a specific, publicly verifiable trigger condition. Conditions are sourced from IMD (weather), CPCB (AQI), government sources (curfews), and platform APIs (outages). Triggers are verified independently and cannot be manually filed.",
  },
  {
    id: "04",
    title: "Payout Structure",
    content: "Payouts are fixed amounts per trigger event, not income-replacement based. Multiple triggers in the same event period may compound. Maximum payouts cap at \u20b96,000 per week across all coverage types combined.",
  },
  {
    id: "05",
    title: "Fraud Prevention",
    content: "Our ML engine performs 5-factor fraud scoring on every trigger: GPS verification, claim frequency, peer validation via your delivery network, anomaly detection, and timing analysis. Fraudulent claims result in permanent account suspension.",
  },
  {
    id: "06",
    title: "Premium & Billing",
    content: "Weekly premiums start at \u20b940/week. Premiums are auto-debited via UPI on the registered number every 7 days. Coverage is paused if payment fails and resumes upon successful payment.",
  },
  {
    id: "07",
    title: "Claims & Disputes",
    content: "All trigger decisions carry a trace code for audit purposes. If you believe a trigger was incorrectly processed, you may raise a dispute within 7 days. Disputes are reviewed within 48 hours by our compliance team.",
  },
  {
    id: "08",
    title: "Cancellation",
    content: "Coverage may be cancelled at any time via the app or WhatsApp. Remaining weekly premium is not refunded but coverage stays active until the end of the paid period. Cancellation takes effect at the next renewal date.",
  },
];

export default function PolicyTermsPage() {
  return (
    <div className="p-6 xl:p-8 max-w-[900px]">
      <div className="border-b border-[#1a1a1a] pb-5 mb-12">
        <p className="mono-label mb-1.5">Legal documentation</p>
        <h1 className="text-2xl font-black text-white tracking-tight">Policy Terms</h1>
        <p className="font-mono text-[11px] text-[#444] mt-2">Effective March 2026 \u2014 Version 3.1</p>
      </div>

      <div className="space-y-0 border-t border-[#1a1a1a]">
        {SECTIONS.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="border-b border-[#1a1a1a] py-8 grid md:grid-cols-[80px_1fr] gap-6"
          >
            <div className="font-mono text-[2rem] font-black text-[#1a1a1a] leading-none">{section.id}</div>
            <div>
              <h2 className="text-base font-bold text-white mb-3">{section.title}</h2>
              <p className="font-mono text-[12px] text-[#555] leading-relaxed">{section.content}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 border border-[#1a1a1a] p-6">
        <p className="mono-label mb-2">Governing law</p>
        <p className="font-mono text-[11px] text-[#444]">
          This policy is governed by the laws of India. All disputes are subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.
          GigShield is a product of GigTech Insurance Pvt. Ltd., IRDAI License No. IRDAI/HLT/2024/GIG001.
        </p>
      </div>
    </div>
  );
}
