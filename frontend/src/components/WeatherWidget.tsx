/**
 * Weather Widget Component
 * Shows current weather and severity indicator
 */

import React from 'react';

interface WeatherData {
  temperature: number;
  rainfall: number;
  conditions: string;
  severity: string;
}

interface WeatherWidgetProps {
  weather: WeatherData;
  zone: string;
}

const getSeverityColor = (severity: string) => {
  const colors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-orange-600 bg-orange-50',
    extreme: 'text-red-600 bg-red-50',
  };
  return colors[severity as keyof typeof colors] || 'text-gray-600 bg-gray-50';
};

const getWeatherIcon = (conditions: string) => {
  if (conditions.includes('rain')) return '🌧️';
  if (conditions.includes('cloud')) return '☁️';
  if (conditions.includes('clear')) return '☀️';
  if (conditions.includes('storm')) return '⛈️';
  return '🌤️';
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, zone }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Current Weather</h3>
          <p className="text-sm text-gray-500">{zone}</p>
        </div>
        <span className="text-4xl">{getWeatherIcon(weather.conditions)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600">Temperature</div>
          <div className="text-2xl font-bold">{weather.temperature}°C</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Rainfall</div>
          <div className="text-2xl font-bold">{weather.rainfall}<span className="text-sm">mm/hr</span></div>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-sm text-gray-600 mb-1">Conditions</div>
        <div className="text-sm font-medium text-gray-800">{weather.conditions}</div>
      </div>

      <div className={`px-4 py-3 rounded-lg ${getSeverityColor(weather.severity)}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Severity Level</span>
          <span className="text-lg font-bold uppercase">{weather.severity}</span>
        </div>
      </div>

      {weather.severity === 'high' || weather.severity === 'extreme' ? (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <strong>⚠️ Weather Alert:</strong> Consider taking a break. Your safety matters!
        </div>
      ) : null}
    </div>
  );
};

export default WeatherWidget;
