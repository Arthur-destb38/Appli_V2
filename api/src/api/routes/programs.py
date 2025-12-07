from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
import random
from collections import defaultdict

from ..db import get_session
from ..models import Program, ProgramSession, ProgramSet, Exercise
from ..schemas import ProgramCreate, ProgramRead

router = APIRouter(prefix="/programs", tags=["programs"])


class GenerateProgramRequest(BaseModel):
    title: str = "Programme personnalisé"
    objective: Optional[str] = None
    duration_weeks: int = 4
    frequency: int = 3
    user_id: Optional[str] = None
    exercises_per_session: int = 4


def _upsert_program(session: Session, payload: ProgramCreate) -> Program:
    program = Program(
        title=payload.title,
        objective=payload.objective,
        duration_weeks=payload.duration_weeks,
        user_id=payload.user_id,
    )
    session.add(program)
    session.flush()

    for sess in payload.sessions:
        prog_session = ProgramSession(
            program_id=program.id,
            day_index=sess.day_index,
            title=sess.title,
            focus=sess.focus,
            estimated_minutes=sess.estimated_minutes,
        )
        session.add(prog_session)
        session.flush()
        for s in sess.sets:
            session.add(
                ProgramSet(
                    program_session_id=prog_session.id,
                    exercise_slug=s.exercise_slug,
                    reps=s.reps,
                    weight=s.weight,
                    rpe=s.rpe,
                    order_index=s.order_index,
                    notes=s.notes,
                )
            )
    return program


@router.get("", response_model=list[ProgramRead], summary="Lister les programmes")
def list_programs(session: Session = Depends(get_session)) -> list[ProgramRead]:
    programs = session.exec(select(Program)).all()
    results: list[ProgramRead] = []
    for prog in programs:
        sessions = session.exec(select(ProgramSession).where(ProgramSession.program_id == prog.id)).all()
        session_reads = []
        for ps in sessions:
            sets = session.exec(select(ProgramSet).where(ProgramSet.program_session_id == ps.id).order_by(ProgramSet.order_index)).all()
            session_reads.append(
                {
                    "id": ps.id,
                    "day_index": ps.day_index,
                    "title": ps.title,
                    "focus": ps.focus,
                    "estimated_minutes": ps.estimated_minutes,
                    "sets": sets,
                }
            )
        results.append(
            ProgramRead(
                id=prog.id,
                title=prog.title,
                objective=prog.objective,
                duration_weeks=prog.duration_weeks,
                user_id=prog.user_id,
                sessions=session_reads,
            )
        )
    return results


@router.post("", response_model=ProgramRead, status_code=status.HTTP_201_CREATED, summary="Créer un programme avec sessions/sets")
def create_program(payload: ProgramCreate, session: Session = Depends(get_session)) -> ProgramRead:
    program = _upsert_program(session, payload)
    session.commit()
    session.refresh(program)

    sessions = session.exec(select(ProgramSession).where(ProgramSession.program_id == program.id)).all()
    session_reads = []
    for ps in sessions:
        sets = session.exec(select(ProgramSet).where(ProgramSet.program_session_id == ps.id).order_by(ProgramSet.order_index)).all()
        session_reads.append(
            {
                "id": ps.id,
                "day_index": ps.day_index,
                "title": ps.title,
                "focus": ps.focus,
                "estimated_minutes": ps.estimated_minutes,
                "sets": sets,
            }
        )

    return ProgramRead(
        id=program.id,
        title=program.title,
        objective=program.objective,
        duration_weeks=program.duration_weeks,
        user_id=program.user_id,
        sessions=session_reads,
    )


@router.get("/{program_id}", response_model=ProgramRead, summary="Détail d'un programme")
def get_program(program_id: int, session: Session = Depends(get_session)) -> ProgramRead:
    program = session.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programme introuvable")
    sessions = session.exec(select(ProgramSession).where(ProgramSession.program_id == program.id)).all()
    session_reads = []
    for ps in sessions:
        sets = session.exec(select(ProgramSet).where(ProgramSet.program_session_id == ps.id).order_by(ProgramSet.order_index)).all()
        session_reads.append(
            {
                "id": ps.id,
                "day_index": ps.day_index,
                "title": ps.title,
                "focus": ps.focus,
                "estimated_minutes": ps.estimated_minutes,
                "sets": sets,
            }
        )
    return ProgramRead(
        id=program.id,
        title=program.title,
        objective=program.objective,
        duration_weeks=program.duration_weeks,
        user_id=program.user_id,
        sessions=session_reads,
    )


@router.post("/generate", response_model=ProgramRead, summary="Générer un programme à partir des exos (inspiré V1)")
def generate_program(payload: GenerateProgramRequest, session: Session = Depends(get_session)) -> ProgramRead:
    exercises = session.exec(select(Exercise)).all()
    if not exercises:
        raise HTTPException(status_code=400, detail="Aucun exercice en base pour générer un programme")

    # Regroupement des exos par groupe musculaire
    by_group: dict[str, list[Exercise]] = defaultdict(list)
    for ex in exercises:
        key = (ex.muscle_group or "full").lower()
        by_group[key].append(ex)

    # Choix du split en fonction de la fréquence
    freq = max(2, min(6, payload.frequency))
    splits: dict[int, list[str]] = {
        2: ["haut", "bas"],
        3: ["push", "pull", "legs"],
        4: ["haut", "bas", "push", "pull"],
        5: ["full", "push", "pull", "legs", "full"],
        6: ["push", "pull", "legs", "push", "pull", "legs"],
    }
    selected_split = splits.get(freq, ["full"] * freq)

    focus_to_groups = {
        "push": ["chest", "shoulders", "triceps", "upper pectorals"],
        "pull": ["back", "lats", "rear delts", "biceps"],
        "legs": ["quads", "hamstrings", "glutes", "posterior_chain", "calves"],
        "haut": ["chest", "shoulders", "back", "lats", "biceps", "triceps"],
        "bas": ["quads", "hamstrings", "glutes", "posterior_chain", "calves"],
        "full": list(by_group.keys()),
    }

    # Objectif -> schéma de reps
    objective = (payload.objective or "").lower()
    if "force" in objective:
        rep_scheme = "4x5-6"
    elif "endurance" in objective:
        rep_scheme = "3x12-15"
    elif "hypertroph" in objective or "masse" in objective or "volume" in objective:
        rep_scheme = "4x8-12"
    else:
        rep_scheme = "3x10"

    rng = random.Random()
    sessions_payload = []

    def pick_for_groups(groups: list[str], k: int) -> list[Exercise]:
        pool: list[Exercise] = []
        for g in groups:
            pool.extend(by_group.get(g, []))
        pool = pool or exercises  # fallback
        rng.shuffle(pool)
        return pool[: min(k, len(pool))]

    for day_index, focus in enumerate(selected_split):
        target_groups = focus_to_groups.get(focus, list(by_group.keys()))
        picked = pick_for_groups(target_groups, payload.exercises_per_session)
        sets_payload = []
        for order_index, ex in enumerate(picked):
            sets_payload.append(
                {
                    "exercise_slug": ex.slug,
                    "reps": rep_scheme,
                    "weight": None,
                    "rpe": None,
                    "order_index": order_index,
                    "notes": ex.description or "",
                }
            )
        sessions_payload.append(
            {
                "day_index": day_index,
                "title": f"Séance {day_index + 1}",
                "focus": focus.capitalize(),
                "estimated_minutes": 60,
                "sets": sets_payload,
            }
        )

    program_create = ProgramCreate(
        title=payload.title,
        objective=payload.objective,
        duration_weeks=payload.duration_weeks,
        user_id=payload.user_id,
        sessions=sessions_payload,
    )
    program = _upsert_program(session, program_create)
    session.commit()
    session.refresh(program)

    sessions_db = session.exec(select(ProgramSession).where(ProgramSession.program_id == program.id)).all()
    session_reads = []
    for ps in sessions_db:
        sets = session.exec(select(ProgramSet).where(ProgramSet.program_session_id == ps.id).order_by(ProgramSet.order_index)).all()
        session_reads.append(
            {
                "id": ps.id,
                "day_index": ps.day_index,
                "title": ps.title,
                "focus": ps.focus,
                "estimated_minutes": ps.estimated_minutes,
                "sets": sets,
            }
        )

    return ProgramRead(
        id=program.id,
        title=program.title,
        objective=program.objective,
        duration_weeks=program.duration_weeks,
        user_id=program.user_id,
        sessions=session_reads,
    )
