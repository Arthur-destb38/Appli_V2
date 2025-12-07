from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from ..db import get_session
from ..models import User, Share

router = APIRouter(prefix="/users", tags=["users-stats"])


@router.get("/{user_id}/stats")
def get_user_stats(user_id: str, session: Session = Depends(get_session)) -> dict:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user_not_found")

    shares = session.exec(select(Share).where(Share.owner_id == user_id)).all()
    sessions = len(shares)
    volume = 0.0
    best_lift = 0.0
    for share in shares:
        for ex in share.snapshot.get("exercises", []):
            for s in ex.get("sets", []):
                reps = s.get("reps") or 0
                weight = s.get("weight") or 0
                if isinstance(reps, str):
                    try:
                        reps = int(reps.split("x")[-1])
                    except Exception:
                        reps = 0
                try:
                    w = float(weight)
                except Exception:
                    w = 0
                volume += reps * w
                best_lift = max(best_lift, w)

    return {
        "user_id": user_id,
        "username": user.username,
        "sessions": sessions,
        "volume": volume,
        "best_lift": best_lift,
    }
