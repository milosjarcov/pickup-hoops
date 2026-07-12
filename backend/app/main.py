import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401 — importing registers the tables on Base
from .database import Base, engine
from .routers import auth, courts, runs

# Fine for v1; a real migration tool (Alembic) replaces this once the schema evolves.
Base.metadata.create_all(engine)

app = FastAPI(title="Pickup Hoops API")

# The browser blocks cross-origin requests unless the API explicitly allows
# the frontend's origin. Locally that's Vite's dev server; in prod, Vercel.
origins = ["http://localhost:5173"]
if os.getenv("FRONTEND_ORIGIN"):
    origins.append(os.getenv("FRONTEND_ORIGIN"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(courts.router)
app.include_router(runs.router)


@app.get("/")
def health():
    return {"status": "ok"}
