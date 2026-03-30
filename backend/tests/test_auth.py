"""
Test authentication utilities
"""

import pytest
from datetime import datetime, timedelta
from app.utils.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
    generate_otp,
    verify_otp,
)


def test_password_hashing():
    """Test password hashing and verification"""
    password = "SecurePassword123!"

    hashed = get_password_hash(password)
    assert hashed != password
    assert hashed.startswith("$2b$")

    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token():
    """Test JWT token creation and decoding"""
    data = {"user_id": "test-user-123", "phone": "+919876543210"}

    token = create_access_token(data)
    assert isinstance(token, str)
    assert len(token) > 50

    decoded = decode_token(token)
    assert decoded["user_id"] == "test-user-123"
    assert decoded["phone"] == "+919876543210"
    assert "exp" in decoded


def test_jwt_expired_token():
    """Test JWT token expiration"""
    data = {"user_id": "test-user"}

    token = create_access_token(data, expires_delta=timedelta(seconds=-1))

    with pytest.raises(Exception):
        decode_token(token)



def test_otp_generation():
    """Test OTP generation"""
    otp = generate_otp()
    
    assert isinstance(otp, str)
    assert len(otp) == 6
    assert otp.isdigit()


def test_otp_verification():
    """Test OTP verification"""
    phone = "+919876543210"
    otp = "123456"
    
    # Store OTP (in production, this would be in Redis)
    stored_otp = otp
    stored_timestamp = datetime.now()
    
    # Verify valid OTP
    is_valid = verify_otp(otp, stored_otp, stored_timestamp)
    assert is_valid is True
    
    # Verify wrong OTP
    is_valid = verify_otp("000000", stored_otp, stored_timestamp)
    assert is_valid is False
    
    # Verify expired OTP (11 minutes old)
    old_timestamp = datetime.now() - timedelta(minutes=11)
    is_valid = verify_otp(otp, stored_otp, old_timestamp)
    assert is_valid is False


def test_multiple_hash_different():
    """Test that same password hashes to different values"""
    password = "TestPassword123"
    
    hash1 = hash_password(password)
    hash2 = hash_password(password)
    
    # Different hashes (due to salt)
    assert hash1 != hash2
    
    # Both verify correctly
    assert verify_password(password, hash1) is True
    assert verify_password(password, hash2) is True
