-- CREATE TYPE user_role AS ENUM (
--     'administrator',
--     'commissioning agent',
--     'engineer',
--     'site manager',
--     'project manager'
-- );

-- CREATE TABLE app_user (
--     user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     first_name VARCHAR(100) NOT NULL,
--     last_name VARCHAR(100) NOT NULL,
--     email VARCHAR(255) NOT NULL UNIQUE,
--     password_hash VARCHAR(255),
--     title VARCHAR(100),
--     role user_role NOT NULL,
--     company VARCHAR(255)
-- );

-- CREATE TABLE project (
--     project_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     project_name VARCHAR(255) NOT NULL,
--     is_archived BOOLEAN NOT NULL DEFAULT FALSE,
--     start_date DATE,
--     end_date DATE
-- );

-- CREATE TABLE user_project (
--     user_project_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     user_id BIGINT NOT NULL,
--     project_id BIGINT NOT NULL,

--     CONSTRAINT fk_user_project_user
--         FOREIGN KEY (user_id)
--         REFERENCES app_user(user_id),

--     CONSTRAINT fk_user_project_project
--         FOREIGN KEY (project_id)
--         REFERENCES project(project_id)
-- ); 
-- CREATE TYPE equipment_type AS ENUM (
--     'panel',
--     'ups',
--     'switchgear',
--     'transformer',
--     'server',
--     'pdu'
-- );

-- CREATE TYPE equipment_status AS ENUM (
--     'delivered',
--     'installed',
--     'commissioned',
--     'energized'
-- );

-- CREATE TABLE equipment (
--     equipment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     equipment_tag VARCHAR(255),
--     equipment_name VARCHAR(255),
--     equipment_type equipment_type,
--     quantity BIGINT,
--     current_status equipment_status
-- );

-- CREATE TYPE project_phase AS ENUM (
--     'L1',
--     'L2',
--     'L3',
--     'L4',
--     'L5'
-- );

-- CREATE TABLE project_equipment_phase (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     project_id BIGINT NOT NULL,
--     equipment_id BIGINT NOT NULL,
--     phase_name project_phase NOT NULL,

--     CONSTRAINT fk_pep_project
--         FOREIGN KEY (project_id)
--         REFERENCES project(project_id),

--     CONSTRAINT fk_pep_equipment
--         FOREIGN KEY (equipment_id)
--         REFERENCES equipment(equipment_id),

--     CONSTRAINT uq_pep_project
--         UNIQUE (project_id),

--     CONSTRAINT uq_pep_equipment
--         UNIQUE (equipment_id)
-- );

-- CREATE TABLE checklist (
--     checklist_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     equipment_id BIGINT NOT NULL,
--     checklist_text VARCHAR(255),
--     phase_name project_phase NOT NULL,

--     CONSTRAINT fk_checklist_equipment
--         FOREIGN KEY (equipment_id)
--         REFERENCES equipment(equipment_id),

--     CONSTRAINT uq_checklist_equipment
--         UNIQUE (equipment_id)
-- );

-- CREATE TYPE checklist_status AS ENUM (
--     'pass',
--     'fail',
--     'n/a'
-- );

-- CREATE TABLE checklist_tracking (
--     id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     project_equipment_phase_id BIGINT NOT NULL,
--     checklist_id BIGINT NOT NULL,
--     status checklist_status NOT NULL,
--     attachment VARCHAR(2048),

--     CONSTRAINT fk_checklist_tracking_phase
--         FOREIGN KEY (project_equipment_phase_id)
--         REFERENCES project_equipment_phase(id),

--     CONSTRAINT fk_checklist_tracking_checklist
--         FOREIGN KEY (checklist_id)
--         REFERENCES checklist(checklist_id),

--     CONSTRAINT uq_checklist_tracking_phase
--         UNIQUE (project_equipment_phase_id),

--     CONSTRAINT uq_checklist_tracking_checklist
--         UNIQUE (checklist_id)
-- );

-- CREATE TYPE issue_type AS ENUM (
--     'checklist',
--     'safety',
--     'punchlist'
-- );
-- CREATE TYPE issue_priority AS ENUM (
--     'low',
--     'medium',
--     'high'
-- );

-- CREATE TABLE issue (
--     issue_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     issue_type issue_type NOT NULL,
--     checklist_tracking_id BIGINT NOT NULL,
--     reason VARCHAR(255),
--     priority issue_priority NOT NULL,
--     linked_equipment_id BIGINT NOT NULL,
--     due_date DATE,

--     CONSTRAINT fk_issue_checklist_tracking
--         FOREIGN KEY (checklist_tracking_id)
--         REFERENCES checklist_tracking(id),

--     CONSTRAINT fk_issue_equipment
--         FOREIGN KEY (linked_equipment_id)
--         REFERENCES equipment(equipment_id),

--     CONSTRAINT uq_issue_checklist_tracking
--         UNIQUE (checklist_tracking_id),

--     CONSTRAINT uq_issue_equipment
--         UNIQUE (linked_equipment_id)
-- );

-- CREATE TABLE issue_assignee (
--     issue_assignee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     issue_id BIGINT NOT NULL,
--     user_id BIGINT NOT NULL,

--     CONSTRAINT fk_issue_assignee_issue
--         FOREIGN KEY (issue_id)
--         REFERENCES issue(issue_id),

--     CONSTRAINT fk_issue_assignee_user
--         FOREIGN KEY (user_id)
--         REFERENCES app_user(user_id),

--     CONSTRAINT uq_issue_assignee
--         UNIQUE (issue_id, user_id)
-- );

-- CREATE TABLE issue_comment (
--     issue_comment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     issue_id BIGINT NOT NULL,
--     comment VARCHAR(255),

--     CONSTRAINT fk_issue_comment_issue
--         FOREIGN KEY (issue_id)
--         REFERENCES issue(issue_id),

--     CONSTRAINT uq_issue_comment_issue
--         UNIQUE (issue_id)
-- );

-- CREATE TYPE submittal_type AS ENUM (
--     'permit',
--     'drawing',
--     'safety',
--     'RAMS'
-- );

-- CREATE TABLE submittal (
--     submittal_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     project_id BIGINT NOT NULL,
--     attachment VARCHAR(2048),
--     submittal_type submittal_type NOT NULL,

--     CONSTRAINT fk_submittal_project
--         FOREIGN KEY (project_id)
--         REFERENCES project(project_id)
-- );

-- CREATE TABLE submittal_assignee (
--     submittal_assignee_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
--     submittal_id BIGINT NOT NULL,
--     user_id BIGINT NOT NULL,

--     CONSTRAINT fk_submittal_assignee_submittal
--         FOREIGN KEY (submittal_id)
--         REFERENCES submittal(submittal_id),

--     CONSTRAINT fk_submittal_assignee_user
--         FOREIGN KEY (user_id)
--         REFERENCES app_user(user_id),

--     CONSTRAINT uq_submittal_assignee
--         UNIQUE (submittal_id, user_id)
-- );

-- select * from submittal_assignee;

