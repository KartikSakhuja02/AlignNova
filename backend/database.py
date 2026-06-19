import os
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, inspect, text
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
    role = Column(String, default="student")
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    enrollment_id = Column(String, nullable=True, default="")
    location = Column(String, nullable=True, default="")
    linkedin_url = Column(String, nullable=True, default="")
    website_url = Column(String, nullable=True, default="")
    headline = Column(String, nullable=True, default="")
    bio = Column(String, nullable=True, default="")
    education = Column(String, nullable=True, default="[]")
    experience = Column(String, nullable=True, default="[]")
    profile_image = Column(String, nullable=True, default="")
    must_change_password = Column(String, nullable=True, default="0")  # "1" = must change on next login
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
    try:
        inspector = inspect(engine)
        if "users" in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns("users")]
            new_cols = {
                "enrollment_id": "VARCHAR(255) DEFAULT ''",
                "location": "VARCHAR(255) DEFAULT ''",
                "linkedin_url": "VARCHAR(255) DEFAULT ''",
                "website_url": "VARCHAR(255) DEFAULT ''",
                "headline": "VARCHAR(255) DEFAULT ''",
                "bio": "TEXT DEFAULT ''",
                "education": "TEXT DEFAULT '[]'",
                "experience": "TEXT DEFAULT '[]'",
                "profile_image": "TEXT DEFAULT ''",
                "must_change_password": "VARCHAR(4) DEFAULT '0'"
            }
            for col_name, col_type in new_cols.items():
                if col_name not in columns:
                    with engine.connect() as conn:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"Database migration: Added {col_name} column to users table.")
    except Exception as e:
        print(f"Database migration warning: {e}")


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
            "enrollment_id": user.enrollment_id,
            "location": user.location,
            "linkedin_url": user.linkedin_url,
            "website_url": user.website_url,
            "headline": user.headline,
            "bio": user.bio,
            "education": user.education,
            "experience": user.experience,
            "profile_image": user.profile_image,
            "must_change_password": user.must_change_password or "0",
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
            "enrollment_id": user.enrollment_id,
            "location": user.location,
            "linkedin_url": user.linkedin_url,
            "website_url": user.website_url,
            "headline": user.headline,
            "bio": user.bio,
            "education": user.education,
            "experience": user.experience,
            "profile_image": user.profile_image,
            "id": user.id,
        }


def update_profile(username: str, full_name: str | None = None, email: str | None = None, phone: str | None = None, enrollment_id: str | None = None, location: str | None = None, linkedin_url: str | None = None, website_url: str | None = None, headline: str | None = None, bio: str | None = None, education: str | None = None, experience: str | None = None, profile_image: str | None = None):
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
        if enrollment_id is not None:
            user.enrollment_id = enrollment_id
        if location is not None:
            user.location = location
        if linkedin_url is not None:
            user.linkedin_url = linkedin_url
        if website_url is not None:
            user.website_url = website_url
        if headline is not None:
            user.headline = headline
        if bio is not None:
            user.bio = bio
        if education is not None:
            user.education = education
        if experience is not None:
            user.experience = experience
        if profile_image is not None:
            user.profile_image = profile_image
        db.add(user)
        db.commit()
        db.refresh(user)
        return get_user(username)


def update_password(username: str, new_hashed_password: str) -> bool:
    """Update a user's password and clear the must_change_password flag."""
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return False
        user.hashed_password = new_hashed_password
        user.must_change_password = "0"
        db.add(user)
        db.commit()
        return True


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


def list_users(role_filter: str = "student"):
    with SessionLocal() as db:
        users = db.query(User).filter(User.role == role_filter).order_by(User.created_at.desc()).all()
        return [
            {
                "id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "email": u.email,
                "phone": u.phone,
                "enrollment_id": u.enrollment_id,
                "role": u.role,
                "headline": u.headline,
                "profile_image": u.profile_image,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ]


def create_user(username: str, hashed_password: str, role: str = "student", full_name: str | None = None, email: str | None = None, phone: str | None = None, enrollment_id: str | None = None, must_change_password: str = "0"):
    with SessionLocal() as db:
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            raise ValueError("user_exists")
        user = User(
            username=username, hashed_password=hashed_password, role=role,
            full_name=full_name, email=email, phone=phone,
            enrollment_id=enrollment_id, must_change_password=must_change_password
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return get_user(username)
