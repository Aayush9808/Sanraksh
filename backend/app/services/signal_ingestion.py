"""
Signal ingestion service.
Combines weather, pollution, traffic, platform, and social indicators into event confidence.
"""

from __future__ import annotations

from typing import Dict

from app.models.disruption import EventType, Severity
from app.services.weather import weather_service


CITY_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bengaluru": (12.9716, 77.5946),
    "Pune": (18.5204, 73.8567),
    "Hyderabad": (17.3850, 78.4867),
    "Chennai": (13.0827, 80.2707),
}


def _severity_score(severity: Severity) -> float:
    return {
        Severity.LOW: 0.35,
        Severity.MEDIUM: 0.55,
        Severity.HIGH: 0.75,
        Severity.EXTREME: 0.9,
    }[severity]


def _clamp(v: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(v, high))


class SignalIngestionService:
    """Multi-source signal collector used by automation engine."""

    async def collect_signals(self, city: str, zone: str, event_type: EventType, severity: Severity) -> Dict:
        weather = await self._weather_signal(city, event_type, severity)
        pollution = self._pollution_signal(event_type, severity)
        traffic = self._traffic_signal(event_type, severity)
        platform = self._platform_signal(event_type, severity)
        social = self._social_signal(event_type, severity)

        sources = {
            "weather": weather,
            "pollution": pollution,
            "traffic": traffic,
            "platform": platform,
            "social": social,
        }

        weights = self._event_weights(event_type)
        numerator = sum(sources[src]["confidence"] * weight for src, weight in weights.items())
        denominator = max(sum(weights.values()), 1e-6)
        aggregate_confidence = round(_clamp(numerator / denominator), 3)

        return {
            "city": city,
            "zone": zone,
            "event_type": event_type.value,
            "aggregate_confidence": aggregate_confidence,
            "recommended_mode": "strict" if aggregate_confidence < 0.6 else "balanced",
            "sources": sources,
        }

    async def _weather_signal(self, city: str, event_type: EventType, severity: Severity) -> Dict:
        lat, lng = CITY_COORDS.get(city, (19.0760, 72.8777))
        data = await weather_service.get_current_weather(lat, lng)
        sev = _severity_score(severity)

        if not data:
            return {
                "source": "simulated-weather",
                "active": event_type in {EventType.HEAVY_RAIN, EventType.FLOOD, EventType.EXTREME_HEAT},
                "confidence": round(_clamp(0.5 + sev * 0.4), 3),
                "detail": "Weather API unavailable, using fallback signal profile",
            }

        rain_1h = float(data.get("rain_1h") or 0)
        temp = float(data.get("temperature") or 0)
        active = (
            (event_type == EventType.HEAVY_RAIN and rain_1h >= 5)
            or (event_type == EventType.FLOOD and rain_1h >= 8)
            or (event_type == EventType.EXTREME_HEAT and temp >= 38)
        )

        confidence = 0.35 + (0.4 if active else 0) + sev * 0.25
        return {
            "source": "openweather",
            "active": active,
            "confidence": round(_clamp(confidence), 3),
            "detail": f"rain_1h={rain_1h}, temp={temp}",
        }

    def _pollution_signal(self, event_type: EventType, severity: Severity) -> Dict:
        sev = _severity_score(severity)
        active = event_type == EventType.SEVERE_POLLUTION
        confidence = 0.3 + (0.45 if active else 0.05) + sev * 0.2
        return {
            "source": "aqi-simulator",
            "active": active,
            "confidence": round(_clamp(confidence), 3),
            "detail": "AQI risk proxy from city profile",
        }

    def _traffic_signal(self, event_type: EventType, severity: Severity) -> Dict:
        sev = _severity_score(severity)
        active = event_type in {EventType.TRAFFIC_JAM, EventType.ROAD_CLOSURE, EventType.FLOOD}
        confidence = 0.35 + (0.35 if active else 0.1) + sev * 0.2
        return {
            "source": "traffic-simulator",
            "active": active,
            "confidence": round(_clamp(confidence), 3),
            "detail": "Congestion and route-block likelihood",
        }

    def _platform_signal(self, event_type: EventType, severity: Severity) -> Dict:
        sev = _severity_score(severity)
        active = event_type in {EventType.MARKET_CLOSURE, EventType.CURFEW}
        confidence = 0.3 + (0.4 if active else 0.1) + sev * 0.2
        return {
            "source": "platform-health-simulator",
            "active": active,
            "confidence": round(_clamp(confidence), 3),
            "detail": "Order-flow degradation and outage proxy",
        }

    def _social_signal(self, event_type: EventType, severity: Severity) -> Dict:
        sev = _severity_score(severity)
        active = event_type in {EventType.CURFEW, EventType.STRIKE, EventType.MARKET_CLOSURE}
        confidence = 0.28 + (0.45 if active else 0.08) + sev * 0.15
        return {
            "source": "civic-feed-simulator",
            "active": active,
            "confidence": round(_clamp(confidence), 3),
            "detail": "Civic advisory confidence proxy",
        }

    def _event_weights(self, event_type: EventType) -> Dict[str, float]:
        if event_type in {EventType.HEAVY_RAIN, EventType.FLOOD, EventType.EXTREME_HEAT}:
            return {"weather": 0.45, "traffic": 0.2, "platform": 0.15, "social": 0.1, "pollution": 0.1}
        if event_type == EventType.SEVERE_POLLUTION:
            return {"pollution": 0.45, "weather": 0.15, "traffic": 0.15, "social": 0.15, "platform": 0.1}
        if event_type in {EventType.TRAFFIC_JAM, EventType.ROAD_CLOSURE}:
            return {"traffic": 0.45, "weather": 0.2, "social": 0.15, "platform": 0.1, "pollution": 0.1}
        return {"social": 0.35, "platform": 0.25, "traffic": 0.15, "weather": 0.15, "pollution": 0.1}


signal_ingestion_service = SignalIngestionService()
