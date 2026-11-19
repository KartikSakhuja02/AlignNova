import os
from dotenv import load_dotenv
from datetime import datetime
from sqlalchemy import Column, DateTime, Index, Integer, LargeBinary, String, create_engine, inspect, text, func
from sqlalchemy.engine import make_url
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import load_only
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

PRODUCTION = os.getenv("APP_ENV", "").lower() == "production" or os.getenv("RENDER") == "true"


def _build_database_engine():
    raw = next((value for key in ("DATABASE_URL", "POSTGRES_URL", "POSTGRESQL_URL")
                if (value := os.getenv(key, "").strip())), "")
    raw = raw.removeprefix("psql ").strip().strip("'\"")
    if not raw:
        if PRODUCTION:
            raise RuntimeError("Production requires a PostgreSQL DATABASE_URL")
        raw = "sqlite:///./alignnova.db"
    if raw.startswith("postgres://"):
        raw = "postgresql://" + raw[len("postgres://"):]
    url = make_url(raw)
    if url.get_backend_name() == "sqlite" and not PRODUCTION:
        return create_engine(url, connect_args={"check_same_thread": False}), raw
    if url.get_backend_name() != "postgresql":
        raise RuntimeError("DATABASE_URL must point to PostgreSQL")
    url = url.set(drivername="postgresql+psycopg")
    if url.host and url.host.endswith(".neon.tech") and "sslmode" not in url.query:
        url = url.update_query_dict({"sslmode": "require"})
    options = {"connect_timeout": 8}
    if url.host and "-pooler." in url.host:
        options["prepare_threshold"] = None
    return create_engine(
        url, connect_args=options, pool_size=3, max_overflow=2,
        pool_timeout=10, pool_pre_ping=True, pool_use_lifo=True,
    ), raw


engine, DATABASE_URL = _build_database_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

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
    resume_name = Column(String, nullable=True, default="")
    resume_url = Column(String, nullable=True, default="")
    is_eligible = Column(Integer, nullable=True, default=0)
    skills = Column(String, nullable=True, default="[]")
    languages = Column(String, nullable=True, default="[]")
    projects = Column(String, nullable=True, default="[]")
    course = Column(String, nullable=True, default="")
    uni_performance = Column(String, nullable=True, default="{}")
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
    
    # Rich details fields
    location = Column(String, nullable=True, default="")
    stipend = Column(String, nullable=True, default="")
    description = Column(String, nullable=True, default="")
    other_benefits = Column(String, nullable=True, default="")
    duration = Column(String, nullable=True, default="")
    eligible_courses = Column(String, nullable=True, default="")
    selection_process = Column(String, nullable=True, default="")
    about_company = Column(String, nullable=True, default="")
    website = Column(String, nullable=True, default="")
    org_size = Column(String, nullable=True, default="")
    contact_person = Column(String, nullable=True, default="")
    responsibilities = Column(String, nullable=True, default="")
    requirements = Column(String, nullable=True, default="")
    tech_stack = Column(String, nullable=True, default="")
    no_active_backlogs = Column(Integer, nullable=True, default=0)
    min_10th_percent = Column(String, nullable=True, default="")
    min_12th_percent = Column(String, nullable=True, default="")
    partner_id = Column(Integer, nullable=True)


class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    drive_id = Column(Integer, nullable=False)
    status = Column(String, default="submitted")
    created_at = Column(DateTime, default=datetime.utcnow)


class OpportunityAlertSent(Base):
    __tablename__ = "opportunity_alerts_sent"
    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, nullable=False, index=True)
    student_id = Column(Integer, nullable=False, index=True)
    sent_at = Column(DateTime, default=datetime.utcnow)



class UsedPasswordToken(Base):
    __tablename__ = "used_password_tokens"
    digest = Column(String(64), primary_key=True)
    expires_at = Column(Integer, nullable=False, index=True)


class StoredUpload(Base):
    __tablename__ = "stored_uploads"
    filename = Column(String, primary_key=True)
    owner_id = Column(Integer, nullable=False, index=True)
    media_type = Column(String, nullable=False)
    content = Column(LargeBinary, nullable=False)


# Create indexes for existing deployments as well as fresh databases.
READ_INDEXES = (
    Index("ix_users_email", User.email),
    Index("ix_users_role_created", User.role, User.created_at),
    Index("ix_applications_user_created", Application.user_id, Application.created_at),
    Index("ix_applications_drive", Application.drive_id),
    Index("ix_applications_status_user", Application.status, Application.user_id),
    Index("ix_drives_created", Drive.created_at),
    Index("ix_alerts_drive_student", OpportunityAlertSent.drive_id, OpportunityAlertSent.student_id),
)


def init_db() -> None:
    import time
    for attempt in range(5):
        try:
            Base.metadata.create_all(bind=engine)
            break
        except Exception as e:
            if attempt < 4:
                print(f"[DATABASE] Waiting for database (attempt {attempt + 1}/5): {e}")
                time.sleep(2)
            else:
                raise RuntimeError("Unable to initialize the database") from e
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        if "users" in tables:
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
                "must_change_password": "VARCHAR(4) DEFAULT '0'",
                "resume_name": "VARCHAR(255) DEFAULT ''",
                "resume_url": "VARCHAR(255) DEFAULT ''",
                "is_eligible": "INTEGER DEFAULT 0",
                "skills": "TEXT DEFAULT '[]'",
                "languages": "TEXT DEFAULT '[]'",
                "projects": "TEXT DEFAULT '[]'",
                "course": "VARCHAR(255) DEFAULT ''",
                "uni_performance": "TEXT DEFAULT '{}'"
            }
            for col_name, col_type in new_cols.items():
                if col_name not in columns:
                    with engine.connect() as conn:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"Database migration: Added {col_name} column to users table.")
        
        if "drives" in tables:
            columns = [col["name"] for col in inspector.get_columns("drives")]
            new_cols = {
                "location": "VARCHAR(255) DEFAULT ''",
                "stipend": "VARCHAR(255) DEFAULT ''",
                "description": "TEXT DEFAULT ''",
                "other_benefits": "TEXT DEFAULT ''",
                "duration": "VARCHAR(255) DEFAULT ''",
                "eligible_courses": "TEXT DEFAULT ''",
                "selection_process": "TEXT DEFAULT ''",
                "about_company": "TEXT DEFAULT ''",
                "website": "VARCHAR(255) DEFAULT ''",
                "org_size": "VARCHAR(255) DEFAULT ''",
                "contact_person": "VARCHAR(255) DEFAULT ''",
                "responsibilities": "TEXT DEFAULT ''",
                "requirements": "TEXT DEFAULT ''",
                "tech_stack": "TEXT DEFAULT ''",
                "no_active_backlogs": "INTEGER DEFAULT 0",
                "min_10th_percent": "VARCHAR(255) DEFAULT ''",
                "min_12th_percent": "VARCHAR(255) DEFAULT ''",
                "partner_id": "INTEGER DEFAULT NULL"
            }
            for col_name, col_type in new_cols.items():
                if col_name not in columns:
                    with engine.connect() as conn:
                        conn.execute(text(f"ALTER TABLE drives ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"Database migration: Added {col_name} column to drives table.")
        for index in READ_INDEXES:
            index.create(bind=engine, checkfirst=True)
    except Exception as exc:
        raise RuntimeError("Database schema setup failed") from exc


def user_dict(user):
    return {
        "username": user.username,
        "hashed_password": user.hashed_password,
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "enrollment_id": user.enrollment_id,
        "course": user.course or "",
        "location": user.location,
        "linkedin_url": user.linkedin_url,
        "website_url": user.website_url,
        "headline": user.headline,
        "bio": user.bio,
        "education": user.education,
        "experience": user.experience,
        "profile_image": user.profile_image,
        "must_change_password": user.must_change_password or "0",
        "resume_name": user.resume_name or "",
        "resume_url": user.resume_url or "",
        "is_eligible": user.is_eligible or 0,
        "skills": user.skills or "[]",
        "languages": user.languages or "[]",
        "projects": user.projects or "[]",
        "uni_performance": user.uni_performance or "{}",
        "id": user.id,
    }


def get_user(username: str):
    with SessionLocal() as db:
        user = db.query(User).filter_by(username=username).first()
        return user_dict(user) if user else None


def get_user_by_email(email: str):
    with SessionLocal() as db:
        user = db.query(User).filter_by(email=email).first()
        return user_dict(user) if user else None


def login_record(identifier):
    identifier = identifier.strip()
    with SessionLocal() as db:
        return (
            db.query(User.username, User.hashed_password, User.role)
            .filter((User.username == identifier) | User.email.in_((identifier, identifier.lower())))
            .order_by((User.username == identifier).desc(), (User.email == identifier).desc(), User.id)
            .first()
        )


def marksheet_filenames(performance):
    import json

    try:
        semesters = json.loads(performance or "{}").get("semesters") or []
    except (AttributeError, ValueError, TypeError):
        return set()
    if not isinstance(semesters, list):
        return set()
    prefix = "/api/uploads/"
    return {
        url[len(prefix):]
        for semester in semesters if isinstance(semester, dict)
        if isinstance(url := semester.get("marksheet_url"), str) and url.startswith(prefix)
    }


def update_profile(username: str, full_name: str | None = None, email: str | None = None, phone: str | None = None, enrollment_id: str | None = None, course: str | None = None, location: str | None = None, linkedin_url: str | None = None, website_url: str | None = None, headline: str | None = None, bio: str | None = None, education: str | None = None, experience: str | None = None, profile_image: str | None = None, resume_name: str | None = None, resume_url: str | None = None, is_eligible: int | None = None, skills: str | None = None, languages: str | None = None, projects: str | None = None, uni_performance: str | None = None):
    with SessionLocal() as db:
        user = db.query(User).filter(User.username == username).with_for_update().first()
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
        if course is not None:
            user.course = course
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
        if resume_name is not None:
            user.resume_name = resume_name
        if resume_url is not None:
            user.resume_url = resume_url
        if is_eligible is not None:
            user.is_eligible = is_eligible
        if skills is not None:
            user.skills = skills
        if languages is not None:
            user.languages = languages
        if projects is not None:
            user.projects = projects
        if uni_performance is not None:
            detached = marksheet_filenames(user.uni_performance) - marksheet_filenames(uni_performance)
            if detached:
                db.query(StoredUpload).filter(
                    StoredUpload.owner_id == user.id, StoredUpload.filename.in_(detached),
                    StoredUpload.filename != (user.resume_url or "").rsplit("/", 1)[-1],
                ).delete(synchronize_session=False)
            user.uni_performance = uni_performance
        
        refresh_profile_eligibility(user)

        db.add(user)
        db.commit()
        return user_dict(user)


def refresh_profile_eligibility(user):
    # Automatically compute eligibility based on updated fields
    has_required_details = bool(user.full_name and user.email and user.resume_name)
    has_eligible_education = False

    if has_required_details and user.education:
        try:
            import json
            edu_list = json.loads(user.education)
            if isinstance(edu_list, list):
                has_10 = False
                has_12 = False
                has_coll = False
                for item in edu_list:
                    inst = (item.get("institution") or "").strip()
                    deg = (item.get("degree") or "").strip().lower()
                    dtl = (item.get("detail") or "").strip()
                    if not inst or not deg or not dtl:
                        continue

                    # Match 10th
                    if any(x in deg for x in ["10", "secondary", "ssc", "matric", "high school", "class x", "class 10"]):
                        has_10 = True
                    # Match 12th
                    elif any(x in deg for x in ["12", "senior", "hsc", "intermediate", "diploma", "junior college", "class xii", "class 12"]):
                        has_12 = True
                    # Match College / University
                    elif any(x in deg for x in ["b.tech", "btech", "b.e", "be", "b.sc", "bsc", "bca", "mca", "mtech", "m.tech", "bachelor", "master", "graduation", "university", "college", "degree"]):
                        has_coll = True
                has_eligible_education = has_10 and has_12 and has_coll
        except Exception:
            pass

    # Check university performance eligibility
    has_uni_perf = False
    if user.uni_performance:
        try:
            import json
            perf = json.loads(user.uni_performance)
            if isinstance(perf, dict):
                if str(perf.get("aggregate_cgpa", "")).strip():
                    has_uni_perf = True
                else:
                    for sem in perf.get("semesters", []):
                        if any(str(sem.get(k, "")).strip() for k in ["cgpa", "closed_backlogs", "live_backlogs", "marksheet_url"]):
                            has_uni_perf = True
                            break
        except Exception:
            pass

    if has_required_details and has_eligible_education and has_uni_perf:
        user.is_eligible = 1
    else:
        user.is_eligible = 0


def update_password(username, new_hashed_password, *, token, expected_hash, expires_at):
    from hashlib import sha256
    from time import time

    digest = sha256(token.encode()).hexdigest()
    try:
        with SessionLocal.begin() as db:
            db.add(UsedPasswordToken(digest=digest, expires_at=expires_at))
            db.flush()  # Unique digest makes token consumption atomic across requests.
            changed = db.query(User).filter_by(
                username=username, hashed_password=expected_hash,
            ).update({"hashed_password": new_hashed_password, "must_change_password": "0"})
            if not changed:
                db.rollback()
                return False
            db.query(UsedPasswordToken).filter(UsedPasswordToken.expires_at < int(time())).delete()
    except IntegrityError:
        return False
    return True


def create_drive(
    company: str, role: str, type: str | None = None, eligibility: str | None = None, package: str | None = None, drive_date: str | None = None,
    location: str | None = None, stipend: str | None = None, description: str | None = None, other_benefits: str | None = None, duration: str | None = None,
    eligible_courses: str | None = None, selection_process: str | None = None, about_company: str | None = None, website: str | None = None,
    org_size: str | None = None, contact_person: str | None = None,
    responsibilities: str | None = None, requirements: str | None = None, tech_stack: str | None = None,
    no_active_backlogs: int | None = 0,
    min_10th_percent: str | None = None, min_12th_percent: str | None = None,
    partner_id: int | None = None
):
    with SessionLocal() as db:
        drive = Drive(
            company=company, role=role, type=type, eligibility=eligibility, package=package, drive_date=drive_date,
            location=location or "", stipend=stipend or "", description=description or "", other_benefits=other_benefits or "",
            duration=duration or "", eligible_courses=eligible_courses or "", selection_process=selection_process or "",
            about_company=about_company or "", website=website or "", org_size=org_size or "", contact_person=contact_person or "",
            responsibilities=responsibilities or "", requirements=requirements or "", tech_stack=tech_stack or "",
            no_active_backlogs=no_active_backlogs if no_active_backlogs is not None else 0,
            min_10th_percent=min_10th_percent or "",
            min_12th_percent=min_12th_percent or "",
            partner_id=partner_id
        )
        db.add(drive)
        db.commit()
        return {
            "id": drive.id,
            "company": drive.company,
            "role": drive.role,
            "type": drive.type,
            "eligibility": drive.eligibility,
            "package": drive.package,
            "drive_date": drive.drive_date,
            "location": drive.location,
            "stipend": drive.stipend,
            "description": drive.description,
            "other_benefits": drive.other_benefits,
            "duration": drive.duration,
            "eligible_courses": drive.eligible_courses,
            "selection_process": drive.selection_process,
            "about_company": drive.about_company,
            "website": drive.website,
            "org_size": drive.org_size,
            "contact_person": drive.contact_person,
            "responsibilities": drive.responsibilities,
            "requirements": drive.requirements,
            "tech_stack": drive.tech_stack,
            "no_active_backlogs": drive.no_active_backlogs,
            "min_10th_percent": drive.min_10th_percent,
            "min_12th_percent": drive.min_12th_percent,
            "partner_id": drive.partner_id
        }


def list_drives():
    with SessionLocal() as db:
        logo_exists = db.query(User.id).filter(
            User.id == Drive.partner_id, User.role == "hr", User.profile_image != ""
        ).exists()
        rows = db.query(Drive, logo_exists.label("has_logo")).order_by(Drive.created_at.desc()).all()
        return [
            {
                "id": r.id, "company": r.company, "role": r.role, "type": r.type, "eligibility": r.eligibility, "package": r.package, "drive_date": r.drive_date,
                "location": r.location, "stipend": r.stipend, "description": r.description, "other_benefits": r.other_benefits, "duration": r.duration,
                "eligible_courses": r.eligible_courses, "selection_process": r.selection_process, "about_company": r.about_company, "website": r.website,
                "org_size": r.org_size, "contact_person": r.contact_person, "responsibilities": r.responsibilities, "requirements": r.requirements,
                "tech_stack": r.tech_stack, "no_active_backlogs": r.no_active_backlogs,
                "min_10th_percent": r.min_10th_percent, "min_12th_percent": r.min_12th_percent,
                "partner_id": r.partner_id, "company_logo": f"/api/partners/{r.partner_id}/logo" if has_logo else ""
            }
            for r, has_logo in rows
        ]


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
        users = db.query(User).options(load_only(
            User.id, User.username, User.full_name, User.email, User.phone,
            User.enrollment_id, User.course, User.role, User.headline, User.profile_image,
            User.created_at, User.is_eligible, User.must_change_password, User.resume_name, User.uni_performance,
        )).filter(User.role == role_filter).order_by(User.created_at.desc()).all()
        return [
            {
                "id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "email": u.email,
                "phone": u.phone,
                "enrollment_id": u.enrollment_id,
                "course": u.course or "",
                "role": u.role,
                "headline": u.headline,
                "profile_image": u.profile_image,
                "created_at": u.created_at.isoformat() if u.created_at else None,
                "is_eligible": u.is_eligible or 0,
                "must_change_password": u.must_change_password or "0",
                "resume_name": u.resume_name or "",
                "uni_performance": u.uni_performance or "{}",
            }
            for u in users
        ]


def create_user(username: str, hashed_password: str, role: str = "student", full_name: str | None = None, email: str | None = None, phone: str | None = None, enrollment_id: str | None = None, course: str | None = None, must_change_password: str = "0"):
    with SessionLocal() as db:
        user = User(
            username=username, hashed_password=hashed_password, role=role,
            full_name=full_name, email=email, phone=phone,
            enrollment_id=enrollment_id, course=course or "", must_change_password=must_change_password
        )
        db.add(user)
        try:
            db.commit()
        except IntegrityError as exc:
            raise ValueError("user_exists") from exc
        return user_dict(user)


def has_sent_opportunity_alert(drive_id: int, student_id: int) -> bool:
    with SessionLocal() as db:
        record = db.query(OpportunityAlertSent).filter(
            OpportunityAlertSent.drive_id == drive_id,
            OpportunityAlertSent.student_id == student_id
        ).first()
        return record is not None


def record_opportunity_alert(drive_id: int, student_id: int):
    with SessionLocal() as db:
        existing = db.query(OpportunityAlertSent).filter(
            OpportunityAlertSent.drive_id == drive_id,
            OpportunityAlertSent.student_id == student_id
        ).first()
        if not existing:
            record = OpportunityAlertSent(drive_id=drive_id, student_id=student_id)
            db.add(record)
            db.commit()

