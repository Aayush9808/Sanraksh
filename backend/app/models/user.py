"""
User Model
"""

from sqlalchemy import Column, String, Float, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class DeliveryPlatform(str, enum.Enum):
    """Delivery platforms enum"""
    ZOMATO = "zomato"
    SWIGGY = "swiggy"
    AMAZON = "amazon"
    ZEPTO = "zepto"
    BLINKIT = "blinkit"
    DUNZO = "dunzo"
    OTHER = "other"


class KYCStatus(str, enum.Enum):
    """KYC status enum"""
    PENDING = "pending"
    SUBMITTED = "submitted"
    VERIFIED = "verified"
    REJECTED = "rejected"


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phone = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    
    # Hashed for privacy
    aadhaar_hash = Column(String(64), nullable=True)
    
    # Work details
    delivery_platform = Column(Enum(DeliveryPlatform), nullable=False)
    work_location_lat = Column(Float, nullable=True)
    work_location_lng = Column(Float, nullable=True)
    work_city = Column(String(50), nullable=True)
    work_zone = Column(String(100), nullable=True)
    
    # Status
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.PENDING)
    is_active = Column(Boolean, default=True)
    
    # Risk scoring
    risk_score = Column(Float, default=0.5)  # 0-1 scale
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        return f"<User {self.name} ({self.phone})>"
