"""Risk Zones Router - Full Implementation"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.risk_zone import RiskZone

router = APIRouter()

@router.get("/heatmap")
async def get_risk_heatmap(db: Session = Depends(get_db)):
    """Get all risk zones for heatmap visualization"""
    zones = db.query(RiskZone).order_by(RiskZone.overall_risk_score.desc()).all()
    result = []
    for z in zones:
        score = z.overall_risk_score
        if score >= 0.7:
            level = "high"
            color = "#ef4444"
        elif score >= 0.45:
            level = "medium"
            color = "#f59e0b"
        else:
            level = "low"
            color = "#22c55e"
        result.append({
            "id": str(z.id), "city": z.city, "zone": z.zone,
            "lat": z.lat, "lng": z.lng,
            "risk_score": round(score, 2),
            "risk_level": level, "color": color,
            "weather_risk": z.weather_risk_score,
            "traffic_risk": z.traffic_risk_score,
            "disruptions_per_month": z.avg_disruptions_per_month,
        })
    return result

@router.get("/city/{city}")
async def get_city_risk_zones(city: str, db: Session = Depends(get_db)):
    """Get all risk zones for a specific city"""
    zones = db.query(RiskZone).filter(RiskZone.city == city).order_by(RiskZone.overall_risk_score.desc()).all()
    return [
        {"zone": z.zone, "risk_score": z.overall_risk_score, "lat": z.lat, "lng": z.lng}
        for z in zones
    ]

@router.get("/zone/{zone_name}")
async def get_zone_details(zone_name: str, db: Session = Depends(get_db)):
    """Get risk details for a specific zone"""
    z = db.query(RiskZone).filter(RiskZone.zone == zone_name).first()
    if not z:
        return {"zone": zone_name, "risk_score": 0.5, "risk_level": "medium"}
    return {
        "id": str(z.id), "city": z.city, "zone": z.zone,
        "overall_risk_score": z.overall_risk_score,
        "weather_risk_score": z.weather_risk_score,
        "traffic_risk_score": z.traffic_risk_score,
        "social_risk_score": z.social_risk_score,
        "avg_disruptions_per_month": z.avg_disruptions_per_month,
        "lat": z.lat, "lng": z.lng,
    }

@router.get("/stats")
async def get_zone_stats(db: Session = Depends(get_db)):
    """Overall risk zone statistics"""
    from sqlalchemy import func
    total = db.query(func.count(RiskZone.id)).scalar() or 0
    high_risk = db.query(func.count(RiskZone.id)).filter(RiskZone.overall_risk_score >= 0.7).scalar() or 0
    med_risk = db.query(func.count(RiskZone.id)).filter(RiskZone.overall_risk_score.between(0.45, 0.7)).scalar() or 0
    return {"total_zones": total, "high_risk": high_risk, "medium_risk": med_risk, "low_risk": total - high_risk - med_risk}
