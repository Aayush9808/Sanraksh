"""
Test policy premium calculations
"""

import pytest
from app.services.pricing import PricingService


@pytest.fixture
def pricing_service():
    return PricingService()


def test_base_premium_calculation(pricing_service):
    """Test basic premium calculation"""
    result = pricing_service.calculate_premium(
        risk_score=0.5,
        city="Mumbai",
        zone="Andheri West",
        season="winter",
        user_history={}
    )
    
    assert result["base_premium"] == 40.0
    assert result["final_premium"] >= 35.0
    assert result["final_premium"] <= 80.0


def test_high_risk_premium(pricing_service):
    """Test premium for high risk user"""
    result = pricing_service.calculate_premium(
        risk_score=0.9,
        city="Mumbai",
        zone="High Risk Zone",
        season="monsoon",
        user_history={"claims_count": 5}
    )
    
    # High risk should have higher premium
    assert result["final_premium"] > 55.0


def test_loyalty_discount(pricing_service):
    """Test loyalty discount for long-term users"""
    result = pricing_service.calculate_premium(
        risk_score=0.5,
        city="Mumbai",
        zone="Andheri West",
        season="winter",
        user_history={"tenure_months": 12, "claims_count": 0}
    )
    
    # Should have loyalty discount
    discount_adjustments = [adj for adj in result["adjustments"] if adj["amount"] < 0]
    assert len(discount_adjustments) > 0


def test_monsoon_premium_increase(pricing_service):
    """Test premium increase during monsoon"""
    winter_premium = pricing_service.calculate_premium(
        risk_score=0.5,
        city="Mumbai",
        zone="Andheri West",
        season="winter",
        user_history={}
    )
    
    monsoon_premium = pricing_service.calculate_premium(
        risk_score=0.5,
        city="Mumbai",
        zone="Andheri West",
        season="monsoon",
        user_history={}
    )
    
    # Monsoon should be more expensive
    assert monsoon_premium["final_premium"] > winter_premium["final_premium"]


def test_premium_within_bounds(pricing_service):
    """Test premium stays within acceptable bounds"""
    # Extreme low risk
    low_result = pricing_service.calculate_premium(
        risk_score=0.0,
        city="Mumbai",
        zone="Safe Zone",
        season="winter",
        user_history={"tenure_months": 24, "claims_count": 0}
    )
    
    # Extreme high risk
    high_result = pricing_service.calculate_premium(
        risk_score=1.0,
        city="Mumbai",
        zone="Risky Zone",
        season="monsoon",
        user_history={"claims_count": 10}
    )
    
    # Both should be within bounds
    assert 35.0 <= low_result["final_premium"] <= 80.0
    assert 35.0 <= high_result["final_premium"] <= 80.0
