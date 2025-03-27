from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from src.database import Base

class Scan(Base):
    __tablename__ = "scans"
    id = Column(String, primary_key=True, index=True)
    domain = Column(String(255), index=True)  
    status = Column(String, default="pending")
    progress = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class ScanResult(Base):
    __tablename__ = "scan_results"
    scan_id = Column(String, ForeignKey("scans.id"), primary_key=True)
    results = Column(Text, nullable=False)  # Ensure this is a JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
