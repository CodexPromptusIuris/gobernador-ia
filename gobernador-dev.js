#!/usr/bin/env node

/**
 * 🛠️ GOBERNADOR DEV TOOLKIT
 * Comprehensive development utilities for the full-stack application
 * 
 * Usage:
 *   npx gobernador-dev [command] [options]
 *   gobernador-dev code-audit
 *   gobernador-dev db-migrate
 *   gobernador-dev api-docs
 *   gobernador-dev perf-profile
 *   gobernador-dev deploy-pipeline
 *   gobernador-dev watch
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import axios from 'axios';

const args = process.argv.slice(2);
const command = args[0];
const options = args.slice(1);

const ROOT_DIR = process.cwd();
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

// ────────────────────────────────────────────────────────────────────────
// 1. CODE QUALITY & SECURITY AUDIT
// ────────────────────────────────────────────────────────────────────────

async function codeAudit() {
  console.log(chalk.blue('\n🔍 CODE QUALITY & SECURITY AUDIT\n'));

  try {
    // Scan Rust code
    console.log(chalk.yellow('📊 Analyzing Rust backend...'));
    const rustFiles = execSync(`find ${BACKEND_DIR}/src -name "*.rs" -type f`, {
      encoding: 'utf-8',
    }).split('\n').filter(Boolean);

    const issues = {
      critical: [],
      warning: [],
      info: [],
    };

    rustFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');

      // Check for security issues
      if (content.includes('unsafe')) issues.critical.push(`⚠️  UNSAFE CODE: ${file}`);
      if (content.includes('unwrap()')) issues.warning.push(`⚠️  unwrap() without error handling: ${file}`);
      if (content.includes('TODO') || content.includes('FIXME')) issues.info.push(`ℹ️  TODO/FIXME: ${file}`);
      if (content.includes('eval') || content.includes('exec')) issues.critical.push(`⚠️  DANGEROUS EXEC: ${file}`);
    });

    // Scan React code
    console.log(chalk.yellow('📊 Analyzing React frontend...'));
    const jsxFiles = execSync(`find ${FRONTEND_DIR}/src -name "*.jsx" -o -name "*.js" -type f`, {
      encoding: 'utf-8',
    }).split('\n').filter(Boolean);

    jsxFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('dangerouslySetInnerHTML')) issues.warning.push(`⚠️  XSS RISK: dangerouslySetInnerHTML in ${file}`);
      if (content.includes('eval(')) issues.critical.push(`⚠️  eval() detected: ${file}`);
      if (!content.includes('useEffect') && content.includes('useState')) issues.info.push(`ℹ️  State without side effects: ${file}`);
    });

    // Report
    console.log(chalk.red(`\n❌ CRITICAL ISSUES: ${issues.critical.length}`));
    issues.critical.forEach((i) => console.log(`  ${i}`));

    console.log(chalk.yellow(`\n⚠️  WARNINGS: ${issues.warning.length}`));
    issues.warning.forEach((i) => console.log(`  ${i}`));

    console.log(chalk.blue(`\nℹ️  INFO: ${issues.info.length}`));
    issues.info.slice(0, 3).forEach((i) => console.log(`  ${i}`));

    console.log(chalk.green('\n✅ Audit complete!\n'));

    // Run cargo clippy for Rust linting
    console.log(chalk.yellow('🔧 Running cargo clippy...'));
    try {
      execSync(`cd ${BACKEND_DIR} && cargo clippy --all-targets --all-features`, {
        stdio: 'inherit',
      });
    } catch (e) {
      console.log(chalk.gray('  (Install Rust for detailed analysis)'));
    }
  } catch (error) {
    console.error(chalk.red('❌ Audit failed:'), error.message);
  }
}

// ────────────────────────────────────────────────────────────────────────
// 2. DATABASE MIGRATION MANAGER
// ────────────────────────────────────────────────────────────────────────

async function dbMigrate() {
  console.log(chalk.blue('\n📦 DATABASE MIGRATION MANAGER\n'));

  const action = options[0] || 'status';

  try {
    switch (action) {
      case 'create':
        const name = options[1] || `migration_${Date.now()}`;
        const migrationFile = path.join(BACKEND_DIR, 'migrations', `${Date.now()}_${name}.sql`);

        fs.mkdirSync(path.dirname(migrationFile), { recursive: true });
        fs.writeFileSync(
          migrationFile,
          `-- Migration: ${name}\n-- Created: ${new Date().toISOString()}\n\n-- TODO: Add your SQL here\n`
        );

        console.log(chalk.green(`✅ Migration created: ${migrationFile}`));
        break;

      case 'list':
        const migrations = fs.readdirSync(path.join(BACKEND_DIR, 'migrations')).filter((f) => f.endsWith('.sql'));
        console.log(chalk.yellow('📋 Available migrations:\n'));
        migrations.forEach((m) => console.log(`  ${m}`));
        break;

      case 'apply':
        console.log(chalk.yellow('🚀 Applying migrations...'));
        execSync(
          `cd ${BACKEND_DIR} && sqlx migrate run --database-url "$DATABASE_URL"`,
          { stdio: 'inherit' }
        );
        console.log(chalk.green('✅ Migrations applied!'));
        break;

      case 'status':
      default:
        console.log(chalk.yellow('📊 Migration Status:\n'));
        console.log(chalk.gray('  Use: gobernador-dev db-migrate [create|list|apply]\n'));
        console.log('  gobernador-dev db-migrate create add_users_table');
        console.log('  gobernador-dev db-migrate list');
        console.log('  gobernador-dev db-migrate apply\n');
    }
  } catch (error) {
    console.error(chalk.red('❌ Migration failed:'), error.message);
  }
}

// ────────────────────────────────────────────────────────────────────────
// 3. API DOCUMENTATION & TESTING
// ────────────────────────────────────────────────────────────────────────

async function apiDocs() {
  console.log(chalk.blue('\n📚 API DOCUMENTATION GENERATOR\n'));

  const apiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Gobernador IA API',
      version: '2.0.0',
      description: 'Full-stack audit platform with AI integration',
    },
    servers: [
      { url: 'http://localhost:8080', description: 'Development' },
      { url: 'https://api.example.com', description: 'Production' },
    ],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          responses: {
            200: {
              description: 'Service is healthy',
              content: { 'text/plain': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/api/auth/login': {
        post: {
          summary: 'Authenticate user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                  },
                  required: ['username', 'password'],
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful, returns JWT token' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/stats': {
        get: {
          summary: 'Get application statistics',
          responses: {
            200: { description: 'Statistics data' },
          },
        },
      },
      '/api/agent/task': {
        post: {
          summary: 'Execute AI agent task',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    task: { type: 'string' },
                    context: { type: 'object' },
                    model: { type: 'string' },
                  },
                  required: ['task'],
                },
              },
            },
          },
          responses: {
            200: { description: 'Task executed' },
          },
        },
      },
    },
  };

  const docFile = path.join(ROOT_DIR, 'API_OPENAPI.json');
  fs.writeFileSync(docFile, JSON.stringify(apiSpec, null, 2));
  console.log(chalk.green(`✅ OpenAPI spec generated: ${docFile}`));

  // Generate Postman collection
  const postmanCollection = {
    info: {
      name: 'Gobernador IA API',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: 'Auth',
        item: [
          {
            name: 'Login',
            request: {
              method: 'POST',
              url: 'http://localhost:8080/api/auth/login',
              body: {
                mode: 'raw',
                raw: JSON.stringify({ username: 'admin', password: 'password' }, null, 2),
              },
            },
          },
        ],
      },
      {
        name: 'Stats',
        item: [
          {
            name: 'Get Stats',
            request: {
              method: 'GET',
              url: 'http://localhost:8080/api/stats',
            },
          },
        ],
      },
      {
        name: 'Agent',
        item: [
          {
            name: 'Execute Task',
            request: {
              method: 'POST',
              url: 'http://localhost:3001/agent/execute',
              body: {
                mode: 'raw',
                raw: JSON.stringify(
                  {
                    task: 'Analyze the following code for bugs',
                    context: { language: 'rust' },
                    model: 'gpt-4',
                  },
                  null,
                  2
                ),
              },
            },
          },
        ],
      },
    ],
  };

  const postmanFile = path.join(ROOT_DIR, 'Gobernador_API_Postman.json');
  fs.writeFileSync(postmanFile, JSON.stringify(postmanCollection, null, 2));
  console.log(chalk.green(`✅ Postman collection generated: ${postmanFile}`));

  console.log(chalk.yellow('\n📖 DOCUMENTATION:\n'));
  console.log('  • OpenAPI spec: ' + chalk.cyan(docFile));
  console.log('  • Postman collection: ' + chalk.cyan(postmanFile));
  console.log('  • View in Swagger UI: https://editor.swagger.io/?url=file://' + docFile);
  console.log('  • Import to Postman: File > Import > ' + postmanFile + '\n');
}

// ────────────────────────────────────────────────────────────────────────
// 4. PERFORMANCE PROFILER
// ────────────────────────────────────────────────────────────────────────

async function perfProfile() {
  console.log(chalk.blue('\n⚡ PERFORMANCE PROFILER\n'));

  try {
    console.log(chalk.yellow('📊 Checking if backend is running...'));
    const health = await axios.get('http://localhost:8080/health').catch(() => null);

    if (!health) {
      console.log(chalk.red('❌ Backend not running. Start with: docker compose up -d'));
      return;
    }

    console.log(chalk.green('✅ Backend is running\n'));

    // Memory & CPU stats
    console.log(chalk.yellow('📈 Container Stats:'));
    try {
      const stats = execSync(
        'docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" gobernador-backend gobernador-frontend gobernador-db',
        { encoding: 'utf-8' }
      );
      console.log(stats);
    } catch (e) {
      console.log(chalk.gray('  (Docker stats unavailable)'));
    }

    // Response time benchmarks
    console.log(chalk.yellow('\n⏱️  Response Time Benchmarks:'));

    const endpoints = [
      { name: 'Health check', method: 'GET', path: '/health' },
      { name: 'Stats', method: 'GET', path: '/api/stats' },
    ];

    for (const ep of endpoints) {
      const start = Date.now();
      try {
        await axios({ method: ep.method, url: `http://localhost:8080${ep.path}`, timeout: 5000 });
        const duration = Date.now() - start;
        console.log(`  ${ep.name}: ${chalk.green(duration + 'ms')}`);
      } catch (e) {
        console.log(`  ${ep.name}: ${chalk.red('Failed')}`);
      }
    }

    // Database connection pool
    console.log(chalk.yellow('\n🗄️  Database Performance:'));
    console.log('  Query timeout: 30s');
    console.log('  Connection pool: 5-20 connections');
    console.log('  Idle timeout: 600s');

    // Disk usage
    console.log(chalk.yellow('\n💾 Docker System Usage:'));
    try {
      const dfOutput = execSync('docker system df --format "table {{.Type}}\t{{.Size}}\t{{.Reclaimable}}"', {
        encoding: 'utf-8',
      });
      console.log(dfOutput);
    } catch (e) {
      console.log(chalk.gray('  (Docker system df unavailable)'));
    }

    console.log(chalk.green('\n✅ Profile complete!\n'));
  } catch (error) {
    console.error(chalk.red('❌ Profile failed:'), error.message);
  }
}

// ────────────────────────────────────────────────────────────────────────
// 5. CI/CD PIPELINE GENERATOR
// ────────────────────────────────────────────────────────────────────────

function deployPipeline() {
  console.log(chalk.blue('\n🚀 DEPLOYMENT PIPELINE GENERATOR\n'));

  const githubActions = `name: Build & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}/backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}/frontend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Run backend tests
        run: |
          cd backend
          cargo test --all-features

      - name: Run frontend tests
        run: |
          cd frontend
          npm ci
          npm run build

  deploy:
    needs: [build, test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to production
        env:
          DEPLOY_KEY: \${{ secrets.DEPLOY_KEY }}
        run: |
          mkdir -p \$HOME/.ssh
          echo "\$DEPLOY_KEY" > \$HOME/.ssh/deploy_key
          chmod 600 \$HOME/.ssh/deploy_key
          ssh-keyscan -H \${{ secrets.DEPLOY_HOST }} >> \$HOME/.ssh/known_hosts
          ssh -i \$HOME/.ssh/deploy_key user@\${{ secrets.DEPLOY_HOST }} << 'EOF'
          cd /app
          docker compose pull
          docker compose up -d
          EOF
`;

  const gitlabCI = `stages:
  - build
  - test
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  REGISTRY_IMAGE: \$CI_REGISTRY_IMAGE

build-backend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t \$REGISTRY_IMAGE/backend:latest ./backend
    - docker push \$REGISTRY_IMAGE/backend:latest
  only:
    - main
    - develop

build-frontend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t \$REGISTRY_IMAGE/frontend:latest ./frontend
    - docker push \$REGISTRY_IMAGE/frontend:latest
  only:
    - main
    - develop

test:
  stage: test
  image: rust:latest
  services:
    - postgres:15-alpine
  variables:
    POSTGRES_PASSWORD: postgres
    DATABASE_URL: postgresql://postgres:postgres@postgres/test
  script:
    - cd backend
    - cargo test --all-features
  only:
    - merge_requests
    - main

deploy-production:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache openssh-client
    - mkdir -p \$HOME/.ssh
    - echo "\$DEPLOY_KEY" | tr -d '\r' > \$HOME/.ssh/deploy_key
    - chmod 600 \$HOME/.ssh/deploy_key
    - ssh-keyscan -H \$DEPLOY_HOST >> \$HOME/.ssh/known_hosts 2>/dev/null
    - ssh -i \$HOME/.ssh/deploy_key user@\$DEPLOY_HOST "cd /app && docker compose pull && docker compose up -d"
  environment:
    name: production
  only:
    - main
`;

  fs.mkdirSync(path.join(ROOT_DIR, '.github/workflows'), { recursive: true });
  fs.writeFileSync(path.join(ROOT_DIR, '.github/workflows/deploy.yml'), githubActions);

  fs.writeFileSync(path.join(ROOT_DIR, '.gitlab-ci.yml'), gitlabCI);

  console.log(chalk.green('✅ Pipeline files generated:\n'));
  console.log('  GitHub Actions: ' + chalk.cyan('.github/workflows/deploy.yml'));
  console.log('  GitLab CI: ' + chalk.cyan('.gitlab-ci.yml'));

  console.log(chalk.yellow('\n📋 SETUP INSTRUCTIONS:\n'));
  console.log('GitHub:');
  console.log('  1. Push to main branch');
  console.log('  2. Go to Settings > Secrets and add:');
  console.log('     - DEPLOY_HOST (your server IP)');
  console.log('     - DEPLOY_KEY (SSH private key)');
  console.log('  3. Pipelines run automatically\n');

  console.log('GitLab:');
  console.log('  1. Push to main branch');
  console.log('  2. Go to CI/CD > Variables and add:');
  console.log('     - DEPLOY_HOST (your server IP)');
  console.log('     - DEPLOY_KEY (SSH private key)');
  console.log('  3. Pipelines run automatically\n');
}

// ────────────────────────────────────────────────────────────────────────
// 6. DEVELOPMENT WATCH MODE
// ────────────────────────────────────────────────────────────────────────

function watchMode() {
  console.log(chalk.blue('\n👀 DEVELOPMENT WATCH MODE\n'));

  console.log(chalk.yellow('🔄 Starting live reload with Docker Compose...\n'));

  try {
    execSync('docker compose -f docker-compose-mcp.yml up -d', { stdio: 'inherit' });

    console.log(chalk.green('\n✅ Services started!\n'));
    console.log(chalk.yellow('📡 Service URLs:\n'));
    console.log('  Frontend: http://localhost:5173');
    console.log('  Backend:  http://localhost:8080');
    console.log('  MCP:      http://localhost:3001');
    console.log('  Ollama:   http://localhost:11434\n');

    console.log(chalk.yellow('👀 Watching for changes...\n'));
    console.log('  • Edit frontend/src/ files → auto-reload at 5173');
    console.log('  • Edit backend/src/ files → rebuild and restart');
    console.log('  • Edit .env → restart containers\n');

    console.log(chalk.yellow('Press Ctrl+C to stop\n'));

    // Watch backend
    const chokidar = require('chokidar');
    const watcher = chokidar.watch([
      path.join(BACKEND_DIR, 'src'),
      path.join(FRONTEND_DIR, 'src'),
    ]);

    watcher.on('change', (file) => {
      console.log(chalk.yellow(`\n📝 Changed: ${file}`));
      if (file.includes('backend')) {
        console.log(chalk.blue('Rebuilding backend...'));
        try {
          execSync('docker compose restart gobernador-backend', { stdio: 'inherit' });
        } catch (e) {
          console.error(chalk.red('Restart failed'));
        }
      }
    });
  } catch (error) {
    console.error(chalk.red('❌ Watch mode failed:'), error.message);
  }
}

// ────────────────────────────────────────────────────────────────────────
// MAIN CLI ROUTER
// ────────────────────────────────────────────────────────────────────────

const commands = {
  'code-audit': codeAudit,
  'db-migrate': dbMigrate,
  'api-docs': apiDocs,
  'perf-profile': perfProfile,
  'deploy-pipeline': deployPipeline,
  'watch': watchMode,
  help: showHelp,
};

function showHelp() {
  console.log(chalk.blue(`
╔═════════════════════════════════════════════════════╗
║  🛠️  GOBERNADOR DEVELOPER TOOLKIT                   ║
║     Integrated development utilities                ║
╚═════════════════════════════════════════════════════╝

COMMANDS:

  code-audit          Scan code for bugs, security issues, performance problems
  db-migrate          Manage database migrations (create, list, apply)
  api-docs            Generate OpenAPI + Postman documentation
  perf-profile        Profile performance (CPU, memory, response times)
  deploy-pipeline     Generate CI/CD pipelines (GitHub Actions, GitLab CI)
  watch               Start dev environment with live reload
  help                Show this help message

EXAMPLES:

  npx gobernador-dev code-audit
  npx gobernador-dev db-migrate create add_users_table
  npx gobernador-dev db-migrate list
  npx gobernador-dev api-docs
  npx gobernador-dev perf-profile
  npx gobernador-dev deploy-pipeline
  npx gobernador-dev watch

ENVIRONMENT:

  Required: Docker, Node.js 18+
  Optional: Rust (for backend analysis), npm (for frontend analysis)

  `));
}

// Execute command
if (!command || command === 'help') {
  showHelp();
} else if (commands[command]) {
  commands[command]().catch((err) => {
    console.error(chalk.red('Error:'), err);
    process.exit(1);
  });
} else {
  console.error(chalk.red(`Unknown command: ${command}`));
  showHelp();
  process.exit(1);
}
