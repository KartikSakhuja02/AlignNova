import os
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Use DATABASE_URL from env, fall back to a local sqlite file
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./alignnova.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="patient")
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Drive(Base):
    __tablename__ = "drives"
    id = Column(Integer, primary_key=True, index=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    type = Column(String, nullable=True)
    eligibility = Column(String, nullable=True)
    package = Column(String, nullable=True)
    drive_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    drive_id = Column(Integer, nullable=False)
    status = Column(String, default="submitted")
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_user(username: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        return {
            "username": user.username,
            "hashed_password": user.hashed_password,
            "role": user.role,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "id": user.id,
        }


def get_user_by_email(email: str):
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        return {
            "username": user.username,
            "hashed_password": user.hashed_password,
            "role": user.role,
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "id": user.id,
        }


def update_profile(username: str, full_name: str | None = None, email: str | None = None, phone: str | None = None):
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if full_name is not None:
            user.full_name = full_name
        if email is not None:
            user.email = email
        if phone is not None:
            user.phone = phone
        db.add(user)
        db.commit()
        db.refresh(user)
        return get_user(username)


def create_drive(company: str, role: str, type: str | None = None, eligibility: str | None = None, package: str | None = None, drive_date: str | None = None):
    with SessionLocal() as db:
        drive = Drive(company=company, role=role, type=type, eligibility=eligibility, package=package, drive_date=drive_date)
        db.add(drive)
        db.commit()
        db.refresh(drive)
        return {
            "id": drive.id,
            "company": drive.company,
            "role": drive.role,
            "type": drive.type,
            "eligibility": drive.eligibility,
            "package": drive.package,
            "drive_date": drive.drive_date,
        }


def list_drives():
    with SessionLocal() as db:
        rows = db.query(Drive).order_by(Drive.created_at.desc()).all()
        return [{"id": r.id, "company": r.company, "role": r.role, "type": r.type, "eligibility": r.eligibility, "package": r.package, "drive_date": r.drive_date} for r in rows]


def create_application(user_id: int, drive_id: int):
    with SessionLocal() as db:
        app = Application(user_id=user_id, drive_id=drive_id)
        db.add(app)
        db.commit()
        db.refresh(app)
        return {"id": app.id, "user_id": app.user_id, "drive_id": app.drive_id, "status": app.status}


def list_applications(for_user_id: int | None = None):
    with SessionLocal() as db:
        q = db.query(Application)
        if for_user_id is not None:
            q = q.filter(Application.user_id == for_user_id)
        rows = q.order_by(Application.created_at.desc()).all()
        return [{"id": r.id, "user_id": r.user_id, "drive_id": r.drive_id, "status": r.status} for r in rows]


def create_user(username: str, hashed_password: str, role: str = "patient", full_name: str | None = None, email: str | None = None, phone: str | None = None):
    with SessionLocal() as db:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            raise ValueError("user_exists")
        user = User(username=username, hashed_password=hashed_password, role=role, full_name=full_name, email=email, phone=phone)
        db.add(user)
        db.commit()
        db.refresh(user)
        return get_user(username)
