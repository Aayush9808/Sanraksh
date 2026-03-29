"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "@/lib/config";

interface Worker {
  id:string; name:string; phone:string; city:string;
  platforms:string[]; status:string; risk:number;
  claims:number; total_earned:number; kyc:string; joined:string;
}
const MOCK: Worker[] = [
  { id:"WRK-001", name:"Rahul Kumar",   phone:"+91 9900001111", city:"Mumbai",    platforms:["Swiggy","Uber"],        status:"active", risk:0.12, claims:8,  total_earned:2240, kyc:"verified", joined:"Jan 2026" },
  { id:"WRK-002", name:"Priya Mistry",  phone:"+91 9900002222", city:"Bengaluru", platforms:["Zomato"],              status:"active", risk:0.34, claims:3,  total_earned:860,  kyc:"verified", joined:"Feb 2026" },
  { id:"WRK-003", name:"Arjun Sharma",  phone:"+91 9900003333", city:"Delhi",     platforms:["Uber","Ola"],          status:"active", risk:0.06, claims:12, total_earned:3680, kyc:"verified", joined:"Nov 2025" },
  { id:"WRK-004", name:"Meena Rajan",   phone:"+91 9900004444", city:"Chennai",   platforms:["Dunzo","Swiggy"],      status:"active", risk:0.11, claims:5,  total_earned:1420, kyc:"verified", joined:"Dec 2025" },
  { id:"WRK-005", name:"Vikram Patil",  phone:"+91 9900005555", city:"Hyderabad", platforms:["Swiggy"],              status:"flagged",risk:0.82, claims:21, total_earned:5800, kyc:"review",   joined:"Oct 2025" },
  { id:"WRK-006", name:"Divya Nair",    phone:"+91 9900006666", city:"Pune",      platforms:["Zomato","Blinkit"],    status:"active", risk:0.09, claims:4,  total_earned:1120, kyc:"verified", joined:"Jan 2026" },
  { id:"WRK-007", name:"Kiran Rao",     phone:"+91 9900007777", city:"Delhi",     platforms:["Uber"],                status:"active", risk:0.45, claims:7,  total_earned:1960, kyc:"pending",  joined:"Mar 2026" },
];

function RiskBadge({ v }: { v:number }) {
  if (v>0.6) return <span className="tag tag-neg">High</span>;
  if (v>0.3) return <span className="tag tag-warn">Med</span>;
  return <span className="tag tag-live">Low</span>;
}
function KycBadge({ s }: { s:string }) {
  const m: Record<string,string> = { verified:"tag-live", pending:"tag-warn", review:"tag-neg" };
  return <span className={`tag ${m[s]||"tag-neutral"}`}>{s}</span>;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(MOCK);
  const [sel, setSel] = useState<Worker|null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/workers/?limit=50`, {
      headers:{Authorization:`Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}`}
    }).then(r=>r.ok?r.json():null).then(d=>{if(d?.workers)setWorkers(d.workers);}).catch(()=>{});
  }, []);

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.id.includes(search) || w.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1400px]">
      <div className="section-head">
        <div><p className="lbl mb-1">Admin portal</p><h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Worker Directory</h1></div>
        <div className="flex items-center gap-3">
          <span className="tag tag-live">{workers.filter(w=>w.status==="active").length} active</span>
          <span className="tag tag-neg">{workers.filter(w=>w.status==="flagged").length} flagged</span>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        <input className="field max-w-xs" style={{padding:"0.5rem 0.875rem"}} placeholder="Search name, ID, city…"
          value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-5">
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="tbl tbl-click">
              <thead><tr><th>Worker</th><th>City</th><th>Platforms</th><th>Claims</th><th>Total earned</th><th>Risk</th><th>KYC</th></tr></thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id} onClick={()=>setSel(sel?.id===w.id?null:w)} style={{background:sel?.id===w.id?"rgba(245,158,11,0.04)":""}}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-amber font-bold text-xs">{w.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-slate-600 font-medium text-sm">{w.name}</div>
                          <div className="lbl">{w.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{w.city}</td>
                    <td><div className="flex gap-1 flex-wrap">{w.platforms.map(p=><span key={p} className="tag tag-neutral">{p}</span>)}</div></td>
                    <td><span className="text-slate-800 font-bold">{w.claims}</span></td>
                    <td><span className="text-amber font-mono font-bold">₹{w.total_earned.toLocaleString()}</span></td>
                    <td><RiskBadge v={w.risk} /></td>
                    <td><KycBadge s={w.kyc} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AnimatePresence>
          {sel && (
            <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
              className="panel p-5 self-start sticky top-20" style={{maxHeight:"calc(100vh - 120px)",overflowY:"auto"}}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center">
                  <span className="text-amber font-bold text-xl">{sel.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-slate-800 font-bold">{sel.name}</div>
                  <div className="lbl">{sel.phone}</div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  ["Worker ID",sel.id],["City",sel.city],["Joined",sel.joined],["KYC",sel.kyc],
                ].map(([k,v])=>(
                  <div key={k} className="flex justify-between text-sm py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-600 font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="panel-inset p-3 text-center">
                  <div className="text-amber font-bold text-xl" style={{letterSpacing:"-0.03em"}}>₹{sel.total_earned.toLocaleString()}</div>
                  <div className="lbl mt-1">Total earned</div>
                </div>
                <div className="panel-inset p-3 text-center">
                  <div className="text-slate-800 font-bold text-xl">{sel.claims}</div>
                  <div className="lbl mt-1">Total claims</div>
                </div>
              </div>
              <div className="panel-inset p-3 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="lbl">Risk score</span>
                  <RiskBadge v={sel.risk} />
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{
                    width:`${sel.risk*100}%`,
                    background:sel.risk>0.6?"#EF4444":sel.risk>0.3?"#F59E0B":"#10B981",
                    animation:"none"
                  }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-amber flex-1 btn-sm">View history</button>
                {sel.status==="flagged" && <button className="btn-ghost flex-1 btn-sm text-signal-neg" style={{borderColor:"rgba(239,68,68,0.3)",color:"#EF4444"}}>Review flag</button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
