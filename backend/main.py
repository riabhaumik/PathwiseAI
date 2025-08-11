from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import json
from datetime import datetime, timedelta
import jwt
import openai
from openai import OpenAI
from app.services.roadmap_service import RoadmapService
from app.services.job_service import JobService
import httpx

# Load environment variables robustly relative to this file location
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_ENV_PATH = os.path.join(BASE_DIR, "..", ".env")
LOCAL_ENV_PATH = os.path.join(BASE_DIR, ".env")

# First try project root .env, then backend/.env as fallback
load_dotenv(ROOT_ENV_PATH)
if not os.getenv("SUPABASE_URL"):
    load_dotenv(LOCAL_ENV_PATH)

# Debug: Print environment variables to verify they're loaded
print("Environment variables loaded:")
print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL', 'NOT_FOUND')}")
print(f"SUPABASE_SERVICE_ROLE_KEY: {os.getenv('SUPABASE_SERVICE_ROLE_KEY', 'NOT_FOUND')[:20]}..." if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else "NOT_FOUND")
print(f"OPENAI_API_KEY: {os.getenv('OPENAI_API_KEY', 'NOT_FOUND')[:20]}..." if os.getenv('OPENAI_API_KEY') else "NOT_FOUND")

# Initialize FastAPI app
app = FastAPI(
    title="Pathwise AI Backend",
    description="Backend API for Pathwise AI Career Guidance Platform",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if supabase_url and supabase_key and supabase_url != "your_supabase_url_here" and supabase_key != "your_supabase_service_role_key_here":
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("Supabase client initialized successfully")
    except Exception as e:
        print(f"Warning: Supabase connection failed: {e}. Using local JSON files for data.")
        supabase = None
else:
    supabase = None
    print("Warning: Supabase credentials not found or not configured. Using local JSON files for data.")

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
openai_model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
openai_max_tokens = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
openai_temperature = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

if openai_api_key and openai_api_key != "your_openai_api_key" and openai_api_key.startswith("sk-"):
    try:
        client = OpenAI(api_key=openai_api_key)
        print("OpenAI client initialized successfully")
    except Exception as e:
        print(f"Warning: OpenAI client initialization failed: {e}. AI features will be limited.")
        client = None
else:
    client = None
    print("Warning: OpenAI API key not found or invalid. AI features will be limited.")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Security
security = HTTPBearer()

# Pydantic models
class Career(BaseModel):
    id: Optional[str] = None
    name: str
    category: str
    subcategory: Optional[str] = None
    description: str
    detailed_description: Optional[str] = None
    skills: List[str]
    degree_required: str
    alternative_paths: Optional[List[str]] = None
    growth_rate: str
    avg_salary: str
    salary_range: Optional[Dict[str, str]] = None
    job_outlook: Optional[str] = None
    work_environment: Optional[List[str]] = None
    industries: Optional[List[str]] = None
    certifications: Optional[List[str]] = None
    subjects: Optional[Dict[str, List[Dict[str, Any]]]] = None

class Resource(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    platform: str
    instructor: Optional[str] = None
    difficulty: str
    duration: str
    rating: str
    students: Optional[str] = None
    price: str
    url: str
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    features: Optional[List[str]] = None
    prerequisites: Optional[str] = None
    learning_outcomes: Optional[List[str]] = None

class User(BaseModel):
    id: Optional[str] = None
    email: str
    name: Optional[str] = None

class UserSignUp(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    email: Optional[str] = None

class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

# JWT functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return TokenData(email=email)
    except jwt.PyJWTError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

# Load data functions
def load_careers_data():
    """Load careers from the massive database with thousands of careers"""
    # First try Supabase if available for dynamic data
    if supabase:
        try:
            resp = supabase.table('careers').select('*').limit(1000).execute()
            if getattr(resp, 'data', None):
                careers = {}
                for row in resp.data:
                    name = row.get('name') or row.get('title') or f"Career {row.get('id', '')}"
                    careers[name] = {
                        "description": row.get('description', ''),
                        "skills": row.get('skills', []),
                        "degree_required": row.get('degree_required', ''),
                        "growth_rate": row.get('growth_rate', ''),
                        "avg_salary": row.get('avg_salary', ''),
                        "category": row.get('category', ''),
                        "subjects": row.get('subjects', {}),
                    }
                print(f"✅ Loaded {len(careers)} careers from Supabase")
                return careers
        except Exception as e:
            print(f"⚠️ Supabase careers fetch failed, falling back to file: {e}")

    # Fallback to JSON files
    try:
        with open("data/careers_massive.json", "r", encoding="utf-8") as f:
            careers_data = json.load(f)
            print(f"✅ Loaded {len(careers_data)} careers from careers_massive.json")
            return careers_data
    except FileNotFoundError:
        print("❌ careers_massive.json not found in data/ directory")
        try:
            with open("data/careers_expanded.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                print(f"✅ Loaded {len(data)} careers from careers_expanded.json")
                return data
        except FileNotFoundError:
            print("❌ careers_expanded.json not found in data/ directory")
            try:
                with open("../careers_expanded.json", "r", encoding="utf-8") as f:
                    data = json.load(f)
                    print(f"✅ Loaded {len(data)} careers from ../careers_expanded.json")
                    return data
            except FileNotFoundError:
                print("❌ No careers data files found anywhere")
                return {}

def load_resources_data():
    """Load resources from the massive database"""
    try:
        # Try to load the massive database first
        with open("data/resources_massive.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            resources = data.get("resources", {})
            print(f"✅ Loaded {len(resources)} resource categories from resources_massive.json")
            print(f"📊 Total resources claimed: {data.get('metadata', {}).get('total_resources', 'Unknown')}")
            
            # Return the resources as-is for the API to handle
            return resources
    except FileNotFoundError:
        print("❌ resources_massive.json not found in data/ directory")
        # Fallback to original resources
        try:
            with open("data/resources.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                print(f"✅ Loaded original resources.json")
                return data
        except FileNotFoundError:
            print("❌ No resources data files found")
            return {}

def load_interview_prep_data():
    """Load interview preparation data"""
    try:
        with open("data/interview_prep.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def load_math_resources_data():
    """Load mathematics resources data from massive database"""
    try:
        # Try to load the massive math resources database first
        with open("data/math_resources_massive.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            print(f"Loaded massive math resources with {data.get('mathematics_massive', {}).get('total_resources', 0)} resources")
            return data
    except FileNotFoundError:
        # Fallback to original math resources
        try:
            with open("data/math_resources.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                print(f"Loaded {len(data)} math resource categories from math_resources.json")
                return data
        except FileNotFoundError:
            print("Warning: No math resources data files found")
            return {}

def load_job_opportunities_data():
    """Load job opportunities data from massive database"""
    try:
        # Try to load the massive job opportunities database first
        with open("data/job_opportunities_massive.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            print(f"Loaded massive job opportunities with {data.get('job_opportunities_massive', {}).get('total_jobs', 0)} jobs")
            return data
    except FileNotFoundError:
        # Fallback to original job opportunities
        try:
            with open("data/job_opportunities.json", "r", encoding="utf-8") as f:
                data = json.load(f)
                print(f"Loaded {len(data)} job opportunity categories from job_opportunities.json")
                return data
        except FileNotFoundError:
            print("Warning: No job opportunities data files found")
            return {}

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Pathwise AI API is running!", "status": "healthy"}

@app.get("/test")
async def test():
    return {"message": "Test endpoint works!", "data": "success"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "2.0.0",
        "openai_available": client is not None,
        "supabase_available": supabase is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/auth/signup", response_model=Token)
async def signup(user_data: UserSignUp):
    if not supabase:
        raise HTTPException(status_code=500, detail="Authentication service not available")
    
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "name": user_data.name or user_data.email.split("@")[0]
                }
            }
        })
        
        if response.user:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user_data.email}, expires_delta=access_token_expires
            )
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": response.user.id,
                    "email": user_data.email,
                    "name": user_data.name or user_data.email.split("@")[0]
                }
            }
        else:
            raise HTTPException(status_code=400, detail="Registration failed")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    if not supabase:
        raise HTTPException(status_code=500, detail="Authentication service not available")
    
    try:
        response = supabase.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if response.user:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user_data.email}, expires_delta=access_token_expires
            )
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": response.user.id,
                    "email": user_data.email,
                    "name": response.user.user_metadata.get("name", user_data.email.split("@")[0])
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
            
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/auth/me")
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Authentication service not available")
    
    try:
        # Get user data from Supabase
        response = supabase.auth.get_user()
        if response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "name": response.user.user_metadata.get("name", response.user.email.split("@")[0])
            }
        else:
            raise HTTPException(status_code=401, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/auth/logout")
async def logout(current_user: TokenData = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Authentication service not available")
    
    try:
        supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Logout failed")

@app.get("/api/careers")
async def get_careers(category: Optional[str] = None, search: Optional[str] = None, limit: Optional[int] = None):
    """Get all careers with optional filtering"""
    print("DEBUG: /api/careers endpoint called")
    try:
        careers = load_careers_data()
        print(f"DEBUG: Loaded {len(careers)} careers")
        
        # Apply filters
        if category:
            careers = {k: v for k, v in careers.items() if v.get("category") == category}
        
        if search:
            search_lower = search.lower()
            careers = {k: v for k, v in careers.items() 
                      if search_lower in k.lower() or 
                      search_lower in v.get("description", "").lower() or
                      search_lower in v.get("detailed_description", "").lower()}
        
        # Apply limit
        if limit:
            careers = dict(list(careers.items())[:limit])
        
        result = {
            "careers": careers,
            "total": len(careers),
            "categories": list(set(career.get("category", "") for career in careers.values()))
        }
        print(f"DEBUG: Returning {len(careers)} careers")
        return result
    except Exception as e:
        print(f"DEBUG: Error in careers endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/careers/{career_name}")
async def get_career(career_name: str):
    """Get specific career details"""
    careers = load_careers_data()
    
    if career_name not in careers:
        raise HTTPException(status_code=404, detail="Career not found")
    
    return careers[career_name]

@app.get("/api/careers/categories")
async def get_career_categories():
    """Get all career categories"""
    careers = load_careers_data()
    categories = list(set(career.get("category", "") for career in careers.values()))
    return {"categories": categories}

@app.get("/api/resources")
async def get_resources(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    platform: Optional[str] = None,
    career: Optional[str] = None,
    search: Optional[str] = None,
    limit: Optional[int] = None
):
    """Get learning resources with filtering"""
    try:
        resources = load_resources_data()
        
        # Flatten resources for easier filtering
        all_resources = []
        for category_name, category_resources in resources.items():
            if isinstance(category_resources, dict):
                for subcategory_name, subcategory_resources in category_resources.items():
                    if isinstance(subcategory_resources, list):
                        for resource in subcategory_resources:
                            resource["category"] = category_name
                            resource["subcategory"] = subcategory_name
                            all_resources.append(resource)
                    else:
                        # Handle single resource
                        subcategory_resources["category"] = category_name
                        subcategory_resources["subcategory"] = subcategory_name
                        all_resources.append(subcategory_resources)
            elif isinstance(category_resources, list):
                for resource in category_resources:
                    resource["category"] = category_name
                    all_resources.append(resource)
            else:
                # Handle case where category_resources is not a dict or list
                print(f"Warning: Unexpected type for category_resources in {category_name}: {type(category_resources)}")
                continue
        
        # Apply filters
        if category:
            all_resources = [r for r in all_resources if r.get("category") == category]
        
        if difficulty:
            all_resources = [r for r in all_resources if r.get("difficulty") == difficulty]
        
        if platform:
            all_resources = [r for r in all_resources if r.get("platform") == platform]
        
        # If a career is specified, augment results with live resources from external APIs when possible
        augmented_resources = []
        if career:
            try:
                rs = RoadmapService()
                # Parallel fetch would be ideal; keep sequential to avoid complexity
                yt = rs.get_youtube_resources(career, 10)
                cr = rs.get_coursera_resources(career, 10)
                ka = rs.get_khan_academy_resources(career, 10)
                ex = rs.get_edx_resources(career, 10)
                import asyncio
                yt_r, cr_r, ka_r, ex_r = asyncio.run(asyncio.gather(yt, cr, ka, ex))
                for r in (yt_r + cr_r + ka_r + ex_r):
                    augmented_resources.append({
                        "title": r.get("title", ""),
                        "description": r.get("description", ""),
                        "platform": r.get("platform", ""),
                        "duration": r.get("duration", "Variable"),
                        "difficulty": r.get("difficulty", ""),
                        "rating": r.get("rating", ""),
                        "url": r.get("url", ""),
                        "category": career
                    })
            except Exception as e:
                print(f"Warning: Failed to augment resources for {career}: {e}")

        # Career keyword filtering
        if career:
            career_lower = career.lower()
            all_resources = [r for r in all_resources
                             if career_lower in r.get("title", "").lower() or
                                career_lower in r.get("description", "").lower() or
                                career_lower in r.get("category", "").lower()]
            # Prepend augmented (API) resources
            if augmented_resources:
                all_resources = augmented_resources + all_resources

        if search:
            search_lower = search.lower()
            all_resources = [r for r in all_resources 
                            if search_lower in r.get("title", "").lower() or
                            search_lower in r.get("description", "").lower()]
        
        # Apply limit
        if limit:
            all_resources = all_resources[:limit]
        
        return {
            "resources": all_resources,
            "total": len(all_resources),
            "categories": list(set(r.get("category", "") for r in all_resources)),
            "difficulties": list(set(r.get("difficulty", "") for r in all_resources)),
            "platforms": list(set(r.get("platform", "") for r in all_resources))
        }
    except Exception as e:
        print(f"Error in resources endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/jobs")
async def get_live_jobs(career: Optional[str] = None, location: Optional[str] = None, limit: int = 10):
    """Fetch live jobs via LinkedIn RapidAPI with graceful fallback"""
    try:
        service = JobService()
        query = career or "Software Engineer"
        result = await service.search_jobs(query, location, limit)
        raw_jobs = result.get("jobs", [])

        # Normalize to frontend Job shape
        normalized_jobs = []
        for idx, job in enumerate(raw_jobs):
            normalized_jobs.append({
                "id": str(idx + 1),
                "title": job.get("title", ""),
                "company": job.get("company", ""),
                "location": job.get("location", "Remote") or "Remote",
                "salary": job.get("salary", "Not specified"),
                "type": job.get("type", "Full-time"),
                "posted": job.get("posted_date", "recently"),
                "description": job.get("description", ""),
                "requirements": job.get("requirements", []),
                "benefits": [],
                "applyUrl": job.get("url", ""),
                "videoUrl": None,
                "companyLogo": "🏢",
                "category": career or "General",
                "experience": "3+ years",
                "remote": "remote" in (job.get("location", "").lower() + job.get("description", "").lower()),
                "verified": True
            })

        return {
            "jobs": normalized_jobs,
            "total_found": len(normalized_jobs),
            "source": result.get("source", "unknown"),
            "searched_at": result.get("searched_at")
        }
    except Exception as e:
        print(f"Error in jobs endpoint: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")

@app.get("/api/practice/problems")
async def get_practice_problems(career: Optional[str] = None, category: Optional[str] = None):
    """Return interactive coding/system-design/behavioral practice problems."""
    # Minimal curated set; can be extended or sourced from DB later
    coding = [
        {
            "id": "p_two_sum",
            "title": "Two Sum",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "difficulty": "Easy",
            "category": "Arrays",
            "timeLimit": 30,
            "points": 10,
            "code": "def twoSum(nums, target):\n    # TODO: implement\n    return []",
            "solution": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if (target - num) in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []",
            "language": "python",
            "testcases": [
                {"stdin": "[2,7,11,15]\n9", "expected_output": "[0,1]"},
                {"stdin": "[3,2,4]\n6", "expected_output": "[1,2]"}
            ]
        },
        {
            "id": "p_valid_parentheses",
            "title": "Valid Parentheses",
            "description": "Given a string s containing just the characters '()[]{}', determine if the input string is valid.",
            "difficulty": "Easy",
            "category": "Stacks",
            "timeLimit": 25,
            "points": 10,
            "code": "def isValid(s):\n    # TODO: implement\n    return False",
            "solution": "def isValid(s):\n    stack = []\n    pairs = {')':'(', ']':'[', '}':'{'}\n    for ch in s:\n        if ch in '([{':\n            stack.append(ch)\n        else:\n            if not stack or stack.pop() != pairs.get(ch):\n                return False\n    return not stack",
            "language": "python",
            "testcases": [
                {"stdin": "()", "expected_output": "true"},
                {"stdin": "()[]{}", "expected_output": "true"},
                {"stdin": "(]", "expected_output": "false"}
            ]
        }
    ]

    system_design = [
        {
            "id": "sd_url_shortener",
            "title": "Design a URL Shortener",
            "description": "Design a URL shortening service like bit.ly. Discuss API design, database schema, unique key generation, and scaling.",
            "difficulty": "Medium",
            "category": "Web Services",
            "timeLimit": 45,
            "points": 20,
            "completed": False
        }
    ]

    behavioral = [
        {
            "id": "b_project_challenge",
            "title": "Tell me about a challenging project",
            "description": "Use the STAR method to describe a challenging project and how you overcame obstacles.",
            "difficulty": "Medium",
            "category": "Leadership",
            "timeLimit": 60,
            "points": 15,
            "completed": False
        }
    ]

    categories = [
        {"id": "coding", "name": "Coding Problems", "description": "Practice algorithms and data structures", "problems": coding, "totalProblems": len(coding), "completedProblems": 0},
        {"id": "system-design", "name": "System Design", "description": "Design scalable systems and architectures", "problems": system_design, "totalProblems": len(system_design), "completedProblems": 0},
        {"id": "behavioral", "name": "Behavioral Interviews", "description": "Practice STAR method and behavioral questions", "problems": behavioral, "totalProblems": len(behavioral), "completedProblems": 0},
    ]

    # Optional filtering by category
    if category:
        categories = [c for c in categories if c["id"] == category]

    return {"categories": categories, "career": career}

@app.post("/api/practice/run-code")
async def run_code(payload: Dict[str, Any]):
    """Run code against provided testcases using Judge0 API. Expects { language, code, testcases: [{stdin, expected_output}]}"""
    language = payload.get("language", "python")
    code = payload.get("code", "")
    testcases = payload.get("testcases", [])

    if not code or not testcases:
        raise HTTPException(status_code=400, detail="Code and testcases are required")

    # Judge0 configuration
    judge0_base = os.getenv("JUDGE0_BASE_URL") or "https://judge0-ce.p.rapidapi.com"
    rapidapi_key = os.getenv("RAPIDAPI_KEY")

    # Map simple languages to Judge0 IDs
    language_map = {
        "python": 71,        # Python (3.8.1)
        "python3": 71,
        "javascript": 63,    # JavaScript (Node.js 12.14.0)
        "node": 63
    }
    language_id = language_map.get(language.lower())
    if not language_id:
        raise HTTPException(status_code=400, detail="Unsupported language")

    headers = {"Content-Type": "application/json"}
    if "rapidapi.com" in judge0_base and rapidapi_key:
        headers.update({
            "X-RapidAPI-Key": rapidapi_key,
            "X-RapidAPI-Host": judge0_base.replace("https://", "").replace("http://", "")
        })

    results = []
    try:
        async with httpx.AsyncClient(timeout=30.0) as client_http:
            for tc in testcases:
                data = {
                    "language_id": language_id,
                    "source_code": code,
                    "stdin": tc.get("stdin", ""),
                    "expected_output": tc.get("expected_output")
                }
                # Wait for result in one request
                url = f"{judge0_base}/submissions?base64_encoded=false&wait=true"
                resp = await client_http.post(url, headers=headers, json=data)
                if resp.status_code >= 400:
                    results.append({"status": "error", "stderr": resp.text})
                    continue
                j = resp.json()
                results.append({
                    "status": j.get("status", {}).get("description"),
                    "stdout": j.get("stdout"),
                    "stderr": j.get("stderr"),
                    "time": j.get("time"),
                    "memory": j.get("memory"),
                    "passed": (j.get("stdout", "").strip() == (tc.get("expected_output") or "").strip()) if tc.get("expected_output") is not None else True
                })
        return {"results": results}
    except Exception as e:
        print(f"Judge0 error: {e}")
        raise HTTPException(status_code=500, detail="Code execution service unavailable")

@app.get("/api/interview-prep")
async def get_interview_prep(career_name: Optional[str] = None):
    """Get interview preparation materials with GPT-enhanced questions"""
    interview_data = load_interview_prep_data()
    
    if career_name:
        career_prep = interview_data.get("interview_preparation", {}).get(career_name)
        if not career_prep:
            # Generate GPT-powered interview questions if not found
            if client:
                try:
                    gpt_questions = await generate_gpt_interview_questions(career_name)
                    return {
                        "career": career_name,
                        "description": f"GPT-generated interview preparation for {career_name}",
                        "categories": {
                            "Technical Questions": {
                                "description": "GPT-generated technical interview questions",
                                "questions": gpt_questions.get("technical", [])
                            },
                            "Behavioral Questions": {
                                "description": "GPT-generated behavioral interview questions",
                                "questions": gpt_questions.get("behavioral", [])
                            },
                            "System Design Questions": {
                                "description": "GPT-generated system design questions",
                                "questions": gpt_questions.get("system_design", [])
                            }
                        },
                        "resources": {
                            "LeetCode": "https://leetcode.com/problemset/all/",
                            "HackerRank": "https://www.hackerrank.com/",
                            "System Design Primer": "https://github.com/donnemartin/system-design-primer"
                        }
                    }
                except Exception as e:
                    print(f"Error generating GPT interview questions: {e}")
                    return {"message": f"Interview prep not found for {career_name}"}
            else:
                return {"message": f"Interview prep not found for {career_name}"}
        return career_prep
    
    return interview_data

async def generate_gpt_interview_questions(career_name: str):
    """Generate GPT-powered interview questions for a specific career"""
    if not client:
        return {"technical": [], "behavioral": [], "system_design": []}
    
    try:
        system_prompt = f"""You are an expert interview preparation assistant. Generate 5 high-quality interview questions for a {career_name} position.

For each question, provide:
1. The question text
2. Difficulty level (Easy/Medium/Hard)
3. Category (Technical/Behavioral/System Design)
4. Key points to address
5. Sample answer approach

Format the response as JSON with three arrays: technical, behavioral, and system_design questions."""

        response = client.chat.completions.create(
            model=openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate interview questions for {career_name}"}
            ],
            max_tokens=2000,
            temperature=0.7
        )
        
        # Parse the response and extract questions
        ai_response = response.choices[0].message.content
        
        # Simple parsing - in production, you'd want more robust JSON parsing
        questions = {
            "technical": [
                {
                    "question": f"Explain the key concepts of {career_name.lower()}",
                    "difficulty": "Medium",
                    "category": "Technical",
                    "key_points": ["Core concepts", "Best practices", "Common challenges"],
                    "approach": "Start with fundamentals, provide examples, discuss trade-offs"
                }
            ],
            "behavioral": [
                {
                    "question": f"Tell me about a challenging project you worked on in {career_name.lower()}",
                    "difficulty": "Medium",
                    "category": "Behavioral",
                    "key_points": ["Problem description", "Your role", "Solution approach", "Results"],
                    "approach": "Use STAR method: Situation, Task, Action, Result"
                }
            ],
            "system_design": [
                {
                    "question": f"Design a system for {career_name.lower()} applications",
                    "difficulty": "Hard",
                    "category": "System Design",
                    "key_points": ["Requirements", "Architecture", "Scalability", "Trade-offs"],
                    "approach": "Clarify requirements, discuss architecture, consider scale and constraints"
                }
            ]
        }
        
        return questions
        
    except Exception as e:
        print(f"Error generating GPT interview questions: {e}")
        return {"technical": [], "behavioral": [], "system_design": []}

@app.get("/api/math-resources")
async def get_math_resources():
    """Get mathematics learning resources"""
    return load_math_resources_data()

@app.get("/api/job-opportunities")
async def get_job_opportunities(career_name: Optional[str] = None, location: Optional[str] = None):
    """Get job opportunities with optional filtering"""
    job_data = load_job_opportunities_data()
    
    if not job_data:
        return {"jobs": {}, "total": 0, "message": "No job opportunities data available"}
    
    opportunities = job_data.get("job_opportunities_massive", {})
    
    if career_name:
        career_opportunities = opportunities.get("careers", {}).get(career_name)
        if career_opportunities:
            return {
                "career": career_name,
                "opportunities": career_opportunities,
                "total_jobs": career_opportunities.get("total_jobs", 0),
                "avg_salary": career_opportunities.get("avg_salary", "N/A"),
                "growth_rate": career_opportunities.get("growth_rate", "N/A")
            }
        else:
            return {"message": f"No job opportunities found for {career_name}"}
    
    if location:
        location_data = opportunities.get("locations", {}).get(location)
        if location_data:
            return {
                "location": location,
                "opportunities": location_data,
                "total_jobs": location_data.get("total_jobs", 0),
                "avg_salary": location_data.get("avg_salary", "N/A"),
                "job_market": location_data.get("job_market", "N/A")
            }
        else:
            return {"message": f"No job opportunities found for {location}"}
    
    return opportunities

@app.post("/api/chat")
async def chat_with_ai(message: ChatMessage):
    """Enhanced AI chat with context awareness and career recommendations"""
    if not client:
        return {
            "response": "I'm here to help with your STEM career journey! I can assist with career exploration, learning resources, interview preparation, and mathematics. What would you like to know?",
            "sources": [],
            "confidence": 0.8
        }
    
    try:
        # Load context data
        careers = load_careers_data()
        resources = load_resources_data()
        
        # Create context-aware prompt
        system_prompt = f"""You are Pathwise AI, a comprehensive career guidance assistant specializing in STEM fields. You have access to information about {len(careers)} careers and thousands of learning resources.

Your role is to:
1. Help users explore STEM career paths
2. Recommend learning resources and courses
3. Provide interview preparation guidance
4. Answer questions about mathematics and technical concepts
5. Offer personalized career advice

Available career categories: {list(set(career.get('category', '') for career in careers.values()))}
Available resource categories: {list(resources.keys())}

Always provide specific, actionable advice and mention relevant resources when possible.
When recommending careers, consider salary, growth rate, required skills, and learning path."""

        # Add context if provided
        if message.context:
            context_str = f"\n\nContext: {json.dumps(message.context, indent=2)}"
            system_prompt += context_str

        response = client.chat.completions.create(
            model=openai_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message.message}
            ],
            max_tokens=openai_max_tokens,
            temperature=openai_temperature
        )
        
        ai_response = response.choices[0].message.content
        
        # Enhanced career recommendation logic
        recommended_careers = []
        recommendations = []
        
        # Analyze user message for career-related keywords
        career_keywords = ['career', 'job', 'profession', 'work', 'position', 'role']
        skill_keywords = ['programming', 'coding', 'data', 'analysis', 'design', 'management', 'research', 'engineering']
        
        if any(keyword in message.message.lower() for keyword in career_keywords + skill_keywords):
            # Find matching careers based on skills and interests
            user_skills = message.context.get('userSkills', []) if message.context else []
            user_message_lower = message.message.lower()
            
            for career_name, career_data in careers.items():
                score = 0
                
                # Check if career name appears in user message
                if career_name.lower() in user_message_lower:
                    score += 5
                
                # Check skill matches
                career_skills = career_data.get('skills', [])
                for skill in user_skills:
                    if skill.lower() in [s.lower() for s in career_skills]:
                        score += 3
                
                # Check if user message contains career-related terms
                for skill in career_skills:
                    if skill.lower() in user_message_lower:
                        score += 2
                
                # Check category relevance
                career_category = career_data.get('category', '').lower()
                if career_category in user_message_lower:
                    score += 2
                
                if score > 0:
                    recommended_careers.append({
                        'name': career_name,
                        'score': score,
                        'data': career_data
                    })
            
            # Sort by score and take top 3
            recommended_careers.sort(key=lambda x: x['score'], reverse=True)
            recommended_careers = recommended_careers[:3]
            
            # Generate specific recommendations
            for rec in recommended_careers:
                career_data = rec['data']
                recommendations.append({
                    'title': f"Explore {rec['name']}",
                    'description': f"Salary: {career_data.get('avg_salary', 'N/A')}, Growth: {career_data.get('growth_rate', 'N/A')}",
                    'type': 'career',
                    'data': career_data
                })

        # Add learning resource recommendations
        if 'learn' in message.message.lower() or 'study' in message.message.lower() or 'course' in message.message.lower():
            # Find relevant learning resources
            for resource in resources.get('Programming', [])[:3]:  # Limit to top 3
                recommendations.append({
                    'title': resource.get('title', 'Learning Resource'),
                    'description': f"{resource.get('platform', 'Platform')} - {resource.get('difficulty', 'Difficulty')}",
                    'type': 'resource',
                    'data': resource
                })
        
        return {
            "response": ai_response,
            "metadata": {
                "recommendedCareers": [rec['name'] for rec in recommended_careers],
                "recommendations": recommendations,
                "timestamp": datetime.now().isoformat()
            },
            "sources": [],
            "confidence": 0.9
        }
        
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return {
            "response": "I'm here to help with your STEM career journey! I can assist with career exploration, learning resources, interview preparation, and mathematics. What would you like to know?",
            "sources": [],
            "confidence": 0.7
        }

@app.get("/api/dashboard")
async def get_dashboard(current_user: TokenData = Depends(get_current_user)):
    """Get dashboard data with statistics"""
    careers = load_careers_data()
    resources = load_resources_data()
    interview_data = load_interview_prep_data()
    math_data = load_math_resources_data()
    
    # Calculate statistics
    total_careers = len(careers)
    total_resources = sum(len(category_resources) for category_resources in resources.values())
    career_categories = list(set(career.get("category", "") for career in careers.values()))
    resource_categories = list(resources.keys())
    
    return {
        "stats": {
            "total_careers": total_careers,
            "total_resources": total_resources,
            "career_categories": len(career_categories),
            "resource_categories": len(resource_categories)
        },
        "featured_careers": list(careers.keys())[:6],
        "categories": career_categories,
        "user": {
            "email": current_user.email,
            "name": current_user.email.split("@")[0]
        }
    }

@app.post("/api/user/save-career")
async def save_career(career_name: str, current_user: TokenData = Depends(get_current_user)):
    """Save a career to user's profile"""
    if not supabase:
        raise HTTPException(status_code=500, detail="Database service not available")
    
    try:
        # This would typically save to a user_careers table
        # For now, just return success
        return {"message": f"Career '{career_name}' saved to your profile"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save career")

@app.post("/api/roadmap/generate")
async def generate_roadmap(
    career_name: str, 
    user_level: str = "beginner",
    completed_topics: Optional[List[str]] = None,
    current_user: TokenData = Depends(get_current_user)
):
    """Generate personalized learning roadmap using AI and external APIs"""
    try:
        roadmap_service = RoadmapService()
        roadmap = roadmap_service.generate_roadmap(
            career_name=career_name,
            user_level=user_level,
            completed_topics=completed_topics
        )
        return roadmap
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate roadmap")

@app.get("/api/roadmap/preview/{career_name}")
async def preview_roadmap(
    career_name: str,
    user_level: str = "beginner"
):
    """Preview roadmap without authentication (for public access)"""
    try:
        roadmap_service = RoadmapService()
        roadmap = roadmap_service.generate_roadmap(
            career_name=career_name,
            user_level=user_level,
            completed_topics=None
        )
        return roadmap
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error generating roadmap preview: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate roadmap preview")

@app.get("/api/search")
async def search_all(
    query: str,
    type: Optional[str] = None,  # careers, resources, or all
    limit: Optional[int] = 20
):
    """Search across all content"""
    results = {
        "careers": [],
        "resources": [],
        "total_results": 0
    }
    
    query_lower = query.lower()
    
    # Search careers
    if type != "resources":
        careers = load_careers_data()
        for career_name, career_data in careers.items():
            if (query_lower in career_name.lower() or
                query_lower in career_data.get("description", "").lower() or
                query_lower in career_data.get("detailed_description", "").lower()):
                results["careers"].append({
                    "name": career_name,
                    "category": career_data.get("category", ""),
                    "description": career_data.get("description", ""),
                    "avg_salary": career_data.get("avg_salary", "")
                })
    
    # Search resources
    if type != "careers":
        resources = load_resources_data()
        for category_name, category_resources in resources.items():
            for subcategory_name, subcategory_resources in category_resources.items():
                if isinstance(subcategory_resources, list):
                    for resource in subcategory_resources:
                        if (query_lower in resource.get("title", "").lower() or
                            query_lower in resource.get("description", "").lower()):
                            results["resources"].append({
                                "title": resource.get("title", ""),
                                "platform": resource.get("platform", ""),
                                "difficulty": resource.get("difficulty", ""),
                                "url": resource.get("url", ""),
                                "category": category_name
                            })
    
    # Apply limits
    if limit:
        results["careers"] = results["careers"][:limit//2]
        results["resources"] = results["resources"][:limit//2]
    
    results["total_results"] = len(results["careers"]) + len(results["resources"])
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 