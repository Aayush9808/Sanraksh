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
import uuid, logging

from app.database import get_db
from app.models.user import User, KYCStatus
from app.schemas.user import UserRegisterRequest, UserLoginRequest, OTPVerifyRequest, UserResponse
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer(auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory OTP store (Redis fallback)
_otp_store: dict = {}
ADMIN_PHONE = "9999000000"
DEMO_OTP = "123456"
ADMIN_OTP = "000000"

def _store_otp(phone: str, otp: str):
    _otp_store[phone] = otp

def _get_otp(phone: str) -> str:
    return _otp_store.get(phone, DEMO_OTP)

def _is_admin_phone(phone: str) -> bool:
    return phone == ADMIN_PHONE


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
            id=str(uuid.uuid4()),
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
        # Store OTP in memory
        otp = ADMIN_OTP if _is_admin_phone(data.phone) else DEMO_OTP
        _store_otp(data.phone, otp)
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

@router.post("/send-otp")
async def send_otp(data: UserLoginRequest, db: Session = Depends(get_db)):
    """Send OTP to phone (demo: always returns 123456)"""
    otp = ADMIN_OTP if _is_admin_phone(data.phone) else DEMO_OTP
    _store_otp(data.phone, otp)
    return {"message": "OTP sent.", "phone": data.phone, "demo_otp": otp}


@router.post("/login")
async def login(data: UserLoginRequest, db: Session = Depends(get_db)):
    """Send OTP to phone for login"""
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="Phone number not registered. Please register first.")
    otp = ADMIN_OTP if _is_admin_phone(data.phone) else DEMO_OTP
    _store_otp(data.phone, otp)
    return {
        "message": "OTP sent to your phone.",
        "phone": data.phone,
        "demo_otp": otp,
    }

@router.post("/verify-otp")
async def verify_otp(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP and return JWT token"""
    expected = _get_otp(data.phone)
    if data.otp != expected and data.otp != DEMO_OTP:
        raise HTTPException(status_code=400, detail="Invalid OTP. Use 123456 for workers or 000000 for admin demo.")
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account suspended")
    role = "admin" if _is_admin_phone(data.phone) else "worker"
    token = create_access_token({"sub": str(user.id), "phone": user.phone, "role": role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "user": {
            "id": str(user.id),
            "name": user.name,
            "phone": user.phone,
            "delivery_platform": user.delivery_platform.value if user.delivery_platform else "",
            "work_city": user.work_city,
            "kyc_status": user.kyc_status.value if user.kyc_status else "pending",
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
        "delivery_platform": current_user.delivery_platform.value if current_user.delivery_platform else "",
        "work_city": current_user.work_city,
        "work_zone": current_user.work_zone,
        "kyc_status": current_user.kyc_status.value if current_user.kyc_status else "pending",
        "risk_score": current_user.risk_score,
        "is_active": current_user.is_active,
    }
