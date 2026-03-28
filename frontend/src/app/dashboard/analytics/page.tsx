"use client";
import dynamic from "next/dynamic";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CLAIMS_DATA = [
  {month:"Oct",claims:42,amount:11760},{month:"Nov",claims:58,amount:16240},{month:"Dec",claims:91,amount:25480},
  {month:"Jan",claims:76,amount:21280},{month:"Feb",claims:104,amount:29120},{month:"Mar",claims:127,amount:35560},
];
const PAYOUT_DATA = [
  {day:"Mon",amount:4200},{day:"Tue",amount:6800},{day:"Wed",amount:3200},{day:"Thu",amount:8900},
  {day:"Fri",amount:11200},{day:"Sat",amount:7400},{day:"Sun",amount:5600},
];
const EVENTS = [
  { type:"Heavy Rain",  count:48, pct:38, color:"#60A5FA" },
  { type:"App Outage",  count:31, pct:24, color:"#F59E0B" },
  { type:"Curfew",      count:24, pct:19, color:"#EF4444" },
  { type:"AQI Alert",   count:14, pct:11, color:"#10B981" },
  { type:"Heat Wave",   count:10, pct:8,  color:"#A78BFA" },
];

const TT_STYLE = { background:"#14100A", border:"1px solid #2A2218", borderRadius:8, color:"#C8BAA0" };

export default function AnalyticsPage() {
  return (
    <div className="max-w-[1400px]">
      <div className="section-head">
        <div><p className="lbl mb-1">Admin portal</p><h1 className="text-[#F5F0E8] font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Analytics</h1></div>
        <span className="tag tag-info">Last 6 months</span>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {label:"Total payouts YTD", val:"₹89,400",  sub:"+24% vs last yr"},
          {label:"Claims processed",   val:"498",      sub:"127 this month"},
          {label:"Avg. claim value",   val:"₹248",     sub:"↓ ₹12 vs last mo"},
          {label:"Fraud prevented",    val:"₹28,400",  sub:"17 flagged, 4 rejected"},
        ].map(k => (
          <div key={k.label} className="panel p-4">
            <div className="lbl mb-2">{k.label}</div>
            <div className="text-[#F5F0E8] font-extrabold text-2xl mb-1" style={{letterSpacing:"-0.04em"}}>{k.val}</div>
            <div className="lbl" style={{color:"#6B5C44"}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_1fr] gap-5 mb-5">
        {/* Claims volume chart */}
        <div className="panel p-5">
          <p className="lbl mb-1">Monthly volume</p>
          <h3 className="text-[#F5F0E8] font-bold mb-4" style={{letterSpacing:"-0.02em"}}>Claims by month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CLAIMS_DATA} barSize={28}>
              <CartesianGrid vertical={false} stroke="#2A2218" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#4A3E2A",fontSize:11,fontFamily:"var(--font-mono)"}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill:"#4A3E2A",fontSize:11,fontFamily:"var(--font-mono)"}} />
              <Tooltip contentStyle={TT_STYLE} cursor={{fill:"rgba(245,158,11,0.05)"}} />
              <Bar dataKey="claims" fill="#F59E0B" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payout trend */}
        <div className="panel p-5">
          <p className="lbl mb-1">This week</p>
          <h3 className="text-[#F5F0E8] font-bold mb-4" style={{letterSpacing:"-0.02em"}}>Daily payout volume (₹)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={PAYOUT_DATA}>
              <CartesianGrid vertical={false} stroke="#2A2218" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#4A3E2A",fontSize:11,fontFamily:"var(--font-mono)"}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill:"#4A3E2A",fontSize:11,fontFamily:"var(--font-mono)"}} />
              <Tooltip contentStyle={TT_STYLE} cursor={{stroke:"rgba(245,158,11,0.2)"}} />
              <Line dataKey="amount" stroke="#F59E0B" strokeWidth={2} dot={{fill:"#F59E0B",r:4}} activeDot={{r:6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event breakdown */}
      <div className="panel p-5">
        <p className="lbl mb-1">Cause analysis</p>
        <h3 className="text-[#F5F0E8] font-bold mb-4" style={{letterSpacing:"-0.02em"}}>Claims by disruption type — this month</h3>
        <div className="space-y-3">
          {EVENTS.map(e => (
            <div key={e.type} className="flex items-center gap-4">
              <div className="w-28 text-sm text-[#9A8A72] flex-shrink-0">{e.type}</div>
              <div className="prog-track flex-1">
                <div className="prog-fill" style={{width:`${e.pct}%`,background:e.color,animation:"none"}} />
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-mono text-sm font-bold text-[#F5F0E8]">{e.count}</span>
                <span className="lbl w-8 text-right">{e.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
