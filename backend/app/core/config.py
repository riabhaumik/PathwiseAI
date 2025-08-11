import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from parent directory
load_dotenv("../.env")

class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    
    # OpenAI Configuration
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    openai_max_tokens: int = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
    openai_temperature: float = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
    
    # External API Keys
    youtube_api_key: Optional[str] = os.getenv("YOUTUBE_API_KEY")
    coursera_api_key: Optional[str] = os.getenv("COURSERA_API_KEY")
    khan_academy_api_key: Optional[str] = os.getenv("KHAN_ACADEMY_API_KEY")
    edx_api_key: Optional[str] = os.getenv("EDX_API_KEY")
    
    # JWT Configuration
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS Configuration
    allowed_origins: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://pathwise-ai.vercel.app"
    ]
    
    # Database Configuration
    database_url: Optional[str] = os.getenv("DATABASE_URL")
    
    # Redis Configuration (optional)
    redis_url: Optional[str] = os.getenv("REDIS_URL")
    
    # Backend and Frontend URLs
    backend_url: Optional[str] = os.getenv("BACKEND_URL")
    frontend_url: Optional[str] = os.getenv("FRONTEND_URL")
    
    class Config:
        env_file = "../.env"
        extra = "allow"  # Allow extra fields from .env file

settings = Settings() 