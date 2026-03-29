"""
Application Configuration
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./gigarmor.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Security
    SECRET_KEY: str = "gigarmor-dev-secret-key-2026-hackathon-do-not-use-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,https://gigarmor.vercel.app,https://*.vercel.app"
    
    # Weather APIs
    OPENWEATHER_API_KEY: str = ""
    WEATHERSTACK_API_KEY: str = ""
    
    # Maps
    GOOGLE_MAPS_API_KEY: str = ""
    
    # Twilio (WhatsApp)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_NUMBER: str = ""
    
    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    
    # SendGrid
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@gigarmor.app"
    
    # Insurance Configuration
    BASE_PREMIUM_WEEKLY: float = 40.0
    MIN_PREMIUM_WEEKLY: float = 35.0
    MAX_PREMIUM_WEEKLY: float = 80.0
    DEFAULT_COVERAGE_DAILY: float = 800.0
    
    # Background Jobs
    WEATHER_CHECK_INTERVAL_SECONDS: int = 300
    CLAIM_PROCESSING_INTERVAL_SECONDS: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
