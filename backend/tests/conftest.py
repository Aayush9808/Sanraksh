"""
Configuration fixtures for pytest
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base


@pytest.fixture(scope="session")
def test_db():
    """Create test database"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(engine)


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "phone": "+919876543210",
        "name": "Test User",
        "email": "test@example.com",
        "delivery_platform": "zomato",
        "work_city": "Mumbai",
        "work_zone": "Andheri West",
        "work_location_lat": 19.1136,
        "work_location_lng": 72.8697
    }


@pytest.fixture
def sample_policy_data():
    """Sample policy data for testing"""
    return {
        "coverage_amount": 800.0,
        "weekly_premium": 45.0,
        "coverage_type": "income_loss_only"
    }


@pytest.fixture
def sample_claim_data():
    """Sample claim data for testing"""
    return {
        "claim_amount": 800.0,
        "description": "Heavy rain, unable to work"
    }
