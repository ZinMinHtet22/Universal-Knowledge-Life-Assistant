from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import models, database
from app.schemas import task as task_schema
from app.api import dependencies

router = APIRouter()

@router.get("/", response_model=List[task_schema.TaskResponse])
def get_tasks(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return db.query(models.Task).filter(models.Task.user_id == current_user.id).order_by(models.Task.created_at.desc()).all()

@router.post("/", response_model=task_schema.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: task_schema.TaskCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    new_task = models.Task(**task_in.model_dump(), user_id=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@router.put("/{task_id}", response_model=task_schema.TaskResponse)
def update_task(task_id: int, task_in: task_schema.TaskUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
        
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    db.delete(task)
    db.commit()
    return None
