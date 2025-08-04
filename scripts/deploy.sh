#!/bin/bash

# ObjectionIQ Vercel Deployment Script
set -e

echo "🚀 Starting ObjectionIQ deployment to Vercel..."

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

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_error "Not logged in to Vercel. Please run:"
    echo "vercel login"
    exit 1
fi

print_status "Running pre-deployment checks..."

# Check for required environment variables
REQUIRED_VARS=("OPENAI_API_KEY" "NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_warning "Missing environment variables: ${MISSING_VARS[*]}"
    print_warning "Make sure these are set in your Vercel project settings"
fi

# Run type checking
print_status "Running TypeScript type checking..."
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed. Please fix the errors before deploying."
    exit 1
fi

# Run linting
print_status "Running linting..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting issues found. Consider running 'npm run lint:fix'"
fi

# Run build test
print_status "Testing build process..."
if npm run build; then
    print_success "Build test passed"
else
    print_error "Build failed. Please fix the build errors before deploying."
    exit 1
fi

# Check if this is a production deployment
if [ "$1" = "--prod" ]; then
    print_status "Deploying to production..."
    DEPLOY_CMD="vercel --prod"
else
    print_status "Deploying to preview..."
    DEPLOY_CMD="vercel"
fi

# Run deployment
print_status "Starting deployment..."
if $DEPLOY_CMD; then
    print_success "Deployment completed successfully!"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "Check Vercel dashboard for URL")
    
    print_success "Your app is live at: $DEPLOYMENT_URL"
    
    echo ""
    print_status "Post-deployment checklist:"
    echo "  ✅ Test the homepage loads correctly"
    echo "  ✅ Test user registration/login"
    echo "  ✅ Test voice training interface"
    echo "  ✅ Test AI responses"
    echo "  ✅ Test mobile responsiveness"
    echo "  ✅ Run Lighthouse audit"
    
else
    print_error "Deployment failed!"
    exit 1
fi

print_success "ObjectionIQ deployment complete! 🎉" 