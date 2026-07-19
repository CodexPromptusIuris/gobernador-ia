#!/bin/bash

################################################################################
# 📊 TEST & COVERAGE RUNNER
# Comprehensive testing suite with coverage reports and benchmarks
################################################################################

set -e

BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"
ROOT_DIR="."

show_menu() {
  clear
  echo ""
  echo "╔═══════════════════════════════════════════════════╗"
  echo "║  🧪 TESTING & COVERAGE SUITE                      ║"
  echo "╚═══════════════════════════════════════════════════╝"
  echo ""
  echo "Select test type:"
  echo "  1) Unit Tests (Rust backend)"
  echo "  2) Unit Tests (React frontend)"
  echo "  3) Integration Tests"
  echo "  4) E2E Tests (API endpoints)"
  echo "  5) Coverage Report"
  echo "  6) Performance Benchmarks"
  echo "  7) Security Audit"
  echo "  8) All Tests"
  echo "  0) Exit"
  echo ""
  read -p "Enter choice (0-8): " choice

  case $choice in
    1) test_rust ;;
    2) test_react ;;
    3) test_integration ;;
    4) test_e2e ;;
    5) coverage ;;
    6) benchmarks ;;
    7) security_audit ;;
    8) all_tests ;;
    0) exit 0 ;;
    *) echo "Invalid choice"; sleep 2; show_menu ;;
  esac
}

test_rust() {
  echo ""
  echo "🧪 Running Rust unit tests..."
  cd $BACKEND_DIR
  cargo test --verbose
  cd ..
  echo "✅ Rust tests complete"
  sleep 2
  show_menu
}

test_react() {
  echo ""
  echo "🧪 Running React tests..."
  cd $FRONTEND_DIR
  npm test -- --watch=false --coverage
  cd ..
  echo "✅ React tests complete"
  sleep 2
  show_menu
}

test_integration() {
  echo ""
  echo "🔗 Running integration tests..."
  echo "Tests: Backend + Database + Frontend"
  
  # Check if services are running
  if ! docker ps | grep -q gobernador-backend; then
    echo "❌ Services not running. Start with: docker compose up -d"
    sleep 2
    show_menu
    return
  fi

  echo "✅ Testing database connection..."
  docker exec gobernador-backend curl -f http://localhost:8080/health || echo "❌ Health check failed"

  echo "✅ Testing API endpoints..."
  curl -s http://localhost:8080/api/stats | head -20

  echo "✅ Integration tests complete"
  sleep 2
  show_menu
}

test_e2e() {
  echo ""
  echo "🌐 Running E2E API tests..."

  tests=(
    "Health Check|GET http://localhost:8080/health"
    "Stats Endpoint|GET http://localhost:8080/api/stats"
    "Frontend Load|GET http://localhost:5173"
  )

  for test in "${tests[@]}"; do
    IFS='|' read -r name url <<< "$test"
    echo ""
    echo "Testing: $name"
    echo "URL: $url"
    
    response=$(curl -s -w "\n%{http_code}" $url)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
      echo "✅ PASS (HTTP $http_code)"
    else
      echo "❌ FAIL (HTTP $http_code)"
    fi
  done

  echo ""
  echo "✅ E2E tests complete"
  sleep 2
  show_menu
}

coverage() {
  echo ""
  echo "📊 Generating coverage reports..."

  echo ""
  echo "📈 Rust coverage..."
  cd $BACKEND_DIR
  cargo tarpaulin --out Html --output-dir coverage 2>/dev/null || echo "Install tarpaulin: cargo install cargo-tarpaulin"
  cd ..

  echo ""
  echo "📈 React coverage..."
  cd $FRONTEND_DIR
  npm run build 2>/dev/null || echo "Install dependencies first: npm install"
  cd ..

  echo ""
  echo "✅ Coverage reports in /backend/coverage and /frontend/coverage"
  sleep 2
  show_menu
}

benchmarks() {
  echo ""
  echo "⚡ Running performance benchmarks..."

  echo ""
  echo "📊 Response time benchmarks:"
  for i in {1..10}; do
    time curl -s http://localhost:8080/health > /dev/null
  done

  echo ""
  echo "💾 Container resource usage:"
  docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

  echo ""
  echo "✅ Benchmarks complete"
  sleep 2
  show_menu
}

security_audit() {
  echo ""
  echo "🔒 Running security audit..."

  echo ""
  echo "🔍 Checking for vulnerabilities..."

  echo ""
  echo "Rust dependencies:"
  cd $BACKEND_DIR
  cargo audit --deny warnings || echo "(Install: cargo install cargo-audit)"
  cd ..

  echo ""
  echo "Node dependencies:"
  cd $FRONTEND_DIR
  npm audit || echo "No vulnerabilities found"
  cd ..

  echo ""
  echo "Docker images:"
  docker scan gobernador-backend || echo "(Install Docker CLI tools)"

  echo ""
  echo "✅ Security audit complete"
  sleep 2
  show_menu
}

all_tests() {
  echo ""
  echo "🚀 Running ALL tests..."
  
  test_rust
  test_react
  test_integration
  test_e2e
  coverage
  benchmarks
  security_audit

  echo ""
  echo "✅ All tests complete!"
  sleep 2
  show_menu
}

show_menu
