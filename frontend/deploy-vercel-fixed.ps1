# Pathwise AI Frontend - Fixed Vercel Deployment Script
# This script ensures proper deployment with environment variable handling

Write-Host "🚀 Deploying Pathwise AI Frontend to Vercel (Fixed Version)..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Test build locally first
Write-Host "🔨 Testing build locally..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if (Test-Path ".next") {
    Write-Host "✅ Local build completed successfully!" -ForegroundColor Green
    
    # Deploy to Vercel with production flag
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod --yes
    
    Write-Host "🎉 Deployment completed!" -ForegroundColor Green
    Write-Host "💡 Your app should now be live on Vercel!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Local build failed! Cannot deploy." -ForegroundColor Red
    Write-Host "🔍 Check the build errors above and fix them first." -ForegroundColor Yellow
    exit 1
}
