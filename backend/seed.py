"""Seed the database. Run from backend/:

    .venv/Scripts/python seed.py           # the 7 real Montreal courts
    .venv/Scripts/python seed.py --demo    # courts + demo players and a week of runs

Safe to re-run. Courts are only added once, and --demo only tops up runs when
fewer than DEMO_TARGET upcoming demo runs are left. That makes it a good
start command on a server that sleeps: every wake-up refreshes the demo.
"""
import random
import secrets
import sys
from datetime import datetime, timedelta

from sqlalchemy import func, select

from app.database import Base, SessionLocal, engine
from app.models import Court, Run, User
from app.security import hash_password

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

# Demo players have addresses on a reserved domain and random passwords, so
# nobody can sign in as them. They exist only to host and fill runs.
DEMO_DOMAIN = "demo.example.com"
DEMO_NAMES = [
    "Jordan Lee", "Nadia Roy", "Theo Martin", "Sam Okafor", "Maya Chen",
    "Luc Gagnon", "Priya Shah", "Marcus Brown", "Élise Tremblay", "Omar Haddad",
]
DEMO_TARGET = 12  # upcoming demo runs to keep on the map
DEMO_DAYS = 7


def seed_courts(db):
    if db.scalar(select(func.count(Court.id))) > 0:
        print("Courts already seeded.")
        return
    db.add_all(COURTS)
    db.commit()
    print(f"Seeded {len(COURTS)} courts.")


def demo_players(db):
    """Fetch the demo players, creating any that are missing."""
    players = []
    for i, name in enumerate(DEMO_NAMES):
        email = f"demo-{i}@{DEMO_DOMAIN}"
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            user = User(name=name, email=email, password_hash=hash_password(secrets.token_urlsafe(32)))
            db.add(user)
        players.append(user)
    db.commit()
    return players


def random_start(rng, now):
    """An evening (or lunchtime) slot sometime in the next week."""
    for _ in range(20):
        day = now + timedelta(days=rng.randrange(DEMO_DAYS))
        hour, minute = rng.choice([(12, 0), (17, 30), (18, 0), (18, 30), (19, 0), (19, 30), (20, 0)])
        start = day.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if start > now + timedelta(hours=1):
            return start
    return (now + timedelta(days=1)).replace(hour=19, minute=0, second=0, microsecond=0)


def seed_demo(db):
    players = demo_players(db)
    now = datetime.now()  # naive local time, same convention as the API
    upcoming = db.scalar(
        select(func.count(Run.id))
        .join(User, Run.host_id == User.id)
        .where(Run.starts_at >= now, User.email.like(f"%@{DEMO_DOMAIN}"))
    )
    missing = DEMO_TARGET - upcoming
    if missing <= 0:
        print(f"{upcoming} upcoming demo runs already, nothing to add.")
        return

    rng = random.Random()
    courts = db.scalars(select(Court)).all()
    for _ in range(missing):
        host = rng.choice(players)
        max_players = rng.choice([8, 10, 10, 10, 12])
        # Mostly half-full runs, with the odd full one so every state shows up.
        filled = max_players if rng.random() < 0.12 else rng.randint(2, max_players - 2)
        others = rng.sample([p for p in players if p is not host], k=min(filled - 1, len(players) - 1))
        db.add(Run(
            court=rng.choice(courts),
            host=host,
            starts_at=random_start(rng, now),
            skill_level=rng.choice(["casual", "casual", "intermediate", "competitive"]),
            max_players=max_players,
            players=[host, *others],
        ))
    db.commit()
    print(f"Added {missing} demo runs.")


if __name__ == "__main__":
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_courts(db)
        if "--demo" in sys.argv:
            seed_demo(db)
