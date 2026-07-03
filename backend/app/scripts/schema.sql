CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    employee_id varchar(32) NOT NULL UNIQUE,
    email varchar(255) UNIQUE,
    username varchar(80) UNIQUE,
    hashed_password varchar(255) NOT NULL,
    role varchar(32) NOT NULL,
    name varchar(255) NOT NULL,
    department varchar(80),
    reporting_manager_name varchar(255),
    avatar_url varchar(500),
    is_active boolean NOT NULL DEFAULT true,
    last_login_at varchar(64)
);

CREATE INDEX IF NOT EXISTS ix_users_employee_id ON users (employee_id);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
CREATE INDEX IF NOT EXISTS ix_users_role ON users (role);

CREATE TABLE IF NOT EXISTS revoked_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jti varchar(64) NOT NULL UNIQUE,
    token_expires_at varchar(64)
);

CREATE INDEX IF NOT EXISTS ix_revoked_tokens_jti ON revoked_tokens (jti);

CREATE TABLE IF NOT EXISTS complaints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    employee_id varchar(32) NOT NULL REFERENCES users (employee_id) ON DELETE CASCADE,
    complaint_type varchar(32) NOT NULL,
    title varchar(150) NOT NULL,
    description text NOT NULL,
    department varchar(80) NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'Submitted',
    ai_category varchar(120),
    priority varchar(32),
    evidence_score integer,
    confidence integer,
    evidence_breakdown jsonb,
    intelligence_summary text,
    assigned_executive varchar(32),
    assigned_manager_id varchar(32) REFERENCES users (employee_id),
    attachment_path varchar(500),
    attachment_name varchar(255),
    attachment_mime_type varchar(120),
    escalated_flag boolean NOT NULL DEFAULT false,
    duplicate_fingerprint varchar(255),
    action_plan jsonb,
    verification jsonb,
    evidence_files jsonb
);

CREATE INDEX IF NOT EXISTS ix_complaints_employee_id ON complaints (employee_id);
CREATE INDEX IF NOT EXISTS ix_complaints_status ON complaints (status);
CREATE INDEX IF NOT EXISTS ix_complaints_department ON complaints (department);
CREATE INDEX IF NOT EXISTS ix_complaints_assigned_manager_id ON complaints (assigned_manager_id);
CREATE INDEX IF NOT EXISTS ix_complaints_duplicate_fingerprint ON complaints (duplicate_fingerprint);
CREATE INDEX IF NOT EXISTS ix_complaints_employee_status_created ON complaints (employee_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS surveys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    employee_id varchar(32) NOT NULL REFERENCES users (employee_id) ON DELETE CASCADE,
    ratings jsonb NOT NULL,
    comments text
);

CREATE INDEX IF NOT EXISTS ix_surveys_employee_id ON surveys (employee_id);

CREATE TABLE IF NOT EXISTS tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    complaint_id uuid NOT NULL UNIQUE REFERENCES complaints (id) ON DELETE CASCADE,
    manager_id varchar(32) NOT NULL,
    title varchar(255) NOT NULL,
    description text NOT NULL,
    progress integer NOT NULL DEFAULT 0,
    checklist jsonb NOT NULL,
    instructions text
);

CREATE INDEX IF NOT EXISTS ix_tasks_complaint_id ON tasks (complaint_id);
CREATE INDEX IF NOT EXISTS ix_tasks_manager_id ON tasks (manager_id);

CREATE TABLE IF NOT EXISTS departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    name varchar(80) NOT NULL UNIQUE,
    head_role varchar(32) NOT NULL,
    health_score integer NOT NULL DEFAULT 0,
    description text
);

CREATE INDEX IF NOT EXISTS ix_departments_name ON departments (name);

CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    role varchar(32) NOT NULL,
    title varchar(120) NOT NULL,
    message text NOT NULL,
    read boolean NOT NULL DEFAULT false,
    target_path varchar(255),
    employee_id varchar(32)
);

CREATE INDEX IF NOT EXISTS ix_notifications_role ON notifications (role);
CREATE INDEX IF NOT EXISTS ix_notifications_employee_id ON notifications (employee_id);

