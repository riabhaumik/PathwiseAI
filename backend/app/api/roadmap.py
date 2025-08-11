from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.services.roadmap_service import RoadmapService
from app.core.auth import get_current_user
from app.models.user import TokenData

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