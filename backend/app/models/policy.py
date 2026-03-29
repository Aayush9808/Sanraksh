"""
Policy Model
"""

from sqlalchemy import Column, String, Float, Date, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.database import Base


class PolicyStatus(str, enum.Enum):
    """Policy status enum"""
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    SUSPENDED = "suspended"


class Policy(Base):
    """Insurance Policy Model"""
    __tablename__ = "policies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    policy_number = Column(String(20), unique=True, nullable=False, index=True)
    
    # Duration
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    
    # Status
    status = Column(Enum(PolicyStatus), default=PolicyStatus.ACTIVE)
    
    # Pricing
    weekly_premium = Column(Float, nullable=False)  # ₹48
    coverage_amount = Column(Float, nullable=False)  # ₹800/day max payout
    coverage_type = Column(String(50), default="income_loss_only")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        return f"<Policy {self.policy_number} ({self.status})>"
