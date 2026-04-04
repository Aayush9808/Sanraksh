"""
Sanraksh Comprehensive Seed Data Script
Generates realistic demo data: 500 workers, 450 policies, 600 claims, 20 risk zones, 8 disruptions
"""
import sys
import os
sys.path.insert(0, '/app')
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date, datetime, timedelta
import uuid, random, json

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://sanraksh:sanraksh_pass@localhost:5432/sanraksh_db")
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

from app.models.user import User, KYCStatus
from app.models.policy import Policy, PolicyStatus
from app.models.claim import Claim, ClaimStatus, ApprovalType
from app.models.risk_zone import RiskZone
from app.models.disruption import Disruption, DisruptionType, EventType, Severity
from app.database import Base

Base.metadata.create_all(bind=engine)

# ─── DATA SETS ────────────────────────────────────────────────────────────────
INDIAN_NAMES = [
    "Ravi Kumar","Amit Singh","Priya Sharma","Sanjay Gupta","Neha Patel",
    "Rahul Verma","Pooja Mishra","Vikram Yadav","Anita Joshi","Suresh Tiwari",
    "Deepak Nair","Kavitha Reddy","Ajay Mehta","Sunita Rao","Mahesh Chandra",
    "Geeta Devi","Ramesh Pillai","Lalita Kumari","Naveen Kumar","Divya Agarwal",
    "Sunil Sharma","Manjula Devi","Prakash Iyer","Shobha Rani","Arun Sahu",
    "Meena Jain","Yogesh Patil","Sarla Bai","Arjun Das","Sunanda Roy",
    "Harish Pandey","Rekha Saxena","Dilip Bhatt","Savita Negi","Manoj Dixit",
    "Annapurna Devi","Vinod Kapoor","Kamla Devi","Santosh Kumar","Pushpa Yadav",
    "Kiran Bala","Naresh Garg","Usha Rani","Hemant Shukla","Padma Laxmi",
    "Subhash Chandra","Saroj Kumari","Rajendra Singh","Asha Devi","Mohan Lal",
    "Sumitra Devi","Devendra Kumar","Champa Devi","Bhavesh Shah","Nirmala Patel",
    "Girish Trivedi","Hema Malhotra","Kamlesh Joshi","Shanti Devi","Ramakant Tiwari",
    "Vimla Devi","Jagdish Prasad","Bimla Kumari","Dinesh Bajpai","Rukma Devi",
    "Satish Pal","Lata Sharma","Rajkumar Singh","Shevita Kumari","Omkar Patel",
    "Janki Devi","Mahendra Soni","Laxmi Bai","Trilok Nath","Pramila Rani",
    "Bhagwati Prasad","Sharda Kumari","Chunni Lal","Durga Devi","Krishan Kumar",
    "Vijayalakshmi","Murali Krishna","Sudha Rani","Gopinath","Vasantha Devi",
    "Balakrishna","Saraswathi","Venkatesh","Jayalakshmi","Srinivasan",
    "Padmavathi","Raghavendra","Lakshmi","Narasimha","Radha Devi",
    "Bhaskar Rao","Venkatalakshmi","Chandrasekhar","Sarojini","Subramaniam",
    "Anand Kumar","Preeti Singh","Nitin Sharma","Deepika Verma","Rohit Gupta",
    "Shreya Mishra","Gaurav Yadav","Nikita Joshi","Shubham Nair","Ritika Reddy",
    "Aditya Mehta","Kritika Rao","Saurabh Pandey","Swati Saxena","Abhinav Bhatt",
]

PLATFORMS = ["zomato", "swiggy", "amazon", "zepto", "blinkit", "other"]
PLATFORM_WEIGHTS = [0.28, 0.26, 0.18, 0.12, 0.12, 0.04]

CITIES = {
    "Mumbai": {
        "zones": ["Andheri West","Bandra","Kurla","Dadar","Lower Parel","Borivali","Thane","Malad","Goregaon","Powai","Juhu","Santacruz"],
        "lat_base": (19.076, 72.877), "risk": 0.72
    },
    "Delhi": {
        "zones": ["Connaught Place","Lajpat Nagar","Hauz Khas","Saket","Dwarka","Rohini","Janakpuri","Noida Sector 18","Greater Noida","Gurugram"],
        "lat_base": (28.613, 77.209), "risk": 0.68
    },
    "Bengaluru": {
        "zones": ["Koramangala","Indiranagar","HSR Layout","Whitefield","Marathahalli","Jayanagar","Electronic City","BTM Layout","Malleshwaram"],
        "lat_base": (12.971, 77.594), "risk": 0.60
    },
    "Pune": {
        "zones": ["Kothrud","Viman Nagar","Hadapsar","Wakad","Aundh","Hinjewadi","Baner","Magarpatta","Shivajinagar"],
        "lat_base": (18.520, 73.856), "risk": 0.54
    },
    "Hyderabad": {
        "zones": ["Hitech City","Gachibowli","Banjara Hills","Jubilee Hills","Secunderabad","Ameerpet","LB Nagar","Kukatpally"],
        "lat_base": (17.385, 78.486), "risk": 0.50
    },
    "Chennai": {
        "zones": ["T Nagar","Anna Nagar","Velachery","Tambaram","OMR","Adyar","Mylapore","Perambur"],
        "lat_base": (13.082, 80.270), "risk": 0.52
    },
}

KYC_STATUSES = [KYCStatus.VERIFIED, KYCStatus.VERIFIED, KYCStatus.VERIFIED, KYCStatus.PENDING, KYCStatus.PENDING]

db = Session()
print("🌱 Starting seed data generation...")

# Clear existing data
db.query(Claim).delete()
db.query(Policy).delete()
db.query(User).delete()
db.query(RiskZone).delete()
db.query(Disruption).delete()
db.commit()
print("✓ Cleared existing data")

# ─── RISK ZONES ───────────────────────────────────────────────────────────────
print("📍 Seeding risk zones...")
for city, data in CITIES.items():
    lat_base, lng_base = data["lat_base"]
    city_risk = data["risk"]
    for zone in data["zones"]:
        w_risk = min(1.0, city_risk + random.uniform(-0.15, 0.20))
        t_risk = min(1.0, city_risk + random.uniform(-0.10, 0.15))
        s_risk = min(1.0, city_risk + random.uniform(-0.20, 0.10))
        overall = (w_risk * 0.5 + t_risk * 0.3 + s_risk * 0.2)
        rz = RiskZone(
            id=uuid.uuid4(), city=city, zone=zone,
            lat=round(lat_base + random.uniform(-0.08, 0.08), 4),
            lng=round(lng_base + random.uniform(-0.08, 0.08), 4),
            weather_risk_score=round(w_risk, 2),
            traffic_risk_score=round(t_risk, 2),
            social_risk_score=round(s_risk, 2),
            overall_risk_score=round(overall, 2),
            population_density=round(random.uniform(8000, 45000), 0),
            avg_disruptions_per_month=round(random.uniform(2, 15), 1),
        )
        db.add(rz)
db.commit()
print(f"✓ Seeded risk zones for {len(CITIES)} cities")

# ─── DISRUPTIONS ──────────────────────────────────────────────────────────────
print("⚡ Seeding disruptions...")
disruption_events = [
    ("Mumbai", "Andheri West", EventType.HEAVY_RAIN, Severity.HIGH, True),
    ("Mumbai", "Dadar", EventType.FLOOD, Severity.EXTREME, True),
    ("Delhi", "Connaught Place", EventType.TRAFFIC_JAM, Severity.MEDIUM, True),
    ("Delhi", "Lajpat Nagar", EventType.ROAD_CLOSURE, Severity.HIGH, True),
    ("Bengaluru", "Koramangala", EventType.HEAVY_RAIN, Severity.MEDIUM, True),
    ("Pune", "Kothrud", EventType.HEAVY_RAIN, Severity.LOW, False),
    ("Hyderabad", "Hitech City", EventType.EXTREME_HEAT, Severity.MEDIUM, False),
    ("Chennai", "T Nagar", EventType.FLOOD, Severity.HIGH, False),
]
for city, zone, etype, sev, is_active in disruption_events:
    d = Disruption(
        id=uuid.uuid4(),
        disruption_type=DisruptionType.WEATHER if "rain" in etype.value or "flood" in etype.value or "heat" in etype.value else DisruptionType.TRAFFIC,
        event_type=etype, severity=sev,
        city=city, zone=zone,
        location_lat=CITIES[city]["lat_base"][0] + random.uniform(-0.05, 0.05),
        location_lng=CITIES[city]["lat_base"][1] + random.uniform(-0.05, 0.05),
        affected_radius_km=random.uniform(1.5, 5.0),
        start_time=datetime.utcnow() - timedelta(hours=random.randint(0, 12)),
        is_active=is_active,
        source="weather_api",
    )
    db.add(d)
db.commit()
print(f"✓ Seeded {len(disruption_events)} disruption events")

# ─── USERS ────────────────────────────────────────────────────────────────────
print("👷 Seeding 500 gig workers...")
users = []
used_names = set()
all_names = INDIAN_NAMES * 6  # Repeat to have enough
random.shuffle(all_names)

for i in range(500):
    city = random.choices(list(CITIES.keys()), weights=[0.30, 0.22, 0.18, 0.12, 0.10, 0.08])[0]
    zone = random.choice(CITIES[city]["zones"])
    lat_base, lng_base = CITIES[city]["lat_base"]
    platform = random.choices(PLATFORMS, weights=PLATFORM_WEIGHTS)[0]
    name = all_names[i % len(all_names)]
    phone = f"+91{random.randint(7000000000, 9999999999)}"
    user = User(
        id=uuid.uuid4(),
        phone=phone,
        name=name,
        email=f"worker{i+1}@sanraksh.in",
        delivery_platform=platform,
        work_city=city,
        work_zone=zone,
        work_location_lat=round(lat_base + random.uniform(-0.05, 0.05), 5),
        work_location_lng=round(lng_base + random.uniform(-0.05, 0.05), 5),
        kyc_status=random.choice(KYC_STATUSES),
        risk_score=round(random.uniform(0.2, 0.85), 2),
        is_active=True,
        created_at=datetime.utcnow() - timedelta(days=random.randint(1, 365)),
    )
    db.add(user)
    users.append(user)

# Add 2 demo accounts
demo1 = User(
    id=uuid.uuid4(), phone="+917000000001", name="Raj Demo Worker",
    email="demo@sanraksh.in", delivery_platform="zomato",
    work_city="Mumbai", work_zone="Andheri West",
    work_location_lat=19.1136, work_location_lng=72.8697,
    kyc_status=KYCStatus.VERIFIED, risk_score=0.45, is_active=True,
    created_at=datetime.utcnow() - timedelta(days=120),
)
demo2 = User(
    id=uuid.uuid4(), phone="+917000000002", name="Priya Demo Admin",
    email="admin@sanraksh.in", delivery_platform="swiggy",
    work_city="Delhi", work_zone="Connaught Place",
    work_location_lat=28.6315, work_location_lng=77.2167,
    kyc_status=KYCStatus.VERIFIED, risk_score=0.35, is_active=True,
    created_at=datetime.utcnow() - timedelta(days=200),
)
db.add(demo1)
db.add(demo2)
users.extend([demo1, demo2])
db.commit()
print(f"✓ Seeded {len(users)} workers (including 2 demo accounts)")
print(f"  Demo OTP: 123456 | Phone: +917000000001 or +917000000002")

# ─── POLICIES ─────────────────────────────────────────────────────────────────
print("📋 Seeding policies...")
COVERAGE_TYPES = ["heavy_rain", "flood", "pollution", "curfew", "app_outage", "job_loss"]
CITY_RISK_MAP = {"Mumbai": 0.72, "Delhi": 0.68, "Bengaluru": 0.60, "Pune": 0.54, "Hyderabad": 0.50, "Chennai": 0.52}
policies = []
policy_users = random.sample(users, min(450, len(users)))

def generate_policy_number(i):
    return f"GS-{date.today().strftime('%Y%m')}-{str(i).zfill(6)}"

for i, user in enumerate(policy_users):
    risk = CITY_RISK_MAP.get(user.work_city, 0.5)
    base = 40.0
    premium = round(base + risk * 20 + random.uniform(-3, 5), 2)
    start = date.today() - timedelta(days=random.randint(0, 180))
    duration = random.choices([28, 56, 84, 168], weights=[0.4, 0.3, 0.2, 0.1])[0]
    end = start + timedelta(days=duration)
    status = PolicyStatus.ACTIVE if end >= date.today() else PolicyStatus.EXPIRED
    pol = Policy(
        id=uuid.uuid4(), user_id=user.id,
        policy_number=generate_policy_number(i+1),
        start_date=start, end_date=end, status=status,
        weekly_premium=premium, coverage_amount=800.0,
        coverage_type=random.choice(COVERAGE_TYPES),
        created_at=datetime.combine(start, datetime.min.time()),
    )
    db.add(pol)
    policies.append(pol)
db.commit()
print(f"✓ Seeded {len(policies)} policies")

# ─── CLAIMS ───────────────────────────────────────────────────────────────────
print("💰 Seeding claims...")
claim_policies = random.sample(policies, min(350, len(policies)))
claim_count = 0

def gen_claim_num(i):
    return f"CLM-{date.today().strftime('%Y%m%d')}-{str(i).zfill(5)}"

status_weights = [ClaimStatus.PAID, ClaimStatus.PAID, ClaimStatus.PAID, ClaimStatus.PAID, ClaimStatus.PENDING, ClaimStatus.PENDING, ClaimStatus.REJECTED]
approval_weights = [ApprovalType.AUTO, ApprovalType.AUTO, ApprovalType.AUTO, ApprovalType.MANUAL, ApprovalType.PEER_VALIDATED]

for pol in claim_policies:
    num_claims = random.choices([1, 2, 3], weights=[0.6, 0.3, 0.1])[0]
    for j in range(num_claims):
        claim_count += 1
        cdiff = random.randint(1, max(1, (pol.end_date - pol.start_date).days))
        cdate = pol.start_date + timedelta(days=cdiff)
        status = random.choice(status_weights)
        apptype = random.choice(approval_weights)
        fraud = round(random.betavariate(2, 8), 3)  # skewed low
        paid_date = datetime.combine(cdate, datetime.min.time()) + timedelta(hours=random.randint(1, 48)) if status == ClaimStatus.PAID else None
        claim = Claim(
            id=uuid.uuid4(), claim_number=gen_claim_num(claim_count),
            user_id=pol.user_id, policy_id=pol.id,
            claim_date=cdate, claim_amount=800.0,
            status=status, approval_type=apptype,
            fraud_score=fraud, location_verified=True,
            payout_date=paid_date,
            payout_transaction_id=f"UPI-{str(uuid.uuid4())[:10].upper()}" if status == ClaimStatus.PAID else None,
            created_at=datetime.combine(cdate, datetime.min.time()) + timedelta(hours=random.randint(0, 23)),
        )
        db.add(claim)

db.commit()
print(f"✓ Seeded {claim_count} claims")

# ─── SUMMARY ──────────────────────────────────────────────────────────────────
from sqlalchemy import func
total_u = db.query(func.count(User.id)).scalar()
total_p = db.query(func.count(Policy.id)).scalar()
active_p = db.query(func.count(Policy.id)).filter(Policy.status == PolicyStatus.ACTIVE).scalar()
total_c = db.query(func.count(Claim.id)).scalar()
paid_c = db.query(func.count(Claim.id)).filter(Claim.status == ClaimStatus.PAID).scalar()
total_payout = db.query(func.sum(Claim.claim_amount)).filter(Claim.status == ClaimStatus.PAID).scalar() or 0
print("\n" + "="*50)
print("✅ Sanraksh SEED DATA COMPLETE!")
print("="*50)
print(f"  👷 Workers:          {total_u:,}")
print(f"  📋 Total Policies:   {total_p:,} ({active_p:,} active)")
print(f"  💰 Total Claims:     {total_c:,} ({paid_c:,} paid)")
print(f"  💵 Total Payout:     ₹{total_payout:,.0f}")
print(f"  🗺  Risk Zones:       {db.query(func.count(RiskZone.id)).scalar()}")
print(f"  ⚡ Disruptions:      {db.query(func.count(Disruption.id)).scalar()} ({db.query(func.count(Disruption.id)).filter(Disruption.is_active==True).scalar()} active)")
print("\n�� DEMO ACCOUNTS (OTP: 123456)")
print("  Worker:  +917000000001 (Raj Demo Worker, Zomato, Mumbai)")
print("  Admin:   +917000000002 (Priya Demo Admin, Swiggy, Delhi)")
print("="*50)
db.close()
