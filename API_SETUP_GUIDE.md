# API Setup Guide for PathwiseAI

## Overview
This guide will help you set up the necessary API keys and configuration to ensure your PathwiseAI application works properly with all features enabled.

## Required API Keys

### 1. OpenAI API Key
**Purpose**: AI-powered career guidance, learning path generation, and interview preparation
**How to get**: 
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

**Usage**: Used by the AI service for generating personalized career advice and learning recommendations

### 2. Supabase Configuration
**Purpose**: User authentication, database storage, and user progress tracking
**How to get**:
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > API
4. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key

**Usage**: Handles user accounts, stores practice progress, and manages user data

## Configuration Steps

### Step 1: Backend Configuration
1. Navigate to the `backend` directory
2. Create a `.env` file (if it doesn't exist)
3. Add the following configuration:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET_KEY=your_secure_random_string_here

# Backend Configuration
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
```

### Step 2: Frontend Configuration
1. Navigate to the `frontend` directory
2. Create a `.env.local` file
3. Add the following configuration:

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Supabase Configuration (if using client-side auth)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 3: Start the Backend
1. Open a terminal in the `backend` directory
2. Install dependencies: `pip install -r requirements.txt`
3. Start the server: `python main.py`
4. Verify the server is running at `http://localhost:8000`

### Step 4: Start the Frontend
1. Open another terminal in the `frontend` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Verify the app is running at `http://localhost:3000`

## Testing the Setup

### 1. Test Authentication
- Go to `/login` page
- Try to sign in with test credentials
- Check if the authentication persists

### 2. Test AI Features
- Go to `/careers` page
- Try the AI chat feature
- Verify AI responses are generated

### 3. Test Practice Problems
- Go to `/practice` page
- Verify practice problems load
- Check if progress is saved

### 4. Test Career Roadmaps
- Go to `/roadmap` page
- Verify career paths display
- Check if learning resources are available

## Troubleshooting

### Common Issues

#### 1. "AI service not properly configured"
**Solution**: Check your OpenAI API key in the backend `.env` file

#### 2. "Authentication failed"
**Solution**: Verify Supabase configuration and check network connectivity

#### 3. "Practice problems not loading"
**Solution**: Ensure backend is running and accessible from frontend

#### 4. "User progress not saving"
**Solution**: Check Supabase database connection and table setup

### Debug Steps
1. Check browser console for error messages
2. Verify backend server is running and accessible
3. Check API endpoints in browser network tab
4. Verify environment variables are loaded correctly

## Security Notes

### Important Security Considerations
1. **Never commit API keys to version control**
2. **Use environment variables for sensitive data**
3. **Rotate API keys regularly**
4. **Monitor API usage and costs**
5. **Use appropriate access controls**

### Production Deployment
1. Use secure environment variable management
2. Enable HTTPS
3. Set up proper CORS configuration
4. Implement rate limiting
5. Monitor and log API usage

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the error logs in browser console and backend terminal
3. Verify all configuration steps are completed
4. Check network connectivity and firewall settings

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
