-- Migración inicial: tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_trail (
    id          BIGSERIAL PRIMARY KEY,
    case_id     TEXT NOT NULL,
    risk_level  TEXT NOT NULL,
    risk_score  INTEGER NOT NULL DEFAULT 0,
    risk_factors TEXT NOT NULL DEFAULT '[]',
    document_hash TEXT NOT NULL,
    trace_id    TEXT NOT NULL UNIQUE,
    status      TEXT NOT NULL DEFAULT 'pending_hitl',
    requires_hitl BOOLEAN NOT NULL DEFAULT false,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_status ON audit_trail(status);
CREATE INDEX IF NOT EXISTS idx_audit_trail_trace_id ON audit_trail(trace_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_trail_case_id ON audit_trail(case_id);
