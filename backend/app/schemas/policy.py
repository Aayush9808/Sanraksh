"""
Policy Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


class PolicyCreateRequest(BaseModel):
    """Create policy request"""
    user_id: str
    coverage_amount: Optional[float] = 800.0
    start_date: Optional[date] = None


class PolicyResponse(BaseModel):
    """Policy response"""
    id: str
    user_id: str
    policy_number: str
    start_date: date
    end_date: date
    status: str
    weekly_premium: float
    coverage_amount: float
    coverage_type: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class PremiumCalculationRequest(BaseModel):
    """Premium calculation request"""
    user_id: str
    city: str
    zone: str
    coverage_amount: Optional[float] = 800.0


class PremiumCalculationResponse(BaseModel):
    """Premium calculation response"""
    base_premium: float
    adjustments: list
    final_premium: float
    coverage_daily: float
    calculation_timestamp: str
