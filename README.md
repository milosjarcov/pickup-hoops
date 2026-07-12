# 🏀 Pickup Hoops

Find and join pickup basketball runs at real courts around Montreal.

Pick a court on the map, see who's playing, post a run or join one.

## Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React (Vite), react-leaflet, react-router          |
| Backend  | FastAPI, SQLAlchemy 2.0                            |
| Database | SQLite locally, PostgreSQL in production           |
| Auth     | Email + password (bcrypt) with JWT bearer tokens   |

## Features (v1)

- Interactive map of Montreal courts (7 real parks seeded)
- Register / log in
- Post a run: court, date/time, skill level, max players
- Join or leave a run; hosts can cancel their runs
- Full-run and permission rules enforced server-side

## Running locally

**Backend** (Python 3.11+):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows — on macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python seed.py                # creates app.db and seeds the courts
uvicorn app.main:app --reload
```

API runs at http://localhost:8000 — interactive docs at http://localhost:8000/docs.

**Frontend** (Node 20+):

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173.

## Architecture notes

```
backend/app/
├── main.py        app wiring: CORS, routers, table creation
├── database.py    engine + session factory (DATABASE_URL env var, SQLite fallback)
├── models.py      SQLAlchemy models: users, courts, runs, run_players
├── schemas.py     Pydantic request/response shapes (what goes over the wire)
├── security.py    bcrypt hashing, JWT create/decode, get_current_user dependency
└── routers/       auth, courts, runs endpoints

frontend/src/
├── api.js         single fetch wrapper (auth header, error handling)
├── AuthContext.jsx token + current user, persisted in localStorage
├── pages/         Login, Register, MapPage
└── components/    CourtPanel (runs per court), RunForm
```

Decisions worth calling out:

- **Models vs. schemas** are separate on purpose: models describe database rows,
  schemas describe JSON. `password_hash` can never leak into a response because
  responses are filtered through `UserOut`.
- **Stateless auth**: the JWT carries the user id and expiry, signed with
  `SECRET_KEY` — no server-side session storage.
- **Server is the source of truth**: after join/leave/post the frontend
  re-fetches instead of mutating local state; all rules (run full, host-only
  cancel, duplicate join) are enforced in the API.
- `Base.metadata.create_all` stands in for real migrations; Alembic is the
  natural next step once the schema changes.

## Environment variables

| Variable          | Where    | Purpose                                        |
| ----------------- | -------- | ---------------------------------------------- |
| `DATABASE_URL`    | backend  | Postgres URL in prod (defaults to local SQLite) |
| `SECRET_KEY`      | backend  | JWT signing key — set a long random value       |
| `FRONTEND_ORIGIN` | backend  | Deployed frontend URL, for CORS                 |
| `VITE_API_URL`    | frontend | Deployed backend URL (defaults to localhost)    |

## Deploying

**Backend → Render** (web service):

- Root directory `backend`, build `pip install -r requirements.txt`,
  start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add a Render PostgreSQL instance and set `DATABASE_URL` to its URL
  (SQLite won't survive on Render — the disk is ephemeral)
- Set `SECRET_KEY` and `FRONTEND_ORIGIN`; run `python seed.py` once from the
  Render shell to seed courts

**Frontend → Vercel**:

- Root directory `frontend`, framework preset Vite
- Set `VITE_API_URL` to the Render backend URL
- `vercel.json` already contains the SPA rewrite so client-side routes work on refresh
