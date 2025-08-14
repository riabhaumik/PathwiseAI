# Pathwise AI Frontend Performance Optimization Script
# This script implements various performance optimizations

Write-Host "🚀 Optimizing Pathwise AI Frontend Performance..." -ForegroundColor Green

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the frontend directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing performance optimization dependencies..." -ForegroundColor Yellow

# Install performance optimization packages
npm install --save-dev @next/bundle-analyzer compression-webpack-plugin

Write-Host "🔧 Updating Next.js configuration for performance..." -ForegroundColor Yellow

# Create optimized Next.js config
$nextConfig = @"
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  
  // Image optimization
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
      
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // Compression
  compress: true,
  
  // Static optimization
  poweredByHeader: false,
  generateEtags: false,
  
  // Caching headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
"@

Set-Content -Path "next.config.js" -Value $nextConfig

Write-Host "🎨 Optimizing Tailwind CSS..." -ForegroundColor Yellow

# Update Tailwind config for better performance
$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark Navy Blue
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#2d3748',
          900: '#1a202c',
          950: '#0f1419',
        },
        // Gold
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Primary colors using navy and gold
        primary: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#2d3748',
          900: '#1a202c',
          950: '#0f1419',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Accent colors
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.8s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          'from': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'slide-up': {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
          },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-navy': 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
        'gradient-gold': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-blue-purple': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-blue-indigo': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
  // Performance optimizations
  corePlugins: {
    preflight: true,
  },
  // Purge unused CSS
  purge: {
    enabled: true,
    content: [
      './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
  },
}
"@

Set-Content -Path "tailwind.config.js" -Value $tailwindConfig

Write-Host "📝 Creating performance optimization utilities..." -ForegroundColor Yellow

# Create performance utilities
$performanceUtils = @"
// Performance optimization utilities
export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function executedFunction(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const lazyLoad = (importFunc: () => Promise<any>) => {
  return React.lazy(importFunc);
};

export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: any[]) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};
"@

New-Item -Path "src/lib" -ItemType Directory -Force | Out-Null
Set-Content -Path "src/lib/performance.ts" -Value $performanceUtils

Write-Host "🔍 Creating bundle analyzer script..." -ForegroundColor Yellow

# Add bundle analyzer script to package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$packageJson.scripts."analyze" = "ANALYZE=true npm run build"
$packageJson.scripts."build:analyze" = "cross-env ANALYZE=true npm run build"
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"

Write-Host "📊 Building optimized version..." -ForegroundColor Yellow

# Clean and rebuild
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

npm run build

if (Test-Path ".next") {
    Write-Host "✅ Performance optimization completed successfully!" -ForegroundColor Green
    Write-Host "📈 Your app should now be significantly faster!" -ForegroundColor Cyan
    Write-Host "💡 Key optimizations applied:" -ForegroundColor Blue
    Write-Host "   - Tree shaking enabled" -ForegroundColor White
    Write-Host "   - Code splitting optimized" -ForegroundColor White
    Write-Host "   - CSS purging enabled" -ForegroundColor White
    Write-Host "   - Bundle compression" -ForegroundColor White
    Write-Host "   - Image optimization" -ForegroundColor White
    Write-Host "   - Caching headers" -ForegroundColor White
} else {
    Write-Host "❌ Build failed! Check the errors above." -ForegroundColor Red
    exit 1
}
