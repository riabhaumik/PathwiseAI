from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.services.roadmap_service import RoadmapService
from app.core.auth import get_current_user
from app.models.user import TokenData
import os

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

class RoadmapRequest(BaseModel):
    career_name: str
    user_level: str = "beginner"
    completed_topics: Optional[List[str]] = None

class RoadmapResponse(BaseModel):
    career: str
    overview: str
    estimated_duration: str
    skill_domains: Dict[str, List[str]]
    phases: List[Dict[str, Any]]
    milestones: List[Dict[str, Any]]
    resources: List[Dict[str, Any]]

@router.get("/")
async def get_roadmap(
    career_name: str,
    user_level: str = "beginner"
):
    """Get a roadmap for a specific career without authentication"""
    try:
        roadmap_service = RoadmapService()
        roadmap = await roadmap_service.generate_roadmap(
            career_name=career_name,
            user_level=user_level
        )
        return roadmap
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get roadmap: {str(e)}"
        )

@router.post("/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    request: RoadmapRequest,
    current_user: TokenData = Depends(get_current_user)
):
    """Generate a personalized roadmap for a specific career"""
    try:
        roadmap_service = RoadmapService()
        roadmap = await roadmap_service.generate_roadmap(
            career_name=request.career_name,
            user_level=request.user_level,
            completed_topics=request.completed_topics
        )
        return roadmap
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate roadmap: {str(e)}"
        )

@router.get("/preview/{career_name}", response_model=RoadmapResponse)
async def preview_roadmap(
    career_name: str,
    user_level: str = "beginner"
):
    """Preview a roadmap for a specific career without authentication"""
    try:
        roadmap_service = RoadmapService()
        roadmap = await roadmap_service.generate_roadmap(
            career_name=career_name,
            user_level=user_level
        )
        return roadmap
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to preview roadmap: {str(e)}"
        )

@router.get("/careers/{career_name}/skills")
async def get_career_skills(career_name: str):
    """Get required skills for a specific career"""
    try:
        roadmap_service = RoadmapService()
        skills = await roadmap_service.get_career_skills(career_name)
        return {"career": career_name, "skills": skills}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get career skills: {str(e)}"
        )

@router.get("/debug/careers")
async def debug_careers():
    """Debug endpoint to test careers data loading"""
    try:
        roadmap_service = RoadmapService()
        careers_data = roadmap_service.load_careers_data()
        return {
            "success": True,
            "careers_count": len(careers_data) if careers_data else 0,
            "sample_careers": list(careers_data.keys())[:5] if careers_data else [],
            "base_dir": getattr(roadmap_service, '_base_dir', 'Not set'),
            "current_working_dir": os.getcwd()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }

@router.get("/debug/test-roadmap")
async def debug_test_roadmap():
    """Debug endpoint to test basic roadmap generation"""
    try:
        roadmap_service = RoadmapService()
        # Test with a simple career name
        roadmap = await roadmap_service.generate_roadmap("Software Engineer", "beginner")
        return {
            "success": True,
            "career": roadmap.get("career"),
            "phases_count": len(roadmap.get("phases", [])),
            "milestones_count": len(roadmap.get("milestones", [])),
            "has_overview": bool(roadmap.get("overview")),
            "error": roadmap.get("error")
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        } 