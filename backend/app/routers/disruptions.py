"""
Disruptions Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()


@router.get("/active")
async def get_active_disruptions(db: Session = Depends(get_db)):
    """Get all active disruptions"""
    return {"message": "Active disruptions endpoint"}


@router.get("/zone/{zone_name}")
async def get_zone_disruptions(zone_name: str, db: Session = Depends(get_db)):
    """Get disruptions for specific zone"""
    return {"message": f"Disruptions in zone {zone_name}"}


@router.post("/detect")
async def detect_disruptions(db: Session = Depends(get_db)):
    """Detect and create disruptions (Internal/Admin)"""
    return {"message": "Detect disruptions endpoint"}
