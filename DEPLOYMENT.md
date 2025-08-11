# 🚀 Pathwise AI - Deployment Guide

This guide covers deploying the Pathwise AI Phase 1 MVP to production environments.

## 📋 Prerequisites

- **GitHub Account** - For code repository
- **Vercel Account** - For frontend deployment
- **Railway/Render Account** - For backend deployment
- **Supabase Account** - For database and authentication
- **OpenAI Account** - For AI features

## 🎯 Deployment Strategy

### Frontend: Vercel
- **Platform**: Vercel (recommended) or Netlify
- **Framework**: Next.js 15
- **Domain**: Custom domain support
- **SSL**: Automatic HTTPS

### Backend: Railway/Render
- **Platform**: Railway (recommended) or Render
- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **Environment**: Python 3.8+

## 🚀 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Ensure your code is in a GitHub repository
git add .
git commit -m "Phase 1 MVP ready for deployment"
git push origin main
```

### 2. Set Up Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your project URL and API keys

2. **Configure Authentication**
   - Go to Authentication > Settings
   - Add your domain to allowed redirect URLs
   - Configure email templates if needed

3. **Set Up Database Tables** (if needed)
   ```sql
   -- Users table (handled by Supabase Auth)
   -- Progress tracking table
   CREATE TABLE user_progress (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id),
     career_name TEXT,
     completed_topics TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### 3. Deploy Backend (Railway)

1. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the repository

2. **Configure Environment Variables**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET_KEY=your_jwt_secret_key
   ```

3. **Deploy Settings**
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements_working.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Deploy**
   - Railway will automatically deploy on push
   - Get your backend URL (e.g., `https://your-app.railway.app`)

### 4. Deploy Frontend (Vercel)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure project settings

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Build Settings**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Deploy**
   - Vercel will automatically deploy on push
   - Get your frontend URL (e.g., `https://your-app.vercel.app`)

### 5. Update Supabase Settings

1. **Add Production Domains**
   - Go to Supabase Dashboard > Authentication > Settings
   - Add your Vercel domain to Site URL
   - Add your Vercel domain to Redirect URLs

2. **Update CORS Settings**
   - Go to Supabase Dashboard > Settings > API
   - Add your Vercel domain to allowed origins

### 6. Test Your Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend**: Test API endpoints at `your-backend-url/docs`
3. **Authentication**: Test signup/login flow
4. **AI Features**: Test chat functionality

## 🔧 Environment Variables Reference

### Backend (Railway/Render)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production

# Optional: Database URL (if using separate database)
# DATABASE_URL=postgresql://user:password@host:port/database
```

### Frontend (Vercel)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: Analytics
# NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## 🚀 Custom Domain Setup

### 1. Frontend (Vercel)
1. Go to Vercel Dashboard > Your Project > Settings > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable HTTPS

### 2. Backend (Railway)
1. Go to Railway Dashboard > Your Project > Settings > Domains
2. Add custom domain
3. Configure DNS records
4. SSL certificate will be auto-generated

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
- Built-in performance monitoring
- Real-time analytics
- Error tracking

### 2. Railway Monitoring
- Application logs
- Performance metrics
- Error tracking

### 3. Supabase Monitoring
- Database performance
- Authentication logs
- API usage

## 🔒 Security Checklist

- [ ] **HTTPS Enabled** - All traffic encrypted
- [ ] **Environment Variables** - No secrets in code
- [ ] **CORS Configured** - Proper domain restrictions
- [ ] **Rate Limiting** - API protection
- [ ] **Input Validation** - Backend validation
- [ ] **Error Handling** - Graceful error responses
- [ ] **Logging** - Proper error logging
- [ ] **Backup Strategy** - Database backups

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check Supabase CORS settings
   - Verify frontend domain in allowed origins

2. **Authentication Issues**
   - Verify Supabase URL and keys
   - Check redirect URLs in Supabase settings

3. **API Connection Errors**
   - Verify backend URL in frontend environment
   - Check if backend is running

4. **Build Failures**
   - Check dependency versions
   - Verify Node.js and Python versions

### Debug Commands

```bash
# Check backend logs
railway logs

# Check frontend build
vercel logs

# Test API endpoints
curl https://your-backend-url.railway.app/health
```

## 📈 Performance Optimization

### Frontend
- Enable Next.js optimizations
- Use image optimization
- Implement proper caching

### Backend
- Enable response caching
- Optimize database queries
- Use connection pooling

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      # Add deployment steps for your platforms
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs
3. Test locally first
4. Contact platform support if needed

---

**Your Pathwise AI Phase 1 MVP is now ready for production! 🚀** 