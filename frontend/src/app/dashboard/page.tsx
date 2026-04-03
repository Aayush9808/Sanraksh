"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { API_BASE } from "@/lib/config";

function Counter({ end, prefix = "", suffix = "" }: { end: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let n = 0; const step = end / (1400 / 16);
      const t = setInterval(() => { n += step; if (n >= end) { setV(end); clearInterval(t); } else setV(n); }, 16);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <div ref={ref}>{prefix}{end >= 1000 ? Math.floor(v).toLocaleString() : Math.floor(v)}{suffix}</div>;
}

function StatusTag({ s }: { s: string }) {
  const map: Record<string, string> = { approved: "tag-live", review: "tag-warn", rejected: "tag-neg", paid: "tag-live", pending: "tag-warn" };
  return <span className={`tag ${map[s] || "tag-grey"}`}>{s}</span>;
}

function FraudBar({ score }: { score: number }) {
  const color = score > 0.6 ? "#EF4444" : score > 0.3 ? "#F59E0B" : "#10B981";
  return (
    <div className="flex items-center gap-2">
      <div className="prog-track flex-1" style={{ minWidth: 60 }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${score * 100}%`, background: color, animation: "none" }} />
      </div>
      <span className="font-mono text-xs font-semibold" style={{ color }}>{(score * 100).toFixed(0)}%</span>
    </div>
  );
}

// ─── WORKER DASHBOARD ──────────────────────────────────────────────────────

function SeverityBar({ val }: { val: number }) {
  const color = val >= 0.75 ? "#EF4444" : val >= 0.45 ? "#F59E0B" : "#10B981";
  return <div className="w-1.5 self-stretch rounded-full flex-shrink-0" style={{ background: color }} />;
}

function WorkerHome() {
  const [policy, setPolicy] = useState<Record<string,unknown>|null>(null);
  const [claims, setClaims] = useState<Record<string,unknown>[]>([]);
  const [triggers, setTriggers] = useState<Record<string,unknown>[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/workers/me/policy`, { headers: h }).then(r=>r.ok?r.json():null).then(d=>{ if(d?.has_policy && d.policy) setPolicy(d.policy); }).catch(()=>{});
    fetch(`${API_BASE}/api/v1/workers/me/claims`, { headers: h }).then(r=>r.ok?r.json():null).then(d=>{ if(Array.isArray(d)) setClaims(d.slice(0,3)); }).catch(()=>{});
    fetch(`${API_BASE}/api/v1/disruptions/active`, { headers: h }).then(r=>r.ok?r.json():null).then(d=>{ if(Array.isArray(d)) setTriggers(d.slice(0,3)); }).catch(()=>{});
  }, []);

  const policyNum = policy?.policy_number as string || "POL-0000";
  const premium = policy?.weekly_premium as number || 0;
  const endDate = policy?.end_date ? new Date(policy.end_date as string).toLocaleDateString("en-IN",{month:"short",year:"numeric"}) : "—";
  const totalEarned = policy?.total_paid as number || 0;
  const totalClaims = policy?.claims_count as number || 0;

  return (
    <div className="max-w-4xl">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-[#0F2044] p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Your coverage</p>
          <h1 className="text-white font-extrabold text-xl tracking-tight">GigArmor {policy ? "Standard" : "—"}</h1>
          <p className="text-blue-200 text-sm mt-0.5">{policyNum} · Active till {endDate} · ₹{premium}/week</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/dashboard/triggers"><button className="bg-amber-400 text-[#0F2044] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-amber-300 transition-all">Live triggers</button></Link>
          <Link href="/dashboard/simulation"><button className="bg-white text-[#0F2044] font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2">▶ Run Simulation</button></Link>
          <Link href="/dashboard/my-policy"><button className="bg-white/10 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all border border-white/20">View policy</button></Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total earned", val: totalEarned, prefix: "₹", suffix: "", amber: true },
          { label: "Total claims", val: totalClaims, prefix: "", suffix: "", amber: false },
          { label: "Active triggers", val: triggers.length, prefix: "", suffix: " now", amber: false },
          { label: "Weekly premium", val: premium, prefix: "₹", suffix: "/wk", amber: false },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="panel p-4 stat-card">
            <div className="lbl mb-2">{k.label}</div>
            <div className={`font-extrabold text-2xl tracking-tight ${k.amber ? "text-amber-500" : "text-slate-900"}`} style={{ letterSpacing: "-0.03em", lineHeight: 1 }}>
              {k.prefix}<Counter end={k.val} />{k.suffix}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-5">
        {/* Active triggers */}
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <p className="lbl mb-0.5">Signal monitor</p>
              <h2 className="font-bold text-slate-900">Active triggers in your city</h2>
            </div>
            <Link href="/dashboard/triggers" className="text-[#0F2044] text-xs font-bold hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {triggers.length === 0 ? (
              <div className="p-6 text-center lbl text-sm">No active disruptions — all clear</div>
            ) : triggers.map((t, i) => {
              const et = (t.event_type as string).replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase());
              const sev = t.severity === "high" ? 0.85 : t.severity === "medium" ? 0.55 : 0.3;
              return (
                <div key={i} className="flex items-stretch gap-0 hover:bg-slate-50 transition-colors">
                  <SeverityBar val={sev} />
                  <div className="flex items-center gap-3 px-4 py-3.5 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-slate-800 text-sm">{et}</span>
                        <span className="tag tag-neg">active</span>
                      </div>
                      <div className="text-xs text-slate-400">{t.zone as string}, {t.city as string}</div>
                    </div>
                    <div className="text-amber-600 font-mono font-bold text-sm flex-shrink-0">₹800/day</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent payouts */}
        <div className="panel overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="lbl mb-0.5">Payment history</p>
            <h2 className="font-bold text-slate-900">Recent payouts</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {claims.length === 0 ? (
              <div className="p-6 text-center lbl text-sm">No claims yet</div>
            ) : claims.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{(c.event_type as string||"").replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase())}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{c.claim_date as string}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-600 font-mono font-bold text-sm">₹{c.amount as number}</div>
                  <StatusTag s={c.status as string} />
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100">
            <Link href="/dashboard/my-policy">
              <button className="w-full text-sm text-slate-500 hover:text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-50 transition-colors">Full history →</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────

function AdminHome() {
  const [stats, setStats] = useState<Record<string,number>>({});
  const [claims, setClaims] = useState<Record<string,unknown>[]>([]);
  const [disruptions, setDisruptions] = useState<Record<string,unknown>[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
  const h = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/analytics/dashboard`, { headers: h }).then(r=>r.ok?r.json():null).then(d=>{ if(d) setStats(d); }).catch(()=>{});
    fetch(`${API_BASE}/api/v1/claims/all?limit=5`, { headers: h }).then(r=>r.ok?r.json():null).then(d=>{ if(d?.claims) setClaims(d.claims); }).catch(()=>{});
    fetch(`${API_BASE}/api/v1/disruptions/active`, { headers: h }).then(r=>r.ok?r.json():null).then(d=>{ if(Array.isArray(d)) setDisruptions(d); }).catch(()=>{});
  }, []);

  const kpis = [
    { label: "Active workers",  val: stats.total_users||0, prefix:"", suffix:"", amber:false, delta:"platform-enrolled", up:true },
    { label: "Claims total",    val: stats.total_claims||0, prefix:"", suffix:"", amber:false, delta:`${stats.claims_review||0} pending review`, up:false },
    { label: "Total payout",    val: stats.total_payout_amount||0, prefix:"₹", suffix:"", amber:true, delta:"all time", up:true },
    { label: "Active policies", val: stats.active_policies||0, prefix:"", suffix:"", amber:false, delta:`${(stats.coverage_ratio||0).toFixed(0)}% coverage`, up:true },
    { label: "Automation rate", val: Math.round(stats.automation_rate||0), prefix:"", suffix:"%", amber:true, delta:"auto-approved", up:true },
    { label: "Live triggers",   val: disruptions.length, prefix:"", suffix:"", amber:false, delta:"cities affected", up:false },
  ];

  return (
    <div className="max-w-[1400px]">
      {/* Header banner */}
      <div className="rounded-2xl bg-[#0F2044] p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Operations center</p>
          <h1 className="text-white font-extrabold text-xl tracking-tight">Command Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/30 rounded-xl px-3 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 text-xs font-semibold">All systems operational</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="panel p-4 stat-card">
            <div className="lbl mb-2">{k.label}</div>
            <div className={`font-extrabold text-2xl tracking-tight mb-1 ${k.amber ? "text-amber-500" : "text-slate-900"}`} style={{ letterSpacing: "-0.03em", lineHeight: 1 }}>
              {k.prefix}<Counter end={k.val} />{k.suffix}
            </div>
            {k.delta && (
              <div className={`text-xs font-semibold ${k.up ? "text-emerald-600" : "text-red-500"}`}>{k.delta}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Claims + Disruptions */}
      <div className="grid xl:grid-cols-[1fr_320px] gap-5">
        {/* Claims table */}
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <p className="lbl mb-0.5">Recent activity</p>
              <h2 className="font-bold text-slate-900">Claims feed</h2>
            </div>
            <Link href="/dashboard/claims"><button className="btn-ghost btn-sm">View all →</button></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="tbl tbl-click">
              <thead>
                <tr><th>Claim ID</th><th>Worker</th><th>Event</th><th>Amount</th><th>Fraud Risk</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <Link key={c.claim_number as string} href="/dashboard/claims" legacyBehavior>
                    <tr style={{ cursor: "pointer" }}>
                      <td><span className="font-mono text-slate-800 text-xs font-semibold">{c.claim_number as string}</span></td>
                      <td><span className="font-semibold text-slate-800">{c.worker_name as string}</span></td>
                      <td className="text-slate-600">{String(c.event_type || "").replace(/_/g, " ")}</td>
                      <td><span className="text-emerald-600 font-mono font-bold">₹{c.amount as number}</span></td>
                      <td><FraudBar score={c.fraud_score as number} /></td>
                      <td><StatusTag s={c.status === "paid" ? "approved" : c.status === "pending" ? "review" : c.status as string} /></td>
                      <td><span className="text-slate-400 text-xs">{String(c.created_at || "").slice(0, 10)}</span></td>
                    </tr>
                  </Link>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active disruptions */}
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <p className="lbl mb-0.5">Signal monitor</p>
              <h2 className="font-bold text-slate-900">Active disruptions</h2>
            </div>
            <div className="dot dot-live" />
          </div>
          <div className="divide-y divide-slate-100">
            {disruptions.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No active disruptions</div>
            ) : disruptions.map((d, i) => {
              const sev = d.severity === "high" ? 0.85 : d.severity === "medium" ? 0.55 : 0.3;
              const color = d.severity === "high" ? "#ef4444" : d.severity === "medium" ? "#f59e0b" : "#10b981";
              const label = String(d.event_type || "").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              const zone = `${d.zone as string}, ${d.city as string}`;
              return (
                <motion.div key={String(d.id)} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-stretch hover:bg-slate-50 transition-colors">
                  <div className="w-1.5 flex-shrink-0 rounded-none" style={{ background: color }} />
                  <div className="px-4 py-3.5 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm">{label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{zone}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-slate-800 text-sm capitalize">{d.severity as string}</div>
                        <div className="text-xs text-slate-400">severity</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="prog-track">
                        <div style={{ height: "100%", borderRadius: 999, width: `${sev * 100}%`, background: color, animation: "none" }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="p-3 border-t border-slate-100">
            <Link href="/dashboard/triggers">
              <button className="w-full text-sm text-slate-500 hover:text-slate-800 font-semibold py-2 rounded-lg hover:bg-slate-50 transition-colors">All triggers →</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [role, setRole] = useState("worker");
  useEffect(() => {
    const r = typeof window !== "undefined" ? localStorage.getItem("role") : "";
    if (r) setRole(r);
  }, []);
  return role === "admin" ? <AdminHome /> : <WorkerHome />;
}
