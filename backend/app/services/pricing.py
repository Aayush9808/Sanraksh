"""
Dynamic Pricing Service
Calculates weekly premium based on multiple factors
"""

from datetime import datetime
from typing import Dict, Optional
import math

from app.config import settings


class PricingService:
    """Dynamic pricing calculator"""
    
    def __init__(self):
        self.base_premium = settings.BASE_PREMIUM_WEEKLY
        self.min_premium = settings.MIN_PREMIUM_WEEKLY
        self.max_premium = settings.MAX_PREMIUM_WEEKLY
    
    def calculate_premium(
        self,
        risk_score: float,
        city: str,
        zone: str,
        season: Optional[str] = None,
        user_history: Optional[Dict] = None
    ) -> Dict:
        """
        Calculate dynamic weekly premium
        
        Args:
            risk_score: Zone risk score (0-1)
            city: City name
            zone: Zone name
            season: Current season (monsoon/summer/winter)
            user_history: User's claim history
        
        Returns:
            Dict with premium breakdown
        """
        
        # Start with base premium
        premium = self.base_premium
        adjustments = []
        
        # 1. Risk-based adjustment (+₹0 to +₹15)
        risk_adjustment = risk_score * 15
        premium += risk_adjustment
        adjustments.append({
            "factor": "Zone Risk",
            "amount": round(risk_adjustment, 2),
            "description": f"{zone} risk level"
        })
        
        # 2. Seasonal adjustment
        if season:
            seasonal_factor = self._get_seasonal_factor(season)
            premium += seasonal_factor
            adjustments.append({
                "factor": "Season",
                "amount": seasonal_factor,
                "description": f"{season.capitalize()} season"
            })
        
        # 3. User history discount (-₹0 to -₹5)
        if user_history:
            history_discount = self._calculate_history_discount(user_history)
            premium -= history_discount
            if history_discount > 0:
                adjustments.append({
                    "factor": "Loyalty Discount",
                    "amount": -history_discount,
                    "description": f"{user_history.get('tenure_months', 0)} months with us"
                })
        
        # 4. Safe behavior bonus
        if user_history and user_history.get('claims_count', 0) == 0:
            safe_bonus = 2.0
            premium -= safe_bonus
            adjustments.append({
                "factor": "Safe Behavior Bonus",
                "amount": -safe_bonus,
                "description": "No claims in last 30 days"
            })
        
        # Ensure within bounds
        premium = max(self.min_premium, min(premium, self.max_premium))
        
        return {
            "base_premium": self.base_premium,
            "adjustments": adjustments,
            "final_premium": round(premium, 2),
            "coverage_daily": settings.DEFAULT_COVERAGE_DAILY,
            "calculation_timestamp": datetime.utcnow().isoformat()
        }
    
    def _get_seasonal_factor(self, season: str) -> float:
        """Get seasonal adjustment factor"""
        seasonal_factors = {
            "monsoon": 5.0,  # High risk
            "summer": -2.0,  # Lower risk
            "winter": 0.0,   # Neutral
        }
        return seasonal_factors.get(season.lower(), 0.0)
    
    def _calculate_history_discount(self, history: Dict) -> float:
        """Calculate discount based on user history"""
        tenure_months = history.get('tenure_months', 0)
        claims_count = history.get('claims_count', 0)
        
        # Loyalty discount
        discount = 0.0
        if tenure_months >= 6:
            discount += 3.0
        elif tenure_months >= 3:
            discount += 2.0
        elif tenure_months >= 1:
            discount += 1.0
        
        # Low claims bonus
        if claims_count == 0 and tenure_months >= 3:
            discount += 2.0
        
        return min(discount, 5.0)  # Max ₹5 discount


pricing_service = PricingService()
