'use client'

import { useEffect, useState } from 'react'

interface RiskZone {
  zone_id: string
  lat: number
  lng: number
  risk_score: number
  risk_level: string
  color: string
}

export default function RiskHeatmapPage() {
  const [zones, setZones] = useState<RiskZone[]>([])
  const [selectedCity, setSelectedCity] = useState('Mumbai')
  
  useEffect(() => {
    // Fetch risk zones data
    fetchRiskZones()
  }, [selectedCity])
  
  const fetchRiskZones = async () => {
    // Mock data for now
    const mockZones: RiskZone[] = [
      { zone_id: 'ZONE_1_1', lat: 19.1136, lng: 72.8697, risk_score: 0.75, risk_level: 'high', color: '#f59e0b' },
      { zone_id: 'ZONE_1_2', lat: 19.0596, lng: 72.8295, risk_score: 0.45, risk_level: 'medium', color: '#fbbf24' },
      { zone_id: 'ZONE_1_3', lat: 18.9388, lng: 72.8354, risk_score: 0.25, risk_level: 'low', color: '#22c55e' },
    ]
    setZones(mockZones)
  }
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Risk Heatmap</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select City:</label>
        <select 
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option>Mumbai</option>
          <option>Bangalore</option>
          <option>Delhi</option>
        </select>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-3 gap-4">
          {zones.map((zone) => (
            <div 
              key={zone.zone_id}
              className="p-4 rounded-lg border-2"
              style={{ borderColor: zone.color }}
            >
              <div className="font-semibold">{zone.zone_id}</div>
              <div className="text-sm text-gray-600">Risk: {zone.risk_level.toUpperCase()}</div>
              <div className="text-sm">Score: {(zone.risk_score * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex items-center gap-6">
          <div className="text-sm font-medium">Risk Levels:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
            <span className="text-sm">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
            <span className="text-sm">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-sm">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
            <span className="text-sm">Extreme</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Hyper-Local Intelligence</h3>
        <p className="text-sm text-blue-800">
          Each zone represents a 2km × 2km area. Risk scores update every 5 minutes based on weather, 
          traffic, and historical disruption data. Workers can see exactly which zones are safe to work in.
        </p>
      </div>
    </div>
  )
}
