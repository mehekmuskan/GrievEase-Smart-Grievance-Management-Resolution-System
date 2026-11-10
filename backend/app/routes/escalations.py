from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Complaint, ActionHistory
from app.schemas import EscalationUpdate
from app.routes.auth import require_roles

router = APIRouter(
    prefix="/api/escalations",
    tags=["Escalations"]
)


# 1. Manually escalate a complaint (Admin only)
@router.put("/{complaint_id}")
def escalate_complaint(
    complaint_id: str,
    update: EscalationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("officer", "admin")
    )
):
    complaint = db.query(Complaint).filter(
        (Complaint.complaint_id == complaint_id) |
        (Complaint.id == int(complaint_id) if str(complaint_id).isdigit() else False)
    ).first()

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    if complaint.status in ["Resolved", "Rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Resolved or rejected complaints cannot be escalated"
        )

    complaint.escalation_level += 1
    complaint.assigned_officer = update.escalate_to

    history = ActionHistory(
        complaint_id=complaint.id,
        action=f"Complaint escalated to {update.escalate_to}",
        remarks=update.remarks,
        performed_by=current_user.full_name
    )

    db.add(history)
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Complaint escalated successfully",
        "complaint_id": complaint.complaint_id,
        "escalation_level": complaint.escalation_level,
        "escalated_to": update.escalate_to
    }


# 2. Get all escalated complaints (Admin only)
@router.get("/")
def get_escalated_complaints(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_roles("officer", "admin")
    )
):
    return db.query(Complaint).filter(
        Complaint.escalation_level > 0
    ).order_by(
        Complaint.updated_at.desc()
    ).all()
