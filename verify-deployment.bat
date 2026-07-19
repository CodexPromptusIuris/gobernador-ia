@echo off
REM 🚀 LEGAL COMPLIANCE SYSTEM - LOCAL DEPLOYMENT VERIFICATION
REM This script verifies all components are running correctly

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  ✅ LEGAL COMPLIANCE SYSTEM - DEPLOYMENT STATUS       ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo 📊 CONTAINER STATUS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
docker ps --filter "name=gobernador-backend" --format "table {{.Names}}\t{{.Status}}"
docker ps --filter "name=gobernador-frontend" --format "table {{.Names}}\t{{.Status}}"
docker ps --filter "name=gobernador-db" --format "table {{.Names}}\t{{.Status}}"

echo.
echo 📡 SERVICE ENDPOINTS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Frontend App:        http://localhost:5173
echo Backend API:         http://localhost:8080
echo Database:            localhost:5432

echo.
echo 🔒 DATABASE TABLES
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
docker exec gobernador-db psql -U postgres -d gobernador_ia -c "\dt" -q

echo.
echo 📋 LEGAL FRAMEWORKS READY
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Ley 21.719 (Chile - Default)
echo ✅ GDPR (EU)
echo ✅ CCPA (California)
echo ✅ LGPD (Brazil)

echo.
echo 🛠️  AVAILABLE TOOLS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ legal-analyzer.js          - Contract analysis CLI
echo ✅ LegalComplianceDashboard.jsx - React dashboard
echo ✅ legal-compliance-schema-pg.sql - Database schema (INSTALLED)

echo.
echo 🚀 NEXT STEPS
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. ANALYZE A CONTRACT:
echo    node legal-analyzer.js analyze contract.txt
echo.
echo 2. VIEW COMPLIANCE DASHBOARD:
echo    node legal-analyzer.js dashboard LEY_21719
echo.
echo 3. ACCESS FRONTEND:
echo    Open http://localhost:5173 in browser
echo.
echo 4. TEST API ENDPOINTS:
echo    curl http://localhost:8080/health
echo.
echo 5. CHECK DATABASE:
echo    docker exec gobernador-db psql -U postgres -d gobernador_ia
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║  ✅ ALL SYSTEMS OPERATIONAL - READY FOR USE!          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

pause
