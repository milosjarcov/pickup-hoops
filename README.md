# Pickup Hoops

Find and join pickup basketball runs at real courts around Montreal. Pick a court on the map, see who's playing, post a run or join one.

## Stack

- **Frontend:** React (Vite), react-router, Leaflet with a MapLibre GL vector basemap from [OpenFreeMap](https://openfreemap.org) (no API key)
- **Backend:** FastAPI, SQLAlchemy
- **Database:** SQLite locally, PostgreSQL in production
- **Auth:** email + password (bcrypt), JWT tokens

## Features

- Landing page with a scroll-driven 3D map tour, live stats from the API, and a look at the architecture
- Browse every court and run without an account; sign in only to join or post
- One-tap guest accounts, so anyone can try the full app without an email
- Map of Montreal courts with search, and each court's next run at a glance
- Register / log in
- Post a run: court, date/time, skill level, max players
- Join or leave a run; hosts can cancel their own
- Light and dark appearance that follows the system setting
- Works on phones: the court list becomes a bottom sheet over the map

## Running locally

Backend (Python 3.11+):

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python seed.py --demo       # courts, plus demo players and a week of runs
uvicorn app.main:app --reload
```

API at http://localhost:8000, docs at http://localhost:8000/docs.

Frontend (Node 20+):

```bash
cd frontend
npm install
npm run dev
```

App at http://localhost:5173.

## Environment variables

| Variable          | Where    | Purpose                                         |
| ----------------- | -------- | ----------------------------------------------- |
| `DATABASE_URL`    | backend  | Postgres URL in prod (defaults to local SQLite)  |
| `SECRET_KEY`      | backend  | JWT signing key                                  |
| `FRONTEND_ORIGIN` | backend  | Deployed frontend URL, for CORS                  |
| `VITE_API_URL`    | frontend | Deployed backend URL (defaults to localhost)     |

## Deploying

- **Backend:** Render web service, root dir `backend`, start command `python seed.py --demo && uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Use a Render Postgres instance for `DATABASE_URL`. The seed step is safe to repeat and tops the demo back up to a week of upcoming runs, so every restart keeps the map from going empty.
- **Frontend:** Vercel, root dir `frontend`, set `VITE_API_URL`.
