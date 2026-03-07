"""
Risk Assessment Service
Calculates risk scores for zones and users
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
import math


class RiskAssessmentService:
    """Risk assessment and scoring"""
    
    def calculate_zone_risk(
        self,
        zone_data: Dict,
        weather_data: Optional[Dict] = None,
        traffic_data: Optional[Dict] = None,
        historical_disruptions: Optional[List] = None
    ) -> Dict:
        """
        Calculate comprehensive risk score for a zone
        
        Args:
            zone_data: Zone information
            weather_data: Current/forecast weather
            traffic_data: Traffic conditions
            historical_disruptions: Past disruptions in zone
        
        Returns:
            Risk score breakdown
        """
        
        # Weather risk (0-1)
        weather_risk = self._calculate_weather_risk(weather_data) if weather_data else 0.5
        
        # Traffic risk (0-1)
        traffic_risk = self._calculate_traffic_risk(traffic_data) if traffic_data else 0.5
        
        # Historical risk (0-1)
        historical_risk = self._calculate_historical_risk(historical_disruptions) if historical_disruptions else 0.5
        
        # Social/Event risk (0-1)
        social_risk = self._calculate_social_risk(zone_data)
        
        # Weighted overall risk
        overall_risk = (
            weather_risk * 0.40 +
            traffic_risk * 0.25 +
            historical_risk * 0.25 +
            social_risk * 0.10
        )
        
        # Risk level classification
        if overall_risk >= 0.75:
            risk_level = "extreme"
            color = "#dc2626"  # Red
        elif overall_risk >= 0.55:
            risk_level = "high"
            color = "#f59e0b"  # Orange
        elif overall_risk >= 0.35:
            risk_level = "medium"
            color = "#fbbf24"  # Yellow
        else:
            risk_level = "low"
            color = "#22c55e"  # Green
        
        return {
            "overall_risk_score": round(overall_risk, 3),
            "risk_level": risk_level,
            "color": color,
            "breakdown": {
                "weather_risk": round(weather_risk, 3),
                "traffic_risk": round(traffic_risk, 3),
                "historical_risk": round(historical_risk, 3),
                "social_risk": round(social_risk, 3)
            },
            "recommendation": self._get_recommendation(overall_risk),
            "calculated_at": datetime.utcnow().isoformat()
        }
    
    def _calculate_weather_risk(self, weather_data: Dict) -> float:
        """Calculate weather-based risk"""
        risk = 0.0
        
        # Rain intensity
        rain_1h = weather_data.get("rain_1h", 0)
        if rain_1h > 15:
            risk += 0.9
        elif rain_1h > 7.6:
            risk += 0.7
        elif rain_1h > 2.5:
            risk += 0.4
        
        # Temperature extremes
        temp = weather_data.get("temperature", 25)
        if temp > 45:
            risk += 0.8
        elif temp > 40:
            risk += 0.6
        elif temp > 35:
            risk += 0.3
        
        # Wind speed
        wind_speed = weather_data.get("wind_speed", 0)
        if wind_speed > 20:
            risk += 0.5
        
        return min(risk, 1.0)
    
    def _calculate_traffic_risk(self, traffic_data: Dict) -> float:
        """Calculate traffic-based risk"""
        congestion_level = traffic_data.get("congestion_level", "low")
        
        traffic_map = {
            "low": 0.2,
            "moderate": 0.4,
            "high": 0.7,
            "severe": 0.9
        }
        
        return traffic_map.get(congestion_level, 0.5)
    
    def _calculate_historical_risk(self, disruptions: List) -> float:
        """Calculate risk based on historical disruptions"""
        if not disruptions:
            return 0.3
        
        # Count disruptions in last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_disruptions = [
            d for d in disruptions 
            if d.get("created_at") and d["created_at"] > thirty_days_ago
        ]
        
        count = len(recent_disruptions)
        
        if count > 15:
            return 0.9
        elif count > 10:
            return 0.7
        elif count > 5:
            return 0.5
        else:
            return 0.3
    
    def _calculate_social_risk(self, zone_data: Dict) -> float:
        """Calculate social event risk (strikes, curfews)"""
        # This would integrate with event calendar APIs
        # For now, return low risk
        return zone_data.get("social_risk_score", 0.2)
    
    def _get_recommendation(self, risk_score: float) -> str:
        """Get actionable recommendation based on risk"""
        if risk_score >= 0.75:
            return "⛔ HIGH RISK: Avoid working in this zone. Consider safer areas."
        elif risk_score >= 0.55:
            return "⚠️ ELEVATED RISK: Work with caution. Monitor conditions closely."
        elif risk_score >= 0.35:
            return "⚡ MODERATE RISK: Normal operations. Stay alert to changes."
        else:
            return "✅ LOW RISK: Safe to work. Good conditions expected."
    
    def calculate_user_risk_score(
        self,
        user_data: Dict,
        zone_risk: float,
        claim_history: List
    ) -> float:
        """
        Calculate personalized risk score for user
        
        Combines zone risk with user's personal factors
        """
        
        # Start with zone risk
        user_risk = zone_risk * 0.6
        
        # Add user factors
        tenure_months = user_data.get("tenure_months", 0)
        claims_count = len(claim_history)
        
        # Newer users = slightly higher risk
        if tenure_months < 1:
            user_risk += 0.1
        
        # High claim frequency = higher risk
        if claims_count > 10:
            user_risk += 0.2
        elif claims_count > 5:
            user_risk += 0.1
        
        return min(user_risk, 1.0)


risk_assessment_service = RiskAssessmentService()
