"""
Claims Router - Full Implementation
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
import uuid, logging

from app.database import get_db
from app.models.claim import Claim, ClaimStatus, ApprovalType
from app.models.policy import Policy, PolicyStatus
from app.models.user import User
from app.models.disruption import Disruption
from app.schemas.claim import ClaimCreateRequest
from app.services.fraud_detection import fraud_detection_service
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


def _decision_trace(claim: Claim) -> list[str]:
    if claim.rejection_reason and "TRACE:" in claim.rejection_reason:
        raw = claim.rejection_reason.split("TRACE:", 1)[1]
        return [part for part in raw.replace(")", "").split("|") if part]

    reasons: list[str] = []
    if claim.status == ClaimStatus.PAID:
        reasons.append("ROUTE_AUTO_PAY" if claim.approval_type == ApprovalType.AUTO else "ROUTE_MANUAL_PAY")
    elif claim.status == ClaimStatus.PENDING:
        reasons.append("ROUTE_MANUAL_REVIEW")
    elif claim.status == ClaimStatus.REJECTED:
        reasons.append("ROUTE_REJECT")

    fraud = float(claim.fraud_score or 0)
    if fraud >= 0.75:
        reasons.append("FRAUD_SCORE_HIGH")
    elif fraud >= 0.40:
        reasons.append("FRAUD_SCORE_MEDIUM")
    else:
        reasons.append("FRAUD_SCORE_LOW")

    reasons.append("LOCATION_MATCH" if claim.location_verified else "LOCATION_MISMATCH")
    if float(claim.peer_validation_count or 0) <= 1:
        reasons.append("WEAK_PEER_CORROBORATION")
    return reasons


def generate_claim_number():
    fmt = datetime.utcnow().strftime("%Y%m%d")
    return f"CLM-{fmt}-{str(uuid.uuid4())[:6].upper()}"

@router.post("/create", status_code=201)
async def create_claim(data: ClaimCreateRequest, db: Session = Depends(get_db)):
    """Create a new claim with fraud detection"""
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    policy = db.query(Policy).filter(
        Policy.user_id == data.user_id, Policy.status == PolicyStatus.ACTIVE
    ).first()
    if not policy:
        raise HTTPException(status_code=400, detail="No active policy found for this user")
    recent_claims = db.query(func.count(Claim.id)).filter(
        Claim.user_id == data.user_id,
        Claim.created_at >= datetime.utcnow() - timedelta(days=30)
    ).scalar() or 0
    fraud_result = fraud_detection_service.calculate_fraud_score(
        claim_data={"amount": policy.coverage_amount, "gps_enabled": True, "location_match": True, "auto_triggered": data.auto_triggered},
        user_history={"claims_last_30_days": recent_claims, "avg_days_between_claims": 30 / max(recent_claims, 1)},
        peer_data={"peers_affected": 8, "peers_in_zone": 12}
    )
    if fraud_result["action"] == "reject":
        raise HTTPException(status_code=400, detail="Claim rejected: high fraud probability ({})".format(fraud_result["fraud_score"]))
    approval_type = ApprovalType.AUTO if fraud_result["action"] == "approve" else ApprovalType.MANUAL
    status = ClaimStatus.APPROVED if fraud_result["action"] == "approve" else ClaimStatus.PENDING
    claim = Claim(
        id=str(uuid.uuid4()), claim_number=generate_claim_number(),
        user_id=data.user_id, policy_id=str(policy.id),
        claim_date=date.today(), claim_amount=policy.coverage_amount,
        status=status, approval_type=approval_type,
        fraud_score=fraud_result["fraud_score"],
        location_verified=True,
        payout_date=datetime.utcnow() if status == ClaimStatus.APPROVED else None,
        payout_transaction_id=f"PAY-{str(uuid.uuid4())[:8].upper()}" if status == ClaimStatus.APPROVED else None,
    )
    db.add(claim)
    if status == ClaimStatus.APPROVED:
        claim.status = ClaimStatus.PAID
    db.commit()
    db.refresh(claim)
    return {
        "claim_id": str(claim.id), "claim_number": claim.claim_number,
        "status": claim.status, "amount": claim.claim_amount,
        "approval_type": claim.approval_type, "fraud_score": claim.fraud_score,
        "payout_transaction_id": claim.payout_transaction_id,
        "message": "Claim auto-approved and paid!" if claim.status == ClaimStatus.PAID else "Claim submitted for review",
    }

@router.get("/all")
async def get_all_claims(skip: int = 0, limit: int = 50, status: str = None, db: Session = Depends(get_db)):
    """Get all claims (admin dashboard)"""
    q = db.query(Claim)
    if status:
        q = q.filter(Claim.status == status)
    total = q.count()
    claims_list = q.order_by(Claim.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for c in claims_list:
        user = db.query(User).filter(User.id == c.user_id).first()
        disc = db.query(Disruption).filter(Disruption.id == c.disruption_id).first() if c.disruption_id else None
        event_label = disc.event_type.value.replace("_", " ").title() if disc and disc.event_type else "General"
        result.append({
            "id": str(c.id), "claim_number": c.claim_number,
            "worker_name": user.name if user else "Unknown",
            "worker_platform": user.delivery_platform.value.capitalize() if user and user.delivery_platform else "",
            "zone": user.work_zone if user else "",
            "event_type": event_label,
            "amount": c.claim_amount, "status": c.status,
            "approval_type": c.approval_type, "fraud_score": c.fraud_score,
            "decision_reasons": _decision_trace(c),
            "decision_notes": c.rejection_reason,
            "claim_date": str(c.claim_date), "created_at": c.created_at.isoformat() if c.created_at else None,
        })
    return {"total": total, "claims": result}

@router.get("/user/{user_id}")
async def get_user_claims(user_id: str, db: Session = Depends(get_db)):
    """Get all claims for a user"""
    claims_list = db.query(Claim).filter(Claim.user_id == user_id).order_by(Claim.created_at.desc()).all()
    return [
        {"id": str(c.id), "claim_number": c.claim_number, "amount": c.claim_amount,
         "status": c.status, "claim_date": str(c.claim_date),
         "payout_transaction_id": c.payout_transaction_id}
        for c in claims_list
    ]

@router.get("/{claim_id}/status")
async def get_claim_status(claim_id: str, db: Session = Depends(get_db)):
    """Get claim status"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return {
        "claim_id": claim_id,
        "claim_number": claim.claim_number,
        "status": claim.status,
        "amount": claim.claim_amount,
        "decision_reasons": _decision_trace(claim),
    }

@router.put("/{claim_id}/approve")
async def approve_claim(claim_id: str, db: Session = Depends(get_db)):
    """Manually approve a claim"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = ClaimStatus.PAID
    claim.approval_type = ApprovalType.MANUAL
    claim.payout_date = datetime.utcnow()
    claim.payout_transaction_id = f"PAY-{str(uuid.uuid4())[:8].upper()}"
    db.commit()
    return {"message": "Claim approved and paid", "claim_number": claim.claim_number, "amount": claim.claim_amount}

@router.put("/{claim_id}/reject")
async def reject_claim(claim_id: str, reason: str = "Manual review rejection", db: Session = Depends(get_db)):
    """Reject a claim"""
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = ClaimStatus.REJECTED
    claim.rejection_reason = reason
    db.commit()
    return {"message": "Claim rejected", "claim_number": claim.claim_number}

@router.post("/auto-trigger")
async def auto_trigger_claims(disruption_zone: str = Query(...), db: Session = Depends(get_db)):
    """Auto-trigger claims for all active workers in a zone"""
    from app.models.policy import Policy
    affected_policies = db.query(Policy).join(User, User.id == Policy.user_id).filter(
        Policy.status == PolicyStatus.ACTIVE, User.work_zone == disruption_zone
    ).all()
    triggered = 0
    for policy in affected_policies:
        existing = db.query(Claim).filter(
            Claim.user_id == policy.user_id,
            cast(Claim.created_at, Date) == date.today()
        ).first()
        if not existing:
            claim = Claim(
                id=uuid.uuid4(), claim_number=generate_claim_number(),
                user_id=policy.user_id, policy_id=str(policy.id),
                claim_date=date.today(), claim_amount=policy.coverage_amount,
                status=ClaimStatus.PAID, approval_type=ApprovalType.AUTO,
                fraud_score=0.05, location_verified=True,
                payout_date=datetime.utcnow(),
                payout_transaction_id=f"AUTO-{str(uuid.uuid4())[:8].upper()}",
            )
            db.add(claim)
            triggered += 1
    db.commit()
    return {"message": f"Auto-triggered {triggered} claims in zone {disruption_zone}", "triggered": triggered}
