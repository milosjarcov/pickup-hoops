from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Court
from ..schemas import CourtOut

router = APIRouter(prefix="/courts", tags=["courts"])


@router.get("", response_model=list[CourtOut])
def list_courts(db: Session = Depends(get_db)):
    return db.scalars(select(Court)).all()
