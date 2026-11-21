from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import shutil
import os
import resend

from app.db.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, ApplicationStats
from app.core.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/applications", tags=["Applications"])
resend.api_key = settings.RESEND_API_KEY

def send_follow_up_reminder(email: str, company: str):
    """
    Sends a real email reminder using Resend.
    Runs in a BackgroundTask so it never blocks the HTTP response.
    """
    try:
        resend.api_key = settings.RESEND_API_KEY
        params = {
            "from": "JobTracker <onboarding@resend.dev>",  # Resend's testing address
            "to": [email],
            "subject": f"Don't forget to follow up with {company}!",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #4f46e5;">JobTracker Reminder</h2>
                    <p>Hey there,</p>
                    <p>You recently applied for a role at <strong>{company}</strong>. It's been a few days—have you followed up?</p>
                    <p>A quick, polite follow-up email can make a huge difference in landing the interview.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #64748b;">Sent with ❤️ by JobTracker.pro</p>
                </div>
            """
        }
        resend.Emails.send(params)
        print(f"✅ Email sent successfully to {email} for {company}")
    except Exception as e:
        print(f"❌ Failed to send email to {email}: {e}")

@router.post("/", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    new_app = Application(
        **app_in.model_dump(),
        user_id=current_user.id
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    background_tasks.add_task(
        send_follow_up_reminder,
        email=current_user.email,
        company=new_app.company_name
    )
    return new_app

@router.get("/", response_model=List[ApplicationResponse])
def get_my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Max records to return (max 100)"),
    app_status: Optional[ApplicationStatus] = Query(None, alias="status", description="Filter by application status"),
    company: Optional[str] = Query(None, description="Search by company name (case-insensitive)")
):
    query = db.query(Application).filter(Application.user_id == current_user.id)
    
    if app_status:
        query = query.filter(Application.status == app_status)
        
    if company:
        query = query.filter(Application.company_name.ilike(f"%{company}%"))
        
    applications = query.offset(skip).limit(limit).all()
    return applications

@router.get("/stats", response_model=ApplicationStats)
def get_application_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = db.query(
        Application.status, 
        func.count(Application.id)
    ).filter(
        Application.user_id == current_user.id
    ).group_by(
        Application.status
    ).all()
    
    stats = {
        "applied": 0,
        "interviewing": 0,
        "offer": 0,
        "rejected": 0,
        "withdrawn": 0
    }
    
    total = 0
    for status_enum, count in results:
        stats[status_enum.value] = count
        total += count
        
    return {
        "total_applications": total,
        **stats
    }

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    app = db.query(Application).filter(
        Application.id == app_id, 
        Application.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int,
    app_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) 
):
    app = db.query(Application).filter(
        Application.id == app_id, 
        Application.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    update_data = app_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(app, key, value)
        
    db.commit()
    db.refresh(app)
    return app

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(
        Application.id == app_id, 
        Application.user_id == current_user.id
    ).first()
    
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    db.delete(app)
    db.commit()
    return None

@router.post("/{app_id}/resume", response_model=ApplicationResponse)
def upload_resume(
    app_id: int,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app_record = db.query(Application).filter(
        Application.id == app_id, 
        Application.user_id == current_user.id
    ).first()
    
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    os.makedirs("uploads", exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"user_{current_user.id}_app_{app_id}{file_extension}"
    file_path = os.path.join("uploads", unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    app_record.resume_filename = unique_filename
    db.commit()
    db.refresh(app_record)
    
    return app_record

@router.get("/{app_id}/resume")
def download_resume(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Find the application
    app_record = db.query(Application).filter(
        Application.id == app_id, 
        Application.user_id == current_user.id
    ).first()
    
    if not app_record or not app_record.resume_filename:
        raise HTTPException(status_code=404, detail="Resume not found in database")
    
    file_path = os.path.join("uploads", app_record.resume_filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Physical file not found (it may have been wiped on server restart)")
        
    return FileResponse(
        path=file_path, 
        media_type="application/pdf", 
        filename=app_record.resume_filename
    )
