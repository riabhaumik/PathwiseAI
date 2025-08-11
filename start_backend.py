#!/usr/bin/env python3
"""
Simple script to start the backend server
"""

import subprocess
import sys
import os

def start_backend():
    """Start the backend server"""
    print("🚀 Starting Pathwise AI Backend...")
    print("📁 Changing to backend directory...")
    
    # Change to backend directory
    os.chdir("backend")
    
    print("🔧 Starting uvicorn server...")
    print("🌐 Server will be available at: http://127.0.0.1:8000")
    print("📊 API Docs will be at: http://127.0.0.1:8000/docs")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", "main:app", 
            "--host", "127.0.0.1", "--port", "8000", "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

if __name__ == "__main__":
    start_backend() 