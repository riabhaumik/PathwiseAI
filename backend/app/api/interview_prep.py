from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
import json
import os

router = APIRouter(prefix="/api", tags=["challenging-problems"])

def load_challenging_problems_data() -> Dict[str, Any]:
    """Load challenging problems data from JSON file"""
    try:
        # Get the path to the data directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "..", "..", "data", "interview_prep.json")
        
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load challenging problems data: {str(e)}"
        )

@router.get("/interview_prep")
async def get_challenging_problems():
    """Get all challenging problems data"""
    try:
        data = load_challenging_problems_data()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve challenging problems data: {str(e)}"
        )

@router.get("/challenging-problems")
async def get_challenging_problems_alt():
    """Alternative endpoint for challenging problems"""
    try:
        data = load_challenging_problems_data()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve challenging problems data: {str(e)}"
        )

@router.get("/challenging-problems/categories")
async def get_problem_categories():
    """Get all available problem categories"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            return {"categories": []}
        
        categories = data["challenging_problems"].get("categories", {})
        return {"categories": categories}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problem categories: {str(e)}"
        )

@router.get("/challenging-problems/difficulties")
async def get_problem_difficulties():
    """Get all available difficulty levels"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            return {"difficulties": []}
        
        difficulties = data["challenging_problems"].get("difficulty_levels", {})
        return {"difficulties": difficulties}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve difficulty levels: {str(e)}"
        )

@router.get("/challenging-problems/category/{category}")
async def get_problems_by_category(category: str):
    """Get challenging problems for a specific category"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenging problems data not found"
            )
        
        problems = data["challenging_problems"].get("problems", [])
        categories = data["challenging_problems"].get("categories", {})
        
        if category not in categories:
            # Try to find partial matches
            matching_categories = []
            for cat in categories.keys():
                if category.lower() in cat.lower():
                    matching_categories.append(cat)
            
            if matching_categories:
                return {
                    "message": f"Category '{category}' not found. Did you mean one of these?",
                    "suggestions": matching_categories,
                    "available_categories": list(categories.keys())
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category '{category}' not found. Available categories: {list(categories.keys())}"
                )
        
        # Filter problems by category
        category_problems = [p for p in problems if p.get("category") == category]
        
        return {
            "category": category,
            "description": categories[category],
            "problems": category_problems,
            "total_problems": len(category_problems)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problems for category '{category}': {str(e)}"
        )

@router.get("/challenging-problems/difficulty/{difficulty}")
async def get_problems_by_difficulty(difficulty: str):
    """Get challenging problems for a specific difficulty level"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenging problems data not found"
            )
        
        problems = data["challenging_problems"].get("problems", [])
        difficulties = data["challenging_problems"].get("difficulty_levels", {})
        
        if difficulty not in difficulties:
            # Try to find partial matches
            matching_difficulties = []
            for diff in difficulties.keys():
                if difficulty.lower() in diff.lower():
                    matching_difficulties.append(diff)
            
            if matching_difficulties:
                return {
                    "message": f"Difficulty '{difficulty}' not found. Did you mean one of these?",
                    "suggestions": matching_difficulties,
                    "available_difficulties": list(difficulties.keys())
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Difficulty '{difficulty}' not found. Available difficulties: {list(difficulties.keys())}"
                )
        
        # Filter problems by difficulty
        difficulty_problems = [p for p in problems if p.get("difficulty") == difficulty]
        
        return {
            "difficulty": difficulty,
            "description": difficulties[difficulty],
            "problems": difficulty_problems,
            "total_problems": len(difficulty_problems)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problems for difficulty '{difficulty}': {str(e)}"
        )

@router.get("/challenging-problems/problem/{problem_id}")
async def get_problem_by_id(problem_id: str):
    """Get a specific challenging problem by ID"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenging problems data not found"
            )
        
        problems = data["challenging_problems"].get("problems", [])
        
        # Find problem by ID
        problem = None
        for p in problems:
            if p.get("id") == problem_id:
                problem = p
                break
        
        if not problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID '{problem_id}' not found"
            )
        
        return problem
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problem '{problem_id}': {str(e)}"
        )
