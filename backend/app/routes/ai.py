from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ai_classifier import classify_complaint

router = APIRouter(prefix="/api/ai", tags=["AI Classification"])


class ComplaintClassificationRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5)


@router.post("/classify")
def classify(request: ComplaintClassificationRequest):
    try:
        return classify_complaint(
            request.title,
            request.description
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Classification failed: {str(error)}"
        )
