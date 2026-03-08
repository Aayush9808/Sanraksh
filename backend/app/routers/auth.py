"""
Authentication Router - Full Implementation
JWT + Mock OTP (OTP = 123456 for demo)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
import uuid, redis, json, logging

from app.database import get_db
from app.models.user import User, KYCStatus
from app.schemas.user import UserRegisterRequest, UserLoginRequest, OTPVerifyRequest, UserResponse
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Redis client for OTP storage
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    redis_client = None

DEMO_OTP = "123456"

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register", status_code=201)
async def register(data: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register new gig worker"""
    existing = db.query(User).filter(User.phone == data.phone).first()
    if existing:
        raise HTTPException(status_code=409, detail="Phone number already registered")
    try:
        user = User(
            id=uuid.uuid4(),
            phone=data.phone,
            name=data.name,
            email=data.email,
            delivery_platform=data.delivery_platform,
            work_city=data.work_city,
            work_zone=data.work_zone,
            work_location_lat=data.work_location_lat,
            work_location_lng=data.work_location_lng,
            kyc_status=KYCStatus.PENDING,
            risk_score=0.5,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        # Store OTP in Redis (demo: always 123456)
        otp_key = f"otp:{data.phone}"
        if redis_client:
            redis_client.setex(otp_key, 300, DEMO_OTP)
        logger.info(f"New user registered: {data.name} ({data.phone})")
        return {
            "message": "Registration successful. OTP sent to your phone.",
            "phone": data.phone,
            "demo_otp": DEMO_OTP,
            "user_id": str(user.id),
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Phone or email already in use")

@router.post("/login")
async def login(data: UserLoginRequest, db: Session = Depends(get_db)):
    """Send OTP to phone for login"""
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="Phone number not registered. Please register first.")
    otp_key = f"otp:{data.phone}"
    if redis_client:
        redis_client.setex(otp_key, 300, DEMO_OTP)
    return {
        "message": "OTP sent to your phone.",
        "phone": data.phone,
        "demo_otp": DEMO_OTP,
    }

@router.post("/verify-otp")
async def verify_otp(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and return JWT token"""
    # Demo: accept 123456 always
    if data.otp != DEMO_OTP:
        if redis_client:
            stored = redis_client.get(f"otp:{data.phone}")
            if stored != data.otp:
                raise HTTPException(status_code=400, detail="Invalid OTP")
        else:
            raise HTTPException(status_code=400, detail="Invalid OTP. Use 123456 for demo.")
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account suspended")
    token = create_access_token({"sub": str(user.id), "phone": user.phone})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.name,
            "phone": user.phone,
            "delivery_platform": user.delivery_platform,
            "work_city": user.work_city,
            "kyc_status": user.kyc_status,
        }
    }

@router.post("/refresh-token")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Refresh JWT token"""
    token = create_access_token({"sub": str(current_user.id), "phone": current_user.phone})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "phone": current_user.phone,
        "email": current_user.email,
        "delivery_platform": current_user.delivery_platform,
        "work_city": current_user.work_city,
        "work_zone": current_user.work_zone,
        "kyc_status": current_user.kyc_status,
        "risk_score": current_user.risk_score,
        "is_active": current_user.is_active,
    }
