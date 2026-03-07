export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-900 mb-4">
            🛡️ GigShield
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            AI-Powered Insurance for India's Gig Workers
          </p>
          <p className="text-xl text-gray-600 mb-12">
            Protecting 10M+ delivery partners from income loss
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">60-Second Payouts</h3>
              <p className="text-gray-600">
                Automated claims from disruption to bank transfer
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold mb-2">Hyper-Local Intelligence</h3>
              <p className="text-gray-600">
                2km × 2km micro-zone risk mapping
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">
                See exactly why your premium is ₹X
              </p>
            </div>
          </div>
          
          <div className="mt-16">
            <a 
              href="/dashboard" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 inline-block"
            >
              View Dashboard →
            </a>
          </div>
          
          <div className="mt-16 text-gray-500">
            <p>Guidewire DEVTrails 2026 | Team: Runtime Terror</p>
          </div>
        </div>
      </div>
    </main>
  )
}
