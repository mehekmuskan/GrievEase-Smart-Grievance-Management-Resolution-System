
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import engine, Base, SessionLocal
from app import models
from app.routes import complaints, dashboard, reminders, escalations, admin, ai

from app.services.reminder_service import (
    run_reminder_automation,
    run_escalation_automation
)


Base.metadata.create_all(bind=engine)

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

    automatic_grievance_check()

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

    if scheduler.running:
        scheduler.shutdown(wait=False)

    print("GrievEase scheduler stopped")


app = FastAPI(
    title="GrievEase - Smart Grievance Management System",
    description="Backend API for citizen grievance registration and tracking",
    version="1.0.0",
    lifespan=lifespan
)


app.include_router(complaints.router)
app.include_router(dashboard.router)
app.include_router(reminders.router)
app.include_router(escalations.router)
app.include_router(admin.router)
app.include_router(ai.router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def home():
    return {
        "message": "GrievEase Backend is Running",
        "status": "Success"
    }


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
