# PathwiseAI Image Conversion Script
# This script helps convert HTML files to images using your default web browser

Write-Host "🎨 PathwiseAI Image Conversion Tool" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if HTML files exist
$headerFile = "header-image.html"
$footerFile = "footer-image.html"

if (-not (Test-Path $headerFile)) {
    Write-Host "❌ Header HTML file not found: $headerFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $footerFile)) {
    Write-Host "❌ Footer HTML file not found: $footerFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ HTML files found successfully!" -ForegroundColor Green

# Create images directory if it doesn't exist
$imagesDir = "images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir | Out-Null
    Write-Host "📁 Created images directory" -ForegroundColor Yellow
}

Write-Host "`n🚀 Opening HTML files in your default browser..." -ForegroundColor Yellow
Write-Host "   Please follow these steps to convert to images:" -ForegroundColor White
Write-Host "`n📋 Conversion Steps:" -ForegroundColor Cyan
Write-Host "1. Each HTML file will open in your browser" -ForegroundColor White
Write-Host "2. Wait for the page to fully load" -ForegroundColor White
Write-Host "3. Take a screenshot or use browser's 'Save as image' feature" -ForegroundColor White
Write-Host "4. Save images to the 'images' folder" -ForegroundColor White
Write-Host "5. Recommended names: header-image.png, footer-image.png" -ForegroundColor White

Write-Host "`n💡 Tips for best results:" -ForegroundColor Yellow
Write-Host "• Use browser's full-screen mode for consistent sizing" -ForegroundColor White
Write-Host "• Ensure browser zoom is set to 100%" -ForegroundColor White
Write-Host "• Use PNG format for transparency support" -ForegroundColor White
Write-Host "• Target dimensions: Header (1200x200), Footer (1200x150)" -ForegroundColor White

# Open header HTML file
Write-Host "`n🌐 Opening header image HTML..." -ForegroundColor Green
Start-Process $headerFile

# Wait a moment before opening footer
Start-Sleep -Seconds 2

# Open footer HTML file
Write-Host "🌐 Opening footer image HTML..." -ForegroundColor Green
Start-Process $footerFile

Write-Host "`n⏳ Both files are now open in your browser" -ForegroundColor Green
Write-Host "   Complete the conversion process and save images to the 'images' folder" -ForegroundColor White

# Check if images were created
Write-Host "`n🔍 Checking for converted images..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$headerImage = Join-Path $imagesDir "header-image.png"
$footerImage = Join-Path $imagesDir "footer-image.png"

if (Test-Path $headerImage) {
    Write-Host "✅ Header image found: $headerImage" -ForegroundColor Green
} else {
    Write-Host "⚠️  Header image not yet created" -ForegroundColor Yellow
}

if (Test-Path $footerImage) {
    Write-Host "✅ Footer image found: $footerImage" -ForegroundColor Green
} else {
    Write-Host "⚠️  Footer image not yet created" -ForegroundColor Yellow
}

Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Convert HTML files to images using your browser" -ForegroundColor White
Write-Host "2. Save images to the 'images' folder" -ForegroundColor White
Write-Host "3. Use images in your PathwiseAI application" -ForegroundColor White
Write-Host "4. Check IMAGES_README.md for integration examples" -ForegroundColor White

Write-Host "`n🎯 Ready to integrate images into your app!" -ForegroundColor Green
Read-Host "Press Enter to exit"
