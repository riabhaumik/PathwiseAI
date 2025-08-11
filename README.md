# 🚀 Pathwise AI - Phase 1 MVP

Your personalized STEM career navigator powered by AI. Discover 1,247+ careers, access 12,473+ learning resources, and get AI-powered guidance to build your dream career path.

## ✨ Phase 1 MVP Features

### ✅ **Core Features Implemented:**

- **🎯 AI-Powered Career Guidance** - Personalized career roadmaps with OpenAI integration
- **📚 12,473+ Learning Resources** - Curated courses from Coursera, edX, Udemy, and more
- **💼 1,247+ Career Paths** - Comprehensive STEM career database with detailed information
- **🧮 Mathematics Pathway** - Interactive math lessons and practice problems
- **🤖 AI Career Assistant** - Real-time chat with career advice and recommendations
- **📊 Progress Tracking** - Monitor your learning journey with detailed analytics
- **🔐 Supabase Authentication** - Secure login/signup with progress storage
- **💻 Interview Preparation** - Technical questions, behavioral prep, and mock interviews
- **🎨 Modern UI/UX** - Beautiful, responsive design with dark mode support

### 🛠 **Tech Stack:**

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + Python + OpenAI + Supabase
- **Database**: Supabase (PostgreSQL + Auth)
- **APIs**: OpenAI GPT-4, JSearch, RapidAPI, Browse AI
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Supabase account
- OpenAI API key

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd PathwiseAI
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp env.example .env
```

Edit `.env` with your credentials:

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

### 3. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
pip install -r requirements_working.txt
```

### 4. Start the Development Servers

#### Option A: Use the provided startup script
```bash
# From the root directory
python start_backend.py
```

In another terminal:
```bash
cd frontend
npm run dev
```

#### Option B: Manual startup
```bash
# Backend (Terminal 1)
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
PathwiseAI/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   └── lib/            # Utilities and services
│   └── public/              # Static assets
├── backend/                  # FastAPI backend
│   ├── app/                 # Application modules
│   ├── data/                # JSON data files
│   └── main.py              # FastAPI application
├── auth/                     # Authentication utilities
└── data/                     # Career and resource data
```

## 🎯 Key Features Walkthrough

### 1. **Landing Page** (`/`)
- Beautiful hero section with animated elements
- Career showcase with filtering
- Feature highlights and statistics
- Call-to-action for user engagement

### 2. **Authentication** (`/login`, `/signup`)
- Supabase-powered authentication
- Guest mode for demo users
- Secure token management
- User progress tracking

### 3. **Dashboard** (`/dashboard`)
- Multi-tab interface (Overview, Careers, Jobs, Learning, Practice, AI Assistant)
- Personalized career recommendations
- Progress tracking and analytics
- Quick access to all features

### 4. **Career Exploration**
- 1,247+ detailed career profiles
- Filter by category, skills, salary
- Growth rates and job outlook
- Required skills and education paths

### 5. **AI Assistant** (`/dashboard?tab=ai-assistant`)
- Real-time chat with OpenAI GPT-4
- Career recommendations based on skills
- Interview preparation guidance
- Learning resource suggestions

### 6. **Learning Resources**
- 12,473+ curated courses and materials
- Filter by platform, difficulty, topic
- Direct links to external platforms
- Progress tracking for courses

### 7. **Interview Preparation** (`/practice`)
- Technical coding problems
- Behavioral interview scenarios
- System design challenges
- Mock interview simulations

### 8. **Job Opportunities**
- Real job listings integration
- Filter by location and career
- Direct application links
- Salary and company information

## 🔧 API Endpoints

### Core Endpoints
- `GET /api/careers` - Get all careers with filtering
- `GET /api/resources` - Get learning resources
- `GET /api/job-opportunities` - Get job listings
- `POST /api/chat` - AI assistant chat
- `POST /api/roadmap/generate` - Generate career roadmap

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Search & Analytics
- `GET /api/search` - Global search across all data
- `GET /api/dashboard` - User dashboard data
- `GET /api/interview-prep` - Interview preparation resources

## 🎨 UI/UX Features

- **Responsive Design** - Works on all devices
- **Dark Mode** - Toggle between light and dark themes
- **Smooth Animations** - Framer Motion powered transitions
- **Loading States** - Skeleton screens and progress indicators
- **Error Handling** - Graceful error messages and fallbacks
- **Accessibility** - WCAG compliant design

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy using Railway CLI or Render dashboard
```

## 🔮 Next Steps (Phase 2)

- **Advanced AI Features** - More sophisticated career matching
- **Social Features** - User communities and networking
- **Mobile App** - React Native application
- **Advanced Analytics** - Detailed progress insights
- **Enterprise Features** - Team and organization management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@pathwise.ai or create an issue in the repository.

---

**Built with ❤️ for the next generation of STEM professionals** 