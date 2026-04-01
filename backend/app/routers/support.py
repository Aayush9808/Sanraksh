"""
Support Router — public message submission + admin inbox
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

from app.database import get_db
from app.models.support import SupportMessage, SupportCategory, SupportStatus
from app.routers.auth import get_current_user

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────

class SupportMessageCreate(BaseModel):
    name: str
    email: str
    category: SupportCategory
    message: str


class SupportReply(BaseModel):
    reply: str


class SupportMessageOut(BaseModel):
    id: str
    name: str
    email: str
    category: str
    message: str
    status: str
    admin_reply: Optional[str]
    created_at: Optional[datetime]
    replied_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Public: submit a support message ─────────────────────────────────────────

@router.post("/message", status_code=201)
def submit_support_message(
    payload: SupportMessageCreate,
    db: Session = Depends(get_db),
):
    msg = SupportMessage(
        name=payload.name,
        email=payload.email,
        category=payload.category,
        message=payload.message,
        status=SupportStatus.NEW,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"success": True, "id": msg.id, "message": "Message received. We'll reply within 1 business day."}


# ── Admin: list all messages ──────────────────────────────────────────────────

@router.get("/messages", response_model=List[SupportMessageOut])
def get_support_messages(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    messages = db.query(SupportMessage).order_by(SupportMessage.created_at.desc()).all()
    return messages


# ── Admin: reply to a message ─────────────────────────────────────────────────

@router.patch("/messages/{message_id}/reply")
def reply_to_message(
    message_id: str,
    payload: SupportReply,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    msg = db.query(SupportMessage).filter(SupportMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.admin_reply = payload.reply
    msg.status = SupportStatus.REPLIED
    msg.replied_at = datetime.utcnow()
    db.commit()
    db.refresh(msg)
    return {"success": True, "message": "Reply sent."}


# ── Admin: mark as read ───────────────────────────────────────────────────────

@router.patch("/messages/{message_id}/read")
def mark_as_read(
    message_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    msg = db.query(SupportMessage).filter(SupportMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    if msg.status == SupportStatus.NEW:
        msg.status = SupportStatus.READ
        db.commit()
    return {"success": True}
