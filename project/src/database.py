from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from src.config import settings # Adjusted import




print(f"Database URL: {settings.database_url}")

# Create async engine
engine = create_async_engine(settings.database_url, echo=True)
print(f"Engine: {engine}")

# Create async session maker
async_session = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Define base class for models
class Base(DeclarativeBase):
    pass

# Async DB initialization
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Dependency for async session
async def get_session():
    async with async_session() as session:
        yield session
