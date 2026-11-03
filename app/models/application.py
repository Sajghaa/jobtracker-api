import enum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class ApplicationStatus(str, enum.Enum):
    APPLIED = "applied"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True, nullable=False)
    job_title = Column(String, nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.APPLIED, nullable=False)
    applied_date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    owner = relationship("User", backref="applications")