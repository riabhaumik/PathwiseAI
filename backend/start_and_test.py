#!/usr/bin/env python3
"""
Startup script that tests backend services before starting the server
"""

import asyncio
import sys
import os
import subprocess
import time

def test_imports():
    """Test if all required modules can be imported"""
    print("Testing imports...")
    
    try:
        from app.services.roadmap_service import RoadmapService
        print("✓ RoadmapService imported successfully")
        
        from app.api.interview_prep import router as interview_prep_router
        print("✓ Interview prep router imported successfully")
        
        from app.api.roadmap import router as roadmap_router
        print("✓ Roadmap router imported successfully")
        
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_data_files():
    """Test if required data files exist"""
    print("\nTesting data files...")
    
    required_files = [
        "data/careers_stem.json",
        "data/interview_prep.json",
        "data/resources_massive.json"
    ]
    
    all_exist = True
    for file_path in required_files:
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✓ {file_path} exists ({size} bytes)")
        else:
            print(f"✗ {file_path} missing")
            all_exist = False
    
    return all_exist

async def test_services():
    """Test if core services are working"""
    print("\nTesting core services...")
    
    try:
        from app.services.roadmap_service import RoadmapService
        
        # Test roadmap service
        service = RoadmapService()
        careers_data = service.load_careers_data()
        
        if careers_data and len(careers_data) > 0:
            print(f"✓ RoadmapService loaded {len(careers_data)} careers")
        else:
            print("✗ RoadmapService failed to load careers data")
            return False
        
        # Test roadmap generation
        roadmap = await service.generate_roadmap("Software Engineer", "beginner")
        if roadmap and not roadmap.get('error'):
            print("✓ Roadmap generation working")
        else:
            print(f"✗ Roadmap generation failed: {roadmap.get('error', 'Unknown error')}")
            return False
        
        return True
        
    except Exception as e:
        print(f"✗ Service test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def start_server():
    """Start the FastAPI server"""
    print("\nStarting FastAPI server...")
    
    try:
        # Start the server in a subprocess
        cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
        print(f"Running: {' '.join(cmd)}")
        
        process = subprocess.Popen(cmd, cwd=os.getcwd())
        
        # Wait a bit for the server to start
        time.sleep(3)
        
        if process.poll() is None:
            print("✓ Server started successfully")
            print("Server is running at http://localhost:8000")
            print("Press Ctrl+C to stop the server")
            
            try:
                process.wait()
            except KeyboardInterrupt:
                print("\nShutting down server...")
                process.terminate()
                process.wait()
                print("Server stopped")
        else:
            print("✗ Server failed to start")
            return False
            
    except Exception as e:
        print(f"✗ Failed to start server: {e}")
        return False
    
    return True

async def main():
    """Main function"""
    print("Pathwise AI Backend - Startup Test")
    print("=" * 50)
    
    # Test imports
    if not test_imports():
        print("\n❌ Import test failed. Please check your dependencies.")
        return False
    
    # Test data files
    if not test_data_files():
        print("\n⚠️  Some data files are missing. The server may not work properly.")
    
    # Test services
    if not await test_services():
        print("\n❌ Service test failed. Please check your configuration.")
        return False
    
    print("\n✅ All tests passed! Backend is ready to start.")
    
    # Ask user if they want to start the server
    try:
        response = input("\nDo you want to start the server now? (y/n): ").lower().strip()
        if response in ['y', 'yes']:
            return start_server()
        else:
            print("Server startup skipped. You can start it manually with: uvicorn main:app --reload")
            return True
    except KeyboardInterrupt:
        print("\nStartup cancelled by user")
        return True

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
