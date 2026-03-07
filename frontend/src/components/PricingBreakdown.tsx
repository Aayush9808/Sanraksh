/**
 * Pricing Breakdown Component
 * Shows transparent breakdown of premium calculation
 */

import React from 'react';

interface Adjustment {
  factor: string;
  amount: number;
  description: string;
}

interface PricingBreakdownProps {
  basePremium: number;
  adjustments: Adjustment[];
  finalPremium: number;
  coverageDaily: number;
}

const PricingBreakdown: React.FC<PricingBreakdownProps> = ({
  basePremium,
  adjustments,
  finalPremium,
  coverageDaily,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Premium Breakdown</h3>
      
      {/* Base Premium */}
      <div className="border-b pb-3 mb-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Base Premium (Weekly)</span>
          <span className="font-semibold">₹{basePremium.toFixed(2)}</span>
        </div>
      </div>

      {/* Adjustments */}
      <div className="space-y-2 mb-4">
        {adjustments.map((adj, index) => (
          <div key={index} className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">{adj.factor}</div>
              <div className="text-xs text-gray-500">{adj.description}</div>
            </div>
            <span className={`text-sm font-semibold ${adj.amount >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {adj.amount >= 0 ? '+' : ''}{adj.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Visual bar chart */}
      <div className="mb-4">
        <div className="flex items-center h-8 bg-gray-100 rounded overflow-hidden">
          <div 
            className="h-full bg-blue-500 flex items-center justify-center text-xs text-white font-semibold"
            style={{ width: `${(basePremium / finalPremium) * 100}%` }}
          >
            Base
          </div>
          {adjustments.filter(a => a.amount > 0).map((adj, i) => (
            <div
              key={i}
              className="h-full bg-orange-500 flex items-center justify-center text-xs text-white font-semibold"
              style={{ width: `${(adj.amount / finalPremium) * 100}%` }}
              title={adj.factor}
            />
          ))}
        </div>
      </div>

      {/* Final Premium */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Final Weekly Premium</span>
          <span className="text-2xl font-bold text-blue-600">₹{finalPremium.toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-600 text-right">
          Daily Coverage: ₹{coverageDaily.toFixed(2)}
        </div>
      </div>

      {/* Info box */}
      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
        <strong>100% Transparent:</strong> No hidden charges. Your premium adjusts weekly based on real-time risk.
      </div>
    </div>
  );
};

export default PricingBreakdown;
