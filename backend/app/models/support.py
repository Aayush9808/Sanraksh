"""
Support Message Model
"""

from sqlalchemy import Column, String, Text, DateTime, Enum
from sqlalchemy.sql import func
import uuid
import enum

from app.database import Base


class SupportCategory(str, enum.Enum):
    PAYOUT = "payout"
    POLICY = "policy"
    ACCOUNT = "account"
    TECHNICAL = "technical"
    OTHER = "other"


class SupportStatus(str, enum.Enum):
    NEW = "new"
    READ = "read"
    REPLIED = "replied"


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    category = Column(Enum(SupportCategory), nullable=False, default=SupportCategory.OTHER)
    message = Column(Text, nullable=False)
    status = Column(Enum(SupportStatus), nullable=False, default=SupportStatus.NEW)
    admin_reply = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    replied_at = Column(DateTime, nullable=True)
