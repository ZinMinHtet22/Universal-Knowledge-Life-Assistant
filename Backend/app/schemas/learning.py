from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ==========================================
# AI Generation Schemas (Structured Output)
# ==========================================
class AIFlashcard(BaseModel):
    front: str
    back: str

class AIQuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_index: int
    explanation: str

class AIStudyMaterial(BaseModel):
    flashcards: List[AIFlashcard]
    quizzes: List[AIQuizQuestion]

# ==========================================
# API Request / Response Schemas
# ==========================================
class GenerateTopicRequest(BaseModel):
    topic_name: str
    difficulty: str

class FlashcardResponse(BaseModel):
    id: int
    topic_id: int
    front: str
    back: str

    class Config:
        from_attributes = True

class QuizQuestionResponse(BaseModel):
    id: int
    topic_id: int
    question: str
    options: List[str]
    correct_index: int
    explanation: str

    class Config:
        from_attributes = True

class LearningTopicResponse(BaseModel):
    id: int
    user_id: int
    topic_name: str
    difficulty: str
    created_at: datetime
    # We might not want to always return all flashcards/quizzes with the topic list,
    # but for simplicity we can include them or fetch them separately.
    flashcards: List[FlashcardResponse] = []
    quizzes: List[QuizQuestionResponse] = []

    class Config:
        from_attributes = True
