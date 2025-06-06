from sqlalchemy.ext.asyncio import AsyncSession
from .engine import async_session
from src.database.engine import async_session


async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session
