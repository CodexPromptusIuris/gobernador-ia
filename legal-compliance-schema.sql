-- ============================================================
-- 🔒 LEGAL COMPLIANCE SUITE - DATABASE SCHEMA
-- For Ley 21.719, GDPR, CCPA, and LGPD compliance
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- AUDIT LOG & TRACEABILITY
-- ────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL,  -- READ, WRITE, DELETE, EXPORT, PROCESS
  data_type VARCHAR(100) NOT NULL,  -- personal_data, sensitive_data, financial_data
  resource_id VARCHAR(255),
  affected_records INT DEFAULT 0,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(50),  -- SUCCESS, FAILURE, DENIED
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_date (user_id, timestamp),
  INDEX idx_action_date (action, timestamp),
  INDEX idx_data_type (data_type)
);

-- ────────────────────────────────────────────────────────────
-- DATA SUBJECT RIGHTS REQUESTS
-- ────────────────────────────────────────────────────────────

CREATE TABLE subject_rights_requests (
  id VARCHAR(50) PRIMARY KEY,
  subject_id VARCHAR(255) NOT NULL,
  subject_email VARCHAR(255),
  request_type VARCHAR(50) NOT NULL,  -- ACCESS, RECTIFICATION, DELETION, OBJECTION, PORTABILITY, BLOCKING
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',  -- PENDING, IN_PROGRESS, COMPLETED, DENIED, WITHDRAWN
  request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deadline TIMESTAMP NOT NULL,
  response_date TIMESTAMP,
  completion_date TIMESTAMP,
  description TEXT,
  documents_count INT DEFAULT 0,
  denial_reason TEXT,
  processed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subject (subject_id),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline),
  CONSTRAINT check_deadline CHECK (deadline > request_date)
);

-- ────────────────────────────────────────────────────────────
-- LEGAL DOCUMENTS & CONTRACT ANALYSIS
-- ────────────────────────────────────────────────────────────

CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),  -- CONTRACT, NDA, POLICY, AGREEMENT, TERMS
  framework VARCHAR(50) NOT NULL,  -- LEY_21719, GDPR, CCPA, LGPD
  uploaded_by VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  document_path VARCHAR(512),
  file_size INT,
  compliance_score INT,  -- 0-100
  status VARCHAR(50) DEFAULT 'ANALYZING',  -- ANALYZING, COMPLIANT, PARTIAL, NON_COMPLIANT
  analysis_date TIMESTAMP,
  analysis_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_framework (framework),
  INDEX idx_status (status),
  INDEX idx_uploaded_by (uploaded_by)
);

-- ────────────────────────────────────────────────────────────
-- COMPLIANCE ISSUES FROM ANALYSIS
-- ────────────────────────────────────────────────────────────

CREATE TABLE compliance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  issue_type VARCHAR(100),  -- MISSING_CONSENT, WEAK_SECURITY, NO_RETENTION_POLICY
  severity VARCHAR(50),  -- CRITICAL, HIGH, MEDIUM, LOW
  issue_description TEXT NOT NULL,
  legal_article VARCHAR(100),  -- e.g., "Ley 21.719 Art. 14°"
  recommendation TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by VARCHAR(255),
  resolved_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES legal_documents(id) ON DELETE CASCADE,
  INDEX idx_severity (severity),
  INDEX idx_resolved (is_resolved)
);

-- ────────────────────────────────────────────────────────────
-- DATA PROCESSING RECORDS
-- ────────────────────────────────────────────────────────────

CREATE TABLE data_processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor_id VARCHAR(255) NOT NULL,  -- Company/Department responsible
  data_category VARCHAR(100) NOT NULL,  -- personal, sensitive, financial, biometric
  processing_purpose VARCHAR(255) NOT NULL,
  legal_basis VARCHAR(100) NOT NULL,  -- consent, contract, legal_obligation, vital_interest, public_task, legitimate_interest
  recipients VARCHAR(500),  -- Comma-separated list of third parties
  retention_period VARCHAR(50),  -- e.g., "5 years", "until contract end"
  data_subjects_count INT,
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  description TEXT,
  dpia_required BOOLEAN DEFAULT FALSE,
  dpia_completed BOOLEAN DEFAULT FALSE,
  security_measures TEXT,  -- JSON: encryption, access_controls, backups, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_processor (processor_id),
  INDEX idx_purpose (processing_purpose)
);

-- ────────────────────────────────────────────────────────────
-- DATA INCIDENT LOG (BREACH NOTIFICATION)
-- ────────────────────────────────────────────────────────────

CREATE TABLE data_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type VARCHAR(100),  -- UNAUTHORIZED_ACCESS, DATA_LOSS, RANSOMWARE, HUMAN_ERROR
  discovery_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  discovery_by VARCHAR(255),
  description TEXT NOT NULL,
  affected_data_types VARCHAR(255),
  affected_records_count INT ESTIMATED,
  severity VARCHAR(50),  -- LOW, MEDIUM, HIGH, CRITICAL
  status VARCHAR(50) DEFAULT 'REPORTED',  -- REPORTED, INVESTIGATING, CONTAINED, RESOLVED
  notification_required BOOLEAN DEFAULT FALSE,
  notification_date TIMESTAMP,
  authorities_notified BOOLEAN DEFAULT FALSE,
  subjects_notified BOOLEAN DEFAULT FALSE,
  remediation_steps TEXT,
  resolved_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_severity (severity),
  INDEX idx_status (status)
);

-- ────────────────────────────────────────────────────────────
-- CONSENT RECORDS
-- ────────────────────────────────────────────────────────────

CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id VARCHAR(255) NOT NULL,
  consent_type VARCHAR(100) NOT NULL,  -- MARKETING, PROFILING, THIRD_PARTY_SHARING
  consent_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  consent_method VARCHAR(100),  -- EMAIL, WEB_FORM, PHONE, IN_PERSON
  consent_value BOOLEAN NOT NULL,  -- true = given, false = withdrawn
  ip_address VARCHAR(45),
  user_agent TEXT,
  version VARCHAR(50),  -- Version of privacy policy/consent form
  withdrawal_date TIMESTAMP,
  withdrawal_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subject (subject_id),
  INDEX idx_date (consent_date)
);

-- ────────────────────────────────────────────────────────────
-- DATA PROCESSING AGREEMENTS (DPA)
-- ────────────────────────────────────────────────────────────

CREATE TABLE data_processor_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processor_name VARCHAR(255) NOT NULL,
  contract_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  data_categories VARCHAR(500),
  processing_scope TEXT,
  security_level VARCHAR(50),  -- STANDARD, ENHANCED, CRITICAL
  subprocessor_allowed BOOLEAN DEFAULT FALSE,
  audit_rights BOOLEAN DEFAULT TRUE,
  insurance_required BOOLEAN DEFAULT FALSE,
  insurance_amount DECIMAL(15,2),
  dpa_signed BOOLEAN DEFAULT FALSE,
  dpa_document_path VARCHAR(512),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_processor (processor_name)
);

-- ────────────────────────────────────────────────────────────
-- COMPLIANCE CERTIFICATIONS & STANDARDS
-- ────────────────────────────────────────────────────────────

CREATE TABLE compliance_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certification_type VARCHAR(100),  -- ISO27001, SOC2, GDPR_READY, CCPA_READY
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  issuing_body VARCHAR(255),
  certificate_number VARCHAR(100),
  document_path VARCHAR(512),
  scope TEXT,
  status VARCHAR(50) DEFAULT 'ACTIVE',  -- ACTIVE, EXPIRED, PENDING_RENEWAL
  renewal_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_expiry (expiry_date)
);

-- ────────────────────────────────────────────────────────────
-- COMPLIANCE REPORTS & METRICS
-- ────────────────────────────────────────────────────────────

CREATE TABLE compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  framework VARCHAR(50),  -- LEY_21719, GDPR, CCPA, LGPD
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  overall_score INT,  -- 0-100
  critical_issues INT,
  high_issues INT,
  medium_issues INT,
  resolved_issues INT,
  pending_rights_requests INT,
  avg_response_time INT,  -- days
  audit_log_entries INT,
  data_breaches_reported INT,
  actions_taken TEXT,
  recommendations TEXT,
  generated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_framework (framework),
  INDEX idx_period (period_start, period_end)
);

-- ────────────────────────────────────────────────────────────
-- INDEXES FOR PERFORMANCE
-- ────────────────────────────────────────────────────────────

CREATE INDEX idx_audit_logs_compound ON audit_logs(timestamp, user_id, action);
CREATE INDEX idx_rights_requests_deadline ON subject_rights_requests(deadline, status);
CREATE INDEX idx_issues_severity_date ON compliance_issues(severity, created_at);
CREATE INDEX idx_incidents_status_date ON data_incidents(status, discovery_date);
CREATE INDEX idx_consent_subject_date ON consent_records(subject_id, consent_date);

-- ────────────────────────────────────────────────────────────
-- VIEWS FOR REPORTING
-- ────────────────────────────────────────────────────────────

-- Data Subject Rights Summary
CREATE VIEW subject_rights_summary AS
SELECT
  request_type,
  status,
  COUNT(*) as count,
  AVG(DATEDIFF(IFNULL(completion_date, NOW()), request_date)) as avg_days_to_complete
FROM subject_rights_requests
GROUP BY request_type, status;

-- Audit Log Summary
CREATE VIEW audit_log_summary_daily AS
SELECT
  DATE(timestamp) as log_date,
  action,
  COUNT(*) as action_count,
  SUM(affected_records) as total_records_affected,
  COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
GROUP BY DATE(timestamp), action;

-- Compliance Status
CREATE VIEW compliance_status_current AS
SELECT
  d.framework,
  d.status,
  COUNT(*) as document_count,
  AVG(d.compliance_score) as avg_compliance_score
FROM legal_documents d
WHERE d.analysis_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY d.framework, d.status;

-- Overdue Rights Requests
CREATE VIEW overdue_rights_requests AS
SELECT
  id,
  subject_id,
  subject_email,
  request_type,
  request_date,
  deadline,
  DATEDIFF(NOW(), deadline) as days_overdue
FROM subject_rights_requests
WHERE status = 'PENDING'
AND deadline < NOW()
ORDER BY deadline ASC;

-- ────────────────────────────────────────────────────────────
-- STORED PROCEDURES
-- ────────────────────────────────────────────────────────────

DELIMITER $$

-- Log data access action
CREATE PROCEDURE log_data_access(
  IN p_user_id VARCHAR(255),
  IN p_action VARCHAR(50),
  IN p_data_type VARCHAR(100),
  IN p_affected_records INT,
  IN p_ip_address VARCHAR(45),
  IN p_status VARCHAR(50)
)
BEGIN
  INSERT INTO audit_logs (
    user_id, action, data_type, affected_records,
    ip_address, status, timestamp
  ) VALUES (
    p_user_id, p_action, p_data_type, p_affected_records,
    p_ip_address, p_status, NOW()
  );
END $$

-- Create subject rights request
CREATE PROCEDURE create_subject_rights_request(
  IN p_subject_id VARCHAR(255),
  IN p_request_type VARCHAR(50),
  IN p_description TEXT
)
BEGIN
  DECLARE v_deadline TIMESTAMP;
  SET v_deadline = DATE_ADD(NOW(), INTERVAL 30 DAY);
  
  INSERT INTO subject_rights_requests (
    id, subject_id, request_type, description,
    request_date, deadline, status
  ) VALUES (
    CONCAT(SUBSTR(p_request_type, 1, 3), '-', UNIX_TIMESTAMP()),
    p_subject_id, p_request_type, p_description,
    NOW(), v_deadline, 'PENDING'
  );
END $$

-- Get compliance score
CREATE PROCEDURE get_compliance_score(
  IN p_document_id CHAR(36),
  OUT p_score INT
)
BEGIN
  SELECT compliance_score INTO p_score
  FROM legal_documents
  WHERE id = p_document_id;
END $$

-- Generate daily compliance report
CREATE PROCEDURE generate_daily_compliance_report(
  IN p_framework VARCHAR(50)
)
BEGIN
  INSERT INTO compliance_reports (
    report_date, framework, period_start, period_end,
    critical_issues, high_issues, medium_issues,
    pending_rights_requests, avg_response_time,
    audit_log_entries
  )
  SELECT
    NOW(),
    p_framework,
    DATE_SUB(CURDATE(), INTERVAL 1 DAY),
    CURDATE(),
    (SELECT COUNT(*) FROM compliance_issues WHERE severity = 'CRITICAL' AND is_resolved = FALSE),
    (SELECT COUNT(*) FROM compliance_issues WHERE severity = 'HIGH' AND is_resolved = FALSE),
    (SELECT COUNT(*) FROM compliance_issues WHERE severity = 'MEDIUM' AND is_resolved = FALSE),
    (SELECT COUNT(*) FROM subject_rights_requests WHERE status = 'PENDING'),
    (SELECT AVG(DATEDIFF(IFNULL(completion_date, NOW()), request_date)) FROM subject_rights_requests),
    (SELECT COUNT(*) FROM audit_logs WHERE DATE(timestamp) = CURDATE());
END $$

DELIMITER ;

-- ────────────────────────────────────────────────────────────
-- SAMPLE DATA (for testing)
-- ────────────────────────────────────────────────────────────

-- Insert sample audit log entries
INSERT INTO audit_logs (user_id, action, data_type, affected_records, ip_address, status, timestamp)
VALUES
  ('admin@company.com', 'READ', 'personal_data', 245, '192.168.1.1', 'SUCCESS', NOW()),
  ('analyst@company.com', 'EXPORT', 'customer_info', 1200, '192.168.1.2', 'SUCCESS', NOW()),
  ('system', 'PROCESS', 'analytics', 50000, '10.0.0.1', 'SUCCESS', NOW());

-- Insert sample subject rights request
INSERT INTO subject_rights_requests (id, subject_id, subject_email, request_type, deadline, status, request_date)
VALUES
  ('ACC-001', 'subject_123', 'john@example.com', 'ACCESS', DATE_ADD(NOW(), INTERVAL 30 DAY), 'PENDING', NOW());

-- ────────────────────────────────────────────────────────────
-- SECURITY PERMISSIONS
-- ────────────────────────────────────────────────────────────

-- Create legal compliance role
CREATE ROLE IF NOT EXISTS 'legal_compliance_officer'@'localhost';

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON gobernador_ia.audit_logs TO 'legal_compliance_officer'@'localhost';
GRANT SELECT, INSERT, UPDATE ON gobernador_ia.subject_rights_requests TO 'legal_compliance_officer'@'localhost';
GRANT SELECT, INSERT ON gobernador_ia.compliance_issues TO 'legal_compliance_officer'@'localhost';
GRANT SELECT ON gobernador_ia.compliance_reports TO 'legal_compliance_officer'@'localhost';

-- Create audit role (read-only)
CREATE ROLE IF NOT EXISTS 'audit_viewer'@'localhost';
GRANT SELECT ON gobernador_ia.audit_logs TO 'audit_viewer'@'localhost';
GRANT SELECT ON gobernador_ia.compliance_reports TO 'audit_viewer'@'localhost';

FLUSH PRIVILEGES;

-- ────────────────────────────────────────────────────────────
-- EOF
-- ────────────────────────────────────────────────────────────
