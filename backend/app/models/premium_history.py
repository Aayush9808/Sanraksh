"""
Premium History Model
"""

from sqlalchemy import Column, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
import uuid

from app.database import Base


class PremiumHistory(Base):
    """Premium History Model - Track weekly premium calculations"""
    __tablename__ = "premium_history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    policy_id = Column(String(36), ForeignKey("policies.id"), nullable=False)
    
    # Week period
    week_start_date = Column(Date, nullable=False)
    week_end_date = Column(Date, nullable=False)
    
    # Premium breakdown
    base_premium = Column(Float, nullable=False)
    risk_adjustment = Column(Float, default=0.0)
    seasonal_adjustment = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    final_premium = Column(Float, nullable=False)
    
    # Payment
    payment_status = Column(String(20), default="pending")
    payment_date = Column(DateTime(timezone=True), nullable=True)
    payment_transaction_id = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<PremiumHistory Week {self.week_start_date} - ₹{self.final_premium}>"
