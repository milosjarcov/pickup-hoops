from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field

# Guest accounts get a made-up address on this domain (example.com is reserved
# for exactly this kind of use, so it can never belong to a real person).
GUEST_EMAIL_DOMAIN = "guest.example.com"


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
    """The signed-in user's own profile. Only /auth/me returns this."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr

    @computed_field
    @property
    def is_guest(self) -> bool:
        return self.email.endswith("@" + GUEST_EMAIL_DOMAIN)


class PlayerOut(BaseModel):
    """Another player, as the public sees them: a name, never an email."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


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
    # PlayerOut, not UserOut: GET /runs is public, so it must not leak emails.
    host: PlayerOut
    players: list[PlayerOut]
