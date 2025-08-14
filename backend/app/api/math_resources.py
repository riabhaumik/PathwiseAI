from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
import json
import os

router = APIRouter(prefix="/api", tags=["math-resources"])

def load_math_resources_data() -> Dict[str, Any]:
    """Load math resources data from JSON file"""
    try:
        # Get the path to the data directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "..", "..", "data", "math_resources_massive.json")
        
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load math resources data: {str(e)}"
        )

@router.get("/math-resources")
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

@router.get("/math-resources/topics")
async def get_math_topics():
    """Get all available math topics"""
    try:
        data = load_math_resources_data()
        
        if not data or "mathematics_massive" not in data:
            return {"topics": []}
        
        topics = data["mathematics_massive"]["topics"]
        topic_list = []
        
        for topic_name, topic_data in topics.items():
            topic_list.append({
                "name": topic_name,
                "description": topic_data.get("description", ""),
                "difficulty": topic_data.get("difficulty", ""),
                "importance": topic_data.get("importance", ""),
                "total_resources": topic_data.get("total_resources", 0)
            })
        
        return {"topics": topic_list}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve math topics: {str(e)}"
        )

@router.get("/math-resources/search")
async def search_math_resources(
    query: str,
    topic: Optional[str] = None,
    limit: Optional[int] = 50
):
    """Search math resources by query string"""
    try:
        data = load_math_resources_data()
        
        if not data or "mathematics_massive" not in data:
            return {"results": []}
        
        results = []
        query_lower = query.lower()
        topics = data["mathematics_massive"]["topics"]
        
        for topic_name, topic_data in topics.items():
            if topic and topic.lower() not in topic_name.lower():
                continue
            
            # Search in topic description
            if query_lower in topic_data.get("description", "").lower():
                results.append({
                    "type": "topic",
                    "name": topic_name,
                    "description": topic_data.get("description", ""),
                    "difficulty": topic_data.get("difficulty", ""),
                    "importance": topic_data.get("importance", "")
                })
            
            # Search in courses
            if "courses" in topic_data:
                for course in topic_data["courses"]:
                    if (query_lower in course.get("title", "").lower() or
                        query_lower in course.get("description", "").lower() or
                        query_lower in course.get("topics", [])):
                        results.append({
                            "type": "course",
                            "topic": topic_name,
                            **course
                        })
            
            # Search in books
            if "books" in topic_data:
                for book in topic_data["books"]:
                    if (query_lower in book.get("title", "").lower() or
                        query_lower in book.get("description", "").lower()):
                        results.append({
                            "type": "book",
                            "topic": topic_name,
                            **book
                        })
            
            # Search in videos
            if "videos" in topic_data:
                for video in topic_data["videos"]:
                    if (query_lower in video.get("title", "").lower() or
                        query_lower in video.get("description", "").lower()):
                        results.append({
                            "type": "video",
                            "topic": topic_name,
                            **video
                        })
            
            # Search in practice problems
            if "practice_problems" in topic_data:
                for problem in topic_data["practice_problems"]:
                    if (query_lower in problem.get("title", "").lower() or
                        query_lower in problem.get("description", "").lower()):
                        results.append({
                            "type": "practice_problem",
                            "topic": topic_name,
                            **problem
                        })
                        
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
            detail=f"Failed to search math resources: {str(e)}"
        )
