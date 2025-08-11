#!/usr/bin/env python3
"""
Pathwise AI - Complete Application Startup Script
Starts both frontend and backend servers
"""

import subprocess
import sys
import os
import time
import threading
import signal
import platform

def print_banner():
    """Print the application banner"""
    print("=" * 60)
    print("🚀 Pathwise AI - Phase 1 MVP")
    print("=" * 60)
    print("Your personalized STEM career navigator powered by AI")
    print("Discover 1,247+ careers, access 12,473+ learning resources")
    print("=" * 60)

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Python
    try:
        subprocess.run([sys.executable, "--version"], capture_output=True, check=True)
        print("✅ Python is installed")
    except subprocess.CalledProcessError:
        print("❌ Python is not installed or not in PATH")
        return False
    
    # Check Node.js
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
        print("✅ Node.js is installed")
    except subprocess.CalledProcessError:
        print("❌ Node.js is not installed or not in PATH")
        return False
    
    # Check npm
    try:
        subprocess.run(["npm", "--version"], capture_output=True, check=True)
        print("✅ npm is installed")
    except subprocess.CalledProcessError:
        print("❌ npm is not installed or not in PATH")
        return False
    
    return True

def install_dependencies():
    """Install project dependencies"""
    print("\n📦 Installing dependencies...")
    
    # Install backend dependencies
    print("Installing Python dependencies...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "backend/requirements_working.txt"
        ], check=True)
        print("✅ Backend dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install backend dependencies: {e}")
        return False
    
    # Install frontend dependencies
    print("Installing Node.js dependencies...")
    try:
        subprocess.run(["npm", "install"], cwd="frontend", check=True)
        print("✅ Frontend dependencies installed")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install frontend dependencies: {e}")
        return False
    
    return True

def start_backend():
    """Start the backend server"""
    print("🔧 Starting backend server...")
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", "main:app", 
            "--host", "127.0.0.1", "--port", "8000", "--reload"
        ], cwd="backend", check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Backend server failed: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")

def start_frontend():
    """Start the frontend server"""
    print("🎨 Starting frontend server...")
    try:
        subprocess.run(["npm", "run", "dev"], cwd="frontend", check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Frontend server failed: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped")

def main():
    """Main startup function"""
    print_banner()
    
    # Check if we're in the right directory
    if not os.path.exists("frontend") or not os.path.exists("backend"):
        print("❌ Please run this script from the project root directory")
        print("   (where frontend/ and backend/ folders are located)")
        return
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install the missing dependencies and try again")
        return
    
    # Ask if user wants to install dependencies
    install_choice = input("\n📦 Install/update dependencies? (y/n): ").lower().strip()
    if install_choice in ['y', 'yes']:
        if not install_dependencies():
            print("\n❌ Failed to install dependencies. Please install manually and try again")
            return
    
    print("\n🚀 Starting Pathwise AI...")
    print("📊 Backend API: http://127.0.0.1:8000")
    print("📊 API Docs: http://127.0.0.1:8000/docs")
    print("🎨 Frontend: http://localhost:3000")
    print("🛑 Press Ctrl+C to stop all servers")
    print("=" * 60)
    
    # Start servers in separate threads
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    frontend_thread = threading.Thread(target=start_frontend, daemon=True)
    
    try:
        # Start backend first
        backend_thread.start()
        time.sleep(3)  # Give backend time to start
        
        # Start frontend
        frontend_thread.start()
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Pathwise AI...")
        print("✅ All servers stopped")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main() 