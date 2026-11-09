import os
import hmac
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash

from app.database import get_db
from app.models import Admin
from app.schemas import AdminRegister, AdminResponse


# Load backend environment variables
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)

password_hash = PasswordHash.recommended()


# Register a new admin
@router.post(
    "/register",
    response_model=AdminResponse,
    status_code=201
)
def register_admin(
    admin: AdminRegister,
    db: Session = Depends(get_db)
):
    # Verify registration code
    configured_code = os.getenv("ADMIN_REGISTRATION_CODE")

    if not configured_code:
        raise HTTPException(
            status_code=503,
            detail="Admin registration is not configured"
        )

    if not hmac.compare_digest(
        admin.registration_code,
        configured_code
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid admin registration code"
        )

    # Normalize email
    normalized_email = str(admin.email).lower()

    # Check duplicate email
    existing_admin = db.query(Admin).filter(
        Admin.email == normalized_email
    ).first()

    if existing_admin:
        raise HTTPException(
            status_code=409,
            detail="An admin with this email already exists"
        )

    # Hash password
    hashed_password = password_hash.hash(admin.password)

    # Create admin account
    new_admin = Admin(
        full_name=admin.full_name.strip(),
        email=normalized_email,
        phone=admin.phone,
        department=admin.department,
        hashed_password=hashed_password
    )

    db.add(new_admin)

    try:
        db.commit()
        db.refresh(new_admin)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="An admin with this email already exists"
        )

    return new_admin
