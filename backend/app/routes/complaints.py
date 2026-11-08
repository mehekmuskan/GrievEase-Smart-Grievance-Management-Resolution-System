
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import uuid4

from app.database import get_db
from app.models import Complaint, ActionHistory
from app.schemas import (
    ComplaintCreate,
    ComplaintResponse,
    ComplaintStatusUpdate,
    ComplaintAssignmentUpdate,
    ActionResponse
)

router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"]
)


# 1. Create a new complaint
@router.post("/", response_model=ComplaintResponse)
def create_complaint(
    complaint: ComplaintCreate,
    db: Session = Depends(get_db)
):
    complaint_id = (
        "GRV-" + datetime.now().strftime("%Y%m%d")
        + "-" + uuid4().hex[:6].upper()
    )

    new_complaint = Complaint(
        complaint_id=complaint_id,
        **complaint.model_dump()
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    return new_complaint


# 2. Get all complaints
@router.get("/", response_model=list[ComplaintResponse])
def get_complaints(db: Session = Depends(get_db)):
    return db.query(Complaint).order_by(
        Complaint.created_at.desc()
    ).all()


# 3. Update complaint status
@router.put("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    update: ComplaintStatusUpdate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    allowed_statuses = [
        "Pending",
        "In Progress",
        "Resolved",
        "Rejected"
    ]

    if update.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid complaint status"
        )

    complaint.status = update.status

    history = ActionHistory(
        complaint_id=complaint.id,
        action="Status updated to " + update.status,
        remarks=update.remarks,
        performed_by=update.performed_by
    )

    db.add(history)
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Complaint status updated successfully",
        "complaint_id": complaint.complaint_id,
        "status": complaint.status
    }


# 4. Assign complaint to department and officer
@router.put("/{complaint_id}/assign")
def assign_complaint(
    complaint_id: str,
    assignment: ComplaintAssignmentUpdate,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    complaint.department = assignment.department
    complaint.assigned_officer = assignment.assigned_officer

    history = ActionHistory(
        complaint_id=complaint.id,
        action="Complaint assigned to " + assignment.assigned_officer,
        remarks=assignment.remarks,
        performed_by=assignment.performed_by
    )

    db.add(history)
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Complaint assigned successfully",
        "complaint_id": complaint.complaint_id,
        "department": complaint.department,
        "assigned_officer": complaint.assigned_officer
    }


# 5. Get action history of a complaint
@router.get(
    "/{complaint_id}/actions",
    response_model=list[ActionResponse]
)
def get_complaint_actions(
    complaint_id: str,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    actions = db.query(ActionHistory).filter(
        ActionHistory.complaint_id == complaint.id
    ).order_by(
        ActionHistory.created_at.desc()
    ).all()

    return actions


# 6. Get complaint details by complaint ID
@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: str,
    db: Session = Depends(get_db)
):
    complaint = db.query(Complaint).filter(
        Complaint.complaint_id == complaint_id
    ).first()

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint
