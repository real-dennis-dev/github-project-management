-- ============================================
-- SUBSCRIPTION ENUMS
-- ============================================

CREATE TYPE subscription_status AS ENUM (
    'active',
    'inactive',
    'past_due',
    'canceled',
    'trialing',
    'expired'
);

CREATE TYPE subscription_interval AS ENUM (
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'succeeded',
    'failed',
    'refunded',
    'charged_back'
);

CREATE TYPE plan_type AS ENUM (
    'free',
    'basic',
    'pro',
    'enterprise',
    'custom'
);

CREATE TYPE billing_cycle AS ENUM (
    'monthly',
    'yearly',
    'quarterly'
);

-- ============================================
-- PLANS TABLE
-- ============================================

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    plan_type plan_type NOT NULL DEFAULT 'basic',
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    trial_days INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status subscription_status NOT NULL DEFAULT 'inactive',
    interval subscription_interval NOT NULL DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    payment_method_id TEXT,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    stripe_price_id TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, plan_id)
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status payment_status NOT NULL DEFAULT 'pending',
    stripe_payment_intent_id TEXT,
    stripe_invoice_id TEXT,
    payment_method_type TEXT,
    description TEXT,
    receipt_url TEXT,
    invoice_url TEXT,
    paid_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- FEATURE_USAGE TABLE
-- ============================================

CREATE TABLE feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    used_count INTEGER DEFAULT 0,
    max_count INTEGER,
    reset_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, feature_name)
);

-- ============================================
-- WEBHOOK_EVENTS TABLE
-- ============================================

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error TEXT,
    stripe_event_id TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX idx_feature_usage_user_id ON feature_usage(user_id);