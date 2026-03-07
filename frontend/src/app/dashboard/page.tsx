'use client'

import { useState } from 'react'

export default function DashboardPage() {
  const [stats] = useState({
    total_users: 1247,
    active_policies: 1089,
    total_claims: 342,
    claims_today: 23,
    total_payout: 273600,
    automation_rate: 99.8
  })
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-900">🛡️ GigShield Admin Dashboard</h1>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.total_users.toLocaleString()}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Active Policies"
            value={stats.active_policies.toLocaleString()}
            icon="📋"
            color="green"
          />
          <StatCard
            title="Claims Today"
            value={stats.claims_today}
            icon="⚡"
            color="orange"
          />
          <StatCard
            title="Total Payouts"
            value={`₹${(stats.total_payout / 1000).toFixed(0)}K`}
            icon="💰"
            color="purple"
          />
        </div>
        
        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Automation Rate</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.automation_rate}%
            </div>
            <p className="text-gray-600">Claims auto-approved without manual review</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-2">
              <ActivityItem 
                text="Heavy rain detected in Andheri West"
                time="2 mins ago"
                type="warning"
              />
              <ActivityItem 
                text="12 claims auto-approved"
                time="5 mins ago"
                type="success"
              />
              <ActivityItem 
                text="New user registered: Rahul Kumar"
                time="10 mins ago"
                type="info"
              />
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6">
          <QuickLink href="/dashboard/risk-map" title="Risk Heatmap" icon="🗺️" />
          <QuickLink href="/dashboard/claims" title="Manage Claims" icon="📝" />
          <QuickLink href="/dashboard/analytics" title="Analytics" icon="📊" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colors = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    orange: 'bg-orange-50 text-orange-900',
    purple: 'bg-purple-50 text-purple-900',
  }
  
  return (
    <div className={`${colors[color]} rounded-lg shadow p-6`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-75">{title}</div>
    </div>
  )
}

function ActivityItem({ text, time, type }: any) {
  const colors = {
    warning: 'text-orange-600',
    success: 'text-green-600',
    info: 'text-blue-600',
  }
  
  return (
    <div className="flex items-start gap-2 py-2 border-b last:border-b-0">
      <div className={`${colors[type]} font-semibold`}>•</div>
      <div className="flex-1">
        <div className="text-sm">{text}</div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
  )
}

function QuickLink({ href, title, icon }: any) {
  return (
    <a 
      href={href}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <div className="font-semibold">{title}</div>
    </a>
  )
}
