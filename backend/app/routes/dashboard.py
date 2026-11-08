
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Complaint

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


# Get dashboard statistics
@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):

    total = db.query(Complaint).count()

    pending = db.query(Complaint).filter(
        Complaint.status == "Pending"
    ).count()

    in_progress = db.query(Complaint).filter(
        Complaint.status == "In Progress"
    ).count()

    resolved = db.query(Complaint).filter(
        Complaint.status == "Resolved"
    ).count()

    rejected = db.query(Complaint).filter(
        Complaint.status == "Rejected"
    ).count()

    overdue = db.query(Complaint).filter(
        Complaint.is_overdue == True
    ).count()

    escalated = db.query(Complaint).filter(
        Complaint.escalation_level > 0
    ).count()

    return {
        "total_complaints": total,
        "pending": pending,
        "in_progress": in_progress,
        "resolved": resolved,
        "rejected": rejected,
        "overdue": overdue,
        "escalated": escalated
    }
