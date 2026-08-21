from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# bcrypt silently truncates passwords to 72 bytes; enforce it to avoid surprises
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"

def _truncate_secret(value: str) -> bytes:
    encoded = value.encode("utf-8")
    return encoded[:72] if len(encoded) > 72 else encoded

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        plain = _truncate_secret(plain_password)
        return pwd_context.verify(plain, hashed_password)
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    plain = _truncate_secret(password)
    return pwd_context.hash(plain)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except JWTError:
        return None