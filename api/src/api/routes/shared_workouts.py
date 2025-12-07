from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from ..db import get_session
from ..models import Share

router = APIRouter(prefix="/workouts/shared", tags=["feed"])

@router.get("/{share_id}")
def get_shared_workout(share_id: str, session: Session = Depends(get_session)) -> dict:
    share = session.get(Share, share_id)
    if share is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="share_not_found")
    return share.snapshot
