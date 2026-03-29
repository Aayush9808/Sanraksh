"""
Disruption Model
"""

from sqlalchemy import Column, String, Float, DateTime, Boolean, Enum, Text
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class DisruptionType(str, enum.Enum):
    """Disruption type enum"""
    WEATHER = "weather"
    TRAFFIC = "traffic"
    SOCIAL = "social"


class EventType(str, enum.Enum):
    """Event type enum"""
    HEAVY_RAIN = "heavy_rain"
    FLOOD = "flood"
    EXTREME_HEAT = "extreme_heat"
    SEVERE_POLLUTION = "severe_pollution"
    TRAFFIC_JAM = "traffic_jam"
    ROAD_CLOSURE = "road_closure"
    STRIKE = "strike"
    CURFEW = "curfew"
    MARKET_CLOSURE = "market_closure"


class Severity(str, enum.Enum):
    """Severity enum"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"


class Disruption(Base):
    """Disruption Event Model"""
    __tablename__ = "disruptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Type & severity
    disruption_type = Column(Enum(DisruptionType), nullable=False)
    event_type = Column(Enum(EventType), nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    
    # Location (hyper-local)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    affected_radius_km = Column(Float, nullable=True)  # 2km radius
    city = Column(String(50), nullable=True)
    zone = Column(String(100), nullable=True)
    
    # Time
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Source
    source = Column(String(50), nullable=True)  # weather_api, manual, traffic_api
    event_metadata = Column(Text, nullable=True)  # Additional data (JSON string)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Disruption {self.event_type} in {self.zone} ({self.severity})>"
