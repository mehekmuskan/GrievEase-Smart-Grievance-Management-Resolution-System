from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import Admin, User, Complaint, ActionHistory
from app.security import hash_password

def seed_data(db: Session):
    # Check if admin already exists
    admin_count = db.query(Admin).count()
    if admin_count == 0:
        default_admin = Admin(
            full_name="Super Administrator",
            email="admin@grievease.gov.in",
            phone="9876543210",
            department="Public Grievance Redressal",
            hashed_password=hash_password("Admin@12345"),
            is_active=True
        )
        db.add(default_admin)
        print("Default admin created: admin@grievease.gov.in / Admin@12345")

    # Check if citizen already exists
    user_count = db.query(User).count()
    citizen = None
    if user_count == 0:
        citizen = User(
            full_name="Ramesh Kumar",
            email="citizen@example.com",
            hashed_password=hash_password("Citizen@12345"),
            role="citizen",
            is_active=True
        )
        db.add(citizen)
        db.flush()
        print("Default citizen created: citizen@example.com / Citizen@12345")
    else:
        citizen = db.query(User).first()

    # Seed sample complaints if empty
    complaint_count = db.query(Complaint).count()
    if complaint_count == 0:
        now = datetime.utcnow()
        sample_complaints = [
            Complaint(
                complaint_id="GRV-20261109-001001",
                citizen_name="Rahul Kumar",
                mobile="9876501234",
                email="rahul.k@example.com",
                title="Continuous drinking water disruption in Ward 4",
                description="Drinking water supply has been disrupted for the past 3 days in 4th Main, Ward 4. Residents have no drinking water.",
                language="English",
                category="Water Supply",
                department="Water Supply & Sewerage Board",
                assigned_officer="Anil Kumar",
                location="Bengaluru Urban",
                status="Pending",
                priority="High",
                created_at=now - timedelta(days=2),
                next_follow_up=now + timedelta(days=1),
                is_overdue=False,
                escalation_level=0,
                citizen_user_id=citizen.id if citizen else None
            ),
            Complaint(
                complaint_id="GRV-20261109-002002",
                citizen_name="Priya Sharma",
                mobile="9812345678",
                email="priya.s@example.com",
                title="Deep potholes on Main Ring Road near bridge",
                description="Severe road damage and deep potholes causing commuter accidents and traffic jams every evening.",
                language="English",
                category="Roads",
                department="Public Works Department",
                assigned_officer="Meena Rao",
                location="Mysuru",
                status="In Progress",
                priority="Medium",
                created_at=now - timedelta(days=3),
                next_follow_up=now - timedelta(hours=5),
                is_overdue=True,
                escalation_level=1,
                citizen_user_id=citizen.id if citizen else None
            ),
            Complaint(
                complaint_id="GRV-20261109-003003",
                citizen_name="Amit Patel",
                mobile="9765432109",
                email="amit.p@example.com",
                title="Transformer spark and frequent low voltage",
                description="Street transformer is sparking during night hours, causing frequent power cuts and equipment failure.",
                language="English",
                category="Electricity",
                department="Electricity Distribution Corp",
                assigned_officer="Ravi Kumar",
                location="Ballari",
                status="Pending",
                priority="High",
                created_at=now - timedelta(hours=10),
                next_follow_up=now + timedelta(days=2),
                is_overdue=False,
                escalation_level=0,
                citizen_user_id=citizen.id if citizen else None
            ),
            Complaint(
                complaint_id="GRV-20261109-004004",
                citizen_name="Sneha Rao",
                mobile="9900112233",
                email="sneha.r@example.com",
                title="Garbage overflow near community park",
                description="Waste collection bins overflowing onto sidewalk, causing severe foul smell and health hazard.",
                language="English",
                category="Sanitation",
                department="Municipal Sanitation",
                assigned_officer="Meena Rao",
                location="Dharwad",
                status="Resolved",
                priority="Low",
                created_at=now - timedelta(days=5),
                next_follow_up=None,
                is_overdue=False,
                escalation_level=0,
                citizen_user_id=citizen.id if citizen else None
            )
        ]

        for c in sample_complaints:
            db.add(c)
            db.flush()
            action = ActionHistory(
                complaint_id=c.id,
                action=f"Complaint registered ({c.status})",
                remarks=f"Registered in {c.category} department with {c.priority} priority.",
                performed_by="System Initializer",
                created_at=c.created_at
            )
            db.add(action)

        print(f"Seeded {len(sample_complaints)} sample complaints.")

    db.commit()
