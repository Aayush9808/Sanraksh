"""Users Router - Full Implementation"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserUpdateRequest

router = APIRouter()


@router.get("/all")
async def get_all_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all workers (admin)"""
    total = db.query(func.count(User.id)).scalar() or 0
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "total": total,
        "users": [
            {
                "id": str(u.id), "name": u.name, "phone": u.phone, "email": u.email,
                "delivery_platform": str(u.delivery_platform),
                "work_city": u.work_city, "work_zone": u.work_zone,
                "kyc_status": str(u.kyc_status),
                "risk_score": u.risk_score, "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]
    }


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
