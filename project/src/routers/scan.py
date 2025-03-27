from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.db import get_session
from src.schemas.scan import ScanRequest, ScanResponse, ScanStatus, ScanResult
from src.models.scan import Scan, ScanResult  # Ensure ScanResult is imported
from src.services.scanner import Scanner
import uuid
import json
from pydantic import BaseModel

#from routers import scan, report

from datetime import datetime
scan_instance = Scan(id=str(uuid.uuid4()), domain="example.com", status="pending", progress=0, updated_at=datetime.utcnow())  # ✅ Ensure timestamp is set

router = APIRouter()

@router.get("/")
def read_root():
    return {"message": "Hello, this is the scan endpoint!"}

@router.post("/start", response_model=ScanResponse)
async def start_scan(
    request: ScanRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
):
    try:
        scan_id = str(uuid.uuid4())
        
        # Create scan record
        scan = Scan(
            id=scan_id,
            domain=request.domain,
            status="pending"
        )
        session.add(scan)
        await session.commit()

        # Start scan process in background
        scanner = Scanner(request.domain, scan_id)
        background_tasks.add_task(scanner.start)

        return ScanResponse(
            scan_id=scan_id,
            success=True,
            message="Scan started successfully"
        )
    except Exception as e:
        print(f"Error starting scan: {e}")  # Log the error
        raise HTTPException(status_code=500, detail=f"Error starting scan: {str(e)}")


@router.get("/status/{scan_id}", response_model=ScanStatus)
async def get_scan_status(
    scan_id: str,
    session: AsyncSession = Depends(get_session)
):
    scan = await session.get(Scan, scan_id)
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return ScanStatus(
        status=scan.status,
        progress=scan.progress
    )

class ScanResultResponse(BaseModel):
    scan_id: str
    results: dict

@router.get("/results/{scan_id}", response_model=ScanResultResponse)
async def get_scan_results(
    scan_id: str,
    session: AsyncSession = Depends(get_session)
):
    try:
        # Fetch scan result from the database
        scan_result = await session.get(ScanResult, scan_id)
        if not scan_result:
            raise HTTPException(status_code=404, detail="Scan results not found")

        # Deserialize results from JSON
        try:
            results_dict = json.loads(scan_result.results) if isinstance(scan_result.results, str) else scan_result.results
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Error decoding scan results JSON")

        # Ensure results_dict is a dictionary
        if not isinstance(results_dict, dict):
            raise HTTPException(status_code=500, detail="Invalid scan results structure")

        # Return the results
        return {
            "scan_id": scan_id,
            "results": results_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching scan results: {str(e)}")
