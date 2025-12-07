from contextlib import asynccontextmanager

from fastapi import FastAPI

from .db import init_db
from .routes import exercises
from .routes import feed
from .routes import health
from .routes import programs
from .routes import stories
from .routes import users_stats
from .routes import share
from .routes import auth
from .routes import shared_workouts
from .routes import sync
from .routes import users


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Gorillax API", version="0.1.0", lifespan=lifespan)


app.include_router(health.router)
app.include_router(exercises.router)
app.include_router(share.router)
app.include_router(feed.router)
app.include_router(shared_workouts.router)
app.include_router(sync.router)
app.include_router(users.router)
app.include_router(programs.router)
app.include_router(stories.router)
app.include_router(users_stats.router)
app.include_router(auth.router)


@app.get("/", tags=["meta"], summary="API metadata")
async def read_root() -> dict[str, str]:
    return {"status": "running"}
