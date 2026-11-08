from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.core.dependencies import get_current_user

import shutil
import os
from fastapi import File, UploadFile


router = APIRouter(prefix="/applications", tags=["Applications"])

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

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 🔒 LOCKED
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
    current_user: User = Depends(get_current_user)  # 🔒 LOCKED
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
    current_user: User = Depends(get_current_user)  # 🔒 LOCKED
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
    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"user_{current_user.id}_app_{app_id}{file_extension}"
    file_path = os.path.join("uploads", unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    app_record.resume_filename = unique_filename
    db.commit()
    db.refresh(app_record)
    
    return app_record


def send_follow_up_reminder(email: str, company: str):
    import time
    time.sleep(3)
    print(f"\n📧 [BACKGROUND TASK] Email sent to {email}: Don't forget to follow up with {company}!\n")