/**
 * Claims List Component
 * Table showing user claims with status
 */

import React from 'react';

interface Claim {
  id: string;
  claim_number: string;
  claim_date: string;
  amount: number;
  status: string;
  approval_type?: string;
  payout_transaction_id?: string;
}

interface ClaimsListProps {
  claims: Claim[];
}

const getStatusBadge = (status: string) => {
  const styles = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
      {status.toUpperCase()}
    </span>
  );
};

const ClaimsList: React.FC<ClaimsListProps> = ({ claims }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-xl font-bold">Your Claims</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {claim.claim_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(claim.claim_date).toLocaleDateString('en-IN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ₹{claim.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(claim.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {claim.approval_type ? (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {claim.approval_type}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                  {claim.payout_transaction_id || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {claims.length === 0 && (
        <div className="px-6 py-12 text-center text-gray-500">
          No claims yet. Stay safe out there! 🛡️
        </div>
      )}
    </div>
  );
};

export default ClaimsList;
