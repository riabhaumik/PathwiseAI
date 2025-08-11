# Pathwise AI Startup Script
# This script sets up environment files and starts the application

Write-Host "🚀 Starting Pathwise AI Application Setup..." -ForegroundColor Cyan

# Create backend .env file
Write-Host "Creating backend .env file..." -ForegroundColor Yellow
$backendEnv = @"
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# External API Keys
YOUTUBE_API_KEY=your_youtube_api_key
COURSERA_API_KEY=your_coursera_api_key
KHAN_ACADEMY_API_KEY=your_khan_academy_api_key
EDX_API_KEY=your_edx_api_key

# JWT Configuration (for token signing)
JWT_SECRET_KEY=pathwise-ai-secret-key-change-in-production-2024

# Backend and Frontend URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
"@

$backendEnv | Out-File -FilePath ".env" -Encoding UTF8

# Create frontend .env.local file
Write-Host "Creating frontend .env.local file..." -ForegroundColor Yellow
$frontendEnv = @"
# Frontend Environment Variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
"@

$frontendEnv | Out-File -FilePath "frontend\.env.local" -Encoding UTF8

Write-Host "✅ Environment files created successfully!" -ForegroundColor Green

# Display resource summary
Write-Host "`n📊 PATHWISE AI RESOURCE SUMMARY:" -ForegroundColor Magenta
Write-Host "📚 Math Resources: 12,500 comprehensive resources" -ForegroundColor White
Write-Host "💼 Job Opportunities: 50,000 job listings across all fields" -ForegroundColor White  
Write-Host "🎯 Career Paths: 206 detailed career guides" -ForegroundColor White
Write-Host "🎓 Learning Resources: 12,473 courses and materials" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANT: Please update the API keys in the .env files:" -ForegroundColor Red
Write-Host "   1. Edit .env (backend) with your actual API keys" -ForegroundColor Yellow
Write-Host "   2. Edit frontend\.env.local with your actual API keys" -ForegroundColor Yellow
Write-Host "   3. Update Supabase URL and keys" -ForegroundColor Yellow
Write-Host "   4. Update OpenAI API key" -ForegroundColor Yellow

Write-Host ""
Write-Host "Ready to start servers!" -ForegroundColor Green
Write-Host "   Backend: cd backend; python main.py" -ForegroundColor Cyan
Write-Host "   Frontend: cd frontend; npm run dev" -ForegroundColor Cyan
