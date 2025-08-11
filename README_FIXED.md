# Pathwise AI - Fixed Setup Guide

This guide will help you fix and run the Pathwise AI application properly.

## 🚨 Issues Fixed

1. **Backend file path issues** - Fixed paths to point to `backend/data/` directory
2. **Port conflicts** - Fixed backend startup script to run from correct directory
3. **Frontend startup issues** - Fixed to run Next.js instead of Streamlit
4. **Data loading problems** - All data files now properly referenced

## 📁 Project Structure

```
PathwiseAI/
├── backend/
│   ├── data/
│   │   ├── careers_massive.json (264KB, 9444 lines)
│   │   ├── resources_massive.json (19KB, 545 lines)
│   │   ├── math_resources_massive.json (35KB, 851 lines)
│   │   ├── job_opportunities_massive.json (17KB, 467 lines)
│   │   └── interview_prep.json (15KB, 292 lines)
│   ├── main.py (Fixed file paths)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   └── env.example
├── start_app.py (New comprehensive startup script)
├── test_backend.py (New test script)
├── run_backend.py (Fixed)
├── run_frontend.py (Fixed)
└── env.example
```

## 🚀 Quick Start

### Option 1: Use the Comprehensive Startup Script (Recommended)

```bash
# Run the comprehensive startup script
python start_app.py
```

This script will:
- ✅ Check dependencies
- ✅ Set up environment files
- ✅ Install frontend dependencies
- ✅ Start backend server
- ✅ Start frontend server
- ✅ Provide status updates

### Option 2: Manual Setup

#### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
cd ..
```

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

#### 3. Set Up Environment Variables

```bash
# Copy the environment template
cp env.example .env

# Edit .env with your API keys
# You'll need:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
```

#### 4. Start Backend

```bash
python run_backend.py
```

#### 5. Start Frontend (in new terminal)

```bash
python run_frontend.py
```

## 🧪 Testing

### Test Backend

```bash
python test_backend.py
```

This will test:
- ✅ Backend health
- ✅ Careers API
- ✅ Resources API
- ✅ Data loading

### Test Frontend

```bash
cd frontend
npm run dev
```

Then visit: http://localhost:3000

## 📊 Data Files Status

| File | Size | Status |
|------|------|--------|
| careers_massive.json | 264KB | ✅ Loaded correctly |
| resources_massive.json | 19KB | ✅ Loaded correctly |
| math_resources_massive.json | 35KB | ✅ Loaded correctly |
| job_opportunities_massive.json | 17KB | ✅ Loaded correctly |
| interview_prep.json | 15KB | ✅ Loaded correctly |

## 🔧 API Endpoints

Once running, you can access:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Key API Endpoints

- `GET /api/careers` - Get all careers
- `GET /api/resources` - Get all resources
- `GET /api/careers/{career_name}` - Get specific career
- `GET /api/math-resources` - Get math resources
- `GET /api/job-opportunities` - Get job opportunities

## 🛠️ Troubleshooting

### Backend Issues

1. **Port 8000 already in use**
   ```bash
   # Find and kill the process
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

2. **Data files not found**
   - Ensure you're running from the project root
   - Check that `backend/data/` directory exists
   - Verify all JSON files are present

3. **Dependencies missing**
   ```bash
   pip install -r backend/requirements.txt
   ```

### Frontend Issues

1. **Node.js not found**
   - Install Node.js from https://nodejs.org/

2. **npm install fails**
   ```bash
   cd frontend
   npm cache clean --force
   npm install
   ```

3. **Port 3000 already in use**
   ```bash
   # Find and kill the process
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_change_in_production
```

## 🎯 What's Fixed

1. **File Path Issues**: All data loading functions now correctly point to `backend/data/`
2. **Backend Startup**: Fixed to run from the correct directory with proper module path
3. **Frontend Startup**: Changed from Streamlit to Next.js
4. **Port Conflicts**: Proper process management and port checking
5. **Data Loading**: All massive JSON files are now properly loaded
6. **Error Handling**: Better error messages and fallback mechanisms

## 🚀 Next Steps

1. Run `python start_app.py` to start everything
2. Test with `python test_backend.py` to verify backend
3. Visit http://localhost:3000 to see the frontend
4. Check http://localhost:8000/docs for API documentation

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run `python test_backend.py` to diagnose backend issues
3. Check the console output for specific error messages
4. Ensure all dependencies are installed correctly

The application should now start properly with all data files loaded correctly! 