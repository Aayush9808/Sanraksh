"""
Weather Service
Integrates with weather APIs for real-time data
"""

import httpx
from typing import Dict, Optional, List
from datetime import datetime
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class WeatherService:
    """Weather API integration"""
    
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = "https://api.openweathermap.org/data/2.5"
    
    async def get_current_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """
        Get current weather for location
        
        Args:
            lat: Latitude
            lng: Longitude
        
        Returns:
            Weather data dict or None if error
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/weather",
                    params={
                        "lat": lat,
                        "lon": lng,
                        "appid": self.api_key,
                        "units": "metric"
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_weather_data(data)
                else:
                    logger.error(f"Weather API error: {response.status_code}")
                    return None
        except Exception as e:
            logger.error(f"Weather API exception: {str(e)}")
            return None
    
    async def get_forecast(self, lat: float, lng: float, hours: int = 24) -> List[Dict]:
        """
        Get weather forecast
        
        Args:
            lat: Latitude
            lng: Longitude
            hours: Forecast hours (default 24)
        
        Returns:
            List of forecast data
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/forecast",
                    params={
                        "lat": lat,
                        "lon": lng,
                        "appid": self.api_key,
                        "units": "metric",
                        "cnt": hours // 3  # API returns 3-hour intervals
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return [self._parse_weather_data(item) for item in data.get("list", [])]
                else:
                    return []
        except Exception as e:
            logger.error(f"Forecast API exception: {str(e)}")
            return []
    
    def _parse_weather_data(self, data: Dict) -> Dict:
        """Parse weather API response"""
        main = data.get("main", {})
        weather = data.get("weather", [{}])[0]
        rain = data.get("rain", {})
        
        return {
            "temperature": main.get("temp"),
            "feels_like": main.get("feels_like"),
            "humidity": main.get("humidity"),
            "pressure": main.get("pressure"),
            "description": weather.get("description"),
            "main": weather.get("main"),
            "rain_1h": rain.get("1h", 0),
            "rain_3h": rain.get("3h", 0),
            "wind_speed": data.get("wind", {}).get("speed"),
            "timestamp": datetime.fromtimestamp(data.get("dt", 0)).isoformat()
        }
    
    def is_severe_weather(self, weather_data: Dict) -> bool:
        """Check if weather is severe enough for disruption"""
        if not weather_data:
            return False
        
        # Heavy rain (>7.6mm/hour)
        if weather_data.get("rain_1h", 0) > 7.6:
            return True
        
        # Extreme heat (>40°C)
        if weather_data.get("temperature", 0) > 40:
            return True
        
        # Severe weather conditions
        severe_conditions = ["Thunderstorm", "Heavy Rain", "Flood"]
        if weather_data.get("main") in severe_conditions:
            return True
        
        return False
    
    def calculate_severity(self, weather_data: Dict) -> str:
        """Calculate severity level"""
        rain = weather_data.get("rain_1h", 0)
        temp = weather_data.get("temperature", 0)
        
        if rain > 15 or temp > 45:
            return "extreme"
        elif rain > 7.6 or temp > 40:
            return "high"
        elif rain > 2.5 or temp > 35:
            return "medium"
        else:
            return "low"


weather_service = WeatherService()
