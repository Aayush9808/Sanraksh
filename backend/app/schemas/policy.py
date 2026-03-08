"""Policy Schemas"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class PolicyCreateRequest(BaseModel):
    user_id: str
    duration_weeks: int = Field(default=4, ge=1, le=52)
    coverage_type: Optional[str] = "income_loss_only"

class PremiumCalculateRequest(BaseModel):
    city: str
    zone: Optional[str] = ""
    user_id: Optional[str] = None
    tenure_months: Optional[int] = 0

class PolicyResponse(BaseModel):
    id: str
    user_id: str
    policy_number: str
    start_date: date
    end_date: date
    status: str
    weekly_premium: float
    coverage_amount: float
    coverage_type: str
    class Config:
        from_attributes = True
