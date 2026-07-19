#!/bin/bash

# ============================================
# Gobernador IA - Launcher Script
# ============================================
# Simple one-click deployment for non-technical users

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
check_requirements() {
    print_header "Checking Requirements"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker Desktop."
        exit 1
    fi
    print_success "Docker installed"
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
    print_success "Docker Compose installed"
}

# Setup environment
setup_env() {
    print_header "Setting Up Environment"
    
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        print_info "Creating .env file from template..."
        cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
        print_warning "⚠️  IMPORTANT: Edit .env file and change all passwords!"
        print_warning "   Location: $SCRIPT_DIR/.env"
        sleep 2
    else
        print_success ".env file already exists"
    fi
}

# Start services
start_services() {
    print_header "Starting Gobernador IA Services"
    
    cd "$SCRIPT_DIR"
    
    print_info "Building and starting containers..."
    docker compose up -d --build
    
    if [ $? -eq 0 ]; then
        print_success "Services started successfully"
    else
        print_error "Failed to start services"
        exit 1
    fi
}

# Wait for services
wait_services() {
    print_header "Waiting for Services to be Ready"
    
    print_info "Checking database..."
    for i in {1..30}; do
        if docker compose exec -T db pg_isready -U postgres &> /dev/null; then
            print_success "Database ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Database failed to start"
            exit 1
        fi
        sleep 1
    done
    
    print_info "Checking backend..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/health &> /dev/null; then
            print_success "Backend ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend failed to start"
            exit 1
        fi
        sleep 1
    done
    
    print_info "Checking frontend..."
    for i in {1..30}; do
        if curl -s http://localhost:5173 &> /dev/null; then
            print_success "Frontend ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Frontend failed to start"
            exit 1
        fi
        sleep 1
    done
}

# Show service info
show_info() {
    print_header "Gobernador IA is Running! 🚀"
    
    echo -e "${GREEN}Service Access:${NC}"
    echo -e "  Frontend:   ${BLUE}http://localhost:5173${NC}"
    echo -e "  Backend:    ${BLUE}http://localhost:8080${NC}"
    echo -e "  Database:   ${BLUE}localhost:5432${NC}"
    echo ""
    echo -e "${YELLOW}Credentials:${NC}"
    echo -e "  Database User: postgres"
    echo -e "  (Check .env for passwords)"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo -e "  View logs:     ${BLUE}./gobernador logs${NC}"
    echo -e "  Stop all:      ${BLUE}./gobernador stop${NC}"
    echo -e "  Restart:       ${BLUE}./gobernador restart${NC}"
}

# Stop services
stop_services() {
    print_header "Stopping Gobernador IA Services"
    cd "$SCRIPT_DIR"
    docker compose down
    print_success "All services stopped"
}

# Restart services
restart_services() {
    stop_services
    sleep 2
    start_services
    wait_services
    show_info
}

# Show logs
show_logs() {
    cd "$SCRIPT_DIR"
    docker compose logs -f --tail 50
}

# Cleanup (remove volumes)
cleanup() {
    print_header "Cleanup (This will DELETE all data)"
    print_warning "This will remove all containers and volumes. Continue? (yes/no)"
    read -r response
    if [ "$response" = "yes" ]; then
        cd "$SCRIPT_DIR"
        docker compose down -v
        print_success "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
}

# Main menu
main_menu() {
    if [ $# -eq 0 ]; then
        check_requirements
        setup_env
        start_services
        wait_services
        show_info
    else
        case "$1" in
            start)
                start_services
                wait_services
                show_info
                ;;
            stop)
                stop_services
                ;;
            restart)
                restart_services
                ;;
            logs)
                show_logs
                ;;
            cleanup)
                cleanup
                ;;
            status)
                cd "$SCRIPT_DIR"
                docker compose ps
                ;;
            *)
                echo "Usage: $0 {start|stop|restart|logs|status|cleanup}"
                exit 1
                ;;
        esac
    fi
}

main_menu "$@"
