from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.models import Complaint, ActionHistory
from app.schemas import ComplaintResponse, FollowUpUpdate
from app.auth import get_current_admin

router = APIRouter(
    prefix="/api/reminders",
    tags=["Reminders"]
)


# 1. Set complaint follow-up date (Admin only)
@router.put("/{complaint_id}/follow-up")
def set_follow_up(
    complaint_id: str,
    update: FollowUpUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    follow_up_date = update.next_follow_up

    if follow_up_date.tzinfo is not None:
        follow_up_date = follow_up_date.astimezone(
            timezone.utc
        ).replace(tzinfo=None)

    complaint.next_follow_up = follow_up_date

    complaint.is_overdue = (
        follow_up_date < datetime.utcnow()
        and complaint.status not in ["Resolved", "Rejected"]
    )

    history = ActionHistory(
        complaint_id=complaint.id,
        action="Follow-up date scheduled",
        remarks=update.remarks,
        performed_by=current_admin.full_name
    )

    db.add(history)
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Follow-up date saved successfully",
        "complaint_id": complaint.complaint_id,
        "next_follow_up": complaint.next_follow_up,
        "is_overdue": complaint.is_overdue
    }


# 2. Get all overdue complaints (Admin only)
@router.get(
    "/overdue",
    response_model=list[ComplaintResponse]
)
def get_overdue_complaints(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    current_time = datetime.utcnow()

    complaints = db.query(Complaint).filter(
        Complaint.next_follow_up.isnot(None),
        Complaint.status.notin_(["Resolved", "Rejected"])
    ).all()

    for complaint in complaints:
        complaint.is_overdue = (
            complaint.next_follow_up < current_time
        )

    db.commit()

    return db.query(Complaint).filter(
        Complaint.is_overdue == True,
        Complaint.status.notin_(["Resolved", "Rejected"])
    ).order_by(
        Complaint.next_follow_up.asc()
    ).all()