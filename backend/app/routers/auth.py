from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import LoginRequest, RegisterRequest, Token, UserOut
from ..security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    email = body.email.lower()
    exists = db.scalar(select(User).where(User.email == email))
    if exists:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(name=body.name, email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)  # populates user.id from the database
    return Token(access_token=create_access_token(user.id))


@router.post("/login", response_model=Token)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    # Same error whether the email or the password is wrong — don't leak which.
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return Token(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user
