import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Admin


# Load environment variables
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


# Verify JWT and identify the logged-in administrator
def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Authentication is not configured"
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        admin_id = payload.get("sub")
        role = payload.get("role")

        if not admin_id or role != "admin":
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        admin_id = int(admin_id)

    except (JWTError, ValueError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )

    admin = db.query(Admin).filter(
        Admin.id == admin_id
    ).first()

    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=401,
            detail="Administrator account is invalid or inactive"
        )

    return admin