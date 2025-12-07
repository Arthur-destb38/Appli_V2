from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlmodel import select

from ..db import get_session
from ..models import Exercise
from ..schemas import (
    ExerciseCreate,
    ExerciseRead,
)
from ..utils.slug import make_exercise_slug

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=list[ExerciseRead], summary="List exercises")
def list_exercises(session=Depends(get_session)) -> list[ExerciseRead]:
    statement = select(Exercise)
    results = session.exec(statement).all()
    return [ExerciseRead.model_validate(result) for result in results]


@router.get(
    "/{exercise_id}",
    response_model=ExerciseRead,
    summary="Get exercise by id",
)
def get_exercise(exercise_id: int, session=Depends(get_session)) -> ExerciseRead:
    exercise = session.get(Exercise, exercise_id)
    if exercise is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise {exercise_id} not found",
        )
    return ExerciseRead.model_validate(exercise)


@router.post("", response_model=ExerciseRead, status_code=status.HTTP_201_CREATED)
def create_exercise(
    payload: ExerciseCreate,
    session=Depends(get_session),
) -> ExerciseRead:
    slug = make_exercise_slug(payload.name, payload.muscle_group)
    existing = session.exec(select(Exercise).where(Exercise.slug == slug)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "reason": "duplicate",
                "exercise": ExerciseRead.model_validate(existing).model_dump(mode="json"),
            },
        )

    exercise = Exercise(
        slug=slug,
        name=payload.name,
        muscle_group=payload.muscle_group,
        equipment=payload.equipment,
        description=payload.description,
        image_url=payload.image_url,
        source_type=payload.source_type,
        source_value=payload.source_value,
    )
    session.add(exercise)
    session.commit()
    session.refresh(exercise)
    return ExerciseRead.model_validate(exercise)


@router.post("/bulk", response_model=list[ExerciseRead], status_code=status.HTTP_201_CREATED)
def create_exercises_bulk(
    payloads: list[ExerciseCreate] = Body(...),
    session=Depends(get_session),
) -> list[ExerciseRead]:
    exercises = []
    for payload in payloads:
        slug = make_exercise_slug(payload.name, payload.muscle_group)
        existing = session.exec(select(Exercise).where(Exercise.slug == slug)).first()
        if existing:
            continue
        exercises.append(
            Exercise(
                slug=slug,
                name=payload.name,
                muscle_group=payload.muscle_group,
                equipment=payload.equipment,
                description=payload.description,
                image_url=payload.image_url,
                source_type=payload.source_type,
                source_value=payload.source_value,
            )
        )
    session.add_all(exercises)
    session.commit()
    refreshed: list[ExerciseRead] = []
    for exercise in exercises:
        session.refresh(exercise)
        refreshed.append(ExerciseRead.model_validate(exercise))
    return refreshed
