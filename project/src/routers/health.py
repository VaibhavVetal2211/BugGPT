from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import get_session

router = APIRouter()

@router.get("/health")
async def health_check(session: AsyncSession = Depends(get_session)):
    try:
        # Try to execute a simple query
        result = await session.execute("SELECT 1")
        return {"status": "ok", "result": result.scalar()}
    except Exception as e:
        return {"status": "error", "message": str(e)}