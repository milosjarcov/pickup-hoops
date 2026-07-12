import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# SQLite locally; on Render we'll set DATABASE_URL to the Postgres URL.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# Render hands out URLs starting with postgres:// but SQLAlchemy expects postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite only: allow the connection to be shared across FastAPI's threads.
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    """All models inherit from this so SQLAlchemy can find them."""


def get_db():
    """FastAPI dependency: one database session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
