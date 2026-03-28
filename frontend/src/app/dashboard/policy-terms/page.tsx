"use client";

const CONDITIONS = [
  {
    id:"C1", event:"Heavy Rainfall / Flooding",
    if_:"IMD issues Orange or Red rainfall warning for worker's district",
    and_:"Warning active for ≥ 2 hours continuously",
    then:"₹280 credited to linked UPI account",
    frequency:"Per calendar day, max ₹840/72h",
  },
  {
    id:"C2", event:"Platform App Outage",
    if_:"Swiggy, Zomato, or Uber status page shows degraded/down",
    and_:"Outage duration ≥ 4 hours verified by platform API",
    then:"₹200 credited per verified incident",
    frequency:"Max 3 incidents per month",
  },
  {
    id:"C3", event:"Government Curfew / Section 144",
    if_:"Official government order prohibiting movement in worker's zone",
    and_:"Order in effect for ≥ 6 hours",
    then:"₹350 credited per day curfew is active",
    frequency:"Per calendar day, max ₹1,050/72h",
  },
  {
    id:"C4", event:"Severe Air Quality (AQI > 400)",
    if_:"CPCB real-time AQI monitor reports city-level AQI > 400 (Severe+)",
    and_:"Reading sustained for ≥ 4 hours",
    then:"₹150 credited per calendar day",
    frequency:"Max 5 days per rolling 30 days",
  },
  {
    id:"C5", event:"Cyclone Warning",
    if_:"IMD issues Cyclone Watch or Warning for coastal zone",
    and_:"Worker's registered city within declared impact radius",
    then:"₹400 credited per day warning is active",
    frequency:"Unlimited during active warning period",
  },
];

export default function PolicyTermsPage() {
  return (
    <div className="max-w-4xl">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Legal & coverage</p>
          <h1 className="text-[#F5F0E8] font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Policy Terms — Plain Language</h1>
        </div>
        <span className="tag tag-info">v3.2 · Mar 2026</span>
      </div>

      <div className="panel-amber p-4 mb-6">
        <p className="lbl-amber mb-1">How to read this</p>
        <p className="text-sm text-[#C8BAA0] leading-relaxed">
          Each condition below defines exactly when a payout triggers. When the <strong className="text-amber">IF</strong> and <strong className="text-amber">AND</strong> conditions are both met, the <strong className="text-amber">THEN</strong> action executes automatically — no form, no call, no wait.
        </p>
      </div>

      <div className="space-y-4">
        {CONDITIONS.map((c, i) => (
          <div key={c.id} className="panel overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2A2218] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#4A3E2A]">{c.id}</span>
                <h3 className="text-[#F5F0E8] font-bold">{c.event}</h3>
              </div>
              <span className="tag tag-live">Active</span>
            </div>
            <div className="p-5 grid md:grid-cols-[1fr_1fr_auto] gap-4">
              <div className="panel-inset p-3">
                <p className="lbl-amber mb-2">IF</p>
                <p className="text-sm text-[#C8BAA0] leading-relaxed">{c.if_}</p>
              </div>
              <div className="panel-inset p-3">
                <p className="lbl mb-2" style={{color:"#60A5FA"}}>AND</p>
                <p className="text-sm text-[#C8BAA0] leading-relaxed">{c.and_}</p>
              </div>
              <div className="panel-amber p-3 min-w-[160px]">
                <p className="lbl-amber mb-2">THEN (auto)</p>
                <p className="text-amber font-bold text-base">{c.then}</p>
                <p className="lbl mt-2">{c.frequency}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel p-5 mt-6">
        <p className="lbl mb-2">General provisions</p>
        <ul className="space-y-2 text-sm text-[#6B5C44] leading-relaxed">
          <li>• All trigger decisions use independent, publicly verifiable data sources</li>
          <li>• GigShield holds no discretion in payout decisions — outcomes are entirely algorithmic</li>
          <li>• Disputes must be raised within 14 days of the relevant trigger event</li>
          <li>• Policy is governed by Indian Contract Act, 1872 · IRDAI parametric guidelines 2024</li>
        </ul>
      </div>
    </div>
  );
}
