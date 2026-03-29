"""Users Router - Full Implementation"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.policy import Policy, PolicyStatus
from app.models.claim import Claim, ClaimStatus
from app.schemas.user import UserUpdateRequest
from app.routers.auth import get_current_user

router = APIRouter()


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user's profile"""
    return {
        "id": str(current_user.id), "name": current_user.name, "phone": current_user.phone,
        "email": current_user.email,
        "delivery_platform": current_user.delivery_platform.value if current_user.delivery_platform else "",
        "work_city": current_user.work_city, "work_zone": current_user.work_zone,
        "kyc_status": current_user.kyc_status.value if current_user.kyc_status else "pending", "risk_score": current_user.risk_score,
        "is_active": current_user.is_active,
    }


@router.get("/me/policy")
async def get_my_policy(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's active policy"""
    policy = db.query(Policy).filter(
        Policy.user_id == current_user.id, Policy.status == PolicyStatus.ACTIVE
    ).first()
    if not policy:
        return {"has_policy": False, "policy": None}
    claims_count = db.query(func.count(Claim.id)).filter(Claim.user_id == current_user.id).scalar() or 0
    paid_amount = db.query(func.sum(Claim.claim_amount)).filter(
        Claim.user_id == current_user.id, Claim.status == ClaimStatus.PAID
    ).scalar() or 0
    return {
        "has_policy": True,
        "policy": {
            "id": str(policy.id), "policy_number": policy.policy_number,
            "weekly_premium": policy.weekly_premium, "coverage_amount": policy.coverage_amount,
            "start_date": str(policy.start_date), "end_date": str(policy.end_date),
            "status": str(policy.status), "coverage_type": policy.coverage_type,
            "claims_count": claims_count, "total_paid": round(paid_amount, 2),
        }
    }


@router.get("/me/claims")
async def get_my_claims(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's claims history"""
    from app.models.disruption import Disruption
    claims = db.query(Claim).filter(Claim.user_id == current_user.id).order_by(Claim.created_at.desc()).limit(20).all()
    result = []
    for c in claims:
        disc = db.query(Disruption).filter(Disruption.id == c.disruption_id).first() if c.disruption_id else None
        result.append({
            "id": str(c.id), "claim_number": c.claim_number,
            "event": disc.event_type.replace("_", " ").title() if disc else "Manual",
            "amount": c.claim_amount, "status": str(c.status),
            "claim_date": str(c.claim_date),
            "payout_transaction_id": c.payout_transaction_id,
            "fraud_score": c.fraud_score,
        })
    return result



@router.get("/all")
async def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all workers (admin) with enriched claim data"""
    total = db.query(func.count(User.id)).scalar() or 0
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for u in users:
        claims_count = db.query(func.count(Claim.id)).filter(Claim.user_id == u.id).scalar() or 0
        total_earned = db.query(func.sum(Claim.claim_amount)).filter(
            Claim.user_id == u.id, Claim.status == ClaimStatus.PAID
        ).scalar() or 0
        from datetime import date
        joined = u.created_at.strftime("%b %Y") if u.created_at else "—"
        has_policy = db.query(Policy).filter(
            Policy.user_id == u.id, Policy.status == PolicyStatus.ACTIVE
        ).first() is not None
        result.append({
            "id": str(u.id), "name": u.name, "phone": u.phone,
            "city": u.work_city or "", "zone": u.work_zone or "",
            "platforms": [u.delivery_platform.value.capitalize()] if u.delivery_platform else [],
            "status": "flagged" if u.risk_score >= 0.7 else ("active" if u.is_active and has_policy else "inactive"),
            "risk": u.risk_score, "claims": claims_count,
            "total_earned": round(float(total_earned), 2),
            "kyc": u.kyc_status.value if u.kyc_status else "pending",
            "joined": joined,
        })
    return {"total": total, "workers": result}


@router.get("/profile/{user_id}")
async def get_profile(user_id: str, db: Session = Depends(get_db)):
    """Get user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user.id), "name": user.name, "phone": user.phone, "email": user.email,
        "delivery_platform": str(user.delivery_platform),
        "work_city": user.work_city, "work_zone": user.work_zone,
        "kyc_status": str(user.kyc_status), "risk_score": user.risk_score,
        "is_active": user.is_active,
    }


@router.put("/profile/{user_id}")
async def update_profile(user_id: str, data: UserUpdateRequest, db: Session = Depends(get_db)):
    """Update user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, val in data.dict(exclude_unset=True).items():
        setattr(user, field, val)
    db.commit()
    return {"message": "Profile updated"}


@router.post("/kyc/{user_id}")
async def update_kyc(user_id: str, status: str = Query(...), db: Session = Depends(get_db)):
    """Update KYC status (admin)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.kyc_status = status
    db.commit()
    return {"message": f"KYC updated to {status}"}


@router.get("/risk-score/{user_id}")
async def get_risk_score(user_id: str, db: Session = Depends(get_db)):
    """Get user risk score"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    level = "high" if user.risk_score > 0.6 else ("medium" if user.risk_score > 0.4 else "low")
    return {"user_id": user_id, "risk_score": user.risk_score, "risk_level": level}


@router.get("/stats")
async def get_user_stats(db: Session = Depends(get_db)):
    """Platform and city breakdown"""
    by_platform = db.query(User.delivery_platform, func.count(User.id)).group_by(User.delivery_platform).all()
    by_city = db.query(User.work_city, func.count(User.id)).filter(User.work_city != None).group_by(User.work_city).order_by(func.count(User.id).desc()).all()
    return {
        "total": db.query(func.count(User.id)).scalar() or 0,
        "by_platform": [{"platform": str(r[0]), "count": r[1]} for r in by_platform],
        "by_city": [{"city": r[0], "count": r[1]} for r in by_city],
    }
