CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    user_id TEXT,

    action TEXT NOT NULL,

    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_project_id
    ON ai_usage(project_id);

CREATE INDEX idx_ai_usage_user_id
    ON ai_usage(user_id);

CREATE INDEX idx_ai_usage_action
    ON ai_usage(action);

CREATE INDEX idx_ai_usage_created_at
    ON ai_usage(created_at);