"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

const MOCK: Claim[] = [
  { id:"CLM-8821", worker:"Rahul Kumar",     phone:"+91 9900001111", event:"Heavy Rain",   amount:280, status:"review",   fraud:0.08, city:"Mumbai",    platform:"Swiggy",  created:"28 Mar 2026, 14:22" },
  { id:"CLM-8820", worker:"Priya Mistry",    phone:"+91 9900002222", event:"App Outage",   amount:200, status:"review",   fraud:0.34, city:"Bengaluru",  platform:"Zomato",  created:"28 Mar 2026, 13:50" },
  { id:"CLM-8819", worker:"Arjun Sharma",    phone:"+91 9900003333", event:"Curfew",       amount:350, status:"approved", fraud:0.06, city:"Delhi",      platform:"Uber",    created:"28 Mar 2026, 11:15" },
  { id:"CLM-8818", worker:"Meena Rajan",     phone:"+91 9900004444", event:"Flood",        amount:280, status:"approved", fraud:0.11, city:"Chennai",    platform:"Dunzo",   created:"28 Mar 2026, 09:40" },
  { id:"CLM-8817", worker:"Vikram Patil",    phone:"+91 9900005555", event:"Heat Wave",    amount:200, status:"rejected",  fraud:0.82, city:"Hyderabad",  platform:"Swiggy",  created:"27 Mar 2026, 22:10" },
  { id:"CLM-8816", worker:"Divya Nair",      phone:"+91 9900006666", event:"Heavy Rain",   amount:280, status:"approved", fraud:0.09, city:"Pune",       platform:"Zomato",  created:"27 Mar 2026, 18:30" },
  { id:"CLM-8815", worker:"Kiran Rao",       phone:"+91 9900007777", event:"AQI Alert",    amount:150, status:"review",   fraud:0.45, city:"Delhi",      platform:"Uber",    created:"27 Mar 2026, 15:55" },
  { id:"CLM-8814", worker:"Anita Desai",     phone:"+91 9900008888", event:"App Outage",   amount:200, status:"approved", fraud:0.07, city:"Mumbai",     platform:"Swiggy",  created:"27 Mar 2026, 12:20" },
];

interface Claim {
  id:string; worker:string; phone:string; event:string; amount:number;
  status:string; fraud:number; city:string; platform:string; created:string;
}

const STATUS_TAB = ["all","review","approved","rejected"] as const;

function FraudBar({ s }: { s:number }) {
  const c = s>0.6?"#EF4444":s>0.3?"#F59E0B":"#10B981";
  return (
    <div className="flex items-center gap-2">
      <div className="prog-track" style={{width:56}}>
        <div style={{height:"100%",background:c,borderRadius:2,width:`${s*100}%`}} />
      </div>
      <span className="font-mono text-xs" style={{color:c}}>{(s*100).toFixed(0)}%</span>
    </div>
  );
}

function StatusTag({ s }: { s:string }) {
  const m: Record<string,string> = { approved:"tag-live", review:"tag-warn", rejected:"tag-neg" };
  return <span className={`tag ${m[s]||"tag-neutral"}`}>{s}</span>;
}

function DetailPanel({ claim, onClose, onAction }: { claim:Claim; onClose:()=>void; onAction:(id:string,action:string)=>void }) {
  const fraudColor = claim.fraud>0.6?"#EF4444":claim.fraud>0.3?"#F59E0B":"#10B981";
  return (
    <motion.div initial={{x:400,opacity:0}} animate={{x:0,opacity:1}} exit={{x:400,opacity:0}}
      transition={{duration:0.3,ease:[0.16,1,0.3,1]}}
      className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
      style={{width:380,background:"#14100A",borderLeft:"1px solid #2A2218",boxShadow:"-24px 0 48px rgba(0,0,0,0.4)"}}
    >
      <div className="sticky top-0 px-5 py-4 border-b border-slate-200 flex items-center justify-between"
        style={{background:"#14100A",zIndex:1}}>
        <div>
          <p className="lbl mb-0.5">Claim detail</p>
          <div className="text-slate-800 font-bold font-mono">{claim.id}</div>
        </div>
        <button onClick={onClose} className="rail-btn text-lg">✕</button>
      </div>

      <div className="p-5 space-y-5">
        {/* Worker */}
        <div>
          <p className="lbl mb-2">Worker</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center">
              <span className="text-amber font-bold">{claim.worker.charAt(0)}</span>
            </div>
            <div>
              <div className="text-slate-800 font-semibold">{claim.worker}</div>
              <div className="lbl">{claim.phone} · {claim.city}</div>
            </div>
          </div>
        </div>

        <div className="div-h" />

        {/* Event details */}
        <div className="space-y-2">
          <p className="lbl mb-2">Event & payout</p>
          {[
            ["Event type",claim.event],
            ["Platform", claim.platform],
            ["Amount",   "₹"+claim.amount],
            ["Filed",    claim.created],
          ].map(([k,v])=>(
            <div key={k} className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-sm text-slate-500">{k}</span>
              <span className={`text-sm font-medium ${k==="Amount"?"text-amber":"text-slate-600"}`}>{v}</span>
            </div>
          ))}
        </div>

        {/* Fraud score */}
        <div className="panel-inset p-4">
          <p className="lbl mb-3">Fraud signal analysis</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{border:`2px solid ${fraudColor}`,color:fraudColor}}>
              <span className="font-mono font-bold text-sm">{(claim.fraud*100).toFixed(0)}%</span>
            </div>
            <div>
              <div className="font-semibold text-sm" style={{color:fraudColor}}>
                {claim.fraud>0.6?"High risk":claim.fraud>0.3?"Medium risk":"Low risk"}
              </div>
              <div className="lbl">Composite fraud score</div>
            </div>
          </div>
          <div className="space-y-2">
            {[
              ["Location match",   Math.max(0, 1-claim.fraud-0.1)],
              ["Timing pattern",   Math.max(0, 1-claim.fraud+0.05)],
              ["Claim frequency",  Math.min(1, claim.fraud+0.1)],
              ["Signal corr.",    Math.max(0, 1-claim.fraud-0.05)],
            ].map(([label, v]) => {
              const val = v as number;
              const col = val>0.7?"#10B981":val>0.4?"#F59E0B":"#EF4444";
              return (
                <div key={label as string} className="flex items-center gap-2">
                  <span className="lbl w-28 flex-shrink-0">{label as string}</span>
                  <div className="prog-track flex-1">
                    <div style={{height:"100%",background:col,borderRadius:2,width:`${val*100}%`}} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        {claim.status === "review" && (
          <div className="space-y-2">
            <p className="lbl mb-2">Action required</p>
            <button onClick={()=>onAction(claim.id,"approve")} className="btn-amber w-full py-3">Approve & process payout ✓</button>
            <button onClick={()=>onAction(claim.id,"reject")} className="w-full py-2.5 rounded-lg border font-semibold text-sm text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/05 transition-colors" style={{background:"transparent",cursor:"pointer"}}>Reject claim ✕</button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>(MOCK);
  const [tab, setTab] = useState<typeof STATUS_TAB[number]>("all");
  const [sel, setSel] = useState<Claim|null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/claims/?limit=50`, {
      headers:{Authorization:`Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}`}
    }).then(r=>r.ok?r.json():null).then(d=>{if(d?.claims)setClaims(d.claims);}).catch(()=>{});
  }, []);

  function doAction(id:string, action:string) {
    setClaims(prev => prev.map(c => c.id===id ? {...c, status:action==="approve"?"approved":"rejected"} : c));
    setSel(null);
    fetch(`${API_BASE}/api/v1/claims/${id}/${action}`, {
      method:"POST",
      headers:{Authorization:`Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}`}
    }).catch(()=>{});
  }

  const filtered = claims.filter(c =>
    (tab==="all" || c.status===tab) &&
    (c.worker.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search))
  );

  return (
    <div className="max-w-[1400px]">
      <div className="section-head">
        <div>
          <p className="lbl mb-1">Admin portal</p>
          <h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Claims Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="tag tag-warn">{claims.filter(c=>c.status==="review").length} pending review</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
          {STATUS_TAB.map(t => (
            <button key={t} onClick={()=>setTab(t)}
              className={`px-4 py-2 text-xs font-semibold font-mono uppercase tracking-wider transition-colors ${tab===t?"bg-amber/10 text-amber":"text-slate-500 hover:text-slate-500"}`}
            >
              {t} {t!=="all"&&<span className="ml-1">({claims.filter(c=>c.status===t).length})</span>}
            </button>
          ))}
        </div>
        <input className="field max-w-xs" style={{padding:"0.5rem 0.875rem"}} placeholder="Search worker or claim ID…"
          value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="tbl tbl-click">
            <thead>
              <tr>
                <th>Claim ID</th><th>Worker</th><th>City</th><th>Event</th>
                <th>Amount</th><th>Fraud score</th><th>Status</th><th>Filed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={()=>setSel(sel?.id===c.id?null:c)}>
                  <td><span className="font-mono text-xs text-slate-800">{c.id}</span></td>
                  <td><span className="text-slate-600 font-medium">{c.worker}</span></td>
                  <td>{c.city}</td>
                  <td>{c.event}</td>
                  <td><span className="text-amber font-mono font-bold">₹{c.amount}</span></td>
                  <td><FraudBar s={c.fraud} /></td>
                  <td><StatusTag s={c.status} /></td>
                  <td><span className="lbl">{c.created}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side panel overlay */}
      <AnimatePresence>
        {sel && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="fixed inset-0 z-40" style={{background:"rgba(6,4,2,0.7)"}}
              onClick={()=>setSel(null)}
            />
            <DetailPanel claim={sel} onClose={()=>setSel(null)} onAction={doAction} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
