"""
Seed data script
Populate database with sample data for testing
"""

import asyncio
import uuid
from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models.user import User
from app.models.policy import Policy
from app.models.claim import Claim
from app.models.disruption import Disruption
from app.models.risk_zone import RiskZone


async def seed_users(db: AsyncSession):
    """Create sample users"""
    users = [
        User(
            id=uuid.uuid4(),
            phone="+919876543210",
            name="Rahul Kumar",
            email="rahul@example.com",
            delivery_platform="zomato",
            work_city="Mumbai",
            work_zone="Andheri West",
            work_location_lat=19.1136,
            work_location_lng=72.8697,
            kyc_status="approved",
            risk_score=0.45,
        ),
        User(
            id=uuid.uuid4(),
            phone="+919876543211",
            name="Priya Sharma",
            email="priya@example.com",
            delivery_platform="swiggy",
            work_city="Mumbai",
            work_zone="Bandra",
            work_location_lat=19.0596,
            work_location_lng=72.8295,
            kyc_status="approved",
            risk_score=0.35,
        ),
        User(
            id=uuid.uuid4(),
            phone="+919876543212",
            name="Amit Singh",
            delivery_platform="amazon",
            work_city="Mumbai",
            work_zone="Powai",
            work_location_lat=19.1176,
            work_location_lng=72.9060,
            kyc_status="pending",
            risk_score=0.55,
        ),
    ]
    
    db.add_all(users)
    await db.commit()
    print(f"✅ Created {len(users)} users")
    return users


async def seed_risk_zones(db: AsyncSession):
    """Create sample risk zones for Mumbai"""
    zones = [
        RiskZone(
            id=uuid.uuid4(),
            zone_id="ZONE_19_72",
            city="Mumbai",
            zone_name="Andheri West",
            center_lat=19.1136,
            center_lng=72.8697,
            weather_risk_score=0.65,
            traffic_risk_score=0.70,
            historical_risk_score=0.60,
            social_risk_score=0.30,
            overall_risk_score=0.62,
            active_workers_count=45,
        ),
        RiskZone(
            id=uuid.uuid4(),
            zone_id="ZONE_19_73",
            city="Mumbai",
            zone_name="Bandra",
            center_lat=19.0596,
            center_lng=72.8295,
            weather_risk_score=0.55,
            traffic_risk_score=0.65,
            historical_risk_score=0.50,
            social_risk_score=0.20,
            overall_risk_score=0.52,
            active_workers_count=78,
        ),
    ]
    
    db.add_all(zones)
    await db.commit()
    print(f"✅ Created {len(zones)} risk zones")
    return zones


async def seed_policies(db: AsyncSession, users):
    """Create sample policies"""
    policies = []
    for i, user in enumerate(users[:2]):  # First 2 users get active policies
        policy = Policy(
            id=uuid.uuid4(),
            policy_number=f"POL-2026-{10001 + i}",
            user_id=user.id,
            start_date=date.today(),
            end_date=date.today() + timedelta(days=7),
            status="active",
            weekly_premium=45.0 + (i * 2),
            coverage_amount=800.0,
            coverage_type="income_loss_only",
        )
        policies.append(policy)
    
    db.add_all(policies)
    await db.commit()
    print(f"✅ Created {len(policies)} policies")
    return policies


async def seed_disruptions(db: AsyncSession):
    """Create sample disruptions"""
    disruptions = [
        Disruption(
            id=uuid.uuid4(),
            disruption_type="weather",
            event_type="heavy_rain",
            severity="high",
            city="Mumbai",
            zone="Andheri West",
            location_lat=19.1136,
            location_lng=72.8697,
            affected_radius_km=5.0,
            start_time=datetime.now() - timedelta(hours=2),
            is_active=True,
        ),
    ]
    
    db.add_all(disruptions)
    await db.commit()
    print(f"✅ Created {len(disruptions)} disruptions")
    return disruptions


async def seed_claims(db: AsyncSession, users, policies, disruptions):
    """Create sample claims"""
    claims = [
        Claim(
            id=uuid.uuid4(),
            claim_number="CLM-2026-00001",
            user_id=users[0].id,
            policy_id=policies[0].id,
            disruption_id=disruptions[0].id,
            claim_date=date.today(),
            claim_amount=800.0,
            status="approved",
            approval_type="auto",
            approved_at=datetime.now() - timedelta(minutes=2),
            payout_date=datetime.now() - timedelta(minutes=1),
            payout_transaction_id="TXN-123456",
            fraud_score=0.15,
            peer_validation_count=7,
            location_verified=True,
        ),
    ]
    
    db.add_all(claims)
    await db.commit()
    print(f"✅ Created {len(claims)} claims")
    return claims


async def main():
    """Run all seed functions"""
    print("🌱 Starting database seeding...")
    
    async with async_session_maker() as db:
        users = await seed_users(db)
        zones = await seed_risk_zones(db)
        policies = await seed_policies(db, users)
        disruptions = await seed_disruptions(db)
        claims = await seed_claims(db, users, policies, disruptions)
    
    print("✅ Database seeding completed!")


if __name__ == "__main__":
    asyncio.run(main())
