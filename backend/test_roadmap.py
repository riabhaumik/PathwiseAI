#!/usr/bin/env python3
"""
Test script to verify roadmap service is working
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.services.roadmap_service import RoadmapService

async def test_roadmap_service():
    """Test the roadmap service"""
    print("Testing Roadmap Service...")
    print("=" * 50)
    
    try:
        # Initialize the service
        service = RoadmapService()
        print(f"✓ RoadmapService initialized")
        print(f"  Base directory: {getattr(service, '_base_dir', 'Not set')}")
        print(f"  Current working directory: {os.getcwd()}")
        
        # Test loading careers data
        print("\nTesting careers data loading...")
        careers_data = service.load_careers_data()
        print(f"✓ Careers data loaded: {len(careers_data)} careers")
        
        if careers_data:
            print("  Sample careers:")
            for i, career_name in enumerate(list(careers_data.keys())[:5]):
                career = careers_data[career_name]
                print(f"    {i+1}. {career_name}")
                print(f"       Description: {career.get('description', 'N/A')[:100]}...")
                print(f"       Skills: {', '.join(career.get('skills', [])[:3])}")
        
        # Test roadmap generation
        print("\nTesting roadmap generation...")
        test_career = "Software Engineer"
        roadmap = await service.generate_roadmap(test_career, "beginner")
        
        if roadmap and not roadmap.get('error'):
            print(f"✓ Roadmap generated for {test_career}")
            print(f"  Phases: {len(roadmap.get('phases', []))}")
            print(f"  Milestones: {len(roadmap.get('milestones', []))}")
            print(f"  Overview: {roadmap.get('overview', 'N/A')[:100]}...")
        else:
            print(f"✗ Roadmap generation failed: {roadmap.get('error', 'Unknown error')}")
        
        print("\n" + "=" * 50)
        print("Test completed!")
        
    except Exception as e:
        print(f"✗ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_roadmap_service())
    sys.exit(0 if success else 1)
