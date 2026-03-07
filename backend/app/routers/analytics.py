"""
Analytics Router (Admin Dashboard)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()


@router.get("/claims-summary")
async def get_claims_summary(db: Session = Depends(get_db)):
    """Get claims analytics summary"""
    return {"message": "Claims summary endpoint"}


@router.get("/risk-heatmap")
async def get_risk_analytics(db: Session = Depends(get_db)):
    """Get risk analytics data"""
    return {"message": "Risk analytics endpoint"}


@router.get("/premium-trends")
async def get_premium_trends(db: Session = Depends(get_db)):
    """Get premium trends over time"""
    return {"message": "Premium trends endpoint"}


@router.get("/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics"""
    return {
        "total_users": 0,
        "active_policies": 0,
        "total_claims": 0,
        "claims_approved_today": 0,
        "total_payout_amount": 0,
    }
