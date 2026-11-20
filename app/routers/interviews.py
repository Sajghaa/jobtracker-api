from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.application import Application
from app.models.interview import Interview
from app.models.user import User
from app.schemas.interview import InterviewCreate, InterviewResponse
from app.core.dependencies import get_current_user

router = APIRouter(tags=["Interviews"])

@router.get("/applications/{app_id}/interviews", response_model=List[InterviewResponse])
def get_interviews(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify user owns the application
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    return app.interviews

@router.post("/applications/{app_id}/interviews", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
def create_interview(
    app_id: int,
    interview_in: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    new_interview = Interview(**interview_in.model_dump(), application_id=app_id)
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    return new_interview

@router.delete("/interviews/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    interview = db.query(Interview).join(Application).filter(
        Interview.id == interview_id,
        Application.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    db.delete(interview)
    db.commit()
    return None