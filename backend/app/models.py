
from sqlalchemy import (
    Column, Integer, String, Text,
    DateTime, Boolean, ForeignKey, UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    complaint_id = Column(
        String(30), unique=True, index=True, nullable=False
    )

    citizen_name = Column(String(100), nullable=False)
    mobile = Column(String(15), nullable=False)
    email = Column(String(100), nullable=True)

    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    language = Column(String(30), default="English")
    category = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    assigned_officer = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)

    status = Column(String(30), default="Pending")
    priority = Column(String(30), default="Medium")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    next_follow_up = Column(DateTime, nullable=True)
    is_overdue = Column(Boolean, default=False)
    escalation_level = Column(Integer, default=0)

    actions = relationship(
        "ActionHistory",
        back_populates="complaint",
        cascade="all, delete-orphan"
    )


class ActionHistory(Base):
    __tablename__ = "action_history"

    id = Column(Integer, primary_key=True, index=True)

    complaint_id = Column(
        Integer, ForeignKey("complaints.id"), nullable=False
    )

    action = Column(String(100), nullable=False)
    remarks = Column(Text, nullable=True)
    performed_by = Column(String(100), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship(
        "Complaint", back_populates="actions"
    )

class Reminder(Base):
    __tablename__ = "reminders"

    __table_args__ = (
        UniqueConstraint(
            "complaint_id",
            "reminder_type",
            "scheduled_at",
            name="uq_complaint_reminder_schedule"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    complaint_id = Column(
        Integer,
        ForeignKey("complaints.id"),
        nullable=False
    )

    reminder_type = Column(
        String(50),
        nullable=False,
        default="Follow-up"
    )

    scheduled_at = Column(DateTime, nullable=False)

    status = Column(String(30), nullable=False, default="Pending")
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    complaint = relationship(
        "Complaint",
        
    )


