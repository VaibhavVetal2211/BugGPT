from pydantic import BaseModel, validator
import validators
from datetime import datetime
from typing import Optional, Dict, Any, List

class ScanRequest(BaseModel):
    domain: str

    @validator('domain')
    def validate_domain(cls, v):
        if not validators.domain(v):
            raise ValueError('Invalid domain name')
        return v

class ScanResponse(BaseModel):
    scan_id: str
    success: bool
    message: str

class ScanStatus(BaseModel):
    status: str
    progress: int

class Vulnerability(BaseModel):
    title: str
    description: str
    severity: str
    cvss: Optional[float]
    recommendation: Optional[str]

class ScanResult(BaseModel):
    scan_id: str
    domain: str
    timestamp: datetime
    results: Dict[str, Any]
    summary: Dict[str, Any]
    vulnerabilities: List[Vulnerability]
    report_path: Optional[str]  # Add this field to include the PDF report path

    @validator('timestamp', pre=True, always=True)
    def serialize_timestamp(cls, v):
        return v.isoformat() if isinstance(v, datetime) else v

    class Config:
        orm_mode = True
