"""Claim Schemas"""
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ClaimCreateRequest(BaseModel):
    user_id: str
    auto_triggered: bool = False
    description: Optional[str] = None

class ClaimResponse(BaseModel):
    id: str
    claim_number: str
    status: str
    amount: float
    payout_transaction_id: Optional[str]
    class Config:
        from_attributes = True
