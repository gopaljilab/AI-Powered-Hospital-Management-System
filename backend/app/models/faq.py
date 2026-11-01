from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class HospitalFAQ(Base):
    __tablename__ = "hospital_faqs"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(255), nullable=False, index=True)
    answer = Column(Text, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)

    department = relationship("Department", back_populates="faqs")
