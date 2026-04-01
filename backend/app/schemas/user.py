"""
User Schemas
Pydantic models for request/response validation
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class DeliveryPlatformEnum(str, Enum):
    ZOMATO = "zomato"
    SWIGGY = "swiggy"
    AMAZON = "amazon"
    ZEPTO = "zepto"
    BLINKIT = "blinkit"
    OTHER = "other"


class UserRegisterRequest(BaseModel):
    """User registration request"""
    phone: str = Field(..., pattern=r"^\+?\d{10,15}$")
    name: str = Field(..., min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    delivery_platform: DeliveryPlatformEnum
    work_city: Optional[str] = None
    work_zone: Optional[str] = None
    work_location_lat: Optional[float] = None
    work_location_lng: Optional[float] = None
    plan_type: Optional[str] = "standard"  # lite | standard | pro
    aadhaar_last4: Optional[str] = None
    weekly_earnings_band: Optional[str] = "4000_7000"


class UserLoginRequest(BaseModel):
    """User login request"""
    phone: str = Field(..., pattern=r"^\+?\d{10,15}$")


class OTPVerifyRequest(BaseModel):
    """OTP verification request"""
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)


class UserResponse(BaseModel):
    """User response"""
    id: str
    phone: str
    name: str
    email: Optional[str]
    delivery_platform: str
    work_city: Optional[str]
    work_zone: Optional[str]
    kyc_status: str
    is_active: bool
    risk_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    """User profile update"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    work_city: Optional[str] = None
    work_zone: Optional[str] = None
    work_location_lat: Optional[float] = None
    work_location_lng: Optional[float] = None
