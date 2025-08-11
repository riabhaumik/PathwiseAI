from fastapi import APIRouter, HTTPException, Depends, Query, Body
from fastapi.security import HTTPBearer
from typing import Dict, Any, Optional, List
import logging
from app.services.ai_service import AIService
from app.core.auth import get_current_user
from app.models.user import User
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI Assistant"])
security = HTTPBearer()

logger = logging.getLogger(__name__)

# Initialize AI service
ai_service = AIService()

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ProfileAnalysisRequest(BaseModel):
    skills: List[str]
    interests: List[str]
    experience: str

@router.post("/chat")
async def chat_with_ai(
    request: ChatRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Chat with AI assistant for career guidance and learning path development.
    
    The AI can:
    - Provide career recommendations
    - Generate learning paths
    - Analyze skill gaps
    - Offer interview preparation guidance
    - Create skill development plans
    - Explore career paths in detail
    """
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Get user ID for conversation memory
        user_id = str(current_user.id) if current_user else None
        
        # Call AI service
        response = await ai_service.chat_with_ai(
            message=request.message,
            context=request.context,
            user_id=user_id
        )
        
        return {
            "success": True,
            "data": response,
            "message": "AI response generated successfully"
        }
        
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(status_code=500, detail="AI service not properly configured")
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI response")

@router.post("/career-insights")
async def get_career_insights(
    career_name: str = Query(..., description="Name of the career to analyze"),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get AI-generated insights about a specific career path.
    
    Provides comprehensive information about:
    - Market trends and demand
    - Salary ranges and growth potential
    - Required education and certifications
    - Day-to-day responsibilities
    - Career advancement opportunities
    """
    try:
        if not career_name.strip():
            raise HTTPException(status_code=400, detail="Career name cannot be empty")
        
        insights = await ai_service.generate_career_insights(career_name)
        
        if "error" in insights:
            raise HTTPException(status_code=500, detail=insights["error"])
        
        return {
            "success": True,
            "data": insights,
            "message": f"Career insights generated for {career_name}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating career insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate career insights")

@router.post("/profile-analysis")
async def analyze_user_profile(
    request: ProfileAnalysisRequest,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Analyze user profile and provide comprehensive career guidance.
    
    Returns:
    - Career path recommendations
    - Skill development priorities
    - Learning resource suggestions
    - Networking opportunities
    - Portfolio building tips
    - Short-term and long-term goals
    """
    try:
        if not request.skills:
            raise HTTPException(status_code=400, detail="At least one skill must be provided")
        
        if not request.experience or request.experience not in ["beginner", "intermediate", "advanced"]:
            raise HTTPException(status_code=400, detail="Experience level must be beginner, intermediate, or advanced")
        
        analysis = await ai_service.analyze_user_profile(request.skills, request.interests, request.experience)
        
        if "error" in analysis:
            raise HTTPException(status_code=500, detail=analysis["error"])
        
        return {
            "success": True,
            "data": analysis,
            "message": "User profile analysis completed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze user profile")

@router.get("/suggestions")
async def get_ai_suggestions(
    message: str = Query(..., description="User message to generate suggestions for"),
    context: Optional[Dict[str, Any]] = Query(None, description="Additional context")
):
    """
    Get AI-generated suggestions for next steps based on user message.
    
    Returns contextual suggestions for:
    - Career exploration
    - Learning paths
    - Skill development
    - Interview preparation
    """
    try:
        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        suggestions = ai_service._generate_enhanced_suggestions(message, context)
        
        return {
            "success": True,
            "data": {
                "suggestions": suggestions,
                "message": message,
                "context": context
            },
            "message": "Suggestions generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error generating suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate suggestions")

@router.get("/follow-up-questions")
async def get_follow_up_questions(
    message: str = Query(..., description="User message to generate follow-up questions for"),
    context: Optional[Dict[str, Any]] = Query(None, description="Additional context")
):
    """
    Get AI-generated follow-up questions to keep conversation engaging.
    
    Returns contextual questions based on:
    - Message content
    - User preferences
    - Conversation context
    """
    try:
        if not message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        follow_up_questions = ai_service._generate_follow_up_questions(message, context)
        
        return {
            "success": True,
            "data": {
                "follow_up_questions": follow_up_questions,
                "message": message,
                "context": context
            },
            "message": "Follow-up questions generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error generating follow-up questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate follow-up questions")

@router.get("/user-preferences/{user_id}")
async def get_user_preferences(
    user_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get user preferences for personalization.
    
    Returns:
    - Career interests
    - Learning preferences
    - Skill levels
    - Experience information
    """
    try:
        # Verify user can only access their own preferences
        if current_user and str(current_user.id) != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        preferences = ai_service._get_user_preferences(user_id)
        
        return {
            "success": True,
            "data": preferences,
            "message": "User preferences retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving user preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user preferences")

@router.get("/conversation-history/{user_id}")
async def get_conversation_history(
    user_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Get conversation history for a user.
    
    Returns:
    - Recent conversation messages
    - Context information
    - Timestamps
    """
    try:
        # Verify user can only access their own history
        if current_user and str(current_user.id) != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        history = ai_service._get_conversation_history(user_id)
        
        return {
            "success": True,
            "data": {
                "conversation_history": history,
                "user_id": user_id
            },
            "message": "Conversation history retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve conversation history")

@router.get("/health")
async def ai_service_health():
    """
    Check the health status of the AI service.
    
    Verifies:
    - OpenAI API key configuration
    - Service initialization
    - Basic functionality
    """
    try:
        # Test basic service functionality
        test_message = "Hello, can you help me with career guidance?"
        response = await ai_service.chat_with_ai(test_message)
        
        return {
            "success": True,
            "status": "healthy",
            "message": "AI service is operational",
            "test_response": "AI service responded successfully",
            "features": [
                "Career recommendations",
                "Learning path generation",
                "Skill gap analysis",
                "Interview preparation",
                "Profile analysis",
                "Conversation memory"
            ]
        }
        
    except Exception as e:
        logger.error(f"AI service health check failed: {e}")
        return {
            "success": False,
            "status": "unhealthy",
            "message": f"AI service is experiencing issues: {str(e)}",
            "error": str(e)
        } 