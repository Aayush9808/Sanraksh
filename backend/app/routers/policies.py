"""
Policies Router - Full Implementation
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
import uuid, logging

from app.database import get_db
from app.models.policy import Policy, PolicyStatus
from app.models.user import User
from app.schemas.policy import PolicyCreateRequest, PremiumCalculateRequest
from app.services.pricing import pricing_service
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

CITY_RISK = {
    "Mumbai": 0.75, "Pune": 0.55, "Delhi": 0.65, "Bengaluru": 0.60,
    "Hyderabad": 0.50, "Chennai": 0.55, "Kolkata": 0.45, "Ahmedabad": 0.40,
}
CURRENT_SEASON = "monsoon"

def generate_policy_number():
    fmt = date.today().strftime("%Y%m")
    return f"GS-{fmt}-{str(uuid.uuid4())[:8].upper()}"

@router.post("/calculate-premium")
async def calculate_premium(data: PremiumCalculateRequest, db: Session = Depends(get_db)):
    """Calculate dynamic premium for a worker"""
    risk_score = CITY_RISK.get(data.city, 0.5)
    user_history = None
    if data.user_id:
        claims_count = db.query(func.count()).select_from(
            __import__("app.models.claim", fromlist=["Claim"]).Claim
        ).filter_by(user_id=data.user_id).scalar() or 0
        user_history = {"tenure_months": data.tenure_months or 0, "claims_count": claims_count}
    result = pricing_service.calculate_premium(
        risk_score=risk_score, city=data.city, zone=data.zone or "",
        season=CURRENT_SEASON, user_history=user_history
    )
    return result

@router.post("/create", status_code=201)
async def create_policy(data: PolicyCreateRequest, db: Session = Depends(get_db)):
    """Create new insurance policy"""
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    active = db.query(Policy).filter(
        Policy.user_id == data.user_id,
        Policy.status == PolicyStatus.ACTIVE
    ).first()
    if active:
        raise HTTPException(status_code=409, detail="User already has an active policy")
    risk_score = CITY_RISK.get(user.work_city or "Mumbai", 0.5)
    pricing = pricing_service.calculate_premium(
        risk_score=risk_score, city=user.work_city or "Mumbai",
        zone=user.work_zone or "", season=CURRENT_SEASON
    )
    policy = Policy(
        id=uuid.uuid4(),
        user_id=data.user_id,
        policy_number=generate_policy_number(),
        start_date=date.today(),
        end_date=date.today() + timedelta(days=data.duration_weeks * 7),
        status=PolicyStatus.ACTIVE,
        weekly_premium=pricing["final_premium"],
        coverage_amount=settings.DEFAULT_COVERAGE_DAILY,
        coverage_type=data.coverage_type or "income_loss_only",
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    logger.info(f"Policy created: {policy.policy_number} for user {data.user_id}")
    return {
        "policy_id": str(policy.id),
        "policy_number": policy.policy_number,
        "weekly_premium": policy.weekly_premium,
        "coverage_amount": policy.coverage_amount,
        "start_date": str(policy.start_date),
        "end_date": str(policy.end_date),
        "status": policy.status,
        "pricing_breakdown": pricing,
    }

@router.get("/active")
async def get_active_policies(user_id: str = Query(...), db: Session = Depends(get_db)):
    """Get active policies for a user"""
    policies_list = db.query(Policy).filter(
        Policy.user_id == user_id,
        Policy.status == PolicyStatus.ACTIVE
    ).all()
    return [
        {
            "id": str(p.id), "policy_number": p.policy_number,
            "weekly_premium": p.weekly_premium, "coverage_amount": p.coverage_amount,
            "start_date": str(p.start_date), "end_date": str(p.end_date),
            "status": p.status, "coverage_type": p.coverage_type,
        }
        for p in policies_list
    ]

@router.get("/all")
async def get_all_policies(skip: int = 0, limit: int = 50, status: str = None, db: Session = Depends(get_db)):
    """Get all policies (admin)"""
    q = db.query(Policy)
    if status:
        q = q.filter(Policy.status == status)
    total = q.count()
    policies_list = q.order_by(Policy.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "total": total,
        "policies": [
            {"id": str(p.id), "policy_number": p.policy_number,
             "user_id": str(p.user_id), "weekly_premium": p.weekly_premium,
             "status": p.status, "start_date": str(p.start_date), "end_date": str(p.end_date)}
            for p in policies_list
        ]
    }

@router.get("/{policy_id}")
async def get_policy(policy_id: str, db: Session = Depends(get_db)):
    """Get specific policy details"""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {
        "id": str(policy.id), "policy_number": policy.policy_number,
        "user_id": str(policy.user_id), "weekly_premium": policy.weekly_premium,
        "coverage_amount": policy.coverage_amount, "coverage_type": policy.coverage_type,
        "start_date": str(policy.start_date), "end_date": str(policy.end_date),
        "status": policy.status,
    }

@router.put("/{policy_id}/renew")
async def renew_policy(policy_id: str, weeks: int = 4, db: Session = Depends(get_db)):
    """Renew an existing policy"""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.end_date = max(policy.end_date, date.today()) + timedelta(days=weeks * 7)
    policy.status = PolicyStatus.ACTIVE
    db.commit()
    return {"message": "Policy renewed", "new_end_date": str(policy.end_date)}
