from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Column
from sqlalchemy import JSON
from sqlmodel import Field
from sqlmodel import SQLModel


class Exercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(index=True, unique=True)
    name: str = Field(index=True)
    muscle_group: str
    equipment: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    source_type: str = Field(default="local")
    source_value: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ExerciseAlias(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    exercise_id: int = Field(foreign_key="exercise.id")
    name: str = Field(index=True)


class Workout(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: Optional[str] = Field(default=None, index=True)
    title: str
    status: str = Field(default="draft")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    deleted_at: Optional[datetime] = Field(default=None, index=True)


class WorkoutExercise(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: Optional[str] = Field(default=None, index=True)
    workout_id: int = Field(foreign_key="workout.id")
    exercise_id: int = Field(foreign_key="exercise.id")
    order_index: int = Field(default=0, index=True)
    planned_sets: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    deleted_at: Optional[datetime] = Field(default=None, index=True)


class WorkoutSet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: Optional[str] = Field(default=None, index=True)
    workout_exercise_id: int = Field(foreign_key="workoutexercise.id")
    reps: int
    weight: Optional[float] = None
    rpe: Optional[float] = None
    done_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    deleted_at: Optional[datetime] = Field(default=None, index=True)


class SyncEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    action: str
    payload: dict = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: Optional[str] = None
    consent_to_public_share: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class RefreshToken(SQLModel, table=True):
    token: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Share(SQLModel, table=True):
    share_id: str = Field(primary_key=True)
    owner_id: str = Field(foreign_key="user.id")
    owner_username: str
    workout_title: str
    exercise_count: int
    set_count: int
    snapshot: dict = Field(sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Follower(SQLModel, table=True):
    follower_id: str = Field(foreign_key="user.id", primary_key=True)
    followed_id: str = Field(foreign_key="user.id", primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Programmes structurés (multi-séances)
class Program(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[str] = Field(default=None, index=True)
    title: str
    objective: Optional[str] = None
    duration_weeks: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProgramSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    program_id: int = Field(foreign_key="program.id")
    day_index: int = Field(default=0, index=True)
    title: str
    focus: Optional[str] = None
    estimated_minutes: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProgramSet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    program_session_id: int = Field(foreign_key="programsession.id")
    exercise_slug: str
    reps: Optional[str] = None
    weight: Optional[float] = None
    rpe: Optional[float] = None
    order_index: int = Field(default=0, index=True)
    notes: Optional[str] = None


class Story(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: str = Field(foreign_key="user.id", index=True)
    owner_username: str
    media_url: str
    title: str
    link: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    expires_at: datetime | None = None
