from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.application import ApplicationStatus

class ApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    status: ApplicationStatus = ApplicationStatus.APPLIED
    notes: Optional[str] = None

class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    company_name: str
    job_title: str
    status: ApplicationStatus
    applied_date: datetime
    notes: Optional[str]
    user_id: int

    class Config:
        from_attributes = True