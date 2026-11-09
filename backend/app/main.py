
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import engine, Base, SessionLocal
from app import models
from app.routes import complaints, dashboard, reminders, escalations

from app.services.reminder_service import (
    run_reminder_automation,
    run_escalation_automation
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Background scheduler
scheduler = BackgroundScheduler()


def automatic_grievance_check():
    """Run reminder and escalation automation."""

    db = SessionLocal()

    try:
        reminder_result = run_reminder_automation(db)
        print("GrievEase Reminder Automation:", reminder_result)

        escalation_result = run_escalation_automation(db)
        print("GrievEase Escalation Automation:", escalation_result)

    except Exception as error:
        print("GrievEase Automation Error:", error)

    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):

    # Run automation once when application starts
    automatic_grievance_check()

    # Run automation every 60 seconds
    scheduler.add_job(
        automatic_grievance_check,
        trigger="interval",
        seconds=60,
        id="grievance_automation_check",
        replace_existing=True,
        max_instances=1
    )

    scheduler.start()

    print("GrievEase automatic reminder and escalation scheduler started")

    yield

    # Stop scheduler when application shuts down
    if scheduler.running:
        scheduler.shutdown(wait=False)

    print("GrievEase scheduler stopped")


# Initialize FastAPI application
app = FastAPI(
    title="GrievEase - Smart Grievance Management System",
    description="Backend API for citizen grievance registration and tracking",
    version="1.0.0",
    lifespan=lifespan
)


# Register API routers
app.include_router(complaints.router)
app.include_router(dashboard.router)
app.include_router(reminders.router)
app.include_router(escalations.router)


# Enable communication with frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Home API
@app.get("/")
def home():
    return {
        "message": "GrievEase Backend is Running",
        "status": "Success"
    }


# Database health check API
@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "Healthy",
            "database": "Connected"
        }

    except Exception as error:
        return {
            "status": "Unhealthy",
            "database": "Disconnected",
            "error": str(error)
        }
