from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any
import json
import os
from pathlib import Path

router = APIRouter(prefix="/api/careers", tags=["careers"])

@router.get("/")
async def get_careers():
    """Get all available careers"""
    try:
        # Get the path to the careers data file
        data_dir = Path(__file__).parent.parent.parent / "data"
        careers_file = data_dir / "careers_stem.json"
        
        if not careers_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Careers data file not found"
            )
        
        # Read and parse the careers data
        with open(careers_file, 'r', encoding='utf-8') as f:
            careers_data = json.load(f)
        
        # Return the careers data
        return {"careers": careers_data}
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse careers data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load careers: {str(e)}"
        )

@router.get("/{career_name}")
async def get_career(career_name: str):
    """Get a specific career by name"""
    try:
        # Get the path to the careers data file
        data_dir = Path(__file__).parent.parent.parent / "data"
        careers_file = data_dir / "careers_stem.json"
        
        if not careers_file.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Careers data file not found"
            )
        
        # Read and parse the careers data
        with open(careers_file, 'r', encoding='utf-8') as f:
            careers_data = json.load(f)
        
        # Check if the career exists
        if career_name not in careers_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career '{career_name}' not found"
            )
        
        # Return the specific career data
        return {"career": career_name, "data": careers_data[career_name]}
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse careers data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load career: {str(e)}"
        )
