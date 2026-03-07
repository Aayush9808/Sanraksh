"""
Risk Zone Model
"""

from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.database import Base


class RiskZone(Base):
    """Risk Zone Model - Precomputed risk scores for micro-zones"""
    __tablename__ = "risk_zones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Location
    city = Column(String(50), nullable=False, index=True)
    zone = Column(String(100), nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    
    # Risk scores (0-1 scale)
    weather_risk_score = Column(Float, default=0.5)
    traffic_risk_score = Column(Float, default=0.5)
    social_risk_score = Column(Float, default=0.5)
    overall_risk_score = Column(Float, default=0.5)
    
    # Metadata
    population_density = Column(Float, nullable=True)
    avg_disruptions_per_month = Column(Float, nullable=True)
    
    # Timestamps
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<RiskZone {self.city}/{self.zone} (Risk: {self.overall_risk_score:.2f})>"
