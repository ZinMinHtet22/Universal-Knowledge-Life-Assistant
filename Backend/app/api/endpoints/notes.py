from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import models, database
from app.schemas import note as note_schema
from app.api import dependencies
from app.services.ai_router import summarize_text

router = APIRouter()

@router.get("/", response_model=List[note_schema.NoteResponse])
def get_notes(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return db.query(models.Note).filter(models.Note.user_id == current_user.id).order_by(models.Note.created_at.desc()).all()

@router.post("/", response_model=note_schema.NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note_in: note_schema.NoteCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    new_note = models.Note(**note_in.model_dump(), user_id=current_user.id)
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    return new_note

@router.put("/{note_id}", response_model=note_schema.NoteResponse)
def update_note(note_id: int, note_in: note_schema.NoteUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = note_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(note, key, value)
        
    db.commit()
    db.refresh(note)
    return note

@router.post("/{note_id}/summarize", response_model=note_schema.NoteResponse)
async def summarize_note(note_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    summary = await summarize_text(note.content)
    note.ai_summary = summary
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    note = db.query(models.Note).filter(models.Note.id == note_id, models.Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
        
    db.delete(note)
    db.commit()
    return None
