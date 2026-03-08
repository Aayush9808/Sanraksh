"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Worker {
  id: string;
  name: string;
  phone: string;
  delivery_platform: string;
  work_city: string;
  work_zone: string;
  kyc_status: string;
  risk_score: number;
  is_active: boolean;
  created_at?: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  zomato: "bg-red-500/20 text-red-400 border-red-500/30",
  swiggy: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  amazon: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  zepto: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  blinkit: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  other: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const PLATFORM_ICONS: Record<string, string> = {
  zomato: "🔴", swiggy: "🟠", amazon: "🔵", zepto: "🟣", blinkit: "🟡", other: "⚪",
};

const KYC_COLORS: Record<string, string> = {
  verified: "bg-emerald-500/20 text-emerald-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  rejected: "bg-red-500/20 text-red-400",
};

// ── MOCK DATA for Vercel demo ──────────────────────────────────────────────────
const MOCK_WORKERS: Worker[] = [
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
  { id:"11", name:"Suresh Tiwari", phone:"+91 8976543210", delivery_platform:"zomato", work_city:"Mumbai", work_zone:"Dadar", kyc_status:"verified", risk_score:0.35, is_active:true },
  { id:"12", name:"Divya Agarwal", phone:"+91 8876543210", delivery_platform:"swiggy", work_city:"Hyderabad", work_zone:"Gachibowli", kyc_status:"pending", risk_score:0.49, is_active:true },
  { id:"13", name:"Rohit Gupta", phone:"+91 8765432109", delivery_platform:"blinkit", work_city:"Mumbai", work_zone:"Powai", kyc_status:"verified", risk_score:0.33, is_active:true },
  { id:"14", name:"Anita Joshi", phone:"+91 8654321098", delivery_platform:"zomato", work_city:"Delhi", work_zone:"Lajpat Nagar", kyc_status:"verified", risk_score:0.44, is_active:true },
  { id:"15", name:"Mahesh Chandra", phone:"+91 8543210987", delivery_platform:"amazon", work_city:"Chennai", work_zone:"Anna Nagar", kyc_status:"verified", risk_score:0.28, is_active:true },
];

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterKyc, setFilterKyc] = useState("all");
  const [stats, setStats] = useState({ total: 0, verified: 0, active: 0, highRisk: 0 });

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/all?limit=100`);
      if (res.ok) {
        const data = await res.json();
        const list = data.users || data || [];
        setWorkers(list);
        setStats({
          total: list.length,
          verified: list.filter((w: Worker) => w.kyc_status === "verified").length,
          active: list.filter((w: Worker) => w.is_active).length,
          highRisk: list.filter((w: Worker) => w.risk_score > 0.6).length,
        });
      } else throw new Error();
    } catch {
      setWorkers(MOCK_WORKERS);
      setStats({ total: MOCK_WORKERS.length, verified: 10, active: 13, highRisk: 3 });
    } finally {
      setLoading(false);
    }
  }

  const filtered = workers.filter(w => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.includes(search) || w.work_zone?.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = filterPlatform === "all" || w.delivery_platform === filterPlatform;
    const matchCity = filterCity === "all" || w.work_city === filterCity;
    const matchKyc = filterKyc === "all" || w.kyc_status === filterKyc;
    return matchSearch && matchPlatform && matchCity && matchKyc;
  });

  const cities = [...new Set(workers.map(w => w.work_city).filter(Boolean))];
  const platforms = ["all", "zomato", "swiggy", "amazon", "zepto", "blinkit", "other"];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Dashboard
            </Link>
            <span className="text-slate-700">/</span>
            <Link href="/dashboard/policies" className="text-slate-400 hover:text-white transition-colors text-sm">Policies</Link>
            <span className="text-slate-700">/</span>
            <h1 className="text-lg font-semibold text-white">Worker Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{filtered.length} workers</span>
            <Link href="/register" className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              + Add Worker
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Workers", value: stats.total.toLocaleString(), icon: "👷", color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
            { label: "KYC Verified", value: stats.verified.toLocaleString(), icon: "✅", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Active Today", value: stats.active.toLocaleString(), icon: "📍", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "High Risk", value: stats.highRisk.toLocaleString(), icon: "⚠️", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by name, phone, zone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500">
              <option value="all">All Platforms</option>
              {platforms.filter(p => p !== "all").map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
            <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500">
              <option value="all">All Cities</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterKyc} onChange={e => setFilterKyc(e.target.value)} className="bg-slate-700/50 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500">
              <option value="all">All KYC Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left px-6 py-4">Worker</th>
                  <th className="text-left px-4 py-4">Platform</th>
                  <th className="text-left px-4 py-4">City / Zone</th>
                  <th className="text-left px-4 py-4">KYC</th>
                  <th className="text-left px-4 py-4">Risk Score</th>
                  <th className="text-left px-4 py-4">Status</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({length: 5}).map((_, i) => (
                    <tr key={i} className="border-b border-slate-700/30">
                      {Array.from({length: 7}).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No workers found</td></tr>
                ) : filtered.map((worker) => (
                  <tr key={worker.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-600/30 border border-cyan-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{worker.name}</p>
                          <p className="text-slate-500 text-xs">{worker.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${PLATFORM_COLORS[worker.delivery_platform] || "bg-slate-700 text-slate-300 border-slate-600"}`}>
                        {PLATFORM_ICONS[worker.delivery_platform]} {worker.delivery_platform}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white text-sm">{worker.work_city}</p>
                      <p className="text-slate-500 text-xs">{worker.work_zone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${KYC_COLORS[worker.kyc_status] || "bg-slate-700 text-slate-400"}`}>
                        {worker.kyc_status === "verified" ? "✓ " : worker.kyc_status === "pending" ? "⏳ " : "✗ "}
                        {worker.kyc_status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${worker.risk_score > 0.6 ? "bg-red-500" : worker.risk_score > 0.4 ? "bg-yellow-500" : "bg-emerald-500"}`}
                            style={{ width: `${worker.risk_score * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${worker.risk_score > 0.6 ? "text-red-400" : worker.risk_score > 0.4 ? "text-yellow-400" : "text-emerald-400"}`}>
                          {Math.round(worker.risk_score * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${worker.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/50 text-slate-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${worker.is_active ? "bg-emerald-400" : "bg-slate-500"}`} />
                        {worker.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium px-3 py-1.5 rounded-lg border border-cyan-500/30 hover:border-cyan-500/60 transition-colors">
                          View
                        </button>
                        <button className="text-xs text-slate-400 hover:text-white font-medium px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors">
                          Policy
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
