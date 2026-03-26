'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { API_BASE } from '../../../lib/config'

interface Policy {
  id: string
  policy_number: string
  user_id: string
  worker_name?: string
  worker_platform?: string
  coverage_type?: string
  weekly_premium: number
  status: string
  start_date: string
  end_date: string
}

const MOCK_POLICIES: Policy[] = [
  { id:'1', policy_number:'GA-202603-000310', user_id:'u1', worker_name:'Rahul Kumar',   worker_platform:'Zomato',  coverage_type:'weather', weekly_premium:55.25, status:'active',  start_date:'2026-03-01', end_date:'2026-03-29' },
  { id:'2', policy_number:'GA-202603-000260', user_id:'u2', worker_name:'Priya Sharma',  worker_platform:'Swiggy',  coverage_type:'flood',     weekly_premium:51.60, status:'active',  start_date:'2026-02-28', end_date:'2026-03-28' },
  { id:'3', policy_number:'GA-202603-000373', user_id:'u3', worker_name:'Amit Singh',    worker_platform:'Blinkit', coverage_type:'job_loss',  weekly_premium:54.85, status:'active',  start_date:'2026-02-20', end_date:'2026-04-17' },
  { id:'4', policy_number:'GA-202602-000145', user_id:'u4', worker_name:'Sneha Patel',   worker_platform:'Ola',     coverage_type:'weather',   weekly_premium:48.00, status:'expired', start_date:'2026-01-01', end_date:'2026-02-28' },
  { id:'5', policy_number:'GA-202603-000189', user_id:'u5', worker_name:'Karan Mehta',   worker_platform:'Uber',    coverage_type:'curfew',    weekly_premium:62.10, status:'active',  start_date:'2026-03-05', end_date:'2026-04-02' },
  { id:'6', policy_number:'GA-202603-000421', user_id:'u6', worker_name:'Divya Nair',    worker_platform:'Zepto',   coverage_type:'pollution', weekly_premium:44.50, status:'active',  start_date:'2026-03-07', end_date:'2026-04-04' },
  { id:'7', policy_number:'GA-202602-000098', user_id:'u7', worker_name:'Rohan Gupta',   worker_platform:'Swiggy',  coverage_type:'weather', weekly_premium:57.75, status:'expired', start_date:'2025-12-01', end_date:'2026-01-28' },
  { id:'8', policy_number:'GA-202603-000502', user_id:'u8', worker_name:'Anita Joshi',   worker_platform:'Dunzo',   coverage_type:'job_loss',weekly_premium:59.00, status:'active',  start_date:'2026-03-08', end_date:'2026-04-05' },
]

const COVERAGE_LABELS: Record<string, string> = {
  weather:    '🌧️ Weather',
  flood:      '🌊 Flood',
  job_loss:   '💼 Job Loss',
  pollution:  '😷 Pollution',
  curfew:     '🚫 Curfew/Strike',
  app_outage: '⚡ App Outage',
}
const PLATFORM_COLORS: Record<string, string> = {
  Zomato: 'bg-red-500/20 text-red-300 border-red-500/30',
  Swiggy: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Blinkit: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Ola: 'bg-green-500/20 text-green-300 border-green-500/30',
  Uber: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Zepto: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Dunzo: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
}

const navItems = [
  { href: '/dashboard',            icon: '▣',  label: 'Overview'   },
  { href: '/dashboard/control-tower', icon: '🛰️', label: 'Control Tower' },
  { href: '/dashboard/workers',    icon: '👷', label: 'Workers'    },
  { href: '/dashboard/policies',   icon: '🛡️', label: 'Policies', active: true },
  { href: '/dashboard/claims',     icon: '≡',  label: 'Claims'     },
  { href: '/dashboard/analytics',  icon: '↗',  label: 'Analytics'  },
  { href: '/dashboard/risk-map',   icon: '🗺️', label: 'Risk Map'   },
  { href: '/dashboard/market-crash', icon: '🚨', label: 'Market Crash' },
]

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(MOCK_POLICIES)
  const [total, setTotal] = useState(450)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [coverageFilter, setCoverageFilter] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/api/v1/policies/all?limit=100`)
        if (res.ok) {
          const data = await res.json()
          if (data.policies?.length) {
            setPolicies(data.policies)
            setTotal(data.total)
          }
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const filtered = policies.filter(p => {
    const matchSearch = !search ||
      p.policy_number.toLowerCase().includes(search.toLowerCase()) ||
      (p.worker_name || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchCoverage = coverageFilter === 'all' || p.coverage_type === coverageFilter
    return matchSearch && matchStatus && matchCoverage
  })

  const active = policies.filter(p => p.status === 'active').length
  const expired = policies.filter(p => p.status === 'expired').length
  const totalRevenue = policies.filter(p => p.status === 'active')
    .reduce((s, p) => s + p.weekly_premium, 0)

  const daysLeft = (end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <div className="flex min-h-screen bg-[#060d1a] text-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 flex h-screen w-60 flex-col border-r border-white/[0.06] bg-[#060d1a]">
        <div className="border-b border-white/[0.06] px-5 py-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-sm font-black text-slate-950">G</span>
            <span className="text-lg font-black tracking-tight text-white">GigArmor</span>
          </Link>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-slate-500">Control Center</p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map(item => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${item.active ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-semibold">Live</span>
            <span className="text-slate-500">· {total} policies</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 px-8 py-8">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs text-slate-500 uppercase tracking-widest">GigArmor / Policies</p>
            <h1 className="text-3xl font-black text-white">Policy Management</h1>
            <p className="mt-1 text-sm text-slate-400">All active and historical insurance policies</p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <span className="text-xs text-slate-500 animate-pulse">Loading live data…</span>}
            <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors">
              + New Policy
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: 'Total Policies',   value: total.toLocaleString(), icon: '📋', sub: 'All time', color: 'border-cyan-500/20 bg-cyan-500/5' },
            { label: 'Active',           value: active.toLocaleString(), icon: '✅', sub: 'Currently covered', color: 'border-emerald-500/20 bg-emerald-500/5' },
            { label: 'Expired',          value: expired.toLocaleString(), icon: '⏰', sub: 'Needs renewal', color: 'border-amber-500/20 bg-amber-500/5' },
            { label: 'Weekly Revenue',   value: `₹${totalRevenue.toFixed(0)}`, icon: '💰', sub: 'Active premiums', color: 'border-violet-500/20 bg-violet-500/5' },
          ].map(k => (
            <div key={k.label} className={`rounded-2xl border p-5 ${k.color}`}>
              <div className="mb-2 text-2xl">{k.icon}</div>
              <div className="text-2xl font-black text-white">{k.value}</div>
              <div className="mt-0.5 text-sm font-medium text-slate-200">{k.label}</div>
              <div className="text-xs text-slate-500">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search policy # or worker name…"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[#0d1829] px-4 py-2.5 text-sm text-slate-300 outline-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={coverageFilter} onChange={e => setCoverageFilter(e.target.value)}
            className="rounded-xl border border-white/[0.08] bg-[#0d1829] px-4 py-2.5 text-sm text-slate-300 outline-none cursor-pointer">
            <option value="all">All Coverage</option>
            <option value="weather">🌧️ Weather</option>
            <option value="flood">🌊 Flood</option>
            <option value="job_loss">💼 Job Loss</option>
            <option value="pollution">😷 Pollution</option>
            <option value="curfew">🚫 Curfew/Strike</option>
            <option value="app_outage">⚡ App Outage</option>
          </select>
          <span className="ml-auto text-sm text-slate-500">{filtered.length} results</span>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {['Policy #', 'Worker', 'Platform', 'Coverage', 'Premium/wk', 'Status', 'Valid Until', 'Days Left'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const days = daysLeft(p.end_date)
                  const isExpiring = days > 0 && days <= 7
                  return (
                    <tr key={p.id} className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold text-cyan-400">{p.policy_number}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-bold text-white">
                            {(p.worker_name || 'W').charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-white">{p.worker_name || p.user_id.slice(0, 8)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.worker_platform ? (
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PLATFORM_COLORS[p.worker_platform] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                            {p.worker_platform}
                          </span>
                        ) : <span className="text-slate-500 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-300">
                        {p.coverage_type ? (COVERAGE_LABELS[p.coverage_type] || p.coverage_type) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-bold text-white">₹{p.weekly_premium.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          p.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          p.status === 'expired' ? 'bg-slate-500/20 text-slate-400 border-slate-500/30' :
                          'bg-red-500/20 text-red-300 border-red-500/30'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-400">
                        {new Date(p.end_date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        {days <= 0 ? (
                          <span className="text-xs text-slate-500">Expired</span>
                        ) : isExpiring ? (
                          <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-300">⚠️ {days}d</span>
                        ) : (
                          <span className="text-xs text-slate-400">{days}d</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm">No policies match your filters</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
