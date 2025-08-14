# Pathwise AI - Simple Vercel Deployment Script
# This script handles the deployment process after fixes

Write-Host "🚀 Pathwise AI - Vercel Deployment (Fixed Version)" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the frontend directory" -ForegroundColor Red
    exit 1
}

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

# Test build locally
Write-Host "🔨 Testing build locally..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if (Test-Path ".next") {
    Write-Host "✅ Local build successful!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
    Write-Host "💡 Make sure you have set environment variables in Vercel dashboard" -ForegroundColor Cyan
    
    vercel --prod --yes
    
    Write-Host "🎉 Deployment completed!" -ForegroundColor Green
    Write-Host "🔗 Check your Vercel dashboard for the live URL" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed! Cannot deploy." -ForegroundColor Red
    Write-Host "🔍 Check the build errors above and fix them first." -ForegroundColor Yellow
    exit 1
}
