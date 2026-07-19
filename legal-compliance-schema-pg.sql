-- ============================================================
-- 🔒 LEGAL COMPLIANCE SUITE - DATABASE SCHEMA (PostgreSQL)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- AUDIT LOG & TRACEABILITY
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  affected_records INT DEFAULT 0,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50),
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user_date ON audit_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action_date ON audit_logs(action, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_data_type ON audit_logs(data_type);

-- ────────────────────────────────────────────────────────────
-- DATA SUBJECT RIGHTS REQUESTS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS subject_rights_requests (
  id VARCHAR(50) PRIMARY KEY,
  subject_id VARCHAR(255) NOT NULL,
  subject_email VARCHAR(255),
  request_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deadline TIMESTAMP NOT NULL,
  response_date TIMESTAMP,
  completion_date TIMESTAMP,
  description TEXT,
  documents_count INT DEFAULT 0,
  denial_reason TEXT,
  processed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subject_rights_subject ON subject_rights_requests(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_rights_status ON subject_rights_requests(status);
CREATE INDEX IF NOT EXISTS idx_subject_rights_deadline ON subject_rights_requests(deadline);

-- ────────────────────────────────────────────────────────────
-- LEGAL DOCUMENTS & CONTRACT ANALYSIS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),
  framework VARCHAR(50) NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  document_path VARCHAR(512),
  file_size INT,
  compliance_score INT,
  status VARCHAR(50) DEFAULT 'ANALYZING',
  analysis_date TIMESTAMP,
  analysis_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_legal_doc_framework ON legal_documents(framework);
CREATE INDEX IF NOT EXISTS idx_legal_doc_status ON legal_documents(status);
CREATE INDEX IF NOT EXISTS idx_legal_doc_uploaded ON legal_documents(uploaded_by);

-- ────────────────────────────────────────────────────────────
-- COMPLIANCE ISSUES FROM ANALYSIS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  issue_type VARCHAR(100),
  severity VARCHAR(50),
  issue_description TEXT NOT NULL,
  legal_article VARCHAR(100),
  recommendation TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by VARCHAR(255),
  resolved_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES legal_documents(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_compliance_severity ON compliance_issues(severity);
CREATE INDEX IF NOT EXISTS idx_compliance_resolved ON compliance_issues(is_resolved);
CREATE INDEX IF NOT EXISTS idx_compliance_doc ON compliance_issues(document_id);

-- ────────────────────────────────────────────────────────────
-- DATA PROCESSING RECORDS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS data_processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor_id VARCHAR(255) NOT NULL,
  data_category VARCHAR(100) NOT NULL,
  processing_purpose VARCHAR(255) NOT NULL,
  legal_basis VARCHAR(100) NOT NULL,
  recipients VARCHAR(500),
  retention_period VARCHAR(50),
  data_subjects_count INT,
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  description TEXT,
  dpia_required BOOLEAN DEFAULT FALSE,
  dpia_completed BOOLEAN DEFAULT FALSE,
  security_measures TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_processing_processor ON data_processing_records(processor_id);
CREATE INDEX IF NOT EXISTS idx_processing_purpose ON data_processing_records(processing_purpose);

-- ────────────────────────────────────────────────────────────
-- DATA INCIDENT LOG (BREACH NOTIFICATION)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS data_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type VARCHAR(100),
  discovery_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  discovery_by VARCHAR(255),
  description TEXT NOT NULL,
  affected_data_types VARCHAR(255),
  affected_records_count INT,
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'REPORTED',
  notification_required BOOLEAN DEFAULT FALSE,
  notification_date TIMESTAMP,
  authorities_notified BOOLEAN DEFAULT FALSE,
  subjects_notified BOOLEAN DEFAULT FALSE,
  remediation_steps TEXT,
  resolved_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_severity ON data_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON data_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_date ON data_incidents(discovery_date);

-- ────────────────────────────────────────────────────────────
-- CONSENT RECORDS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id VARCHAR(255) NOT NULL,
  consent_type VARCHAR(100) NOT NULL,
  consent_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  consent_method VARCHAR(100),
  consent_value BOOLEAN NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  version VARCHAR(50),
  withdrawal_date TIMESTAMP,
  withdrawal_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_consent_subject ON consent_records(subject_id);
CREATE INDEX IF NOT EXISTS idx_consent_date ON consent_records(consent_date);

-- ────────────────────────────────────────────────────────────
-- DATA PROCESSING AGREEMENTS (DPA)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS data_processor_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor_name VARCHAR(255) NOT NULL,
  contract_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  data_categories VARCHAR(500),
  processing_scope TEXT,
  security_level VARCHAR(50),
  subprocessor_allowed BOOLEAN DEFAULT FALSE,
  audit_rights BOOLEAN DEFAULT TRUE,
  insurance_required BOOLEAN DEFAULT FALSE,
  insurance_amount NUMERIC(15,2),
  dpa_signed BOOLEAN DEFAULT FALSE,
  dpa_document_path VARCHAR(512),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dpa_processor ON data_processor_agreements(processor_name);

-- ────────────────────────────────────────────────────────────
-- COMPLIANCE CERTIFICATIONS & STANDARDS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_type VARCHAR(100),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_body VARCHAR(255),
  certificate_number VARCHAR(100),
  document_path VARCHAR(512),
  scope TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  renewal_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cert_status ON compliance_certifications(status);
CREATE INDEX IF NOT EXISTS idx_cert_expiry ON compliance_certifications(expiry_date);

-- ────────────────────────────────────────────────────────────
-- COMPLIANCE REPORTS & METRICS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  framework VARCHAR(50),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  overall_score INT,
  critical_issues INT,
  high_issues INT,
  medium_issues INT,
  resolved_issues INT,
  pending_rights_requests INT,
  avg_response_time INT,
  audit_log_entries INT,
  data_breaches_reported INT,
  actions_taken TEXT,
  recommendations TEXT,
  generated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_framework ON compliance_reports(framework);
CREATE INDEX IF NOT EXISTS idx_reports_period ON compliance_reports(period_start, period_end);

-- ────────────────────────────────────────────────────────────
-- VIEWS FOR REPORTING
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW subject_rights_summary AS
SELECT
  request_type,
  status,
  COUNT(*) as count,
  ROUND(AVG(EXTRACT(DAY FROM (COALESCE(completion_date, NOW()) - request_date))))::INT as avg_days_to_complete
FROM subject_rights_requests
GROUP BY request_type, status;

CREATE OR REPLACE VIEW audit_log_summary_daily AS
SELECT
  DATE(timestamp) as log_date,
  action,
  COUNT(*) as action_count,
  SUM(affected_records) as total_records_affected,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
GROUP BY DATE(timestamp), action;

CREATE OR REPLACE VIEW compliance_status_current AS
SELECT
  d.framework,
  d.status,
  COUNT(*) as document_count,
  ROUND(AVG(d.compliance_score))::INT as avg_compliance_score
FROM legal_documents d
WHERE d.analysis_date >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY d.framework, d.status;

CREATE OR REPLACE VIEW overdue_rights_requests AS
SELECT
  id,
  subject_id,
  subject_email,
  request_type,
  request_date,
  deadline,
  EXTRACT(DAY FROM (NOW() - deadline))::INT as days_overdue
FROM subject_rights_requests
WHERE status = 'PENDING'
AND deadline < NOW()
ORDER BY deadline ASC;

-- ────────────────────────────────────────────────────────────
-- SAMPLE DATA (for testing)
-- ────────────────────────────────────────────────────────────

INSERT INTO audit_logs (user_id, action, data_type, affected_records, ip_address, status, timestamp)
VALUES
  ('admin@company.com', 'READ', 'personal_data', 245, '192.168.1.1', 'SUCCESS', NOW()),
  ('analyst@company.com', 'EXPORT', 'customer_info', 1200, '192.168.1.2', 'SUCCESS', NOW()),
  ('system', 'PROCESS', 'analytics', 50000, '10.0.0.1', 'SUCCESS', NOW())
ON CONFLICT DO NOTHING;

INSERT INTO subject_rights_requests (id, subject_id, subject_email, request_type, deadline, status, request_date)
VALUES
  ('ACC-001', 'subject_123', 'john@example.com', 'ACCESS', NOW() + INTERVAL '30 days', 'PENDING', NOW())
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- VERIFY INSTALLATION
-- ────────────────────────────────────────────────────────────

SELECT 'Legal Compliance Schema Installed Successfully!' as status,
       COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('audit_logs', 'subject_rights_requests', 'legal_documents', 'compliance_issues', 'data_incidents', 'consent_records');
