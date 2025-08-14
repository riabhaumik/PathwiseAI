from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import json
import os
from app.services.roadmap_service import RoadmapService
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/practice", tags=["practice"])

# Data models
class PracticeProblem(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    category: str
    timeLimit: int
    points: int
    completed: bool = False
    code: Optional[str] = None
    solution: Optional[str] = None
    careers: Optional[List[str]] = None
    language: Optional[str] = None
    testcases: Optional[List[Any]] = None

class PracticeCategory(BaseModel):
    id: str
    name: str
    description: str
    problems: List[PracticeProblem]
    totalProblems: int
    completedProblems: int

class CodeExecutionRequest(BaseModel):
    language: str
    code: str
    testcases: List[Any]

class ProgressUpdateRequest(BaseModel):
    email: Optional[str] = None
    problem_id: str
    completed: bool
    career: Optional[str] = None

# Initialize roadmap service for practice problems
roadmap_service = RoadmapService()

@router.get("/problems")
async def get_practice_problems(career: Optional[str] = None):
    """Get practice problems organized by category"""
    try:
        # Define comprehensive practice categories
        categories = [
            {
                "id": "coding",
                "name": "Coding Challenges",
                "description": "Practice coding problems and algorithms",
                "problems": [
                    {
                        "id": "two-sum",
                        "title": "Two Sum",
                        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                        "difficulty": "Easy",
                        "category": "Arrays",
                        "timeLimit": 15,
                        "points": 100,
                        "completed": False,
                        "code": 'def two_sum(nums, target):\n    # Your solution here\n    pass',
                        "solution": 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
                        "careers": ["Software Engineer", "Data Scientist", "AI Engineer"],
                        "language": "python"
                    },
                    {
                        "id": "reverse-string",
                        "title": "Reverse String",
                        "description": "Write a function that reverses a string. The input string is given as an array of characters.",
                        "difficulty": "Easy",
                        "category": "Strings",
                        "timeLimit": 10,
                        "points": 80,
                        "completed": False,
                        "code": 'def reverse_string(s):\n    # Your solution here\n    pass',
                        "solution": 'def reverse_string(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1',
                        "careers": ["Software Engineer", "DevOps Engineer"],
                        "language": "python"
                    },
                    {
                        "id": "valid-palindrome",
                        "title": "Valid Palindrome",
                        "description": "Given a string s, return true if it is a palindrome, or false otherwise.",
                        "difficulty": "Easy",
                        "category": "Strings",
                        "timeLimit": 12,
                        "points": 90,
                        "completed": False,
                        "code": 'def is_palindrome(s):\n    # Your solution here\n    pass',
                        "solution": 'def is_palindrome(s):\n    s = "".join(c.lower() for c in s if c.isalnum())\n    return s == s[::-1]',
                        "careers": ["Software Engineer", "Data Scientist"],
                        "language": "python"
                    },
                    {
                        "id": "binary-search",
                        "title": "Binary Search",
                        "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
                        "difficulty": "Medium",
                        "category": "Search",
                        "timeLimit": 20,
                        "points": 150,
                        "completed": False,
                        "code": 'def binary_search(nums, target):\n    # Your solution here\n    pass',
                        "solution": 'def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
                        "careers": ["Software Engineer", "AI Engineer", "Data Scientist"],
                        "language": "python"
                    },
                    {
                        "id": "linked-list-cycle",
                        "title": "Linked List Cycle",
                        "description": "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
                        "difficulty": "Medium",
                        "category": "Linked Lists",
                        "timeLimit": 25,
                        "points": 180,
                        "completed": False,
                        "code": 'def has_cycle(head):\n    # Your solution here\n    pass',
                        "solution": 'def has_cycle(head):\n    if not head or not head.next:\n        return False\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False',
                        "careers": ["Software Engineer", "DevOps Engineer"],
                        "language": "python"
                    }
                ]
            },
            {
                "id": "system-design",
                "name": "System Design",
                "description": "Practice system design and architecture problems",
                "problems": [
                    {
                        "id": "url-shortener",
                        "title": "Design URL Shortener",
                        "description": "Design a URL shortening service like TinyURL or Bitly. Consider scalability, storage, and URL generation.",
                        "difficulty": "Medium",
                        "category": "System Design",
                        "timeLimit": 45,
                        "points": 300,
                        "completed": False,
                        "solution": "Key components:\n1. URL shortening algorithm (hash-based)\n2. Database for URL mappings\n3. Rate limiting\n4. Analytics tracking\n5. Caching layer (Redis)\n6. Load balancer\n7. CDN for global distribution",
                        "careers": ["Software Engineer", "DevOps Engineer", "System Architect"]
                    },
                    {
                        "id": "chat-system",
                        "title": "Design Chat System",
                        "description": "Design a real-time chat system like WhatsApp or Slack. Consider message delivery, online presence, and push notifications.",
                        "difficulty": "Hard",
                        "category": "System Design",
                        "timeLimit": 60,
                        "points": 400,
                        "completed": False,
                        "solution": "Key components:\n1. WebSocket connections for real-time\n2. Message queue (Kafka/RabbitMQ)\n3. Database for message history\n4. Push notifications\n5. File sharing service\n6. User presence tracking\n7. Message encryption",
                        "careers": ["Software Engineer", "DevOps Engineer", "System Architect"]
                    }
                ]
            },
            {
                "id": "mathematics",
                "name": "Mathematics & Statistics",
                "description": "Mathematical concepts essential for STEM careers",
                "problems": [
                    {
                        "id": "linear-algebra",
                        "title": "Matrix Operations",
                        "description": "Implement matrix multiplication and verify dimension compatibility.",
                        "difficulty": "Medium",
                        "category": "Linear Algebra",
                        "timeLimit": 25,
                        "points": 200,
                        "completed": False,
                        "code": 'def matrix_multiply(A, B):\n    # Your solution here\n    pass',
                        "solution": 'def matrix_multiply(A, B):\n    if len(A[0]) != len(B):\n        raise ValueError("Incompatible dimensions")\n    \n    m, n = len(A), len(B[0])\n    result = [[0 for _ in range(n)] for _ in range(m)]\n    \n    for i in range(m):\n        for j in range(n):\n            for k in range(len(B)):\n                result[i][j] += A[i][k] * B[k][j]\n    \n    return result',
                        "careers": ["Data Scientist", "AI Engineer", "ML Engineer", "Quantitative Analyst"],
                        "language": "python"
                    },
                    {
                        "id": "statistics",
                        "title": "Hypothesis Testing",
                        "description": "Design and conduct a t-test to determine if two sample means are significantly different.",
                        "difficulty": "Medium",
                        "category": "Statistics",
                        "timeLimit": 30,
                        "points": 250,
                        "completed": False,
                        "code": 'def t_test(sample1, sample2, alpha=0.05):\n    # Your solution here\n    pass',
                        "solution": 'import numpy as np\nfrom scipy import stats\n\ndef t_test(sample1, sample2, alpha=0.05):\n    # Perform independent t-test\n    t_stat, p_value = stats.ttest_ind(sample1, sample2)\n    \n    # Decision\n    if p_value < alpha:\n        return f"Reject H0 (p={p_value:.4f})"\n    else:\n        return f"Fail to reject H0 (p={p_value:.4f})"',
                        "careers": ["Data Scientist", "Product Manager", "Research Analyst", "ML Engineer"],
                        "language": "python"
                    }
                ]
            }
        ]

        # Filter by career if specified
        if career:
            for category in categories:
                category["problems"] = [
                    problem for problem in category["problems"]
                    if not problem.get("careers") or career in problem.get("careers", [])
                ]

        # Calculate totals
        for category in categories:
            category["totalProblems"] = len(category["problems"])
            category["completedProblems"] = sum(1 for p in category["problems"] if p["completed"])

        return {"categories": categories}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading practice problems: {str(e)}")

@router.post("/run-code")
async def run_code(request: CodeExecutionRequest):
    """Execute code and return results"""
    try:
        # This is a simplified code execution - in production, use proper sandboxing
        if request.language.lower() == "python":
            # Basic Python code validation
            if "import os" in request.code or "import sys" in request.code:
                return {"error": "Import of os or sys modules is not allowed for security reasons"}
            
            # For now, just return a success message
            # In production, implement proper code execution with sandboxing
            return {
                "success": True,
                "message": "Code execution simulated successfully",
                "output": "Code would be executed here in production",
                "execution_time": "0.001s"
            }
        else:
            return {"error": f"Language {request.language} not supported yet"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error executing code: {str(e)}")

@router.post("/save-progress")
async def save_progress(request: ProgressUpdateRequest):
    """Save user progress on practice problems"""
    try:
        # In production, save to database
        # For now, just return success
        return {
            "success": True,
            "message": "Progress saved successfully",
            "problem_id": request.problem_id,
            "completed": request.completed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving progress: {str(e)}")

@router.get("/challenging-problems")
async def get_challenging_problems():
    """Get challenging coding and math problems"""
    try:
        challenging_problems = {
            "title": "Challenging Coding & Math Problems",
            "description": "A curated collection of challenging problems to test your problem-solving skills",
            "problems": [
                {
                    "id": "1",
                    "title": "Two Sum",
                    "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                    "difficulty": "Easy",
                    "category": "Arrays",
                    "example": "Input: nums = [2,7,11,15], target = 9, Output: [0,1]",
                    "hint": "Use a hash map to store complements",
                    "solution_approach": "Use a hash map to store numbers and their indices. For each number, check if its complement exists.",
                    "time_complexity": "O(n)",
                    "space_complexity": "O(n)",
                    "related_topics": ["Arrays", "Hash Table", "Two Pointers"]
                },
                {
                    "id": "2",
                    "title": "Valid Parentheses",
                    "description": "Given a string s containing just the characters '()[]{}', determine if the input string is valid.",
                    "difficulty": "Easy",
                    "category": "Stacks",
                    "example": "Input: s = '()[]{}', Output: true",
                    "hint": "Use a stack to keep track of opening brackets",
                    "solution_approach": "Use a stack to push opening brackets and pop when encountering closing brackets.",
                    "time_complexity": "O(n)",
                    "space_complexity": "O(n)",
                    "related_topics": ["Stack", "String", "Parentheses"]
                },
                {
                    "id": "3",
                    "title": "Maximum Subarray",
                    "description": "Find the contiguous subarray with the largest sum and return its sum.",
                    "difficulty": "Medium",
                    "category": "Dynamic Programming",
                    "example": "Input: nums = [-2,1,-3,4,-1,2,1,-5,4], Output: 6",
                    "hint": "Think about what happens when you add a negative number to a positive sum",
                    "solution_approach": "Use Kadane's algorithm: keep track of current sum and maximum sum seen so far.",
                    "time_complexity": "O(n)",
                    "space_complexity": "O(1)",
                    "related_topics": ["Dynamic Programming", "Arrays", "Kadane's Algorithm"]
                },
                {
                    "id": "4",
                    "title": "Longest Palindromic Substring",
                    "description": "Given a string s, return the longest palindromic substring in s.",
                    "difficulty": "Medium",
                    "category": "Dynamic Programming",
                    "example": "Input: s = 'babad', Output: 'bab' or 'aba'",
                    "hint": "Consider expanding around each center",
                    "solution_approach": "Expand around each center (single character or pair) to find palindromes.",
                    "time_complexity": "O(n²)",
                    "space_complexity": "O(1)",
                    "related_topics": ["Dynamic Programming", "String", "Palindrome"]
                }
            ],
            "categories": {
                "Arrays": "Problems involving array manipulation and algorithms",
                "Stacks": "Problems involving stack data structure",
                "Dynamic Programming": "Problems requiring dynamic programming solutions",
                "String": "Problems involving string manipulation"
            },
            "difficulty_levels": {
                "Easy": "Basic concepts, straightforward implementation",
                "Medium": "Requires algorithmic thinking and optimization",
                "Hard": "Advanced algorithms, complex data structures, mathematical insight"
            }
        }
        
        return {"challenging_problems": challenging_problems}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading challenging problems: {str(e)}")
