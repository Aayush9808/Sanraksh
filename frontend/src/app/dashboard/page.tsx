"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { API_BASE } from "@/lib/config";

function Counter({ end, prefix="", suffix="" }: { end:number; prefix?:string; suffix?:string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let n = 0; const step = end / (1600 / 16);
      const t = setInterval(() => {
        n += step;
        if (n >= end) { setV(end); clearInterval(t); } else setV(n);
      }, 16);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <div ref={ref}>{prefix}{end >= 1000 ? Math.floor(v).toLocaleString() : Math.floor(v)}{suffix}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKER HOME VIEW
// ─────────────────────────────────────────────────────────────────────────────
const WORKER_PAYOUTS = [
  { date:"Mar 24, 2026", event:"Heavy Rain",  amount:280, status:"paid" },
  { date:"Mar 18, 2026", event:"App Outage",  amount:200, status:"paid" },
  { date:"Mar 10, 2026", event:"Curfew",      amount:350, status:"paid" },
];
const WORKER_TRIGGERS = [
  { type:"Heavy Rain",    zone:"Andheri West",    payout:"₹280/day", severity:0.82, status:"active" },
  { type:"App Outage",   zone:"Zomato — Mumbai", payout:"₹200/inc", severity:0.68, status:"active" },
  { type:"AQI Alert",   zone:"Delhi NCR",         payout:"₹150/day", severity:0.44, status:"watch"  },
];

function WorkerHome() {
  return (
    <div className="max-w-4xl">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Worker portal</p>
          <h1 className="text-[#F5F0E8] font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Your Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot dot-live" />
          <span className="lbl-live">Coverage active</span>
        </div>
      </div>

      {/* Policy status strip */}
      <div className="panel-amber p-4 mb-5 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber/15 border border-amber/30 flex items-center justify-center flex-shrink-0">
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div className="text-[#F5F0E8] font-bold">GigShield Standard</div>
            <div className="lbl">POL-2024-8821 · Active till Apr 2027</div>
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <div className="lbl mb-1.5">Coverage remaining</div>
          <div className="prog-track">
            <div className="prog-fill" style={{width:"79%",animation:"none"}} />
          </div>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Link href="/dashboard/my-policy"><button className="btn-outline-amber btn-sm">View policy</button></Link>
          <Link href="/dashboard/triggers"><button className="btn-amber btn-sm">Live triggers</button></Link>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          { label:"Total earned",        val:2840,  prefix:"₹", suffix:"",      amber:true  },
          { label:"Claims this month",   val:3,     prefix:"",  suffix:"",      amber:false },
          { label:"Active triggers",     val:2,     prefix:"",  suffix:" now",  amber:false },
          { label:"Coverage days left",  val:287,   prefix:"",  suffix:" days", amber:false },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
            className="panel p-4">
            <div className="lbl mb-2">{k.label}</div>
            <div className={`font-extrabold text-2xl ${k.amber?"text-amber":"text-[#F5F0E8]"}`}
              style={{letterSpacing:"-0.04em",lineHeight:1}}>
              {k.prefix}<Counter end={k.val} />{k.suffix}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-5">
        {/* Active triggers */}
        <div className="panel overflow-hidden">
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <div className="flex justify-between items-center">
              <div>
                <p className="lbl mb-0.5">Signal monitor</p>
                <h2 className="text-[#F5F0E8] font-bold" style={{letterSpacing:"-0.02em"}}>Active triggers in your city</h2>
              </div>
              <Link href="/dashboard/triggers"><span className="lbl hover:text-amber transition-colors cursor-pointer">View all →</span></Link>
            </div>
          </div>
          <div className="divide-y divide-[#2A2218]">
            {WORKER_TRIGGERS.map(t => {
              const c = t.severity>=0.75?"#EF4444":t.severity>=0.45?"#F59E0B":"#10B981";
              return (
                <div key={t.type} className="flex items-center gap-4 px-5 py-3.5"
                  style={{borderLeft:`3px solid ${c}`}}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[#C8BAA0] font-semibold text-sm">{t.type}</span>
                      <span className={`tag ${t.status==="active"?"tag-neg":"tag-warn"}`}>{t.status}</span>
                    </div>
                    <div className="lbl">{t.zone}</div>
                  </div>
                  <div className="text-amber font-mono font-bold text-sm flex-shrink-0">{t.payout}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent payouts */}
        <div className="panel overflow-hidden">
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <p className="lbl mb-0.5">Payment history</p>
            <h2 className="text-[#F5F0E8] font-bold" style={{letterSpacing:"-0.02em"}}>Recent payouts</h2>
          </div>
          <div className="divide-y divide-[#2A2218]">
            {WORKER_PAYOUTS.map(p => (
              <div key={p.date} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-[#C8BAA0] font-medium text-sm">{p.event}</div>
                  <div className="lbl mt-0.5">{p.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-amber font-mono font-bold">₹{p.amount}</div>
                  <div className="tag tag-live mt-1">{p.status}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4">
            <Link href="/dashboard/my-policy">
              <button className="w-full btn-ghost btn-sm">Full history →</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN COMMAND VIEW
// ─────────────────────────────────────────────────────────────────────────────
const CLAIMS_DEMO = [
  { id:"CLM-8821", worker:"Rahul Kumar",  event:"Heavy Rain",    amount:280, status:"approved", fraud:0.08, time:"12 min ago" },
  { id:"CLM-8820", worker:"Priya Mistry", event:"App Outage",    amount:200, status:"review",   fraud:0.34, time:"28 min ago" },
  { id:"CLM-8819", worker:"Arjun Sharma", event:"Curfew",        amount:350, status:"approved", fraud:0.06, time:"41 min ago" },
  { id:"CLM-8818", worker:"Meena Rajan",  event:"Flood Warning", amount:280, status:"approved", fraud:0.11, time:"1h ago"     },
  { id:"CLM-8817", worker:"Vikram Patil", event:"Heat Wave",     amount:200, status:"rejected",  fraud:0.82, time:"1.5h ago"  },
  { id:"CLM-8816", worker:"Divya Nair",   event:"Heavy Rain",    amount:280, status:"approved", fraud:0.09, time:"2h ago"    },
];
const DISRUPTIONS_DEMO = [
  { zone:"Andheri West, Mumbai",   type:"Heavy Rain",    severity:0.82, workers:243, color:"#EF4444" },
  { zone:"Koramangala, Bengaluru", type:"App Outage",    severity:0.68, workers:187, color:"#F59E0B" },
  { zone:"Saket, Delhi",           type:"AQI Alert",     severity:0.44, workers:156, color:"#F59E0B" },
  { zone:"Banjara Hills, Hyd",     type:"Heavy Rain",    severity:0.35, workers:98,  color:"#10B981" },
  { zone:"T.Nagar, Chennai",       type:"Cyclone Watch", severity:0.91, workers:312, color:"#EF4444" },
];
const KPIS = [
  { label:"Active claims",      val:127,   prefix:"",  suffix:"",       delta:"+12",  up:false, amber:false },
  { label:"Payouts today",      val:89400, prefix:"₹", suffix:"",       delta:"+24%", up:true,  amber:true  },
  { label:"Workers online",     val:14200, prefix:"",  suffix:"+",      delta:"+840", up:true,  amber:false },
  { label:"Avg. payout time",   val:4,     prefix:"",  suffix:" hrs",   delta:"-30min",up:true, amber:false },
  { label:"Fraud detected",     val:4,     prefix:"",  suffix:" flags", delta:"",     up:false, amber:false },
  { label:"Engine runs today",  val:24,    prefix:"",  suffix:"",       delta:"100%", up:true,  amber:false },
];

function StatusTag({ s }: { s:string }) {
  const m: Record<string,string> = { approved:"tag-live", review:"tag-warn", rejected:"tag-neg", pending:"tag-neutral" };
  return <span className={`tag ${m[s] || "tag-neutral"}`}>{s}</span>;
}
function FraudBar({ score }: { score:number }) {
  const color = score>0.6?"#EF4444":score>0.3?"#F59E0B":"#10B981";
  return (
    <div className="flex items-center gap-2">
      <div className="prog-track flex-1" style={{minWidth:60}}>
        <div className="prog-fill" style={{width:`${score*100}%`,background:color,animation:"none"}} />
      </div>
      <span className="font-mono text-xs" style={{color}}>{(score*100).toFixed(0)}%</span>
    </div>
  );
}

function AdminHome() {
  const [claims, setClaims] = useState(CLAIMS_DEMO);

  useEffect(() => {
    const token = typeof window!=="undefined" ? localStorage.getItem("token") : "";
    fetch(`${API_BASE}/api/v1/claims/?limit=6`, {
      headers: { Authorization: `Bearer ${token||""}` }
    }).then(r=>r.ok?r.json():null).then(d=>{ if(d?.claims) setClaims(d.claims); }).catch(()=>{});
  }, []);

  return (
    <div className="max-w-[1500px]">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Operations center</p>
          <h1 className="text-[#F5F0E8] font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Command Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot dot-live" />
          <span className="lbl-live">All systems operational</span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {KPIS.map((k, i) => (
          <motion.div key={k.label} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
            className={`panel p-4 ${k.amber?"panel-amber":""}`}>
            <div className="lbl mb-2">{k.label}</div>
            <div className={`font-extrabold text-2xl mb-1 ${k.amber?"text-amber":"text-[#F5F0E8]"}`}
              style={{letterSpacing:"-0.04em",lineHeight:1}}>
              {k.prefix}<Counter end={k.val} />{k.suffix}
            </div>
            {k.delta && (
              <div className={`font-mono text-xs ${k.up?"text-signal-live":"text-signal-neg"}`}>{k.delta}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Claims + Disruptions */}
      <div className="grid xl:grid-cols-[1fr_340px] gap-5">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between" style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <div>
              <p className="lbl mb-1">Recent activity</p>
              <h2 className="text-[#F5F0E8] font-bold" style={{letterSpacing:"-0.02em"}}>Claims feed</h2>
            </div>
            <Link href="/dashboard/claims"><button className="btn-ghost btn-sm text-xs">View all →</button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl tbl-click">
              <thead><tr><th>Claim ID</th><th>Worker</th><th>Event</th><th>Amount</th><th>Fraud</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {claims.map((c) => (
                  <Link key={c.id} href="/dashboard/claims" legacyBehavior><tr style={{cursor:"pointer"}}>
                    <td><span className="font-mono text-[#F5F0E8] text-xs">{c.id}</span></td>
                    <td><span className="text-[#C8BAA0] font-medium">{c.worker}</span></td>
                    <td>{c.event}</td>
                    <td><span className="text-amber font-mono font-bold">₹{c.amount}</span></td>
                    <td><FraudBar score={c.fraud} /></td>
                    <td><StatusTag s={c.status} /></td>
                    <td><span className="lbl">{c.time}</span></td>
                  </tr></Link>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid #2A2218"}}>
            <div className="flex items-center justify-between">
              <div>
                <p className="lbl mb-1">Signal monitor</p>
                <h2 className="text-[#F5F0E8] font-bold" style={{letterSpacing:"-0.02em"}}>Active disruptions</h2>
              </div>
              <span className="dot dot-live" />
            </div>
          </div>
          <div className="p-3 space-y-2">
            {DISRUPTIONS_DEMO.map((d, i) => (
              <motion.div key={d.zone} initial={{opacity:0,x:12}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.1}}
                className="panel-inset p-3" style={{borderLeft:`3px solid ${d.color}`}}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[#F5F0E8] text-sm font-semibold mb-0.5">{d.zone}</div>
                    <div className="lbl mb-2">{d.type}</div>
                    <div className="prog-track" style={{width:120}}>
                      <div className="prog-fill" style={{width:`${d.severity*100}%`,background:d.color,animation:"none"}} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[#F5F0E8] font-bold text-sm">{d.workers}</div>
                    <div className="lbl">workers</div>
                  </div>
                </div>
              </motion.div>
            ))}
            <Link href="/dashboard/risk-map">
              <button className="w-full btn-ghost btn-sm mt-2">View risk map →</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT — choose view by role
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [role, setRole] = useState<string>("worker");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRole(localStorage.getItem("role") || "worker");
    }
  }, []);

  return role === "admin" ? <AdminHome /> : <WorkerHome />;
}
