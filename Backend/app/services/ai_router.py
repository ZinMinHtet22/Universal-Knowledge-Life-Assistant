import os
import json
import redis
from litellm import completion, acompletion
from dotenv import load_dotenv
from app.schemas.learning import AIStudyMaterial

load_dotenv()

# Define Model Tiers
LIGHTWEIGHT_MODEL = os.getenv("LIGHTWEIGHT_MODEL", "ollama/llama3:8b")
ADVANCED_MODEL = os.getenv("ADVANCED_MODEL", "openai/gpt-4o")

# Redis connection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def analyze_query_complexity(query: str) -> bool:
    """
    Heuristic to determine if a query requires an advanced model.
    True = Complex (Needs Advanced Model)
    False = Simple (Use Lightweight Model)
    """
    complex_keywords = ["analyze", "architect", "synthesize", "evaluate", "code", "explain quantum"]
    if len(query.split()) > 100:
        return True
    for word in complex_keywords:
        if word in query.lower():
            return True
    return False

def get_cache_key(messages: list) -> str:
    """Generate a unique cache key based on the message history."""
    # Convert list of dicts to a JSON string for hashing/keying
    return f"chat_cache:{hash(json.dumps(messages, sort_keys=True))}"

async def route_chat_query(messages: list, query: str):
    """
    Routes the query to the appropriate model based on complexity.
    Implements fallbacks if the primary model fails.
    """
    # 1. Check Redis Cache
    cache_key = get_cache_key(messages)
    try:
        cached_response = redis_client.get(cache_key)
        if cached_response:
            return {"content": cached_response, "model_used": "cache (redis)"}
    except Exception as e:
        print(f"Redis cache read error: {e}")

    is_complex = analyze_query_complexity(query)
    
    primary_model = ADVANCED_MODEL if is_complex else LIGHTWEIGHT_MODEL
    fallback_model = ADVANCED_MODEL if primary_model == LIGHTWEIGHT_MODEL else LIGHTWEIGHT_MODEL

    try:
        # Attempt completion with the chosen primary model
        response = completion(
            model=primary_model,
            messages=messages,
            fallbacks=[fallback_model], 
            temperature=0.7
        )
        model_used = response.model
        content = response.choices[0].message.content
        
        # 2. Save to Redis Cache (expire in 24 hours for example)
        try:
            redis_client.setex(cache_key, 86400, content)
        except Exception as e:
            print(f"Redis cache write error: {e}")
        
        return {"content": content, "model_used": model_used}
        
    except Exception as e:
        # Handle severe errors if all fallbacks fail
        print(f"Error during AI generation: {e}")
        return {"content": "I apologize, but I am currently unable to process your request.", "model_used": "error"}

async def stream_chat_query(messages: list, query: str):
    """
    Asynchronous generator that streams the AI response.
    """
    cache_key = get_cache_key(messages)
    try:
        cached_response = redis_client.get(cache_key)
        if cached_response:
            # Yield cached response as a single chunk instantly
            yield cached_response
            return
    except Exception as e:
        print(f"Redis cache read error: {e}")

    is_complex = analyze_query_complexity(query)
    
    primary_model = ADVANCED_MODEL if is_complex else LIGHTWEIGHT_MODEL
    fallback_model = ADVANCED_MODEL if primary_model == LIGHTWEIGHT_MODEL else LIGHTWEIGHT_MODEL

    try:
        response_stream = await acompletion(
            model=primary_model,
            messages=messages,
            fallbacks=[fallback_model], 
            temperature=0.7,
            stream=True
        )
        
        full_content = ""
        async for chunk in response_stream:
            content_chunk = chunk.choices[0].delta.content
            if content_chunk:
                full_content += content_chunk
                yield content_chunk
                
        # Save to Redis Cache (expire in 24 hours) after stream finishes
        try:
            redis_client.setex(cache_key, 86400, full_content)
        except Exception as e:
            print(f"Redis cache write error: {e}")
            
    except Exception as e:
        print(f"Error during AI stream generation: {e}")
        yield " I apologize, but I am currently unable to process your request."

async def summarize_text(text: str) -> str:
    """
    Summarize text using the lightweight model to save costs.
    """
    messages = [{"role": "system", "content": "You are a helpful assistant that summarizes text concisely."},
                {"role": "user", "content": f"Summarize the following note:\n\n{text}"}]
    try:
        response = await acompletion(
            model=LIGHTWEIGHT_MODEL,
            messages=messages,
            fallbacks=[ADVANCED_MODEL], 
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error during summarization: {e}")
        return "Failed to generate summary."

async def generate_study_material(topic: str, difficulty: str) -> AIStudyMaterial:
    """
    Generate flashcards and quizzes for a given topic and difficulty.
    Uses the advanced model to ensure strict JSON formatting.
    """
    messages = [
        {
            "role": "system", 
            "content": f"You are an expert tutor creating study materials for a {difficulty} level student. You must return your response in strictly valid JSON matching the requested schema. Generate exactly 5 flashcards and 3 multiple-choice questions."
        },
        {
            "role": "user", 
            "content": f"Create study materials for the topic: {topic}"
        }
    ]
    
    try:
        response = await acompletion(
            model=ADVANCED_MODEL,
            messages=messages,
            response_format=AIStudyMaterial,
            temperature=0.4
        )
        # response.choices[0].message.content should be a JSON string matching the schema
        content = response.choices[0].message.content
        return AIStudyMaterial.model_validate_json(content)
    except Exception as e:
        print(f"Error generating study materials: {e}")
        # Fallback empty material
        return AIStudyMaterial(flashcards=[], quizzes=[])
