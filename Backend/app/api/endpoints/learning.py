from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db import models, database
from app.schemas import learning as learning_schema
from app.api import dependencies
from app.services.ai_router import generate_study_material

router = APIRouter()

@router.get("/topics", response_model=List[learning_schema.LearningTopicResponse])
def get_topics(db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    return db.query(models.LearningTopic).filter(models.LearningTopic.user_id == current_user.id).order_by(models.LearningTopic.created_at.desc()).all()

@router.post("/topics", response_model=learning_schema.LearningTopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(request: learning_schema.GenerateTopicRequest, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # 1. Create the Topic in DB
    new_topic = models.LearningTopic(
        user_id=current_user.id,
        topic_name=request.topic_name,
        difficulty=request.difficulty
    )
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    
    # 2. Call AI to generate Flashcards and Quizzes
    study_material = await generate_study_material(request.topic_name, request.difficulty)
    
    # 3. Save Flashcards
    for fc in study_material.flashcards:
        db_flashcard = models.Flashcard(
            topic_id=new_topic.id,
            front=fc.front,
            back=fc.back
        )
        db.add(db_flashcard)
        
    # 4. Save Quizzes
    for qz in study_material.quizzes:
        db_quiz = models.QuizQuestion(
            topic_id=new_topic.id,
            question=qz.question,
            options=qz.options,
            correct_index=qz.correct_index,
            explanation=qz.explanation
        )
        db.add(db_quiz)
        
    db.commit()
    db.refresh(new_topic)
    
    return new_topic

@router.get("/topics/{topic_id}/flashcards", response_model=List[learning_schema.FlashcardResponse])
def get_flashcards(topic_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Verify ownership
    topic = db.query(models.LearningTopic).filter(models.LearningTopic.id == topic_id, models.LearningTopic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    return db.query(models.Flashcard).filter(models.Flashcard.topic_id == topic_id).all()

@router.get("/topics/{topic_id}/quizzes", response_model=List[learning_schema.QuizQuestionResponse])
def get_quizzes(topic_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    # Verify ownership
    topic = db.query(models.LearningTopic).filter(models.LearningTopic.id == topic_id, models.LearningTopic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    return db.query(models.QuizQuestion).filter(models.QuizQuestion.topic_id == topic_id).all()

@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(topic_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(dependencies.get_current_user)):
    topic = db.query(models.LearningTopic).filter(models.LearningTopic.id == topic_id, models.LearningTopic.user_id == current_user.id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    db.delete(topic)
    db.commit()
    return None
