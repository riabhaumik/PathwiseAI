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
from app.api.interview_prep import router as interview_prep_router
from app.api.careers import router as careers_router
from app.api.roadmap import router as roadmap_router
from app.api.resources import router as resources_router
from app.api.math_resources import router as math_resources_router
from app.api.ai import router as ai_router
import httpx
import asyncio

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

# CORS middleware (allow configured frontend origin in addition to localhost)
frontend_origin = os.getenv("FRONTEND_URL") or "http://localhost:3000"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(interview_prep_router)
app.include_router(careers_router)
app.include_router(roadmap_router)
app.include_router(resources_router)
app.include_router(math_resources_router)
app.include_router(ai_router)

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
    """Load careers data from the database or fallback to STEM careers JSON file"""
    try:
        # Try to fetch from Supabase first
        if supabase:
            try:
                response = supabase.table("careers").select("*").execute()
                if response.data:
                    print(f"SUCCESS: Loaded {len(response.data)} careers from Supabase")
                    return response.data
                else:
                    print("WARNING: Supabase returned no data, falling back to file")
            except Exception as e:
                print(f"WARNING: Supabase careers fetch failed, falling back to file: {e}")

        # Fallback to STEM careers JSON file
        try:
            with open("data/careers_stem.json", "r", encoding="utf-8") as f:
                careers_data = json.load(f)
                print(f"SUCCESS: Loaded {len(careers_data)} STEM careers from careers_stem.json")
                return careers_data
        except FileNotFoundError:
            print("ERROR: careers_stem.json not found in data/ directory")
            return {}
    except Exception as e:
        print(f"ERROR: Error loading careers data: {e}")
        return {}

def load_resources_data():
    """Load resources from the massive database"""
    try:
        # Try to load the massive database first
        with open("data/resources_massive.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            resources = data.get("resources", {})
            print(f"SUCCESS: Loaded {len(resources)} resource categories from resources_massive.json")
            print(f"INFO: Total resources claimed: {data.get('metadata', {}).get('total_resources', 'Unknown')}")
            
            # Return the resources as-is for the API to handle
            return resources
    except FileNotFoundError:
        print("ERROR: resources_massive.json not found in data/ directory")
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

@app.get("/api/careers/categories")
async def get_career_categories():
    """Get all career categories"""
    careers = load_careers_data()
    categories = list(set(career.get("category", "") for career in careers.values()))
    return {"categories": categories}

@app.get("/api/careers/{career_name}")
async def get_career(career_name: str):
    """Get specific career details"""
    careers = load_careers_data()
    
    if career_name not in careers:
        raise HTTPException(status_code=404, detail="Career not found")
    
    return careers[career_name]

@app.get("/api/resources")
async def get_resources(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    platform: Optional[str] = None,
    career: Optional[str] = None,
    search: Optional[str] = None,
    topic: Optional[str] = None,
    limit: Optional[int] = None,
    validate: Optional[bool] = False
):
    """Get learning resources with filtering"""
    try:
        # Simple in-memory cache for repeat queries
        cache_key = json.dumps({
            "category": category,
            "difficulty": difficulty,
            "platform": platform,
            "career": career,
            "search": search,
            "limit": limit,
            "topic": topic,
            "validate": validate,
        }, sort_keys=True)
        if not hasattr(get_resources, "_cache"):
            get_resources._cache = {}
        _cache = getattr(get_resources, "_cache")
        cached = _cache.get(cache_key)
        if cached and (datetime.utcnow() - cached[0]) < timedelta(minutes=10):
            return cached[1]
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
                # Parallel fetch with asyncio
                yt = rs.get_youtube_resources(career, 10)
                cr = rs.get_coursera_resources(career, 10)
                ka = rs.get_khan_academy_resources(career, 10)
                ex = rs.get_edx_resources(career, 10)
                import asyncio
                yt_r, cr_r, ka_r, ex_r = await asyncio.gather(yt, cr, ka, ex)
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

        # Map topic to search if provided
        if topic and not search:
            search = topic

        if search:
            search_lower = search.lower()
            all_resources = [r for r in all_resources 
                            if search_lower in r.get("title", "").lower() or
                            search_lower in r.get("description", "").lower()]
        
        # Optionally validate links server-side
        if validate:
            try:
                import asyncio as _asyncio
                async def _validate(urls):
                    timeout = httpx.Timeout(5.0, connect=5.0)
                    limits = httpx.Limits(max_keepalive_connections=5, max_connections=20)
                    results = {}
                    async with httpx.AsyncClient(timeout=timeout, limits=limits, follow_redirects=True) as client_http:
                        async def check(u: str):
                            try:
                                r = await client_http.head(u)
                                if r.status_code >= 400 or r.status_code == 405:
                                    r = await client_http.get(u)
                                results[u] = r.status_code
                            except Exception:
                                results[u] = None
                        tasks = [check(u) for u in [r.get("url") for r in all_resources if r.get("url")][:200]]
                        await _asyncio.gather(*tasks)
                    return results
                statuses = await _validate([r.get("url") for r in all_resources if r.get("url")])
                ok_set = {u for u, s in statuses.items() if s and 200 <= s < 400}
                all_resources = [r for r in all_resources if r.get("url") in ok_set]
            except Exception as e:
                print(f"Warning: link validation failed: {e}")

        # Apply limit
        if limit:
            all_resources = all_resources[:limit]

        response = {
            "resources": all_resources,
            "total": len(all_resources),
            "categories": list(set(r.get("category", "") for r in all_resources)),
            "difficulties": list(set(r.get("difficulty", "") for r in all_resources)),
            "platforms": list(set(r.get("platform", "") for r in all_resources))
        }
        _cache[cache_key] = (datetime.utcnow(), response)
        return response
    except Exception as e:
        print(f"Error in resources endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def _validate_links(urls: List[str]) -> Dict[str, Optional[int]]:
    results: Dict[str, Optional[int]] = {}
    timeout = httpx.Timeout(5.0, connect=5.0)
    limits = httpx.Limits(max_keepalive_connections=5, max_connections=20)
    async with httpx.AsyncClient(timeout=timeout, limits=limits, follow_redirects=True) as client_http:
        async def check(u: str):
            try:
                r = await client_http.head(u)
                if r.status_code >= 400 or r.status_code == 405:
                    r = await client_http.get(u)
                results[u] = r.status_code
            except Exception:
                results[u] = None
        tasks = [check(u) for u in urls[:200]]
        await asyncio.gather(*tasks)
    return results

@app.post("/api/validate-links")
async def validate_links(payload: Dict[str, Any]):
    urls = payload.get("urls", [])
    if not isinstance(urls, list) or not urls:
        raise HTTPException(status_code=400, detail="urls list required")
    statuses = await _validate_links([u for u in urls if isinstance(u, str)])
    return {"statuses": statuses}

@app.get("/api/jobs")
async def get_live_jobs(career: Optional[str] = None, location: Optional[str] = None, limit: int = 20):
    """Fetch live jobs via LinkedIn RapidAPI with graceful fallback"""
    try:
        service = JobService()
        query = career or "Software Engineer"
        # cache layer for repeat queries
        cache_key = f"jobs::{query}::{location or 'any'}::{limit}"
        if not hasattr(get_live_jobs, "_cache"):
            get_live_jobs._cache = {}
        cache = getattr(get_live_jobs, "_cache")
        cached = cache.get(cache_key)
        if cached and (datetime.utcnow() - cached[0]) < timedelta(minutes=10):
            result = cached[1]
        else:
            result = await service.search_jobs(query, location, limit)
            cache[cache_key] = (datetime.utcnow(), result)
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

        response = {
            "jobs": normalized_jobs,
            "total_found": len(normalized_jobs),
            "source": result.get("source", "unknown"),
            "searched_at": result.get("searched_at")
        }
        return response
    except Exception as e:
        print(f"Error in jobs endpoint: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")

@app.get("/api/practice/problems")
async def get_practice_problems(career: Optional[str] = None, category: Optional[str] = None):
    """Return comprehensive interactive practice problems for STEM careers."""
    
    # Enhanced coding problems with career-specific focus
    coding = [
        {
            "id": "p_two_sum",
            "title": "Two Sum",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "difficulty": "Easy",
            "category": "Arrays & Hashing",
            "timeLimit": 30,
            "points": 10,
            "code": "def twoSum(nums, target):\n    # TODO: implement\n    return []",
            "solution": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if (target - num) in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []",
            "language": "python",
            "testcases": [
                {"stdin": "[2,7,11,15]\n9", "expected_output": "[0,1]"},
                {"stdin": "[3,2,4]\n6", "expected_output": "[1,2]"}
            ],
            "careers": ["Software Engineer", "Data Scientist", "AI Engineer"]
        },
        {
            "id": "p_valid_parentheses",
            "title": "Valid Parentheses",
            "description": "Given a string s containing just the characters '()[]{}', determine if the input string is valid.",
            "difficulty": "Easy",
            "category": "Stack & Queue",
            "timeLimit": 25,
            "points": 10,
            "code": "def isValid(s):\n    # TODO: implement\n    return False",
            "solution": "def isValid(s):\n    stack = []\n    pairs = {')':'(', ']':'[', '}':'{'}\n    for ch in s:\n        if ch in '([{':\n            stack.append(ch)\n        else:\n            if not stack or stack.pop() != pairs.get(ch):\n                return False\n    return not stack",
            "language": "python",
            "testcases": [
                {"stdin": "()", "expected_output": "true"},
                {"stdin": "()[]{}", "expected_output": "true"},
                {"stdin": "(]", "expected_output": "false"}
            ],
            "careers": ["Software Engineer", "DevOps Engineer"]
        },
        {
            "id": "p_binary_search",
            "title": "Binary Search Implementation",
            "description": "Implement binary search algorithm to find target in sorted array. Return index if found, -1 otherwise.",
            "difficulty": "Easy",
            "category": "Binary Search",
            "timeLimit": 20,
            "points": 15,
            "code": "def binarySearch(nums, target):\n    # TODO: implement\n    return -1",
            "solution": "def binarySearch(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1",
            "language": "python",
            "testcases": [
                {"stdin": "[1,3,5,7,9]\n5", "expected_output": "2"},
                {"stdin": "[1,2,3,4,5]\n6", "expected_output": "-1"}
            ],
            "careers": ["Software Engineer", "AI Engineer", "Data Scientist"]
        },
        {
            "id": "p_merge_sorted_arrays",
            "title": "Merge Two Sorted Arrays",
            "description": "Merge two sorted arrays into one sorted array efficiently.",
            "difficulty": "Medium",
            "category": "Two Pointers",
            "timeLimit": 35,
            "points": 20,
            "code": "def merge(nums1, m, nums2, n):\n    # TODO: merge nums2 into nums1\n    pass",
            "solution": "def merge(nums1, m, nums2, n):\n    i, j, k = m - 1, n - 1, m + n - 1\n    while j >= 0:\n        if i >= 0 and nums1[i] > nums2[j]:\n            nums1[k] = nums1[i]\n            i -= 1\n        else:\n            nums1[k] = nums2[j]\n            j -= 1\n        k -= 1",
            "language": "python",
            "testcases": [
                {"stdin": "[1,2,3,0,0,0]\n3\n[2,5,6]\n3", "expected_output": "[1,2,2,3,5,6]"}
            ],
            "careers": ["Software Engineer", "Data Scientist"]
        },
        {
            "id": "p_max_subarray",
            "title": "Maximum Subarray (Kadane's Algorithm)",
            "description": "Find the contiguous subarray with the largest sum and return its sum.",
            "difficulty": "Medium",
            "category": "Dynamic Programming",
            "timeLimit": 40,
            "points": 25,
            "code": "def maxSubArray(nums):\n    # TODO: implement Kadane's algorithm\n    return 0",
            "solution": "def maxSubArray(nums):\n    max_sum = current_sum = nums[0]\n    for num in nums[1:]:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum",
            "language": "python",
            "testcases": [
                {"stdin": "[-2,1,-3,4,-1,2,1,-5,4]", "expected_output": "6"},
                {"stdin": "[1]", "expected_output": "1"}
            ],
            "careers": ["Software Engineer", "AI Engineer", "Data Scientist"]
        },
        {
            "id": "p_reverse_linked_list",
            "title": "Reverse Linked List",
            "description": "Reverse a singly linked list iteratively and return the new head.",
            "difficulty": "Medium",
            "category": "Linked Lists",
            "timeLimit": 30,
            "points": 20,
            "code": "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head):\n    # TODO: reverse the linked list\n    return head",
            "solution": "def reverseList(head):\n    prev = None\n    current = head\n    while current:\n        next_temp = current.next\n        current.next = prev\n        prev = current\n        current = next_temp\n    return prev",
            "language": "python",
            "testcases": [
                {"stdin": "[1,2,3,4,5]", "expected_output": "[5,4,3,2,1]"}
            ],
            "careers": ["Software Engineer", "DevOps Engineer"]
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
            "completed": False,
            "careers": ["Software Engineer", "DevOps Engineer"]
        },
        {
            "id": "sd_chat_system",
            "title": "Design a Chat System",
            "description": "Design a real-time chat application like WhatsApp. Consider message delivery, online presence, push notifications.",
            "difficulty": "Hard",
            "category": "Distributed Systems",
            "timeLimit": 60,
            "points": 30,
            "completed": False,
            "careers": ["Software Engineer", "DevOps Engineer"]
        },
        {
            "id": "sd_recommendation_system",
            "title": "Design a Recommendation System",
            "description": "Design a recommendation system for an e-commerce platform. Discuss collaborative filtering, content-based filtering, and scalability.",
            "difficulty": "Hard",
            "category": "Machine Learning Systems",
            "timeLimit": 50,
            "points": 25,
            "completed": False,
            "careers": ["Data Scientist", "AI Engineer", "Software Engineer"]
        },
        {
            "id": "sd_data_pipeline",
            "title": "Design a Data Processing Pipeline",
            "description": "Design a real-time data processing pipeline for analytics. Consider data ingestion, processing, storage, and monitoring.",
            "difficulty": "Medium",
            "category": "Data Engineering",
            "timeLimit": 40,
            "points": 20,
            "completed": False,
            "careers": ["Data Scientist", "DevOps Engineer"]
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
            "completed": False,
            "careers": ["Software Engineer", "Product Manager", "Data Scientist"]
        },
        {
            "id": "b_team_conflict",
            "title": "Describe a time you had to resolve team conflict",
            "description": "Explain how you handled disagreements in a team setting and achieved resolution.",
            "difficulty": "Medium",
            "category": "Teamwork",
            "timeLimit": 45,
            "points": 15,
            "completed": False,
            "careers": ["Product Manager", "Software Engineer", "DevOps Engineer"]
        },
        {
            "id": "b_technical_decision",
            "title": "Explain a difficult technical decision you made",
            "description": "Describe the trade-offs you considered and how you arrived at your decision.",
            "difficulty": "Hard",
            "category": "Technical Leadership",
            "timeLimit": 50,
            "points": 20,
            "completed": False,
            "careers": ["Software Engineer", "DevOps Engineer", "AI Engineer"]
        },
        {
            "id": "b_failure_learning",
            "title": "Tell me about a time you failed and what you learned",
            "description": "Discuss a professional failure, what you learned, and how you applied those lessons.",
            "difficulty": "Medium",
            "category": "Growth Mindset",
            "timeLimit": 40,
            "points": 15,
            "completed": False,
            "careers": ["Software Engineer", "Product Manager", "Data Scientist", "AI Engineer"]
        }
    ]

    # Math problems for STEM careers
    math_problems = [
        {
            "id": "m_linear_algebra",
            "title": "Matrix Multiplication",
            "description": "Given two matrices A and B, compute their product C = A × B. Verify dimensions are compatible.",
            "difficulty": "Medium",
            "category": "Linear Algebra",
            "timeLimit": 25,
            "points": 15,
            "completed": False,
            "careers": ["Data Scientist", "AI Engineer"]
        },
        {
            "id": "m_statistics",
            "title": "Hypothesis Testing",
            "description": "Design and conduct a t-test to determine if two sample means are significantly different.",
            "difficulty": "Medium",
            "category": "Statistics",
            "timeLimit": 30,
            "points": 20,
            "completed": False,
            "careers": ["Data Scientist", "Product Manager"]
        },
        {
            "id": "m_calculus",
            "title": "Gradient Descent",
            "description": "Implement gradient descent algorithm to minimize a quadratic function. Calculate partial derivatives.",
            "difficulty": "Hard",
            "category": "Calculus & Optimization",
            "timeLimit": 35,
            "points": 25,
            "completed": False,
            "careers": ["AI Engineer", "Data Scientist"]
        },
        {
            "id": "m_probability",
            "title": "Bayes' Theorem Application",
            "description": "Apply Bayes' theorem to solve a real-world classification problem with given prior probabilities.",
            "difficulty": "Medium",
            "category": "Probability",
            "timeLimit": 20,
            "points": 15,
            "completed": False,
            "careers": ["Data Scientist", "AI Engineer"]
        }
    ]

    categories = [
        {"id": "coding", "name": "Coding Problems", "description": "Practice algorithms and data structures", "problems": coding, "totalProblems": len(coding), "completedProblems": 0},
        {"id": "system-design", "name": "System Design", "description": "Design scalable systems and architectures", "problems": system_design, "totalProblems": len(system_design), "completedProblems": 0},
        {"id": "behavioral", "name": "Behavioral Interviews", "description": "Practice STAR method and behavioral questions", "problems": behavioral, "totalProblems": len(behavioral), "completedProblems": 0},
        {"id": "mathematics", "name": "Mathematics", "description": "Mathematical concepts for STEM careers", "problems": math_problems, "totalProblems": len(math_problems), "completedProblems": 0},
    ]

    # Filter by career if specified
    if career:
        for cat in categories:
            cat["problems"] = [p for p in cat["problems"] if not p.get("careers") or career in p.get("careers", [])]
            cat["totalProblems"] = len(cat["problems"])

    # Optional filtering by category
    if category:
        categories = [c for c in categories if c["id"] == category]

    return {
        "categories": categories, 
        "career": career,
        "total_problems": sum(len(cat["problems"]) for cat in categories),
        "available_categories": ["coding", "system-design", "behavioral", "mathematics"]
    }

@app.post("/api/practice/save-progress")
async def save_practice_progress(payload: Dict[str, Any]):
    """Persist user's practice completion state in Supabase if configured."""
    email = payload.get("email")
    problem_id = payload.get("problem_id")
    completed = bool(payload.get("completed", True))
    career = payload.get("career")
    if not problem_id:
        raise HTTPException(status_code=400, detail="problem_id is required")

    if not supabase:
        return {"status": "ok", "stored": False}

    try:
        data = {
            "email": email,
            "problem_id": problem_id,
            "completed": completed,
            "career": career,
            "updated_at": datetime.utcnow().isoformat()
        }
        supabase.table("practice_progress").upsert(data, on_conflict="email,problem_id").execute()
        return {"status": "ok", "stored": True}
    except Exception as e:
        print(f"Supabase save progress failed: {e}")
        return {"status": "ok", "stored": False}

@app.get("/api/practice/progress")
async def get_practice_progress(email: Optional[str] = None):
    if not supabase:
        return {"progress": []}
    try:
        query = supabase.table("practice_progress").select("email,problem_id,completed,career,updated_at")
        if email:
            query = query.eq("email", email)
        resp = query.execute()
        return {"progress": resp.data or []}
    except Exception as e:
        print(f"Supabase get progress failed: {e}")
        return {"progress": []}

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

# Interview prep endpoint moved to router

# GPT interview questions function removed - using static data instead

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

# Roadmap endpoints are now handled by the roadmap router

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

# New API endpoints for enhanced resources and interview prep

@app.get("/api/resources")
async def get_resources(
    category: Optional[str] = None,
    platform: Optional[str] = None,
    difficulty: Optional[str] = None,
    limit: Optional[int] = 100
):
    """Get learning resources with optional filtering"""
    try:
        data = load_resources_data()
        
        if not data or "resources" not in data:
            return {"resources": {}, "metadata": data.get("metadata", {})}
        
        resources = data["resources"]
        
        # Apply filters if provided
        if category:
            if category in resources:
                resources = {category: resources[category]}
            else:
                # Search for partial matches
                filtered_resources = {}
                for cat, cat_resources in resources.items():
                    if category.lower() in cat.lower():
                        filtered_resources[cat] = cat_resources
                resources = filtered_resources
        
        # Apply platform filter
        if platform:
            filtered_resources = {}
            for cat, cat_resources in resources.items():
                if isinstance(cat_resources, list):
                    filtered_cat_resources = [
                        res for res in cat_resources 
                        if res.get("platform", "").lower() == platform.lower()
                    ]
                    if filtered_cat_resources:
                        filtered_resources[cat] = filtered_cat_resources
                resources = filtered_resources
        
        # Apply difficulty filter
        if difficulty:
            filtered_resources = {}
            for cat, cat_resources in resources.items():
                if isinstance(cat_resources, list):
                    filtered_cat_resources = [
                        res for res in cat_resources 
                        if res.get("difficulty", "").lower() == difficulty.lower()
                    ]
                    if filtered_cat_resources:
                        filtered_resources[cat] = filtered_cat_resources
                resources = filtered_resources
        
        # Apply limit
        if limit:
            for cat in resources:
                if isinstance(resources[cat], list):
                    resources[cat] = resources[cat][:limit]
        
        return {
            "resources": resources,
            "metadata": data.get("metadata", {}),
            "filters_applied": {
                "category": category,
                "platform": platform,
                "difficulty": difficulty,
                "limit": limit
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve resources: {str(e)}"
        )

@app.get("/api/math-resources")
async def get_math_resources(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    platform: Optional[str] = None,
    limit: Optional[int] = 100
):
    """Get math resources with optional filtering"""
    try:
        data = load_math_resources_data()
        
        if not data or "mathematics_massive" not in data:
            return {"topics": {}, "metadata": data.get("metadata", {})}
        
        topics = data["mathematics_massive"]["topics"]
        
        # Apply topic filter if provided
        if topic:
            if topic in topics:
                topics = {topic: topics[topic]}
            else:
                # Search for partial matches
                filtered_topics = {}
                for topic_name, topic_data in topics.items():
                    if topic.lower() in topic_name.lower():
                        filtered_topics[topic_name] = topic_data
                topics = filtered_topics
        
        # Apply difficulty filter
        if difficulty:
            filtered_topics = {}
            for topic_name, topic_data in topics.items():
                if topic_data.get("difficulty", "").lower() == difficulty.lower():
                    filtered_topics[topic_name] = topic_data
            topics = filtered_topics
        
        # Apply platform filter to courses
        if platform:
            for topic_name, topic_data in topics.items():
                if "courses" in topic_data:
                    topic_data["courses"] = [
                        course for course in topic_data["courses"]
                        if course.get("platform", "").lower() == platform.lower()
                    ]
        
        # Apply limit to courses
        if limit:
            for topic_name, topic_data in topics.items():
                if "courses" in topic_data:
                    topic_data["courses"] = topic_data["courses"][:limit]
        
        return {
            "topics": topics,
            "metadata": data["mathematics_massive"].get("metadata", {}),
            "filters_applied": {
                "topic": topic,
                "difficulty": difficulty,
                "platform": platform,
                "limit": limit
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve math resources: {str(e)}"
        )

# Interview prep endpoint moved to router

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 