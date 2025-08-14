from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
import json
import os

router = APIRouter(prefix="/api", tags=["resources"])

def load_resources_data() -> Dict[str, Any]:
    """Load resources data from JSON file"""
    try:
        # Get the path to the data directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "..", "..", "data", "resources_massive.json")
        
        with open(data_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load resources data: {str(e)}"
        )

@router.get("/resources")
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

@router.get("/resources/categories")
async def get_resource_categories():
    """Get all available resource categories"""
    try:
        data = load_resources_data()
        return {
            "categories": data.get("metadata", {}).get("categories", []),
            "platforms": data.get("metadata", {}).get("platforms", []),
            "difficulty_levels": data.get("metadata", {}).get("difficulty_levels", []),
            "resource_types": data.get("metadata", {}).get("resource_types", [])
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve resource categories: {str(e)}"
        )

@router.get("/resources/search")
async def search_resources(
    query: str,
    category: Optional[str] = None,
    limit: Optional[int] = 50
):
    """Search resources by query string"""
    try:
        data = load_resources_data()
        
        if not data or "resources" not in data:
            return {"results": []}
        
        results = []
        query_lower = query.lower()
        
        for cat, cat_resources in data["resources"].items():
            if category and category.lower() not in cat.lower():
                continue
                
            if isinstance(cat_resources, list):
                for resource in cat_resources:
                    # Search in title, description, and tags
                    if (query_lower in resource.get("title", "").lower() or
                        query_lower in resource.get("description", "").lower() or
                        any(query_lower in tag.lower() for tag in resource.get("tags", []))):
                        results.append({
                            **resource,
                            "category": cat
                        })
                        
                        if limit and len(results) >= limit:
                            break
                
                if limit and len(results) >= limit:
                    break
        
        return {
            "query": query,
            "results": results,
            "total_found": len(results)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search resources: {str(e)}"
        )
