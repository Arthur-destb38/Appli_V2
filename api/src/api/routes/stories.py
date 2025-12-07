from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from ..db import get_session
from ..models import Story
from ..schemas import StoryRead

router = APIRouter(prefix="/stories", tags=["stories"])


@router.get("", response_model=list[StoryRead])
def list_stories(limit: int = Query(10, ge=1, le=50), session: Session = Depends(get_session)) -> list[StoryRead]:
  now = datetime.now(timezone.utc)
  statement = select(Story).where((Story.expires_at.is_(None)) | (Story.expires_at > now))
  statement = statement.order_by(Story.created_at.desc()).limit(limit)
  stories = session.exec(statement).all()
  return stories
