"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { API_BASE } from "@/lib/config";

interface DashStats { total_users:number; active_policies:number; total_claims:number; total_payout_amount:number; automation_rate:number; coverage_ratio:number; }
interface DayData { day:string; date:string; claims:number; payout:number; }
interface PolicyMix { name:string; value:number; color:string; }

const TT_STYLE = { background:"#14100A", border:"1px solid #2A2218", borderRadius:8, color:"#C8BAA0" };

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashStats|null>(null);
  const [weekly, setWeekly] = useState<DayData[]>([]);
  const [policyMix, setPolicyMix] = useState<PolicyMix[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = {Authorization:`Bearer ${typeof window!=="undefined"&&localStorage.getItem("token")||""}`};
    Promise.all([
      fetch(`${API_BASE}/api/v1/analytics/dashboard`,{headers:h}).then(r=>r.ok?r.json():null),
      fetch(`${API_BASE}/api/v1/analytics/claims-summary`,{headers:h}).then(r=>r.ok?r.json():null),
      fetch(`${API_BASE}/api/v1/analytics/policy-mix`,{headers:h}).then(r=>r.ok?r.json():null),
    ]).then(([s, w, pm]) => {
      if(s) setStats(s);
      if(w) setWeekly(w);
      if(pm && pm.length>0) setPolicyMix(pm);
    }).finally(()=>setLoading(false));
  }, []);

  const kpis = stats ? [
    {label:"Total payout (all time)",  val:`₹${stats.total_payout_amount.toLocaleString()}`,  sub:`${stats.total_claims} claims settled`},
    {label:"Active policies",           val:String(stats.active_policies),                      sub:`${stats.coverage_ratio.toFixed(0)}% coverage ratio`},
    {label:"Automation rate",           val:`${stats.automation_rate}%`,                        sub:"claims auto-approved"},
    {label:"Registered workers",        val:String(stats.total_users),                          sub:"platform-enrolled"},
  ] : Array(4).fill({label:"—",val:"…",sub:""});

  return (
    <div className="max-w-[1400px]">
      <div className="section-head">
        <div><p className="lbl mb-1">Admin portal</p>
          <h1 className="text-slate-800 font-bold text-xl" style={{letterSpacing:"-0.03em"}}>Analytics</h1></div>
        <span className="tag tag-live">Live data</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpis.map((k,i)=>(
          <div key={i} className="panel p-4">
            <div className="lbl mb-2">{k.label}</div>
            <div className="text-slate-800 font-extrabold text-2xl mb-1" style={{letterSpacing:"-0.04em"}}>{k.val}</div>
            <div className="lbl" style={{color:"#6B5C44"}}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_1fr] gap-5 mb-5">
        <div className="panel p-5">
          <p className="lbl mb-1">This week</p>
          <h3 className="text-slate-800 font-bold mb-4" style={{letterSpacing:"-0.02em"}}>Claims filed — last 7 days</h3>
          {loading ? <div className="h-[200px] flex items-center justify-center lbl">Loading…</div> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekly} barSize={28}>
                <CartesianGrid vertical={false} stroke="#2A2218" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#4A3E2A",fontSize:11,fontFamily:"var(--font-mono)"}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill:"#4A3E2A",fontSize:11,fontFamily:"var(--font-mono)"}} allowDecimals={false} />
                <Tooltip contentStyle={TT_STYLE} cursor={{fill:"rgba(245,158,11,0.05)"}} />
                <Bar dataKey="claims" fill="#F59E0B" radius={[4,4,0,0]} name="Claims" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel p-5">
          <p className="lbl mb-1">This week</p>
          <h3 className="text-slate-800 font-bold mb-4" style={{letterSpacing:"-0.02em"}}>Daily payout volume (₹)</h3>
          {loading ? <div className="h-[200px] flex items-center justify-center lbl">Loading…</div> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weekly}>
                <CartesianGrid vertical={false} stroke="#2A2218" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#4A3E2A",fontSize:11,fontFamily:"var(--font-mono)"}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill:"#4A3E2A",fontSize:11,fontFamily:"var(--font-mono)"}} />
                <Tooltip contentStyle={TT_STYLE} cursor={{stroke:"rgba(245,158,11,0.2)"}} formatter={(v:number)=>[`₹${v.toLocaleString()}`,""]}/>
                <Line dataKey="payout" stroke="#F59E0B" strokeWidth={2} dot={{fill:"#F59E0B",r:4}} activeDot={{r:6}} name="Payout ₹"/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {policyMix.length > 0 && (
        <div className="panel p-5 mb-5">
          <p className="lbl mb-1">Coverage breakdown</p>
          <h3 className="text-slate-800 font-bold mb-4" style={{letterSpacing:"-0.02em"}}>Active policies by coverage type</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={policyMix} cx={85} cy={85} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {policyMix.map((e,i)=><Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TT_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {policyMix.map(e=>(
                <div key={e.name} className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{background:e.color}} />
                  <div className="text-sm text-slate-500 flex-1">{e.name}</div>
                  <div className="prog-track w-28">
                    <div style={{height:"100%",background:e.color,borderRadius:2,width:`${(e.value/Math.max(...policyMix.map(x=>x.value)))*100}%`}} />
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-800 w-6 text-right">{e.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
