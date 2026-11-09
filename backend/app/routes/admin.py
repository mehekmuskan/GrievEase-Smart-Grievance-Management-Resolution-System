import os
import hmac
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from pwdlib import PasswordHash
from pydantic import BaseModel, EmailStr, Field

from app.database import get_db
from app.models import Admin
from app.schemas import AdminRegister, AdminResponse


# Load environment variables
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

password_hash = PasswordHash.recommended()

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"]
)


# Login request schema
class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


# Generate JWT token
def create_access_token(admin_id: int, email: str):
    if not SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Authentication is not configured"
        )

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(admin_id),
        "email": email,
        "role": "admin",
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# Admin registration
@router.post(
    "/register",
    response_model=AdminResponse,
    status_code=201
)
def register_admin(
    admin: AdminRegister,
    db: Any = Depends(get_db)
):
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

    normalized_email = str(admin.email).lower()

    existing_admin = db.query(Admin).filter(
        Admin.email == normalized_email
    ).first()

    if existing_admin:
        raise HTTPException(
            status_code=409,
            detail="An admin with this email already exists"
        )

    hashed_password = password_hash.hash(admin.password)

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

    except Exception as error:
        db.rollback()

        if error.__class__.__name__ != "IntegrityError":
            raise

        raise HTTPException(
            status_code=409,
            detail="An admin with this email already exists"
        )

    return new_admin


# Admin login
@router.post("/login")
def login_admin(
    credentials: AdminLogin,
    db: Any = Depends(get_db)
):
    normalized_email = str(credentials.email).lower()

    admin = db.query(Admin).filter(
        Admin.email == normalized_email
    ).first()

    if not admin or not password_hash.verify(
        credentials.password,
        admin.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your admin account is inactive"
        )

    access_token = create_access_token(
        admin.id,
        admin.email
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "full_name": admin.full_name,
            "email": admin.email,
            "department": admin.department
        }
    }