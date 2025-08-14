# Pathwise AI Frontend Build and Deploy Script
# This script ensures proper compilation of Tailwind CSS and all animations

Write-Host "🚀 Building Pathwise AI Frontend..." -ForegroundColor Green

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Build Tailwind CSS
Write-Host "🎨 Building Tailwind CSS..." -ForegroundColor Yellow
npx tailwindcss -i ./src/app/globals.css -o ./src/app/output.css --watch=false

# Build the application
Write-Host "🔨 Building Next.js application..." -ForegroundColor Yellow
npm run build

# Check if build was successful
if (Test-Path ".next") {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "📁 Build output: .next/" -ForegroundColor Cyan
    
    # Show build info
    $buildSize = (Get-ChildItem -Recurse ".next" | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📊 Build size: $([math]::Round($buildSize, 2)) MB" -ForegroundColor Cyan
    
    Write-Host "🚀 Ready for deployment!" -ForegroundColor Green
    Write-Host "💡 Run 'npm start' to test the production build locally" -ForegroundColor Blue
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
