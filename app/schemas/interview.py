from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class InterviewCreate(BaseModel):
    round_name: str
    scheduled_date: datetime
    notes: Optional[str] = None

class InterviewResponse(InterviewCreate):
    id: int
    application_id: int

    class Config:
        from_attributes = True