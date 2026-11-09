import os
from pathlib import Path
from datetime import datetime
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.database import get_db
from app.models import Complaint, ActionHistory, ComplaintDocument
from app.auth import get_current_admin

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


# File upload configuration
UPLOAD_DIR = (
    Path(__file__).resolve().parents[2]
    / "uploads"
    / "complaint_documents"
)

MAX_FILE_SIZE = 5 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png"
}


# 1. Create a new complaint (PUBLIC)
@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    citizen_name: str = Form(...),
    mobile: str = Form(...),
    email: str | None = Form(None),
    title: str = Form(...),
    description: str = Form(...),
    language: str = Form("English"),
    category: str | None = Form(None),
    department: str | None = Form(None),
    assigned_officer: str | None = Form(None),
    location: str | None = Form(None),
    priority: str = Form("Medium"),
    next_follow_up: datetime | None = Form(None),
    document: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    try:
        complaint_data = ComplaintCreate(
            citizen_name=citizen_name,
            mobile=mobile,
            email=email or None,
            title=title,
            description=description,
            language=language,
            category=category or None,
            department=department or None,
            assigned_officer=assigned_officer or None,
            location=location or None,
            priority=priority,
            next_follow_up=next_follow_up
        )

    except ValidationError as error:
        raise HTTPException(
            status_code=422,
            detail=error.errors()
        )

    complaint_id = (
        "GRV-"
        + datetime.now().strftime("%Y%m%d")
        + "-"
        + uuid4().hex[:6].upper()
    )

    new_complaint = Complaint(
        complaint_id=complaint_id,
        **complaint_data.model_dump()
    )

    saved_file_path = None

    try:
        db.add(new_complaint)
        db.flush()

        if document and document.filename:

            original_filename = (
                document.filename.replace("\\", "/").split("/")[-1]
            )

            extension = Path(original_filename).suffix.lower()

            if extension not in ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Unsupported file format. "
                        "Allowed formats: PDF, DOC, DOCX, TXT, JPG, JPEG and PNG."
                    )
                )

            file_content = await document.read(MAX_FILE_SIZE + 1)

            if len(file_content) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="The uploaded file is empty."
                )

            if len(file_content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail="File size must not exceed 5 MB."
                )

            stored_filename = uuid4().hex + extension

            UPLOAD_DIR.mkdir(
                parents=True,
                exist_ok=True
            )

            saved_file_path = UPLOAD_DIR / stored_filename

            saved_file_path.write_bytes(file_content)

            new_document = ComplaintDocument(
                complaint_db_id=new_complaint.id,
                original_filename=original_filename,
                stored_filename=stored_filename,
                content_type=document.content_type,
                file_size=len(file_content)
            )

            db.add(new_document)

        db.commit()
        db.refresh(new_complaint)

        return new_complaint

    except HTTPException:
        db.rollback()

        if saved_file_path and saved_file_path.exists():
            saved_file_path.unlink()

        raise

    except Exception:
        db.rollback()

        if saved_file_path and saved_file_path.exists():
            saved_file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail="Complaint registration failed. Please try again."
        )

    finally:
        if document:
            await document.close()


# 2. Get all complaints (ADMIN ONLY)
@router.get("/", response_model=list[ComplaintResponse])
def get_complaints(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    return db.query(Complaint).order_by(
        Complaint.created_at.desc()
    ).all()


# 3. Update complaint status (ADMIN ONLY)
@router.put("/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    update: ComplaintStatusUpdate,
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


# 4. Assign complaint (ADMIN ONLY)
@router.put("/{complaint_id}/assign")
def assign_complaint(
    complaint_id: str,
    assignment: ComplaintAssignmentUpdate,
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


# 5. Get complaint action history (ADMIN ONLY)
@router.get(
    "/{complaint_id}/actions",
    response_model=list[ActionResponse]
)
def get_complaint_actions(
    complaint_id: str,
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

    actions = db.query(ActionHistory).filter(
        ActionHistory.complaint_id == complaint.id
    ).order_by(
        ActionHistory.created_at.desc()
    ).all()

    return actions


# 6. Download complaint document (ADMIN ONLY)
@router.get("/{complaint_id}/document")
def download_complaint_document(
    complaint_id: str,
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

    document = db.query(ComplaintDocument).filter(
        ComplaintDocument.complaint_db_id == complaint.id
    ).order_by(
        ComplaintDocument.uploaded_at.desc()
    ).first()

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="No document attached to this complaint."
        )

    file_path = UPLOAD_DIR / document.stored_filename

    if not file_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Document file not found on server."
        )

    return FileResponse(
        path=str(file_path),
        filename=document.original_filename,
        media_type=document.content_type or "application/octet-stream"
    )


# 7. Get complaint details by ID (PUBLIC)
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