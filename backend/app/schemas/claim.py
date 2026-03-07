"""
Claim Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class ClaimCreateRequest(BaseModel):
    """Create claim request"""
    user_id: str
    policy_id: str
    disruption_id: Optional[str] = None
    claim_date: date
    claim_amount: float
    description: Optional[str] = None


class ClaimResponse(BaseModel):
    """Claim response"""
    id: str
    claim_number: str
    user_id: str
    policy_id: str
    disruption_id: Optional[str]
    claim_date: date
    claim_amount: float
    status: str
    approval_type: Optional[str]
    payout_date: Optional[datetime]
    payout_transaction_id: Optional[str]
    fraud_score: float
    location_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ClaimStatusResponse(BaseModel):
    """Claim status response"""
    claim_id: str
    claim_number: str
    status: str
    amount: float
    claim_date: date
    payout_info: Optional[dict]
