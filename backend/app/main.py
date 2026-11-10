import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from apscheduler.schedulers.background import BackgroundScheduler

from app.database import engine, Base, SessionLocal
from app import models
from app.routes import (
    complaints,
    dashboard,
    reminders,
    escalations,
    admin,
    auth,
    ai
)

from app.services.reminder_service import (
    run_reminder_automation,
    run_escalation_automation
)


Base.metadata.create_all(bind=engine)


# Initialize scheduler
scheduler = BackgroundScheduler()


# Run reminder and escalation automation
def automatic_grievance_check():
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


# Start and stop scheduler with FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):

    automatic_grievance_check()

    if not scheduler.running:
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


# Create FastAPI application
app = FastAPI(
    title="GrievEase - Smart Grievance Management System",
    description="Backend API for grievance registration, tracking, authentication, reminders and escalation.",
    version="1.0.0",
    lifespan=lifespan
)


app.include_router(complaints.router)
app.include_router(dashboard.router)
app.include_router(reminders.router)
app.include_router(escalations.router)
app.include_router(admin.router)
app.include_router(auth.router)
app.include_router(ai.router)

# Enable frontend communication
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
]

deployment_origins = os.getenv("FRONTEND_URL", "")
allowed_origins.extend(
    origin.strip().rstrip("/")
    for origin in deployment_origins.split(",")
    if origin.strip()
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# Root endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to GrievEase API",
        "status": "Running"
    }


# Health check endpoint
@app.get("/health")
def health_check():

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as error:
        return {
            "status": "unhealthy",
            "database": str(error)
        }
