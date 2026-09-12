"""Seed courts, a demo account and a week of runs. Run from backend/:

    .venv/bin/python seed.py            # macOS / Linux
    .venv\\Scripts\\python seed.py       # Windows

Safe to re-run. Courts and users are only created if missing, and runs are
only created when nothing upcoming is left, so a long-running demo server
refills itself instead of showing an empty map.

    python seed.py --refresh            # wipe upcoming runs and rebuild them
"""
import sys
from datetime import datetime, timedelta

from sqlalchemy import select

from app.database import Base, SessionLocal, engine
from app.models import Court, Run, User
from app.routers.auth import DEMO_EMAIL
from app.security import hash_password

DEMO_PASSWORD = "hoopsdemo123"

COURTS = [
    Court(name="Jeanne-Mance Park", latitude=45.5142, longitude=-73.5852,
          address="Av. du Parc & Av. Duluth, Montreal, QC"),
    Court(name="La Fontaine Park", latitude=45.5227, longitude=-73.5695,
          address="3819 Av. Calixa-Lavallée, Montreal, QC"),
    Court(name="Jarry Park", latitude=45.5322, longitude=-73.6284,
          address="205 Rue Gary-Carter, Montreal, QC"),
    Court(name="Kent Park", latitude=45.4963, longitude=-73.6316,
          address="Av. de Kent & Ch. de la Côte-des-Neiges, Montreal, QC"),
    Court(name="NDG Park", latitude=45.4707, longitude=-73.6155,
          address="Av. Girouard & Rue Sherbrooke O, Montreal, QC"),
    Court(name="Père-Marquette Park", latitude=45.5391, longitude=-73.5926,
          address="1600 Rue de Bellechasse, Montreal, QC"),
    Court(name="Laurier Park", latitude=45.5287, longitude=-73.5878,
          address="Av. Laurier E & Rue de Mentana, Montreal, QC"),
]

# Regulars who fill out the rosters. Nobody logs in as these.
PLAYERS = [
    "Andre Dubois", "Malik Chen", "Sam Rivard", "Tariq Bell", "Jon Okafor",
    "Luc Tremblay", "Dev Patel", "Chris Nadeau", "Ade Lawal", "Rami Haddad",
    "Theo Gagne", "Nico Russo", "Paul Kim", "Yanis Ould", "Marc Belanger",
    "Ben Cote", "Sid Arora", "Omar Diallo", "Max Leduc", "Ian Fortin",
]

# (court index, hours from now, skill, max players, how many are in,
#  is the demo user already playing)
SCHEDULE = [
    (0, 2,   "competitive",  10, 8,  True),   # pulses on the map as "starting soon"
    (2, 5,   "casual",        8, 3,  True),
    (1, 23,  "intermediate", 10, 6,  False),
    (4, 27,  "competitive",  10, 10, False),  # full, so Join shows disabled
    (5, 30,  "casual",       12, 4,  False),
    (3, 49,  "intermediate", 10, 2,  False),
    (1, 54,  "casual",       10, 7,  False),
    (2, 73,  "competitive",   8, 5,  False),
    (0, 96,  "intermediate", 10, 4,  False),
    (6, 121, "casual",       12, 3,  False),
]


def seed_courts(db):
    if db.scalar(select(Court).limit(1)):
        return db.scalars(select(Court)).all(), 0
    db.add_all(COURTS)
    db.commit()
    return db.scalars(select(Court)).all(), len(COURTS)


def seed_users(db):
    created = 0
    demo = db.scalar(select(User).where(User.email == DEMO_EMAIL))
    if demo is None:
        demo = User(name="Demo Player", email=DEMO_EMAIL,
                    password_hash=hash_password(DEMO_PASSWORD))
        db.add(demo)
        created += 1

    # One shared throwaway hash for the filler accounts: hashing 20 separate
    # passwords with bcrypt is slow and none of them are ever used to log in.
    filler_hash = hash_password("not-a-real-login-account")
    regulars = []
    for name in PLAYERS:
        email = name.lower().replace(" ", ".") + "@example.com"
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(name=name, email=email, password_hash=filler_hash)
            db.add(user)
            created += 1
        regulars.append(user)

    db.commit()
    return demo, regulars, created


def seed_runs(db, courts, demo, regulars):
    now = datetime.now()
    for court_i, hours, skill, max_players, taken, demo_plays in SCHEDULE:
        court = courts[court_i % len(courts)]
        # A regular always fills the first slot, because roster[0] becomes the
        # host and "Hosted by Demo Player" looks like test data to a visitor.
        wanted = min(taken, max_players) - (1 if demo_plays else 0)
        roster = []
        # Offset the slice per run so the same faces are not in everything.
        start = (court_i * 3 + hours) % len(regulars)
        while len(roster) < wanted:
            candidate = regulars[start % len(regulars)]
            if candidate not in roster:
                roster.append(candidate)
            start += 1
        if demo_plays:
            roster.append(demo)

        db.add(Run(
            court_id=court.id,
            host_id=roster[0].id,
            starts_at=now + timedelta(hours=hours),
            skill_level=skill,
            max_players=max_players,
            players=roster,
        ))
    db.commit()
    return len(SCHEDULE)


def seed(refresh=False):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        courts, new_courts = seed_courts(db)
        demo, regulars, new_users = seed_users(db)

        upcoming = db.scalars(select(Run).where(Run.starts_at >= datetime.now())).all()
        if refresh:
            for run in upcoming:
                db.delete(run)
            db.commit()
            upcoming = []

        new_runs = 0
        if upcoming:
            print(f"{len(upcoming)} upcoming runs already scheduled, leaving them alone.")
        else:
            new_runs = seed_runs(db, courts, demo, regulars)

        print(f"Courts: +{new_courts} (total {len(courts)})")
        print(f"Users:  +{new_users}")
        print(f"Runs:   +{new_runs}")
        print(f"Demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    seed(refresh="--refresh" in sys.argv)
