from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Court, Run, User
from ..schemas import RunCreate, RunOut
from ..security import get_current_user

router = APIRouter(prefix="/runs", tags=["runs"])


def get_run_or_404(run_id: int, db: Session) -> Run:
    run = db.get(Run, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@router.get("", response_model=list[RunOut])
def list_runs(court_id: int | None = None, db: Session = Depends(get_db)):
    """Upcoming runs, optionally filtered to one court."""
    query = select(Run).where(Run.starts_at >= datetime.now()).order_by(Run.starts_at)
    if court_id is not None:
        query = query.where(Run.court_id == court_id)
    return db.scalars(query).all()


@router.post("", response_model=RunOut, status_code=201)
def create_run(
    body: RunCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if db.get(Court, body.court_id) is None:
        raise HTTPException(status_code=404, detail="Court not found")

    # Store naive local time; SQLite has no timezone support and v1 is Montreal-only.
    starts_at = body.starts_at.replace(tzinfo=None)
    if starts_at <= datetime.now():
        raise HTTPException(status_code=422, detail="Run must start in the future")

    run = Run(
        court_id=body.court_id,
        host_id=current_user.id,
        starts_at=starts_at,
        skill_level=body.skill_level,
        max_players=body.max_players,
        players=[current_user],  # host is automatically in
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


@router.delete("/{run_id}", status_code=204)
def delete_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    run = get_run_or_404(run_id, db)
    if run.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the host can cancel a run")
    db.delete(run)
    db.commit()


@router.post("/{run_id}/join", response_model=RunOut)
def join_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    run = get_run_or_404(run_id, db)
    if current_user in run.players:
        raise HTTPException(status_code=409, detail="Already joined this run")
    if len(run.players) >= run.max_players:
        raise HTTPException(status_code=409, detail="Run is full")
    run.players.append(current_user)
    db.commit()
    db.refresh(run)
    return run


@router.post("/{run_id}/leave", response_model=RunOut)
def leave_run(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    run = get_run_or_404(run_id, db)
    if current_user not in run.players:
        raise HTTPException(status_code=409, detail="You are not in this run")
    run.players.remove(current_user)
    db.commit()
    db.refresh(run)
    return run
