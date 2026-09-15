/*
# Create Construction Management Database Schema

## Overview
This migration creates the complete database for SiteSphere, a construction
commissioning management platform. The app has a sign-in screen, so all
policies are scoped to authenticated users who share collaborative access
to project data (a shared-workspace model where the whole team works on
the same construction projects).

## New Tables (11 tables)

1. **projects** — Top-level construction projects (e.g., "Data Center Alpha")
   - id, name, location, status, progress, issues_count, tests_count, image_url, archived, created_at

2. **phases** — Commissioning phases within a project (L1–L5)
   - id, project_id (FK), level, title, description, status, health, created_at

3. **issues** — Construction issues / nonconformance reports
   - id, project_id (FK), title, category, priority, status, assignee, product, phase, equipment, due_date, description, created_at

4. **submittals** — Technical document submittals (HSE plans, RAMS, permits)
   - id, project_id (FK), title, group, status, version, submitted_by, equipment, submitted_at, created_at

5. **tests** — Testing workflow items
   - id, project_id (FK), name, assignee, status, attempts, created_at

6. **milestones** — Project milestones tied to phases
   - id, project_id (FK), phase_id (FK), title, status, target_date, date_range, checklists_count, health, created_at

7. **personas** — Team member profiles / personas
   - id, project_id (FK), name, role, company, email, phone, personnel_count, status, initials, avatar_color, updated_at, created_at

8. **assets** — Equipment and physical assets
   - id, project_id (FK), name, category, system, status, location, assigned_to, updated_at, created_at

9. **companies** — Contractor / vendor companies
   - id, project_id (FK), name, tasks_count, verified_count, progress, status, created_at

10. **checklist_tasks** — Individual checklist line items
    - id, project_id (FK), phase_id (FK), text, meta, result, has_issue, created_at

11. **change_logs** — Audit trail of all project changes
    - id, project_id (FK), title, description, status, user_name, role, change_date, tags, checklist_summary, approved, rejected, unread, created_at

## Security
- RLS enabled on every table.
- All policies scoped to `authenticated` (the app has a sign-in screen).
- Shared-workspace model: any authenticated user can read, insert, update,
  and delete project data — this is a collaborative construction platform
  where the whole team works on the same projects.
- 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

## Notes
1. All tables use `gen_random_uuid()` for primary keys.
2. Foreign keys cascade on delete (deleting a project removes its children).
3. Timestamps default to `now()`.
4. Indexes added on frequently-filtered columns (project_id, status, phase_id).
*/

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Planning' CHECK (status IN ('On Track', 'Delayed', 'Planning', 'Critical')),
  progress numeric NOT NULL DEFAULT 0,
  issues_count integer NOT NULL DEFAULT 0,
  tests_count integer NOT NULL DEFAULT 0,
  image_url text,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_projects" ON projects;
CREATE POLICY "select_projects" ON projects FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_projects" ON projects;
CREATE POLICY "insert_projects" ON projects FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_projects" ON projects;
CREATE POLICY "update_projects" ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_projects" ON projects;
CREATE POLICY "delete_projects" ON projects FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects (archived);

-- ============================================================
-- PHASES
-- ============================================================
CREATE TABLE IF NOT EXISTS phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  level text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Completed', 'In Progress', 'Not Started')),
  health numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE phases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_phases" ON phases;
CREATE POLICY "select_phases" ON phases FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_phases" ON phases;
CREATE POLICY "insert_phases" ON phases FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_phases" ON phases;
CREATE POLICY "update_phases" ON phases FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_phases" ON phases;
CREATE POLICY "delete_phases" ON phases FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_phases_project_id ON phases (project_id);

-- ============================================================
-- ISSUES
-- ============================================================
CREATE TABLE IF NOT EXISTS issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reference_id text NOT NULL,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'NCR' CHECK (category IN ('NCR', 'Punch List', 'Safety')),
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Critical', 'High', 'Medium', 'Low')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Under Review', 'Closed')),
  assignee text NOT NULL DEFAULT '',
  product text NOT NULL DEFAULT '',
  phase text NOT NULL DEFAULT '',
  equipment text,
  due_date date,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_issues" ON issues;
CREATE POLICY "select_issues" ON issues FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_issues" ON issues;
CREATE POLICY "insert_issues" ON issues FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_issues" ON issues;
CREATE POLICY "update_issues" ON issues FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_issues" ON issues;
CREATE POLICY "delete_issues" ON issues FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_issues_project_id ON issues (project_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues (priority);

-- ============================================================
-- SUBMITTALS
-- ============================================================
CREATE TABLE IF NOT EXISTS submittals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reference_id text NOT NULL,
  title text NOT NULL,
  group_name text NOT NULL,
  status text NOT NULL DEFAULT 'Pending Review' CHECK (status IN ('Approved', 'Pending Review', 'Active', 'Inactive')),
  version text NOT NULL DEFAULT '',
  submitted_by text,
  equipment text,
  submitted_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE submittals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_submittals" ON submittals;
CREATE POLICY "select_submittals" ON submittals FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_submittals" ON submittals;
CREATE POLICY "insert_submittals" ON submittals FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_submittals" ON submittals;
CREATE POLICY "update_submittals" ON submittals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_submittals" ON submittals;
CREATE POLICY "delete_submittals" ON submittals FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_submittals_project_id ON submittals (project_id);
CREATE INDEX IF NOT EXISTS idx_submittals_status ON submittals (status);

-- ============================================================
-- TESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reference_id text NOT NULL,
  name text NOT NULL,
  assignee text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Passed', 'In Progress', 'Not Started', 'Failed', 'Passed with Exceptions', 'Deferred Testing Requirements')),
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_tests" ON tests;
CREATE POLICY "select_tests" ON tests FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_tests" ON tests;
CREATE POLICY "insert_tests" ON tests FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_tests" ON tests;
CREATE POLICY "update_tests" ON tests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_tests" ON tests;
CREATE POLICY "delete_tests" ON tests FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_tests_project_id ON tests (project_id);
CREATE INDEX IF NOT EXISTS idx_tests_status ON tests (status);

-- ============================================================
-- MILESTONES
-- ============================================================
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES phases(id) ON DELETE SET NULL,
  reference_id text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Done', 'In Progress', 'At Risk', 'Not Started')),
  target_date date,
  date_range text,
  checklists_count integer NOT NULL DEFAULT 0,
  health numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_milestones" ON milestones;
CREATE POLICY "select_milestones" ON milestones FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_milestones" ON milestones;
CREATE POLICY "insert_milestones" ON milestones FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_milestones" ON milestones;
CREATE POLICY "update_milestones" ON milestones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_milestones" ON milestones;
CREATE POLICY "delete_milestones" ON milestones FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones (project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_phase_id ON milestones (phase_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones (status);

-- ============================================================
-- PERSONAS
-- ============================================================
CREATE TABLE IF NOT EXISTS personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  personnel_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  initials text NOT NULL DEFAULT '',
  avatar_color text NOT NULL DEFAULT 'blue' CHECK (avatar_color IN ('blue', 'green', 'dark', 'orange', 'gold')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE personas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_personas" ON personas;
CREATE POLICY "select_personas" ON personas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_personas" ON personas;
CREATE POLICY "insert_personas" ON personas FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_personas" ON personas;
CREATE POLICY "update_personas" ON personas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_personas" ON personas;
CREATE POLICY "delete_personas" ON personas FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_personas_project_id ON personas (project_id);

-- ============================================================
-- ASSETS
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reference_id text NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  system text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'In Use', 'Maintenance', 'Removed')),
  location text NOT NULL DEFAULT '',
  assigned_to text NOT NULL DEFAULT 'Unassigned',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_assets" ON assets;
CREATE POLICY "select_assets" ON assets FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_assets" ON assets;
CREATE POLICY "insert_assets" ON assets FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_assets" ON assets;
CREATE POLICY "update_assets" ON assets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_assets" ON assets;
CREATE POLICY "delete_assets" ON assets FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets (project_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets (status);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  tasks_count integer NOT NULL DEFAULT 0,
  verified_count integer NOT NULL DEFAULT 0,
  progress numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'On Track' CHECK (status IN ('On Track', 'Delayed', 'Ahead')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_companies" ON companies;
CREATE POLICY "select_companies" ON companies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_companies" ON companies;
CREATE POLICY "insert_companies" ON companies FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_companies" ON companies;
CREATE POLICY "update_companies" ON companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_companies" ON companies;
CREATE POLICY "delete_companies" ON companies FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_companies_project_id ON companies (project_id);

-- ============================================================
-- CHECKLIST TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES phases(id) ON DELETE SET NULL,
  text text NOT NULL,
  meta text NOT NULL DEFAULT '',
  result text NOT NULL DEFAULT 'N/A' CHECK (result IN ('PASSED', 'FAILED', 'N/A')),
  has_issue boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE checklist_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_checklist_tasks" ON checklist_tasks;
CREATE POLICY "select_checklist_tasks" ON checklist_tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_checklist_tasks" ON checklist_tasks;
CREATE POLICY "insert_checklist_tasks" ON checklist_tasks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_checklist_tasks" ON checklist_tasks;
CREATE POLICY "update_checklist_tasks" ON checklist_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_checklist_tasks" ON checklist_tasks;
CREATE POLICY "delete_checklist_tasks" ON checklist_tasks FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_checklist_tasks_project_id ON checklist_tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_checklist_tasks_phase_id ON checklist_tasks (phase_id);

-- ============================================================
-- CHANGE LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reference_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'In Progress' CHECK (status IN ('Completed', 'Returned', 'In Progress')),
  user_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  change_date text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  checklist_summary text NOT NULL DEFAULT '',
  approved text,
  rejected text,
  unread text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_change_logs" ON change_logs;
CREATE POLICY "select_change_logs" ON change_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "insert_change_logs" ON change_logs;
CREATE POLICY "insert_change_logs" ON change_logs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "update_change_logs" ON change_logs;
CREATE POLICY "update_change_logs" ON change_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "delete_change_logs" ON change_logs;
CREATE POLICY "delete_change_logs" ON change_logs FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_change_logs_project_id ON change_logs (project_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_status ON change_logs (status);
