from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
import json
import os

router = APIRouter(prefix="/api", tags=["interview-prep"])

def load_interview_prep_data() -> Dict[str, Any]:
    """Load interview preparation data from JSON file"""
    try:
        # Get the path to the data directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "..", "..", "data", "interview_prep.json")
        
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load interview prep data: {str(e)}"
        )

@router.get("/interview-prep")
async def get_interview_prep():
    """Get all interview preparation data"""
    try:
        data = load_interview_prep_data()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve interview prep data: {str(e)}"
        )

@router.get("/interview-prep/careers")
async def get_interview_careers():
    """Get all available careers for interview preparation"""
    try:
        data = load_interview_prep_data()
        
        if not data or "interview_preparation" not in data:
            return {"careers": []}
        
        careers = data["interview_preparation"].get("careers", {})
        career_list = []
        
        for career_name, career_data in careers.items():
            career_list.append({
                "name": career_name,
                "description": career_data.get("description", ""),
                "categories": list(career_data.get("categories", {}).keys())
            })
        
        return {"careers": career_list}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve interview careers: {str(e)}"
        )

@router.get("/interview-prep/careers/{career_name}")
async def get_career_interview_prep(career_name: str):
    """Get interview preparation data for a specific career"""
    try:
        data = load_interview_prep_data()
        
        if not data or "interview_preparation" not in data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview preparation data not found"
            )
        
        careers = data["interview_preparation"].get("careers", {})
        
        if career_name not in careers:
            # Try to find partial matches
            matching_careers = []
            for career in careers.keys():
                if career_name.lower() in career.lower():
                    matching_careers.append(career)
            
            if matching_careers:
                return {
                    "message": f"Career '{career_name}' not found. Did you mean one of these?",
                    "suggestions": matching_careers,
                    "available_careers": list(careers.keys())
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Career '{career_name}' not found. Available careers: {list(careers.keys())}"
                )
        
        return {
            "career": career_name,
            "data": careers[career_name]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve career interview prep: {str(e)}"
        )

@router.get("/interview-prep/careers/{career_name}/categories/{category_name}")
async def get_career_category_interview_prep(career_name: str, category_name: str):
    """Get interview preparation data for a specific career and category"""
    try:
        data = load_interview_prep_data()
        
        if not data or "interview_preparation" not in data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview preparation data not found"
            )
        
        careers = data["interview_preparation"].get("careers", {})
        
        if career_name not in careers:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career '{career_name}' not found"
            )
        
        career_data = careers[career_name]
        categories = career_data.get("categories", {})
        
        if category_name not in categories:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category '{category_name}' not found for career '{career_name}'. Available categories: {list(categories.keys())}"
            )
        
        return {
            "career": career_name,
            "category": category_name,
            "data": categories[category_name]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve category interview prep: {str(e)}"
        )

@router.get("/interview-prep/search")
async def search_interview_prep(
    query: str,
    career: Optional[str] = None,
    category: Optional[str] = None,
    limit: Optional[int] = 50
):
    """Search interview preparation content by query string"""
    try:
        data = load_interview_prep_data()
        
        if not data or "interview_preparation" not in data:
            return {"results": []}
        
        results = []
        query_lower = query.lower()
        careers = data["interview_preparation"].get("careers", {})
        
        for career_name, career_data in careers.items():
            if career and career.lower() not in career_name.lower():
                continue
            
            # Search in career description
            if query_lower in career_data.get("description", "").lower():
                results.append({
                    "type": "career",
                    "career": career_name,
                    "description": career_data.get("description", ""),
                    "match": "description"
                })
            
            # Search in categories
            for cat_name, cat_data in career_data.get("categories", {}).items():
                if category and category.lower() not in cat_name.lower():
                    continue
                
                # Search in category description
                if query_lower in cat_data.get("description", "").lower():
                    results.append({
                        "type": "category",
                        "career": career_name,
                        "category": cat_name,
                        "description": cat_data.get("description", ""),
                        "match": "category_description"
                    })
                
                # Search in questions
                for question in cat_data.get("questions", []):
                    if query_lower in question.get("question", "").lower():
                        results.append({
                            "type": "question",
                            "career": career_name,
                            "category": cat_name,
                            "question": question.get("question", ""),
                            "difficulty": question.get("difficulty", ""),
                            "match": "question"
                        })
                    
                    # Search in hints and solutions
                    if question.get("hint") and query_lower in question.get("hint", "").lower():
                        results.append({
                            "type": "hint",
                            "career": career_name,
                            "category": cat_name,
                            "question": question.get("question", ""),
                            "hint": question.get("hint", ""),
                            "match": "hint"
                        })
                    
                    if question.get("solution_approach") and query_lower in question.get("solution_approach", "").lower():
                        results.append({
                            "type": "solution",
                            "career": career_name,
                            "category": cat_name,
                            "question": question.get("question", ""),
                            "solution_approach": question.get("solution_approach", ""),
                            "match": "solution"
                        })
                
                if limit and len(results) >= limit:
                    break
            
            if limit and len(results) >= limit:
                break
        
        return {
            "query": query,
            "results": results[:limit] if limit else results,
            "total_found": len(results)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search interview prep: {str(e)}"
        )
