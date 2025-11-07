#!/bin/bash

# YYO Agent AI Setup Script
# This script sets up the development environment for YYO Agent AI

set -e

echo "🚀 Setting up YYO Agent AI Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 18
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js version 18 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Check if Docker is installed
check_docker() {
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker is installed: $DOCKER_VERSION"
    else
        print_warning "Docker is not installed. You can install it later for containerized development."
    fi
}

# Check if Docker Compose is installed
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose is installed: $DOCKER_COMPOSE_VERSION"
    else
        print_warning "Docker Compose is not installed. You can install it later for containerized development."
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    npm install
    print_success "Dependencies installed successfully!"
}

# Setup environment file
setup_env() {
    if [ ! -f .env.local ]; then
        print_status "Creating .env.local file..."
        cat > .env.local << 'EOF'
# YYO Agent AI Environment Variables

# Database URLs
DATABASE_URL="postgresql://yyo_user:yyo_password_2024@localhost:5432/yyo_ai_enterprise"
MONGODB_URI="mongodb://yyo_admin:yyo_mongo_2024@localhost:27017/yyo_ai_enterprise?authSource=admin"
REDIS_URL="redis://localhost:6379"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-here-change-this-in-production"

# AI Service API Keys (Add your actual keys here)
OPENAI_API_KEY="your-openai-api-key-here"
GOOGLE_AI_API_KEY="your-google-ai-api-key-here"
ANTHROPIC_API_KEY="your-anthropic-api-key-here"
XAI_API_KEY="your-xai-api-key-here"
DEEPSEEK_API_KEY="your-deepseek-api-key-here"
MISTRAL_API_KEY="your-mistral-api-key-here"
KIMI_API_KEY="your-kimi-api-key-here"
QWEN_API_KEY="your-qwen-api-key-here"

# Socket.io Configuration
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR="./uploads"

# Email Configuration (Optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_FROM="noreply@yyo-ai.com"

# Development Settings
NODE_ENV="development"
NEXT_TELEMETRY_DISABLED=1
EOF
        print_success ".env.local file created!"
        print_warning "Please update the environment variables in .env.local with your actual values."
    else
        print_warning ".env.local already exists. Skipping..."
    fi
}

# Generate Prisma client
generate_prisma() {
    print_status "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated successfully!"
}

# Setup database (if Docker is available)
setup_database() {
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        print_status "Setting up database with Docker..."
        docker-compose up -d postgres redis
        
        # Wait for database to be ready
        print_status "Waiting for database to be ready..."
        sleep 10
        
        # Push database schema
        print_status "Pushing database schema..."
        npx prisma db push
        
        print_success "Database setup completed!"
    else
        print_warning "Docker not available. Please setup PostgreSQL and Redis manually."
        print_warning "Then run: npx prisma db push"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    directories=(
        "public/images"
        "public/icons"
        "uploads"
        "logs"
        "backups"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        print_success "Created directory: $dir"
    done
}

# Setup Git hooks (optional)
setup_git_hooks() {
    if [ -d ".git" ]; then
        print_status "Setting up Git hooks..."
        
        # Pre-commit hook
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# YYO Agent AI pre-commit hook

echo "Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues before committing."
    exit 1
fi

# Run type checking
npm run type-check
if [ $? -ne 0 ]; then
    echo "Type checking failed. Please fix the issues before committing."
    exit 1
fi

echo "Pre-commit checks passed!"
EOF
        
        chmod +x .git/hooks/pre-commit
        print_success "Git hooks setup completed!"
    else
        print_warning "Not a Git repository. Skipping Git hooks setup."
    fi
}

# Main setup function
main() {
    echo "🎯 YYO Agent AI - النظام الإداري المؤسسي الذكي"
    echo "=================================================="
    echo ""
    
    # Check prerequisites
    print_status "Checking prerequisites..."
    check_node
    check_npm
    check_docker
    check_docker_compose
    echo ""
    
    # Setup environment
    print_status "Setting up environment..."
    setup_env
    echo ""
    
    # Install dependencies
    install_dependencies
    echo ""
    
    # Generate Prisma client
    generate_prisma
    echo ""
    
    # Create directories
    create_directories
    echo ""
    
    # Setup database
    setup_database
    echo ""
    
    # Setup Git hooks
    setup_git_hooks
    echo ""
    
    # Final message
    print_success "🎉 YYO Agent AI setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env.local file with actual API keys and database URLs"
    echo "2. Run 'npm run dev' to start the development server"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    echo "For Docker development:"
    echo "- Run 'docker-compose up' to start all services"
    echo "- Run 'docker-compose down' to stop all services"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main
