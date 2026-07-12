"""Seed the courts table with real Montreal courts. Run from backend/:

    .venv/Scripts/python seed.py

Safe to re-run: does nothing if courts already exist.
"""
from app.database import Base, SessionLocal, engine
from app.models import Court

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


def seed():
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.query(Court).count() > 0:
            print("Courts already seeded, nothing to do.")
            return
        db.add_all(COURTS)
        db.commit()
        print(f"Seeded {len(COURTS)} courts.")


if __name__ == "__main__":
    seed()
