"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { API_BASE } from "../../../lib/config";

interface Worker {
  id:string; name:string; phone:string; delivery_platform:string;
  work_city:string; work_zone:string; kyc_status:string;
  risk_score:number; is_active:boolean;
}

const PLAT_CLR:Record<string,string> = {
  zomato:"bg-state-danger/15 text-state-danger border-state-danger/20",
  swiggy:"bg-accent-ember/15 text-accent-ember border-accent-ember/20",
  amazon:"bg-state-info/15 text-state-info border-state-info/20",
  zepto:"bg-accent-violet/15 text-accent-violet border-accent-violet/20",
  blinkit:"bg-state-warning/15 text-state-warning border-state-warning/20",
};
const KYC_CLR:Record<string,string> = {
  verified:"bg-state-success/15 text-state-success",
  pending:"bg-state-warning/15 text-state-warning",
  rejected:"bg-state-danger/15 text-state-danger",
};

const MOCK:Worker[] = [
  { id:"1", name:"Ravi Kumar", phone:"+91 9876543210", delivery_platform:"zomato", work_city:"Mumbai", work_zone:"Andheri West", kyc_status:"verified", risk_score:0.42, is_active:true },
  { id:"2", name:"Priya Sharma", phone:"+91 9123456789", delivery_platform:"swiggy", work_city:"Delhi", work_zone:"Connaught Place", kyc_status:"verified", risk_score:0.31, is_active:true },
  { id:"3", name:"Amit Singh", phone:"+91 9654321870", delivery_platform:"blinkit", work_city:"Bengaluru", work_zone:"Koramangala", kyc_status:"pending", risk_score:0.58, is_active:true },
  { id:"4", name:"Sunita Rao", phone:"+91 9765432180", delivery_platform:"zepto", work_city:"Pune", work_zone:"Kothrud", kyc_status:"verified", risk_score:0.29, is_active:true },
  { id:"5", name:"Vikram Yadav", phone:"+91 9543218760", delivery_platform:"amazon", work_city:"Hyderabad", work_zone:"Hitech City", kyc_status:"verified", risk_score:0.45, is_active:true },
  { id:"6", name:"Neha Patel", phone:"+91 9432187650", delivery_platform:"zomato", work_city:"Mumbai", work_zone:"Bandra", kyc_status:"pending", risk_score:0.62, is_active:true },
  { id:"7", name:"Deepak Nair", phone:"+91 9321876540", delivery_platform:"swiggy", work_city:"Chennai", work_zone:"T Nagar", kyc_status:"verified", risk_score:0.38, is_active:true },
  { id:"8", name:"Kavitha Reddy", phone:"+91 9218765430", delivery_platform:"blinkit", work_city:"Bengaluru", work_zone:"HSR Layout", kyc_status:"verified", risk_score:0.55, is_active:false },
  { id:"9", name:"Ajay Mehta", phone:"+91 9187654320", delivery_platform:"zepto", work_city:"Delhi", work_zone:"Hauz Khas", kyc_status:"verified", risk_score:0.41, is_active:true },
  { id:"10", name:"Pooja Mishra", phone:"+91 9076543210", delivery_platform:"amazon", work_city:"Pune", work_zone:"Viman Nagar", kyc_status:"rejected", risk_score:0.77, is_active:false },
];

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fPlat, setFPlat] = useState("all");
  const [fCity, setFCity] = useState("all");
  const [fKyc, setFKyc] = useState("all");
  const [stats, setStats] = useState({total:0,verified:0,active:0,highRisk:0});

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/v1/users/all?limit=100`);
        if (r.ok) {
          const d = await r.json(); const list = d.users||d||[];
          setWorkers(list);
          setStats({ total:list.length, verified:list.filter((w:Worker)=>w.kyc_status==="verified").length, active:list.filter((w:Worker)=>w.is_active).length, highRisk:list.filter((w:Worker)=>w.risk_score>0.6).length });
        } else throw 0;
      } catch {
        setWorkers(MOCK);
        setStats({total:MOCK.length, verified:10, active:8, highRisk:3});
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = workers.filter(w => {
    const ms = w.name.toLowerCase().includes(search.toLowerCase()) || w.phone.includes(search) || w.work_zone?.toLowerCase().includes(search.toLowerCase());
    return ms && (fPlat==="all"||w.delivery_platform===fPlat) && (fCity==="all"||w.work_city===fCity) && (fKyc==="all"||w.kyc_status===fKyc);
  });
  const cities = [...new Set(workers.map(w=>w.work_city).filter(Boolean))];

  const card = "rounded-2xl bg-surface-1 border border-white/[0.04]";
  const sel = "rounded-xl border border-white/[0.06] bg-surface-2 px-3 py-2 text-sm text-text-secondary outline-none cursor-pointer focus:border-accent-amber/50";
  const b = (d:number) => ({ initial:{opacity:0,y:12}, animate:{opacity:1,y:0}, transition:{delay:d*0.06} } as const);

  return (
    <motion.div className="p-6 space-y-5 max-w-[1400px] mx-auto" initial={{opacity:0}} animate={{opacity:1}}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Worker Management</h1>
          <p className="text-sm text-text-secondary mt-0.5">View and manage all registered gig workers</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-muted">{filtered.length} workers</span>
          <Link href="/register" className="rounded-xl bg-accent-amber/15 border border-accent-amber/25 px-4 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/25 transition">+ Add Worker</Link>
        </div>
      </div>

      {/* Stats */}
      <motion.div {...b(1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l:"Total Workers", v:stats.total, icon:"👷", accent:"border-accent-amber/30 bg-accent-amber/[0.04]" },
          { l:"KYC Verified", v:stats.verified, icon:"✅", accent:"border-state-success/30 bg-state-success/[0.04]" },
          { l:"Active Today", v:stats.active, icon:"📍", accent:"border-state-info/30 bg-state-info/[0.04]" },
          { l:"High Risk", v:stats.highRisk, icon:"⚠️", accent:"border-state-danger/30 bg-state-danger/[0.04]" },
        ].map(s=>(
          <div key={s.l} className={`rounded-2xl border p-4 ${s.accent}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{s.icon}</span>
              <span className="text-2xl font-bold text-text-primary">{s.v}</span>
            </div>
            <p className="text-sm text-text-muted">{s.l}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div {...b(2)} className={`${card} p-4`}>
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Search name, phone, zone…" value={search} onChange={e=>setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-white/[0.06] bg-surface-2 px-4 py-2 text-sm text-text-primary placeholder-text-muted/40 outline-none focus:border-accent-amber/50 transition" />
          <select value={fPlat} onChange={e=>setFPlat(e.target.value)} className={sel}>
            <option value="all">All Platforms</option>
            {["zomato","swiggy","amazon","zepto","blinkit"].map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <select value={fCity} onChange={e=>setFCity(e.target.value)} className={sel}>
            <option value="all">All Cities</option>
            {cities.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <select value={fKyc} onChange={e=>setFKyc(e.target.value)} className={sel}>
            <option value="all">All KYC</option>
            <option value="verified">Verified</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div {...b(3)} className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead><tr className="border-b border-white/[0.04] text-[10px] text-text-muted uppercase tracking-wider">
              <th className="text-left px-5 py-3">Worker</th><th className="text-left px-4 py-3">Platform</th>
              <th className="text-left px-4 py-3">City / Zone</th><th className="text-left px-4 py-3">KYC</th>
              <th className="text-left px-4 py-3">Risk</th><th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=>(
                <tr key={i} className="border-b border-white/[0.03]">
                  {Array.from({length:7}).map((_,j)=><td key={j} className="px-5 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse"/></td>)}
                </tr>
              )) : filtered.length===0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-text-muted">No workers found</td></tr>
              ) : filtered.map(w=>(
                <tr key={w.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-accent-amber/15 border border-accent-amber/20 flex items-center justify-center text-xs font-bold text-accent-amber">{w.name[0]}</div>
                      <div><p className="text-sm font-medium text-text-primary">{w.name}</p><p className="text-[11px] text-text-muted">{w.phone}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold border capitalize ${PLAT_CLR[w.delivery_platform]||"bg-surface-2 text-text-muted border-white/[0.06]"}`}>{w.delivery_platform}</span></td>
                  <td className="px-4 py-3"><p className="text-sm text-text-primary">{w.work_city}</p><p className="text-[11px] text-text-muted">{w.work_zone}</p></td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-semibold capitalize ${KYC_CLR[w.kyc_status]||"bg-surface-2 text-text-muted"}`}>{w.kyc_status==="verified"?"✓ ":w.kyc_status==="pending"?"⏳ ":"✗ "}{w.kyc_status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[70px] h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${w.risk_score>0.6?"bg-state-danger":w.risk_score>0.4?"bg-state-warning":"bg-state-success"}`} style={{width:`${w.risk_score*100}%`}}/>
                      </div>
                      <span className={`text-[10px] font-semibold ${w.risk_score>0.6?"text-state-danger":w.risk_score>0.4?"text-state-warning":"text-state-success"}`}>{Math.round(w.risk_score*100)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${w.is_active?"bg-state-success/15 text-state-success":"bg-surface-2 text-text-muted"}`}><span className={`w-1.5 h-1.5 rounded-full ${w.is_active?"bg-state-success":"bg-text-muted"}`}/>{w.is_active?"Active":"Inactive"}</span></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="text-[10px] text-accent-amber hover:text-accent-gold font-medium px-2.5 py-1 rounded-lg border border-accent-amber/25 hover:border-accent-amber/50 transition">View</button>
                      <button className="text-[10px] text-text-muted hover:text-text-primary font-medium px-2.5 py-1 rounded-lg border border-white/[0.06] hover:border-white/[0.12] transition">Policy</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
