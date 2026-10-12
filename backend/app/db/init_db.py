import asyncio
from sqlalchemy import text
from app.db.session import engine
from app.models import Base

async def init_db():
    print("Initializing Render PostgreSQL tables and pgvector...")
    async with engine.begin() as conn:
        # Enable vector extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        # Create all tables defined in Base
        await conn.run_sync(Base.metadata.create_all)
        # Create HNSW index for cosine distance if not exists
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_biometric_profiles_embedding_hnsw
            ON biometric_profiles USING hnsw (embedding vector_cosine_ops)
            WITH (m = 16, ef_construction = 64);
        """))
    print("Database tables and HNSW vector index created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
