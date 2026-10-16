-- WorkTrack PostgreSQL Authoritative Schema
-- Fully aligned with user's SQL dataset specification

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id                  VARCHAR(50) PRIMARY KEY,
    emp_id              VARCHAR(30) UNIQUE NOT NULL,
    name                VARCHAR(150) NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       TEXT,
    salt                TEXT,
    role                VARCHAR(30) NOT NULL CHECK (role IN ('employee','tester','manager','admin')),
    department          VARCHAR(100),
    designation         VARCHAR(120),
    hourly_rate         NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (hourly_rate >= 0),
    avatar_url          TEXT,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id          VARCHAR(50) PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modules (
    id          VARCHAR(50) PRIMARY KEY,
    project_id  VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
    name        VARCHAR(150) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
    id                       VARCHAR(50) PRIMARY KEY,
    task_id                  VARCHAR(50) UNIQUE NOT NULL,
    title                    VARCHAR(200) NOT NULL,
    description              TEXT,
    module_id                VARCHAR(50) REFERENCES modules(id) ON DELETE SET NULL,
    module_name              VARCHAR(150),
    assigned_to_user_id      VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    original_delivery_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    created_by_user_id       VARCHAR(50) REFERENCES users(id) ON DELETE RESTRICT,
    deadline                 DATE,
    progress                 INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    status                   VARCHAR(30) NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','in_progress','completed','reopened','overdue','cancelled')),
    submission_file          TEXT,
    submission_notes         TEXT,
    submitted_at             TIMESTAMPTZ,
    qa_status                VARCHAR(20) DEFAULT 'Pending' CHECK (qa_status IN ('Pass', 'Fail', 'Pending')),
    qa_verified_at           TIMESTAMPTZ,
    qa_verified_by_user_id   VARCHAR(50) REFERENCES users(id),
    qa_defect_reason         TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_status_history (
    id                  VARCHAR(50) PRIMARY KEY,
    task_id             VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    previous_status     VARCHAR(30),
    new_status          VARCHAR(30) NOT NULL,
    changed_by_user_id  VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    comment             TEXT,
    "timestamp"         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bug_reports (
    id                       VARCHAR(50) PRIMARY KEY,
    bug_id                   VARCHAR(50) UNIQUE NOT NULL,
    title                    VARCHAR(200) NOT NULL,
    description              TEXT NOT NULL,
    steps_to_reproduce       TEXT,
    expected_result          TEXT,
    actual_result            TEXT,
    severity                 VARCHAR(20) NOT NULL CHECK (severity IN ('Low','Medium','High','Critical')),
    evidence_url             TEXT,
    evidence_name            TEXT,
    task_id                  VARCHAR(50) REFERENCES tasks(id) ON DELETE SET NULL,
    module_id                VARCHAR(50) REFERENCES modules(id) ON DELETE SET NULL,
    module_name              VARCHAR(150),
    reported_by_user_id      VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    reported_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status                   VARCHAR(30) NOT NULL DEFAULT 'reported'
                             CHECK (status IN ('reported','assigned','in_progress','ready_for_review','approved','changes_requested','rejected','closed')),
    assigned_to_user_id      VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    original_deliverer_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    correction_deadline      DATE,
    manager_notes            TEXT,
    assigned_at              TIMESTAMPTZ,
    assigned_by_user_id      VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS work_sessions (
    id                  VARCHAR(50) PRIMARY KEY,
    bug_id              VARCHAR(50) NOT NULL REFERENCES bug_reports(bug_id) ON DELETE CASCADE,
    employee_id         VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    started_at          TIMESTAMPTZ,
    accumulated_seconds  INTEGER NOT NULL DEFAULT 0 CHECK (accumulated_seconds >= 0),
    is_running          BOOLEAN NOT NULL DEFAULT FALSE,
    last_heartbeat_at   TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    stopped_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS fix_submissions (
    id                    VARCHAR(50) PRIMARY KEY,
    bug_id                VARCHAR(50) NOT NULL REFERENCES bug_reports(bug_id) ON DELETE CASCADE,
    task_id               VARCHAR(50) REFERENCES tasks(id) ON DELETE SET NULL,
    employee_id           VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    fix_description       TEXT NOT NULL,
    progress_percentage   INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    status                VARCHAR(30) NOT NULL DEFAULT 'submitted'
                          CHECK (status IN ('submitted','changes_requested','approved','rejected')),
    fix_file              TEXT,
    notes                 TEXT,
    time_spent_seconds    INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
    submitted_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by_user_id   VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    review_notes          TEXT,
    reviewed_at           TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS corrective_time_entries (
    id                  VARCHAR(50) PRIMARY KEY,
    bug_id              VARCHAR(50) NOT NULL REFERENCES bug_reports(bug_id) ON DELETE RESTRICT,
    task_id             VARCHAR(50),
    module_name         VARCHAR(150),
    employee_id         VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    hours_spent         NUMERIC(10,2) NOT NULL CHECK (hours_spent >= 0),
    hours_display       VARCHAR(30),
    hourly_rate         NUMERIC(12,2) NOT NULL CHECK (hourly_rate >= 0),
    calculated_cost     NUMERIC(12,2) NOT NULL CHECK (calculated_cost >= 0),
    proposed_deduction  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (proposed_deduction >= 0),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','rejected','exempted')),
    exemption_reason    TEXT,
    entry_date          VARCHAR(50) NOT NULL,
    approved_by_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    approved_at         TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
    id          VARCHAR(50) PRIMARY KEY,
    user_id     VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    message     TEXT NOT NULL,
    type        VARCHAR(50) NOT NULL,
    read        BOOLEAN NOT NULL DEFAULT FALSE,
    link        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id           VARCHAR(50) PRIMARY KEY,
    user_id      VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    user_name    VARCHAR(150),
    action       VARCHAR(80) NOT NULL,
    entity_type  VARCHAR(80) NOT NULL,
    entity_id    VARCHAR(100),
    details      TEXT,
    "timestamp"  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    token       VARCHAR(128) PRIMARY KEY,
    user_id     VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_assigned_to ON bug_reports(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_work_sessions_employee ON work_sessions(employee_id);
CREATE INDEX IF NOT EXISTS idx_corrective_entries_employee ON corrective_time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs("timestamp");
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON auth_sessions(token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);

COMMIT;
