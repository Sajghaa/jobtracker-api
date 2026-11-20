from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False)
    
    round_name = Column(String, nullable=False)
    scheduled_date = Column(DateTime(timezone=True), nullable=False)
    notes = Column(String, nullable=True)

    application = relationship("Application", back_populates="interviews")