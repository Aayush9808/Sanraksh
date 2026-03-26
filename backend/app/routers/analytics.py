"""
Analytics Router - Full Implementation with Real DB Queries
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import datetime, timedelta, date
import logging

from app.database import get_db
from app.models.user import User
from app.models.policy import Policy, PolicyStatus
from app.models.claim import Claim, ClaimStatus
from app.models.risk_zone import RiskZone

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Real-time dashboard statistics"""
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_policies = db.query(func.count(Policy.id)).filter(Policy.status == PolicyStatus.ACTIVE).scalar() or 0
    total_claims = db.query(func.count(Claim.id)).scalar() or 0
    claims_today = db.query(func.count(Claim.id)).filter(
        cast(Claim.created_at, Date) == date.today()
    ).scalar() or 0
    total_payout = db.query(func.sum(Claim.claim_amount)).filter(
        Claim.status == ClaimStatus.PAID
    ).scalar() or 0
    auto_approved = db.query(func.count(Claim.id)).filter(
        Claim.approval_type == "auto"
    ).scalar() or 0
    automation_rate = round((auto_approved / max(total_claims, 1)) * 100, 1)
    claims_review = db.query(func.count(Claim.id)).filter(Claim.status == ClaimStatus.PENDING).scalar() or 0
    return {
        "total_users": total_users,
        "active_policies": active_policies,
        "total_claims": total_claims,
        "claims_today": claims_today,
        "claims_review": claims_review,
        "total_payout_amount": round(total_payout, 2),
        "automation_rate": automation_rate,
        "coverage_ratio": round(active_policies / max(total_users, 1) * 100, 1),
    }

@router.get("/claims-summary")
async def get_claims_summary(days: int = 7, db: Session = Depends(get_db)):
    """Claims by day for the last N days"""
    result = []
    for i in range(days - 1, -1, -1):
        day = date.today() - timedelta(days=i)
        count = db.query(func.count(Claim.id)).filter(cast(Claim.created_at, Date) == day).scalar() or 0
        payout = db.query(func.sum(Claim.claim_amount)).filter(
            cast(Claim.created_at, Date) == day, Claim.status == ClaimStatus.PAID
        ).scalar() or 0
        result.append({
            "day": day.strftime("%a"),
            "date": str(day),
            "claims": count,
            "payout": round(payout, 2),
        })
    return result

@router.get("/policy-mix")
async def get_policy_mix(db: Session = Depends(get_db)):
    """Policy distribution by coverage type"""
    rows = db.query(Policy.coverage_type, func.count(Policy.id)).filter(
        Policy.status == PolicyStatus.ACTIVE
    ).group_by(Policy.coverage_type).all()
    colors = {
        "income_loss_only": "#22d3ee",
        "heavy_rain": "#38bdf8",
        "flood": "#0ea5e9",
        "pollution": "#f59e0b",
        "curfew": "#f97316",
        "app_outage": "#a78bfa",
        "job_loss": "#34d399",
    }
    names = {
        "income_loss_only": "Income Loss",
        "heavy_rain": "Heavy Rain",
        "flood": "Flood",
        "pollution": "Pollution",
        "curfew": "Curfew",
        "app_outage": "App Outage",
        "job_loss": "Job Loss",
    }
    return [
        {
            "name": names.get(r[0], str(r[0]).replace("_", " ").title()),
            "value": r[1],
            "color": colors.get(r[0], "#6b7280"),
        }
        for r in rows
    ]

@router.get("/risk-heatmap")
async def get_risk_analytics(db: Session = Depends(get_db)):
    """Risk zone statistics"""
    zones = db.query(RiskZone).order_by(RiskZone.overall_risk_score.desc()).limit(20).all()
    result = []
    for z in zones:
        score = z.overall_risk_score
        level = "high" if score >= 0.7 else ("medium" if score >= 0.45 else "low")
        result.append({"city": z.city, "zone": z.zone,
             "risk_score": round(score, 2), "risk_level": level,
             "lat": z.lat, "lng": z.lng})
    return result

@router.get("/premium-trends")
async def get_premium_trends(db: Session = Depends(get_db)):
    """Premium collection trends"""
    total_weekly = db.query(func.sum(Policy.weekly_premium)).filter(Policy.status == PolicyStatus.ACTIVE).scalar() or 0
    avg_premium = db.query(func.avg(Policy.weekly_premium)).filter(Policy.status == PolicyStatus.ACTIVE).scalar() or 0
    return {
        "total_weekly_collection": round(total_weekly, 2),
        "avg_premium": round(avg_premium, 2),
        "monthly_projected": round(total_weekly * 4.3, 2),
        "annual_projected": round(total_weekly * 52, 2),
    }

@router.get("/workers-stats")
async def get_workers_stats(db: Session = Depends(get_db)):
    """Worker statistics by platform and city"""
    by_platform = db.query(User.delivery_platform, func.count(User.id)).group_by(User.delivery_platform).all()
    by_city = db.query(User.work_city, func.count(User.id)).filter(User.work_city != None).group_by(User.work_city).order_by(func.count(User.id).desc()).limit(8).all()
    return {
        "by_platform": [{"platform": str(r[0]), "count": r[1]} for r in by_platform],
        "by_city": [{"city": r[0], "count": r[1]} for r in by_city],
    }
