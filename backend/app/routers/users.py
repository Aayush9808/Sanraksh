"""
Users Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()


@router.get("/profile")
async def get_profile(db: Session = Depends(get_db)):
    """Get user profile"""
    return {"message": "User profile endpoint"}


@router.put("/profile")
async def update_profile(db: Session = Depends(get_db)):
    """Update user profile"""
    return {"message": "Update profile endpoint"}


@router.post("/kyc")
async def submit_kyc(db: Session = Depends(get_db)):
    """Submit KYC documents"""
    return {"message": "KYC submission endpoint"}


@router.get("/risk-score")
async def get_risk_score(db: Session = Depends(get_db)):
    """Get user risk score"""
    return {"message": "Risk score endpoint"}
