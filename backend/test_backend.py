#!/usr/bin/env python3
"""
Simple test script to verify backend API endpoints
"""

import requests
import json
import sys

def test_backend():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Backend API Endpoints...")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Health check: PASSED")
        else:
            print(f"❌ Health check: FAILED (Status: {response.status_code})")
    except requests.exceptions.ConnectionError:
        print("❌ Health check: FAILED (Connection refused - backend not running)")
        return False
    
    # Test 2: Careers endpoint
    try:
        response = requests.get(f"{base_url}/api/careers")
        if response.status_code == 200:
            data = response.json()
            if 'careers' in data and len(data['careers']) > 0:
                print(f"✅ Careers endpoint: PASSED ({len(data['careers'])} careers found)")
            else:
                print("❌ Careers endpoint: FAILED (No careers data)")
        else:
            print(f"❌ Careers endpoint: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Careers endpoint: FAILED (Error: {e})")
    
    # Test 3: Resources endpoint
    try:
        response = requests.get(f"{base_url}/api/resources")
        if response.status_code == 200:
            data = response.json()
            if 'resources' in data and len(data['resources']) > 0:
                print(f"✅ Resources endpoint: PASSED ({len(data['resources'])} resources found)")
            else:
                print("❌ Resources endpoint: FAILED (No resources data)")
        else:
            print(f"❌ Resources endpoint: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Resources endpoint: FAILED (Error: {e})")
    
    # Test 4: Roadmap preview endpoint
    try:
        response = requests.get(f"{base_url}/api/roadmap/preview/Software%20Engineer")
        if response.status_code == 200:
            data = response.json()
            if 'career' in data and 'phases' in data:
                print(f"✅ Roadmap endpoint: PASSED (Roadmap for Software Engineer)")
            else:
                print("❌ Roadmap endpoint: FAILED (Invalid roadmap data)")
        else:
            print(f"❌ Roadmap endpoint: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Roadmap endpoint: FAILED (Error: {e})")
    
    # Test 5: Math resources endpoint
    try:
        response = requests.get(f"{base_url}/api/math-resources")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Math resources endpoint: PASSED")
        else:
            print(f"❌ Math resources endpoint: FAILED (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Math resources endpoint: FAILED (Error: {e})")
    
    print("=" * 50)
    print("🎯 Backend testing completed!")
    return True

if __name__ == "__main__":
    test_backend()
