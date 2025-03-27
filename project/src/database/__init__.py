from .engine import async_session
from .init_db import init_db
from .models import Base


async def get_session():
    async with async_session() as session:
        yield session
