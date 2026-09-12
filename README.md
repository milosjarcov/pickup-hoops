# Pickup Hoops

Find and join pickup basketball runs at real courts around Montreal. The map
shows every court in the city, which ones have runs posted, and which ones are
about to start. Pick a run, see who is playing, join it.

## Stack

- **Frontend:** React (Vite), react-leaflet, react-router
- **Backend:** FastAPI, SQLAlchemy
- **Database:** SQLite locally, PostgreSQL in production
- **Auth:** email + password (bcrypt), JWT tokens

## Features

- Interactive map of Montreal courts, with markers that reflect activity:
  outlined when quiet, filled when runs are posted, pulsing when one starts
  within three hours
- A city-wide list of upcoming runs, so the app has content before any click
- Post a run: court, date/time, skill level, max players
- Join or leave a run; hosts can cancel their own. Join and leave are
  idempotent, since someone browsing signed out cannot know whether they are
  already on a roster
- Register / log in, or one click into a shared demo account

## Browsing is public

Courts and runs are readable without an account. Nothing redirects to a login
page: a visitor lands straight on the map, and signing in is only prompted at
the moment they try to post, join or leave. The action they were attempting is
replayed once they are in, so nothing is lost to the interruption.

`POST /auth/demo` returns a token for a shared demo account (seeded by
`seed.py`, no special privileges) so the app can be tried without signing up.
Credentials are `demo@pickuphoops.app` / `hoopsdemo123` if you would rather use
the form.

## Design

Court paint: the palette and hardware of a municipal outdoor court. Asphalt
cream ground, court-line black, key blue, ball orange. Everything is drawn with
a real 2px line the way court markings are painted, and the hard offset shadow
is rationed to the things you can actually act on, so cards and primary buttons
lift off the page while tags and inputs sit flat on it.

One typeface throughout, Bricolage Grotesque, worked across its weight range
rather than paired with a second family. Colour is never decorative: orange
means a run is posted or an action is primary, blue means something is starting
soon, and everything else is ink on asphalt. All of it lives in
`frontend/src/index.css` as CSS custom properties.

The map uses standard OpenStreetMap raster tiles desaturated and warmed with a
CSS filter on the tile pane, so it sits under the interface instead of
competing with it, and there is no API key or paid basemap. Markers are Leaflet
`divIcon`s, which means they are plain HTML styled from the same stylesheet.

## Running locally

Backend (Python 3.11+):

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload
```

API at http://localhost:8000, docs at http://localhost:8000/docs.

`seed.py` is safe to re-run. It creates the courts, the demo account and a
week of runs, and only adds runs when nothing upcoming is left, so a demo
server refills itself instead of showing an empty map. `python seed.py
--refresh` rebuilds the schedule from scratch.

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

- **Backend:** Render web service, root dir `backend`, start command
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Use a Render Postgres
  instance for `DATABASE_URL`, and run `python seed.py` once after the first
  deploy so the map is not empty.
- **Frontend:** Vercel, root dir `frontend`, set `VITE_API_URL`.
