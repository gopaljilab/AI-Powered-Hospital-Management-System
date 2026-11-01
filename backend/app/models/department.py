from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True, default="Activity")
    image_url = Column(String(255), nullable=True)

    doctors = relationship("Doctor", back_populates="department", cascade="all, delete-orphan")
    faqs = relationship("HospitalFAQ", back_populates="department")
