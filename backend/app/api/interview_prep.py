from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
import json
import os

router = APIRouter(prefix="/api", tags=["challenging-problems"])

def load_challenging_problems_data() -> Dict[str, Any]:
    """Load challenging problems data from JSON file"""
    try:
        # Get the path to the data directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_path = os.path.join(current_dir, "..", "..", "data", "interview_prep.json")
        
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Validate data structure
        if not data or "challenging_problems" not in data:
            raise ValueError("Invalid data structure in interview_prep.json")
            
        return data
    except Exception as e:
        # Return fallback data if file loading fails
        print(f"Warning: Failed to load interview_prep.json: {e}. Using fallback data.")
        return {
            "challenging_problems": {
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
                        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
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
                        "title": "Binary Search",
                        "description": "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
                        "difficulty": "Medium",
                        "category": "Search",
                        "example": "Input: nums = [-1,0,3,5,9,12], target = 9, Output: 4",
                        "hint": "Use two pointers and compare with middle element",
                        "solution_approach": "Use binary search with left and right pointers, comparing middle element with target.",
                        "time_complexity": "O(log n)",
                        "space_complexity": "O(1)",
                        "related_topics": ["Binary Search", "Arrays", "Search"]
                    },
                    {
                        "id": "4",
                        "title": "Maximum Subarray",
                        "description": "Find the contiguous subarray with the largest sum and return its sum.",
                        "difficulty": "Medium",
                        "category": "Dynamic Programming",
                        "example": "Input: nums = [-2,1,-3,4,-1,2,1,-5,4], Output: 6",
                        "hint": "Use Kadane's algorithm",
                        "solution_approach": "Keep track of current sum and maximum sum, reset current sum when it becomes negative.",
                        "time_complexity": "O(n)",
                        "space_complexity": "O(1)",
                        "related_topics": ["Dynamic Programming", "Arrays", "Kadane's Algorithm"]
                    },
                    {
                        "id": "5",
                        "title": "Longest Palindromic Substring",
                        "description": "Given a string s, return the longest palindromic substring in s.",
                        "difficulty": "Medium",
                        "category": "Dynamic Programming",
                        "example": "Input: s = 'babad', Output: 'bab'",
                        "hint": "Expand around center for each character",
                        "solution_approach": "For each character, expand around center to find longest palindrome.",
                        "time_complexity": "O(n²)",
                        "space_complexity": "O(1)",
                        "related_topics": ["Dynamic Programming", "String", "Palindrome"]
                    },
                    {
                        "id": "6",
                        "title": "Merge Intervals",
                        "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
                        "difficulty": "Medium",
                        "category": "Sorting",
                        "example": "Input: intervals = [[1,3],[2,6],[8,10],[15,18]], Output: [[1,6],[8,10],[15,18]]",
                        "hint": "Sort intervals by start time first",
                        "solution_approach": "Sort intervals by start time, then merge overlapping ones.",
                        "time_complexity": "O(n log n)",
                        "space_complexity": "O(n)",
                        "related_topics": ["Sorting", "Arrays", "Intervals"]
                    },
                    {
                        "id": "7",
                        "title": "Linked List Cycle",
                        "description": "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
                        "difficulty": "Medium",
                        "category": "Linked Lists",
                        "example": "Input: head = [3,2,0,-4], pos = 1, Output: true",
                        "hint": "Use Floyd's cycle-finding algorithm",
                        "solution_approach": "Use two pointers, one moving twice as fast as the other.",
                        "time_complexity": "O(n)",
                        "space_complexity": "O(1)",
                        "related_topics": ["Linked Lists", "Two Pointers", "Cycle Detection"]
                    },
                    {
                        "id": "8",
                        "title": "Reverse String",
                        "description": "Write a function that reverses a string. The input string is given as an array of characters.",
                        "difficulty": "Easy",
                        "category": "Strings",
                        "example": "Input: s = ['h','e','l','l','o'], Output: ['o','l','l','e','h']",
                        "hint": "Use two pointers from both ends",
                        "solution_approach": "Use two pointers from start and end, swap characters and move inward.",
                        "time_complexity": "O(n)",
                        "space_complexity": "O(1)",
                        "related_topics": ["Strings", "Two Pointers", "Array"]
                    },
                    {
                        "id": "9",
                        "title": "Valid Anagram",
                        "description": "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
                        "difficulty": "Easy",
                        "category": "Strings",
                        "example": "Input: s = 'anagram', t = 'nagaram', Output: true",
                        "hint": "Count character frequencies",
                        "solution_approach": "Count character frequencies in both strings and compare.",
                        "time_complexity": "O(n)",
                        "space_complexity": "O(1)",
                        "related_topics": ["Strings", "Hash Table", "Anagram"]
                    },
                    {
                        "id": "10",
                        "title": "Climbing Stairs",
                        "description": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps.",
                        "difficulty": "Easy",
                        "category": "Dynamic Programming",
                        "example": "Input: n = 3, Output: 3",
                        "hint": "Think about Fibonacci sequence",
                        "solution_approach": "Use dynamic programming with base cases dp[1] = 1, dp[2] = 2.",
                        "time_complexity": "O(n)",
                        "space_complexity": "O(1)",
                        "related_topics": ["Dynamic Programming", "Fibonacci", "Combinatorics"]
                    }
                ],
                "categories": {
                    "Arrays": "Problems involving array manipulation and algorithms",
                    "Strings": "String processing and manipulation problems",
                    "Dynamic Programming": "Problems involving optimal substructure and overlapping subproblems",
                    "Linked Lists": "Problems involving linked list data structures",
                    "Stacks": "Problems involving stack data structure",
                    "Search": "Search algorithms and techniques",
                    "Sorting": "Sorting algorithms and related problems"
                },
                "difficulty_levels": {
                    "Easy": "Basic concepts, straightforward implementation",
                    "Medium": "Requires algorithmic thinking and optimization",
                    "Hard": "Advanced algorithms, complex data structures, mathematical insight"
                }
            }
        }

@router.get("/interview_prep")
async def get_challenging_problems():
    """Get all challenging problems data"""
    try:
        data = load_challenging_problems_data()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve challenging problems data: {str(e)}"
        )

@router.get("/challenging-problems")
async def get_challenging_problems_alt():
    """Alternative endpoint for challenging problems"""
    try:
        data = load_challenging_problems_data()
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve challenging problems data: {str(e)}"
        )

@router.get("/challenging-problems/categories")
async def get_problem_categories():
    """Get all available problem categories"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            return {"categories": []}
        
        categories = data["challenging_problems"].get("categories", {})
        return {"categories": categories}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problem categories: {str(e)}"
        )

@router.get("/challenging-problems/difficulties")
async def get_problem_difficulties():
    """Get all available difficulty levels"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            return {"difficulties": []}
        
        difficulties = data["challenging_problems"].get("difficulty_levels", {})
        return {"difficulties": difficulties}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve difficulty levels: {str(e)}"
        )

@router.get("/challenging-problems/category/{category}")
async def get_problems_by_category(category: str):
    """Get challenging problems for a specific category"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenging problems data not found"
            )
        
        problems = data["challenging_problems"].get("problems", [])
        categories = data["challenging_problems"].get("categories", {})
        
        if category not in categories:
            # Try to find partial matches
            matching_categories = []
            for cat in categories.keys():
                if category.lower() in cat.lower():
                    matching_categories.append(cat)
            
            if matching_categories:
                return {
                    "message": f"Category '{category}' not found. Did you mean one of these?",
                    "suggestions": matching_categories,
                    "available_categories": list(categories.keys())
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category '{category}' not found. Available categories: {list(categories.keys())}"
                )
        
        # Filter problems by category
        category_problems = [p for p in problems if p.get("category") == category]
        
        return {
            "category": category,
            "description": categories[category],
            "problems": category_problems,
            "total_problems": len(category_problems)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problems for category '{category}': {str(e)}"
        )

@router.get("/challenging-problems/difficulty/{difficulty}")
async def get_problems_by_difficulty(difficulty: str):
    """Get challenging problems for a specific difficulty level"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenging problems data not found"
            )
        
        problems = data["challenging_problems"].get("problems", [])
        difficulties = data["challenging_problems"].get("difficulty_levels", {})
        
        if difficulty not in difficulties:
            # Try to find partial matches
            matching_difficulties = []
            for diff in difficulties.keys():
                if difficulty.lower() in diff.lower():
                    matching_difficulties.append(diff)
            
            if matching_difficulties:
                return {
                    "message": f"Difficulty '{difficulty}' not found. Did you mean one of these?",
                    "suggestions": matching_difficulties,
                    "available_difficulties": list(difficulties.keys())
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Difficulty '{difficulty}' not found. Available difficulties: {list(difficulties.keys())}"
                )
        
        # Filter problems by difficulty
        difficulty_problems = [p for p in problems if p.get("difficulty") == difficulty]
        
        return {
            "difficulty": difficulty,
            "description": difficulties[difficulty],
            "problems": difficulty_problems,
            "total_problems": len(difficulty_problems)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problems for difficulty '{difficulty}': {str(e)}"
        )

@router.get("/challenging-problems/problem/{problem_id}")
async def get_problem_by_id(problem_id: str):
    """Get a specific challenging problem by ID"""
    try:
        data = load_challenging_problems_data()
        
        if not data or "challenging_problems" not in data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Challenging problems data not found"
            )
        
        problems = data["challenging_problems"].get("problems", [])
        
        # Find problem by ID
        problem = None
        for p in problems:
            if p.get("id") == problem_id:
                problem = p
                break
        
        if not problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problem with ID '{problem_id}' not found"
            )
        
        return problem
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve problem '{problem_id}': {str(e)}"
        )
