from datetime import datetime

from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base

# Pure join table (no extra columns), so a plain Table beats a full model class.
run_players = Table(
    "run_players",
    Base.metadata,
    Column("run_id", ForeignKey("runs.id"), primary_key=True),
    Column("user_id", ForeignKey("users.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    runs_joined: Mapped[list["Run"]] = relationship(
        secondary=run_players, back_populates="players"
    )


class Court(Base):
    __tablename__ = "courts"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    latitude: Mapped[float]
    longitude: Mapped[float]
    address: Mapped[str] = mapped_column(String(255))

    runs: Mapped[list["Run"]] = relationship(back_populates="court")


class Run(Base):
    __tablename__ = "runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    court_id: Mapped[int] = mapped_column(ForeignKey("courts.id"))
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    starts_at: Mapped[datetime]
    skill_level: Mapped[str] = mapped_column(String(20))  # "casual" | "intermediate" | "competitive"
    max_players: Mapped[int]

    court: Mapped[Court] = relationship(back_populates="runs")
    host: Mapped[User] = relationship()
    players: Mapped[list[User]] = relationship(
        secondary=run_players, back_populates="runs_joined"
    )
