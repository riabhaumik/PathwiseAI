# Pathwise AI Frontend - Deploy to Vercel Script
# This script ensures proper deployment with all animations and styles

Write-Host "🚀 Deploying Pathwise AI Frontend to Vercel..." -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Clean and rebuild
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the application
Write-Host "🔨 Building application..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if (Test-Path ".next") {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod
    
    Write-Host "🎉 Deployment completed!" -ForegroundColor Green
    Write-Host "💡 Your app should now have all the beautiful graphics and animations!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed! Cannot deploy." -ForegroundColor Red
    exit 1
}
