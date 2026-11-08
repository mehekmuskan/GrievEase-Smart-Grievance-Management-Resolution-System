
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


# 1. Create Complaint
class ComplaintCreate(BaseModel):
    citizen_name: str = Field(min_length=2, max_length=100)
    mobile: str = Field(min_length=10, max_length=15)
    email: Optional[str] = None
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5)
    language: str = "English"
    category: Optional[str] = None
    department: Optional[str] = None
    assigned_officer: Optional[str] = None
    location: Optional[str] = None
    priority: str = "Medium"
    next_follow_up: Optional[datetime] = None


# 2. Update Complaint Status
class ComplaintStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None
    performed_by: str


# 3. Assign Complaint
class ComplaintAssignmentUpdate(BaseModel):
    department: str = Field(min_length=2, max_length=100)
    assigned_officer: str = Field(min_length=2, max_length=100)
    performed_by: str = Field(min_length=2, max_length=100)
    remarks: Optional[str] = None


# 4. Create Action
class ActionCreate(BaseModel):
    action: str
    remarks: Optional[str] = None
    performed_by: str


# 5. Complaint Response
class ComplaintResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    complaint_id: str
    citizen_name: str
    mobile: str
    email: Optional[str] = None
    title: str
    description: str
    language: str
    category: Optional[str] = None
    department: Optional[str] = None
    assigned_officer: Optional[str] = None
    location: Optional[str] = None
    status: str
    priority: str
    created_at: datetime
    updated_at: datetime
    next_follow_up: Optional[datetime] = None
    is_overdue: bool
    escalation_level: int


# 6. Action History Response
class ActionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    complaint_id: int
    action: str
    remarks: Optional[str] = None
    performed_by: str
    created_at: datetime


# 7. Follow-Up Update
class FollowUpUpdate(BaseModel):
    next_follow_up: datetime
    performed_by: str
    remarks: Optional[str] = None


# 8. Escalation Update
class EscalationUpdate(BaseModel):
    escalate_to: str = Field(min_length=2, max_length=100)
    performed_by: str = Field(min_length=2, max_length=100)
    remarks: str = Field(min_length=5)
