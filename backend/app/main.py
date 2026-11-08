
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine, Base
from app import models
from app.routes import complaints, dashboard, reminders, escalations


# Create database tables
Base.metadata.create_all(bind=engine)


# Initialize FastAPI application
app = FastAPI(
    title="GrievEase - Smart Grievance Management System",
    description="Backend API for citizen grievance registration and tracking",
    version="1.0.0"
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
