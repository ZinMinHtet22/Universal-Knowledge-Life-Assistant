from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base

# Create database tables (in a real app, use Alembic migrations instead)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="UKLA API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Universal Knowledge & Life Assistant (UKLA) API"}

from app.api.endpoints import auth, chat, tasks, notes, learning, utilities
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(learning.router, prefix="/api/learning", tags=["learning"])
app.include_router(utilities.router, prefix="/api/utilities", tags=["utilities"])

