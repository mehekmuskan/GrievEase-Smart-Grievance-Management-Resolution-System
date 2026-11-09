
from datetime import datetime

from sqlalchemy.orm import Session

from app.models import Complaint, Reminder, ActionHistory


# Automatic escalation rules
LEVEL_1_DAYS = 1
LEVEL_2_DAYS = 3

LEVEL_1_OFFICER = "Senior Grievance Officer"
LEVEL_2_OFFICER = "District Grievance Officer"


def run_reminder_automation(db: Session):
    """
    Checks follow-up dates, marks overdue complaints,
    and creates reminders without duplicates.
    """

    current_time = datetime.utcnow()

    active_complaints = db.query(Complaint).filter(
        Complaint.next_follow_up.isnot(None),
        Complaint.status.notin_(["Resolved", "Rejected"])
    ).all()

    created_reminders = 0
    overdue_count = 0

    try:
        for complaint in active_complaints:
            follow_up = complaint.next_follow_up

            if follow_up <= current_time:
                complaint.is_overdue = True
                overdue_count += 1

                existing_reminder = db.query(Reminder).filter(
                    Reminder.complaint_id == complaint.id,
                    Reminder.reminder_type == "Follow-up",
                    Reminder.scheduled_at == follow_up
                ).first()

                if existing_reminder is None:
                    reminder = Reminder(
                        complaint_id=complaint.id,
                        reminder_type="Follow-up",
                        scheduled_at=follow_up,
                        status="Pending",
                        message=(
                            f"Follow-up required for complaint "
                            f"{complaint.complaint_id}"
                        )
                    )

                    db.add(reminder)
                    created_reminders += 1

            else:
                complaint.is_overdue = False

        db.commit()

        return {
            "message": "Reminder automation completed",
            "checked_complaints": len(active_complaints),
            "overdue_complaints": overdue_count,
            "created_reminders": created_reminders
        }

    except Exception:
        db.rollback()
        raise


def run_escalation_automation(db: Session):
    """
    Automatically escalates overdue complaints.

    Level 1: 1 day overdue.
    Level 2: 3 days overdue.

    Existing escalation levels prevent repeated escalation.
    """

    current_time = datetime.utcnow()

    active_complaints = db.query(Complaint).filter(
        Complaint.next_follow_up.isnot(None),
        Complaint.status.notin_(["Resolved", "Rejected"])
    ).all()

    escalated_count = 0

    try:
        for complaint in active_complaints:

            follow_up = complaint.next_follow_up

            if follow_up > current_time:
                continue

            overdue_days = (
                current_time - follow_up
            ).total_seconds() / 86400

            if overdue_days >= LEVEL_2_DAYS:
                required_level = 2
                officer = LEVEL_2_OFFICER

            elif overdue_days >= LEVEL_1_DAYS:
                required_level = 1
                officer = LEVEL_1_OFFICER

            else:
                continue

            # Do not repeat an escalation already completed.
            if complaint.escalation_level >= required_level:
                continue

            previous_level = complaint.escalation_level

            complaint.escalation_level = required_level
            complaint.assigned_officer = officer

            history = ActionHistory(
                complaint_id=complaint.id,
                action=(
                    f"Automatic escalation from level "
                    f"{previous_level} to level {required_level}"
                ),
                remarks=(
                    f"Complaint was overdue for "
                    f"{int(overdue_days)} days. "
                    f"Automatically assigned to {officer}."
                ),
                performed_by="System Automation"
            )

            db.add(history)
            escalated_count += 1

        db.commit()

        return {
            "message": "Automatic escalation check completed",
            "checked_complaints": len(active_complaints),
            "new_escalations": escalated_count
        }

    except Exception:
        db.rollback()
        raise


def get_pending_reminders(db: Session):
    """Returns reminders that are still pending."""

    return db.query(Reminder).filter(
        Reminder.status == "Pending"
    ).order_by(Reminder.scheduled_at.asc()).all()
