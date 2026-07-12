from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---- auth ----

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)  # bcrypt ignores bytes past 72


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr


# ---- courts ----

class CourtOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    latitude: float
    longitude: float
    address: str


# ---- runs ----

class RunCreate(BaseModel):
    court_id: int
    starts_at: datetime
    skill_level: Literal["casual", "intermediate", "competitive"]
    max_players: int = Field(ge=2, le=30)


class RunOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    court_id: int
    starts_at: datetime
    skill_level: str
    max_players: int
    host: UserOut
    players: list[UserOut]
