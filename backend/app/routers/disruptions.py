"""Disruptions Router - Full Implementation"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid

from app.database import get_db
from app.models.disruption import Disruption, DisruptionType, EventType, Severity

router = APIRouter()

@router.get("/active")
async def get_active_disruptions(db: Session = Depends(get_db)):
    """Get all currently active disruptions"""
    disruptions = db.query(Disruption).filter(Disruption.is_active == True).order_by(Disruption.created_at.desc()).all()
    return [
        {
            "id": str(d.id), "event_type": d.event_type, "severity": d.severity,
            "city": d.city, "zone": d.zone, "disruption_type": d.disruption_type,
            "lat": d.location_lat, "lng": d.location_lng,
            "radius_km": d.affected_radius_km,
            "start_time": d.start_time.isoformat() if d.start_time else None,
            "source": d.source,
        }
        for d in disruptions
    ]

@router.get("/zone/{zone_name}")
async def get_zone_disruptions(zone_name: str, db: Session = Depends(get_db)):
    """Get active disruptions for a specific zone"""
    disruptions = db.query(Disruption).filter(
        Disruption.zone == zone_name, Disruption.is_active == True
    ).all()
    return {"zone": zone_name, "active_disruptions": len(disruptions), "disruptions": [
        {"id": str(d.id), "event_type": d.event_type, "severity": d.severity}
        for d in disruptions
    ]}

@router.post("/create")
async def create_disruption(
    city: str = Query(...), zone: str = Query(...),
    event_type: str = Query(default="heavy_rain"),
    severity: str = Query(default="high"),
    radius_km: float = Query(default=2.0),
    db: Session = Depends(get_db)
):
    """Create a new disruption event (admin/automated)"""
    d = Disruption(
        id=uuid.uuid4(),
        disruption_type=DisruptionType.WEATHER,
        event_type=event_type,
        severity=severity,
        city=city, zone=zone,
        affected_radius_km=radius_km,
        start_time=datetime.utcnow(),
        is_active=True, source="manual",
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return {"id": str(d.id), "message": f"Disruption created in {zone}, {city}", "severity": severity}

@router.put("/{disruption_id}/resolve")
async def resolve_disruption(disruption_id: str, db: Session = Depends(get_db)):
    """Mark a disruption as resolved"""
    d = db.query(Disruption).filter(Disruption.id == disruption_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Disruption not found")
    d.is_active = False
    d.end_time = datetime.utcnow()
    db.commit()
    return {"message": "Disruption resolved", "id": disruption_id}

@router.get("/summary")
async def get_disruption_summary(db: Session = Depends(get_db)):
    """Summary of disruptions by city"""
    rows = db.query(Disruption.city, func.count(Disruption.id)).filter(
        Disruption.is_active == True
    ).group_by(Disruption.city).all()
    return {"active_cities": len(rows), "by_city": [{"city": r[0], "count": r[1]} for r in rows]}
