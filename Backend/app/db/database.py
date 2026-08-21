import os
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Allow SQLite fallback for local dev if DATABASE_URL is missing or sqlite
if not settings.database_url or settings.database_url.startswith("sqlite"):
    sqlite_path = settings.database_url.replace("sqlite:///", "") if settings.database_url else "ukla.db"
    os.makedirs(os.path.dirname(os.path.abspath(sqlite_path)) if os.path.dirname(sqlite_path) else ".", exist_ok=True)
    engine = create_engine(
        f"sqlite:///{sqlite_path}",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
        echo=False,
    )
else:
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,
        echo=False,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

@contextmanager
def get_db_context():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()