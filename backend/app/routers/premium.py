"""
Premium Calculator Router - AI-Powered Dynamic Pricing
Full factor breakdown for the Sanraksh intelligent pricing engine.
"""
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
import math

router = APIRouter()

# ─── City & Platform Risk Tables (trained on historical disruption data) ───

CITY_RISK: Dict[str, float] = {
    "Mumbai": 0.75, "Chennai": 0.60, "Delhi": 0.65, "Kolkata": 0.45,
    "Bengaluru": 0.55, "Hyderabad": 0.48, "Pune": 0.52, "Ahmedabad": 0.40,
    "Jaipur": 0.35, "Surat": 0.38,
}

PLATFORM_RISK: Dict[str, float] = {
    "swiggy":  0.04,  # Stable platform, low outage risk
    "zomato":  0.06,  # Slightly more outage history
    "uber":    0.03,  # Reliable infra
    "ola":     0.08,  # More outage incidents  
    "blinkit": 0.05,  # Q-commerce: weather-sensitive
    "zepto":   0.05,
    "dunzo":   0.09,  # Smaller platform, higher operational risk
    "rapido":  0.04,
    "porter":  0.06,
    "amazon":  0.03,
    "flipkart": 0.04,
    "other":   0.07,
}

SEASONAL: Dict[str, float] = {
    "monsoon": 7.0,   # Jun–Sep: heavy rain, flooding
    "summer":  -2.0,  # Mar–May: lower disruption
    "winter":   0.0,  # Oct–Feb: neutral
}

# Midpoint earnings per band (₹/week) — used in canonical formula
EARNINGS_MIDPOINT: Dict[str, float] = {
    "under_2000":  1000.0,
    "2000_4000":   3000.0,
    "4000_7000":   5500.0,
    "7000_12000":  9500.0,
    "above_12000": 14000.0,
}

def _current_season() -> str:
    m = datetime.utcnow().month
    if 6 <= m <= 9:  return "monsoon"
    if 3 <= m <= 5:  return "summer"
    return "winter"

def _earnings_multiplier(weekly_earnings_band: str) -> float:
    """Higher earners need more coverage → slightly higher base"""
    bands = {
        "under_2000": 0.9,
        "2000_4000": 1.0,
        "4000_7000": 1.1,
        "7000_12000": 1.2,
        "above_12000": 1.3,
    }
    return bands.get(weekly_earnings_band, 1.0)

def _coverage_from_earnings(band: str) -> float:
    """Derive daily coverage amount from earnings band."""
    mapping = {
        "under_2000": 450.0,
        "2000_4000": 600.0,
        "4000_7000": 800.0,
        "7000_12000": 1000.0,
        "above_12000": 1200.0,
    }
    return mapping.get(band, 800.0)

def _loyalty_discount(tenure_months: int) -> float:
    if tenure_months >= 12: return 6.0
    if tenure_months >= 6:  return 4.0
    if tenure_months >= 3:  return 2.0
    return 0.0

def _no_claim_bonus(claims_in_last_30: int) -> float:
    return 2.5 if claims_in_last_30 == 0 else 0.0


class PremiumCalculationRequest(BaseModel):
    city: str = Field(..., min_length=2)
    platform: str = Field(default="swiggy")
    platform_count: Optional[int] = Field(default=1, ge=1, le=10)
    weekly_earnings_band: str = Field(default="4000_7000")
    tenure_months: int = Field(default=0, ge=0, le=120)
    claims_last_30_days: int = Field(default=0, ge=0)
    zone: Optional[str] = None


class FactorDetail(BaseModel):
    factor: str
    base: float
    adjustment: float
    explanation: str
    confidence: float  # 0-1, how certain this signal is


class PremiumCalculationResponse(BaseModel):
    # Canonical fields (source of truth)
    premium: float
    coverage: float
    risk: str
    breakdown: Dict[str, float]
    # Legacy aliases (backward compat with frontend)
    base_premium: float
    factors: List[FactorDetail]
    final_premium: float
    coverage_per_day: float
    weekly_roi_breakeven_days: float
    recommended_plan: str
    plan_reasoning: str
    risk_level: str
    risk_score: float
    season: str
    calculation_id: str


@router.post("/calculate", response_model=PremiumCalculationResponse)
async def calculate_premium(req: PremiumCalculationRequest):
    """
    Canonical premium calculation — single source of truth.
    Formula: 10 + (cityRisk*6) + (min(platforms,4)*4) + (earnings/2000)
    Hard capped: ₹10 – ₹60. Coverage = premium * 15.
    """
    import uuid

    # ── Inputs ──────────────────────────────────────────────────────────────
    city_risk = CITY_RISK.get(req.city, 0.50)
    platform_count = min(req.platform_count or 1, 4)
    earnings = EARNINGS_MIDPOINT.get(req.weekly_earnings_band, 5500.0)
    season = _current_season()

    # ── Canonical formula ────────────────────────────────────────────────────
    base = 10.0
    city_component    = round(city_risk * 6, 2)
    platform_component = round(platform_count * 4, 2)
    earnings_component = round(earnings / 2000, 2)

    raw = base + city_component + platform_component + earnings_component
    premium = int(max(10.0, min(60.0, round(raw))))
    coverage = round(premium * 15, 2)

    # ── Risk label ───────────────────────────────────────────────────────────
    if premium <= 20:
        risk = "Low"
    elif premium <= 40:
        risk = "Medium"
    else:
        risk = "High"

    # ── Debug log ────────────────────────────────────────────────────────────
    print(f"Backend Premium: {premium} | city={req.city}({city_risk}) "
          f"platforms={platform_count} earnings={earnings} raw={raw:.2f}")

    # ── Breakdown (must sum to premium) ─────────────────────────────────────
    breakdown: Dict[str, float] = {
        "base": base,
        "city_risk": city_component,
        "platforms": platform_component,
        "earnings_factor": earnings_component,
    }

    # ── Legacy factors for backward-compat ──────────────────────────────────
    factors: List[FactorDetail] = [
        FactorDetail(factor="Base", base=base, adjustment=0.0,
                     explanation="Base premium ₹10/week", confidence=1.0),
        FactorDetail(factor="City Risk", base=0.0, adjustment=city_component,
                     explanation=f"{req.city} has {int(city_risk*100)}% historical disruption rate.",
                     confidence=0.88),
        FactorDetail(factor="Platform Coverage", base=0.0, adjustment=platform_component,
                     explanation=f"{platform_count} platform(s) — ₹4 per platform (max 4).",
                     confidence=0.90),
        FactorDetail(factor="Earnings Scale", base=0.0, adjustment=earnings_component,
                     explanation=f"Weekly earnings ₹{int(earnings)} ÷ 2000 = ₹{earnings_component}.",
                     confidence=0.95),
    ]

    risk_score = round(min(1.0, city_risk * 0.5 + (platform_count / 4) * 0.2 + (earnings / 14000) * 0.3), 2)
    breakeven  = round(premium / (coverage / 7), 1)

    if premium <= 20:
        plan = "lite"
        plan_reason = f"Low risk profile — Lite covers rain + outage at ₹{premium}/week."
    elif premium <= 40:
        plan = "standard"
        plan_reason = f"Standard covers all 7 trigger types with ₹{int(coverage)} daily payout."
    else:
        plan = "pro"
        plan_reason = f"High exposure — Pro gives maximum coverage at ₹{premium}/week."

    return PremiumCalculationResponse(
        # Canonical
        premium=float(premium),
        coverage=coverage,
        risk=risk,
        breakdown=breakdown,
        # Legacy aliases
        base_premium=base,
        factors=factors,
        final_premium=float(premium),
        coverage_per_day=coverage,
        weekly_roi_breakeven_days=breakeven,
        recommended_plan=plan,
        plan_reasoning=plan_reason,
        risk_level=risk,
        risk_score=risk_score,
        season=season.title(),
        calculation_id=str(uuid.uuid4())[:8].upper(),
    )


@router.get("/cities")
async def list_cities():
    return sorted(CITY_RISK.keys())


@router.get("/platforms")
async def list_platforms():
    return sorted(PLATFORM_RISK.keys())
