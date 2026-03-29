"""
Claim Model
"""

from sqlalchemy import Column, String, Float, Date, DateTime, Enum, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class ClaimStatus(str, enum.Enum):
    """Claim status enum"""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PAID = "paid"


class ApprovalType(str, enum.Enum):
    """Approval type enum"""
    AUTO = "auto"
    MANUAL = "manual"
    PEER_VALIDATED = "peer_validated"


class Claim(Base):
    """Insurance Claim Model"""
    __tablename__ = "claims"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_number = Column(String(20), unique=True, nullable=False, index=True)
    
    # Relationships
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    policy_id = Column(String(36), ForeignKey("policies.id"), nullable=False)
    disruption_id = Column(String(36), ForeignKey("disruptions.id"), nullable=True)
    
    # Claim details
    claim_date = Column(Date, nullable=False)
    claim_amount = Column(Float, nullable=False)
    
    # Status
    status = Column(Enum(ClaimStatus), default=ClaimStatus.PENDING)
    approval_type = Column(Enum(ApprovalType), nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Payout
    payout_date = Column(DateTime(timezone=True), nullable=True)
    payout_transaction_id = Column(String(100), nullable=True)
    
    # Fraud detection
    fraud_score = Column(Float, default=0.0)  # 0-1 scale
    location_verified = Column(Boolean, default=False)
    peer_validation_count = Column(Float, default=0)  # How many peers also affected
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        return f"<Claim {self.claim_number} ({self.status})>"
