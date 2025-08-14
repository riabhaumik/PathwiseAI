#!/usr/bin/env python3
"""
Test script to verify the application can start and respond to health checks
"""
import os
import sys
import time
import requests
import subprocess
from pathlib import Path

def test_application_startup():
    """Test if the application can start and respond to health checks"""
    print("=== Testing Application Startup ===")
    
    # Change to backend directory
    backend_dir = Path(__file__).parent / "backend"
    if not backend_dir.exists():
        print(f"ERROR: Backend directory not found: {backend_dir}")
        return False
    
    os.chdir(backend_dir)
    print(f"Changed to directory: {os.getcwd()}")
    
    # Check if main.py exists
    if not Path("main.py").exists():
        print("ERROR: main.py not found")
        return False
    
    # Test import
    try:
        print("Testing application import...")
        import main
        print("✓ Application imported successfully")
    except Exception as e:
        print(f"✗ Failed to import application: {e}")
        return False
    
    # Test if we can start the server
    try:
        print("Testing server startup...")
        # Start server in background
        process = subprocess.Popen([
            sys.executable, "main.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Wait for server to start
        time.sleep(5)
        
        # Check if process is still running
        if process.poll() is not None:
            stdout, stderr = process.communicate()
            print(f"✗ Server process died: {stderr.decode()}")
            return False
        
        print("✓ Server process started successfully")
        
        # Test health endpoint
        port = int(os.getenv("PORT", 8000))
        health_url = f"http://localhost:{port}/"
        
        print(f"Testing health endpoint: {health_url}")
        
        # Try multiple times
        for i in range(10):
            try:
                response = requests.get(health_url, timeout=5)
                if response.status_code == 200:
                    print("✓ Health check passed!")
                    print(f"Response: {response.json()}")
                    break
                else:
                    print(f"Health check attempt {i+1}: Status {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"Health check attempt {i+1} failed: {e}")
            
            if i < 9:
                time.sleep(2)
        else:
            print("✗ All health checks failed")
            process.terminate()
            return False
        
        # Clean up
        process.terminate()
        process.wait()
        print("✓ Server stopped successfully")
        return True
        
    except Exception as e:
        print(f"✗ Error during startup test: {e}")
        return False

if __name__ == "__main__":
    success = test_application_startup()
    if success:
        print("\n🎉 All tests passed! Application should work on Railway.")
        sys.exit(0)
    else:
        print("\n❌ Tests failed. Check the errors above.")
        sys.exit(1)
