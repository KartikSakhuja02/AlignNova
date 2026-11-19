-- AlignNova schema generated from backend/database.py.

-- Run in an empty Neon database. This creates tables and indexes only.

-- For a full pg_dump restore, use the dump on an empty database instead.

BEGIN;

SET LOCAL search_path TO public;

CREATE TABLE applications (
    id SERIAL NOT NULL,
    user_id INTEGER NOT NULL,
    drive_id INTEGER NOT NULL,
    status VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id)
);

CREATE INDEX ix_applications_drive ON applications (drive_id);

CREATE INDEX ix_applications_id ON applications (id);

CREATE INDEX ix_applications_status_user ON applications (status, user_id);

CREATE INDEX ix_applications_user_created ON applications (user_id, created_at);

CREATE TABLE drives (
    id SERIAL NOT NULL,
    company VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    type VARCHAR,
    eligibility VARCHAR,
    package VARCHAR,
    drive_date VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    location VARCHAR,
    stipend VARCHAR,
    description VARCHAR,
    other_benefits VARCHAR,
    duration VARCHAR,
    eligible_courses VARCHAR,
    selection_process VARCHAR,
    about_company VARCHAR,
    website VARCHAR,
    org_size VARCHAR,
    contact_person VARCHAR,
    responsibilities VARCHAR,
    requirements VARCHAR,
    tech_stack VARCHAR,
    no_active_backlogs INTEGER,
    min_10th_percent VARCHAR,
    min_12th_percent VARCHAR,
    partner_id INTEGER,
    PRIMARY KEY (id)
);

CREATE INDEX ix_drives_created ON drives (created_at);

CREATE INDEX ix_drives_id ON drives (id);

CREATE TABLE opportunity_alerts_sent (
    id SERIAL NOT NULL,
    drive_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id)
);

CREATE INDEX ix_alerts_drive_student ON opportunity_alerts_sent (drive_id, student_id);

CREATE INDEX ix_opportunity_alerts_sent_drive_id ON opportunity_alerts_sent (drive_id);

CREATE INDEX ix_opportunity_alerts_sent_id ON opportunity_alerts_sent (id);

CREATE INDEX ix_opportunity_alerts_sent_student_id ON opportunity_alerts_sent (student_id);

CREATE TABLE stored_uploads (
    filename VARCHAR NOT NULL,
    owner_id INTEGER NOT NULL,
    media_type VARCHAR NOT NULL,
    content BYTEA NOT NULL,
    PRIMARY KEY (filename)
);

CREATE INDEX ix_stored_uploads_owner_id ON stored_uploads (owner_id);

CREATE TABLE used_password_tokens (
    digest VARCHAR(64) NOT NULL,
    expires_at INTEGER NOT NULL,
    PRIMARY KEY (digest)
);

CREATE INDEX ix_used_password_tokens_expires_at ON used_password_tokens (expires_at);

CREATE TABLE users (
    id SERIAL NOT NULL,
    username VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role VARCHAR,
    full_name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    enrollment_id VARCHAR,
    location VARCHAR,
    linkedin_url VARCHAR,
    website_url VARCHAR,
    headline VARCHAR,
    bio VARCHAR,
    education VARCHAR,
    experience VARCHAR,
    profile_image VARCHAR,
    must_change_password VARCHAR,
    resume_name VARCHAR,
    resume_url VARCHAR,
    is_eligible INTEGER,
    skills VARCHAR,
    languages VARCHAR,
    projects VARCHAR,
    course VARCHAR,
    uni_performance VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    PRIMARY KEY (id)
);

CREATE INDEX ix_users_email ON users (email);

CREATE INDEX ix_users_id ON users (id);

CREATE INDEX ix_users_role_created ON users (role, created_at);

CREATE UNIQUE INDEX ix_users_username ON users (username);

COMMIT;
