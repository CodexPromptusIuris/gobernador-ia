# 🔐 DATABASE CONNECTION & ACCESS GUIDE

## Connection Credentials

### PostgreSQL Database
```
Host:        localhost
Port:        5432
Database:    gobernador_ia
Username:    postgres
Password:    gobernador-secure-password-2024
```

### Alternative Connection String
```
postgresql://postgres:gobernador-secure-password-2024@localhost:5432/gobernador_ia
```

---

## ✅ Database Status

### Tables Installed: 12
```
✓ audit_logs                    (12 columns)
✓ audit_trail                   (13 columns)
✓ compliance_certifications     (11 columns)
✓ compliance_issues             (11 columns)
✓ compliance_reports            (18 columns)
✓ consent_records               (12 columns)
✓ data_incidents                (16 columns)
✓ data_processing_records       (16 columns)
✓ data_processor_agreements     (18 columns)
✓ legal_documents               (14 columns)
✓ subject_rights_requests       (15 columns)
✓ _sqlx_migrations              (6 columns - Rust migration tracker)
```

### Views Installed: 4
```
✓ audit_log_summary_daily       - Daily audit summaries
✓ compliance_status_current     - Current compliance status
✓ subject_rights_summary        - Rights requests summary
✓ overdue_rights_requests       - Overdue requests tracking
```

### Current Data
```
Audit Logs:           3 entries
Subject Rights:       1 entry
Legal Documents:      0 entries
Compliance Issues:    0 entries
Data Incidents:       0 entries
```

---

## 🔌 Connection Methods

### Method 1: Docker Command (Easiest)
```bash
docker exec gobernador-db psql -U postgres -d gobernador_ia
```

Then use psql commands:
```sql
\dt                        -- List all tables
\dv                        -- List all views
SELECT * FROM audit_logs;  -- Query data
\q                         -- Exit
```

### Method 2: DBeaver (Visual Client)
1. Open DBeaver
2. Create New Database Connection
3. Select PostgreSQL
4. Fill in:
   - Server: localhost
   - Port: 5432
   - Database: gobernador_ia
   - Username: postgres
   - Password: gobernador-secure-password-2024
5. Click Test Connection → Finish

### Method 3: pgAdmin (Web UI)
1. Open pgAdmin (usually http://localhost:5050 if running)
2. Right-click Servers → Register → Server
3. Fill:
   - Name: Gobernador
   - Hostname: localhost
   - Port: 5432
   - Username: postgres
   - Password: gobernador-secure-password-2024
4. Save and connect

### Method 4: Command Line (if PostgreSQL installed)
```bash
psql -h localhost -U postgres -d gobernador_ia
```

### Method 5: Python Script
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="gobernador_ia",
    user="postgres",
    password="gobernador-secure-password-2024"
)

cur = conn.cursor()
cur.execute("SELECT * FROM audit_logs LIMIT 10;")
rows = cur.fetchall()
for row in rows:
    print(row)

cur.close()
conn.close()
```

### Method 6: Node.js Script
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'gobernador-secure-password-2024',
  host: 'localhost',
  port: 5432,
  database: 'gobernador_ia',
});

pool.query('SELECT * FROM audit_logs LIMIT 10', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows);
  pool.end();
});
```

---

## 📊 Sample Queries

### View All Audit Logs
```sql
SELECT user_id, action, data_type, affected_records, timestamp 
FROM audit_logs 
ORDER BY timestamp DESC;
```

### View Subject Rights Requests
```sql
SELECT id, subject_id, request_type, status, deadline 
FROM subject_rights_requests;
```

### Get Database Statistics
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname='public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Table Structures
```sql
-- Show audit_logs columns
\d audit_logs

-- Show all columns and types
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='audit_logs';
```

### View All Views
```sql
SELECT * FROM information_schema.views 
WHERE table_schema='public';
```

### Get Overdue Requests
```sql
SELECT id, subject_id, request_type, deadline 
FROM subject_rights_requests 
WHERE status='PENDING' AND deadline < NOW();
```

### Daily Audit Summary
```sql
SELECT * FROM audit_log_summary_daily;
```

### Compliance Status
```sql
SELECT * FROM compliance_status_current;
```

---

## 🛠️ Useful psql Commands

```sql
\l                 -- List all databases
\c database_name   -- Connect to database
\dt                -- List all tables
\dv                -- List all views
\d table_name      -- Show table structure
\du                -- List users/roles
\dp                -- List permissions
\q                 -- Exit psql
```

---

## 🔒 User Management

### Create New User
```sql
CREATE USER legal_officer WITH PASSWORD 'new_password';
GRANT CONNECT ON DATABASE gobernador_ia TO legal_officer;
GRANT USAGE ON SCHEMA public TO legal_officer;
```

### Grant Permissions
```sql
-- Read all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO legal_officer;

-- Write to audit logs
GRANT INSERT ON audit_logs TO legal_officer;

-- Full access to subject rights
GRANT SELECT, INSERT, UPDATE ON subject_rights_requests TO legal_officer;

-- Read-only compliance reports
GRANT SELECT ON compliance_reports TO legal_officer;
```

### Create Read-Only User
```sql
CREATE USER auditor WITH PASSWORD 'audit_password';
GRANT CONNECT ON DATABASE gobernador_ia TO auditor;
GRANT USAGE ON SCHEMA public TO auditor;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO auditor;
```

### Change User Password
```sql
ALTER USER postgres WITH PASSWORD 'new_password';
```

---

## 📈 Database Maintenance

### Backup Database
```bash
docker exec gobernador-db pg_dump -U postgres gobernador_ia > backup.sql
```

### Restore Backup
```bash
docker exec -i gobernador-db psql -U postgres gobernador_ia < backup.sql
```

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('gobernador_ia'));
```

### Vacuum & Analyze
```sql
VACUUM;
ANALYZE;
```

### List Active Connections
```sql
SELECT pid, usename, application_name, state 
FROM pg_stat_activity;
```

---

## 🔍 Troubleshooting

### Connection Refused
```bash
# Check if Docker container is running
docker ps | grep gobernador-db

# If not running, start it
docker compose up -d gobernador-db

# Test connection
docker exec gobernador-db pg_isready -U postgres
```

### Permission Denied
```bash
# Reset password
docker exec gobernador-db psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'gobernador-secure-password-2024';"
```

### Cannot Access Database
```bash
# Check if database exists
docker exec gobernador-db psql -U postgres -l

# Create if missing
docker exec gobernador-db psql -U postgres -c "CREATE DATABASE gobernador_ia;"
```

### Slow Queries
```sql
-- Enable query logging
ALTER DATABASE gobernador_ia SET log_min_duration_statement = 1000;

-- View slow query log
SELECT query, calls, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

---

## 🚀 Quick Start

### Connect & Explore
```bash
# Connect to database
docker exec gobernador-db psql -U postgres -d gobernador_ia

# Inside psql, run:
\dt                                    -- See all tables
SELECT * FROM audit_logs;             -- View audit data
SELECT * FROM subject_rights_requests; -- View rights requests
SELECT * FROM compliance_status_current; -- View compliance status
\q                                     -- Exit
```

### Insert Test Data
```bash
docker exec gobernador-db psql -U postgres -d gobernador_ia -c "
INSERT INTO audit_logs (user_id, action, data_type, affected_records, status) 
VALUES ('test@example.com', 'READ', 'personal_data', 50, 'SUCCESS');
"
```

### Check Data
```bash
docker exec gobernador-db psql -U postgres -d gobernador_ia -c "SELECT * FROM audit_logs;"
```

---

## 📋 Environment Variables

Add to your `.env` file for application use:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gobernador_ia
DATABASE_USER=postgres
DATABASE_PASSWORD=gobernador-secure-password-2024
DATABASE_URL=postgresql://postgres:gobernador-secure-password-2024@localhost:5432/gobernador_ia
```

---

**You're now ready to connect and manage your legal compliance database! 🎉**
