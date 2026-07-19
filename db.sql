-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE project_status AS ENUM (
    'planning',
    'in_progress',
    'paused',
    'completed',
    'archived'
);

CREATE TYPE project_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE feature_status AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'blocked',
    'cancelled'
);

CREATE TYPE feature_difficulty AS ENUM (
    'easy',
    'medium',
    'hard',
    'expert'
);

CREATE TYPE bug_status AS ENUM (
    'reported',
    'investigating',
    'in_progress',
    'fixed',
    'verified',
    'closed'
);

CREATE TYPE bug_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE idea_status AS ENUM (
    'draft',
    'reviewing',
    'approved',
    'rejected',
    'implemented'
);

CREATE TYPE idea_potential AS ENUM (
    'low',
    'medium',
    'high'
);

CREATE TYPE idea_difficulty AS ENUM (
    'easy',
    'medium',
    'hard',
    'expert'
);

CREATE TYPE research_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'archived'
);

CREATE TYPE decision_impact AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE tech_debt_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE tech_debt_status AS ENUM (
    'identified',
    'planned',
    'in_progress',
    'resolved',
    'ignored'
);

CREATE TYPE release_status AS ENUM (
    'planned',
    'in_progress',
    'testing',
    'released',
    'cancelled'
);

CREATE TYPE risk_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE risk_status AS ENUM (
    'identified',
    'monitoring',
    'mitigated',
    'realized',
    'closed'
);

CREATE TYPE milestone_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'delayed'
);

CREATE TYPE learning_status AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'archived'
);

CREATE TYPE expense_category AS ENUM (
    'hosting',
    'database',
    'domain',
    'api',
    'software',
    'hardware',
    'marketing',
    'other'
);

CREATE TYPE document_type AS ENUM (
    'api',
    'erd',
    'flowchart',
    'user_manual',
    'technical',
    'other'
);

CREATE TYPE journal_mood AS ENUM (
    '😊',
    '😐',
    '😔',
    '😡',
    '😴',
    '🤔',
    '🎉',
    '😰'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'planning',
    priority project_priority NOT NULL DEFAULT 'medium',
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    tech_stack TEXT[] DEFAULT '{}',
    repository_url TEXT,
    start_date DATE,
    target_completion_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Features table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status feature_status NOT NULL DEFAULT 'planned',
    difficulty feature_difficulty,
    estimated_days INTEGER CHECK (estimated_days > 0),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature subtasks
CREATE TABLE feature_subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bugs table
CREATE TABLE bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status bug_status NOT NULL DEFAULT 'reported',
    priority bug_priority NOT NULL DEFAULT 'medium',
    cause TEXT,
    possible_fix TEXT,
    reported_by TEXT,
    assigned_to TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ideas table
CREATE TABLE ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status idea_status NOT NULL DEFAULT 'draft',
    potential_revenue idea_potential,
    difficulty idea_difficulty,
    market TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brainstorm entries
CREATE TABLE brainstorm_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Architecture diagrams
CREATE TABLE architecture_diagrams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    diagram_data TEXT NOT NULL, -- JSON or Mermaid data
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Architecture components
CREATE TABLE architecture_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID NOT NULL REFERENCES architecture_diagrams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    component_type TEXT NOT NULL,
    position_x INTEGER,
    position_y INTEGER,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Architecture connections
CREATE TABLE architecture_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    diagram_id UUID NOT NULL REFERENCES architecture_diagrams(id) ON DELETE CASCADE,
    source_component_id UUID NOT NULL REFERENCES architecture_components(id) ON DELETE CASCADE,
    target_component_id UUID NOT NULL REFERENCES architecture_components(id) ON DELETE CASCADE,
    connection_type TEXT,
    label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Research notes
CREATE TABLE research_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status research_status NOT NULL DEFAULT 'not_started',
    tags TEXT[] DEFAULT '{}',
    url TEXT,
    pros TEXT,
    cons TEXT,
    use_case TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- GITHUB INTEGRATION
-- ============================================

CREATE TABLE github_repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    repo_name TEXT NOT NULL,
    repo_owner TEXT NOT NULL,
    repo_url TEXT NOT NULL,
    github_id BIGINT UNIQUE,
    default_branch TEXT DEFAULT 'main',
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE github_commits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
    commit_sha TEXT NOT NULL,
    author_name TEXT,
    author_email TEXT,
    commit_message TEXT,
    committed_at TIMESTAMPTZ NOT NULL,
    added_lines INTEGER DEFAULT 0,
    removed_lines INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE github_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
    branch_name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    last_commit_sha TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(repository_id, branch_name)
);

CREATE TABLE github_pull_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
    pr_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    state TEXT NOT NULL,
    author TEXT,
    created_at_github TIMESTAMPTZ,
    updated_at_github TIMESTAMPTZ,
    merged_at TIMESTAMPTZ,
    additions INTEGER DEFAULT 0,
    deletions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(repository_id, pr_number)
);

CREATE TABLE github_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES github_repositories(id) ON DELETE CASCADE,
    issue_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    state TEXT NOT NULL,
    author TEXT,
    created_at_github TIMESTAMPTZ,
    updated_at_github TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(repository_id, issue_number)
);

-- ============================================
-- PROGRESS TIMELINE
-- ============================================

CREATE TABLE progress_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    month_year DATE NOT NULL, -- First day of the month
    feature_name TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- DAILY JOURNAL
-- ============================================

CREATE TABLE daily_journal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    finished_today TEXT,
    problems TEXT,
    tomorrow_plan TEXT,
    mood journal_mood,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, entry_date)
);

-- ============================================
-- DECISIONS
-- ============================================

CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    decision TEXT NOT NULL,
    reason TEXT NOT NULL,
    impact decision_impact NOT NULL DEFAULT 'medium',
    alternatives TEXT,
    decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TECH DEBT
-- ============================================

CREATE TABLE tech_debt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reason TEXT NOT NULL,
    impact TEXT,
    priority tech_debt_priority NOT NULL DEFAULT 'medium',
    status tech_debt_status NOT NULL DEFAULT 'identified',
    estimated_effort_hours INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FUTURE FEATURES
-- ============================================

CREATE TABLE future_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status feature_status NOT NULL DEFAULT 'planned',
    dependencies TEXT,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- RELEASES
-- ============================================

CREATE TABLE releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    description TEXT,
    status release_status NOT NULL DEFAULT 'planned',
    features TEXT[] DEFAULT '{}',
    release_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, version)
);

-- Release features mapping
CREATE TABLE release_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(release_id, feature_id)
);

-- ============================================
-- DOCUMENTATION
-- ============================================

CREATE TABLE documentation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    doc_type document_type NOT NULL DEFAULT 'technical',
    version INTEGER DEFAULT 1,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- EXPENSES
-- ============================================

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    category expense_category NOT NULL DEFAULT 'other',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    vendor TEXT,
    receipt_url TEXT,
    recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LEARNING
-- ============================================

CREATE TABLE learning (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    topic TEXT NOT NULL,
    description TEXT,
    status learning_status NOT NULL DEFAULT 'planned',
    is_completed BOOLEAN DEFAULT FALSE,
    completed_date DATE,
    notes TEXT,
    resource_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- RISKS
-- ============================================

CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    risk_level risk_level NOT NULL DEFAULT 'medium',
    status risk_status NOT NULL DEFAULT 'identified',
    reason TEXT,
    mitigation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MILESTONES
-- ============================================

CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status milestone_status NOT NULL DEFAULT 'not_started',
    target_date DATE,
    completed_date DATE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AI ASSISTANT (Conversations)
-- ============================================

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    user_id TEXT,
    question TEXT NOT NULL,
    answer TEXT,
    context_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- VISION BOARD
-- ============================================

CREATE TABLE vision_board (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal TEXT NOT NULL,
    description TEXT,
    target_timeline TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vision projects mapping
CREATE TABLE vision_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vision_id UUID NOT NULL REFERENCES vision_board(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(vision_id, project_id)
);

-- ============================================
-- KNOWLEDGE BASE
-- ============================================

CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    related_links TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TASKS (for Today's Tasks on dashboard)
-- ============================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    due_date DATE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_features_project_id ON features(project_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_bugs_project_id ON bugs(project_id);
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_priority ON bugs(priority);
CREATE INDEX idx_ideas_project_id ON ideas(project_id);
CREATE INDEX idx_research_project_id ON research_notes(project_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX idx_github_commits_repository ON github_commits(repository_id);
CREATE INDEX idx_github_commits_date ON github_commits(committed_at);
CREATE INDEX idx_daily_journal_project_date ON daily_journal(project_id, entry_date);
CREATE INDEX idx_decisions_project_id ON decisions(project_id);
CREATE INDEX idx_tech_debt_project_id ON tech_debt(project_id);
CREATE INDEX idx_releases_project_id ON releases(project_id);
CREATE INDEX idx_expenses_project_id ON expenses(project_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_risks_project_id ON risks(project_id);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_ai_conversations_project_id ON ai_conversations(project_id);