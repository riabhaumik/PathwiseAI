import os
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import openai
from openai import OpenAI
import requests
import asyncio
from dotenv import load_dotenv
from app.core.config import settings

# Load environment variables
load_dotenv("../.env")

logger = logging.getLogger(__name__)

class RoadmapService:
    def __init__(self):
        # Make OpenAI optional - provide comprehensive roadmaps even without API key
        self.openai_client = None
        self.openai_model = settings.openai_model
        
        if settings.openai_api_key and settings.openai_api_key != "your_openai_api_key":
            try:
                self.openai_client = OpenAI(api_key=settings.openai_api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.warning(f"OpenAI client initialization failed: {e}. Using enhanced fallback roadmaps.")
        else:
            logger.info("OpenAI API key not configured. Using enhanced fallback roadmaps.")
        
        # API keys for external services
        self.youtube_api_key = settings.youtube_api_key
        self.coursera_api_key = settings.coursera_api_key
        self.khan_api_key = settings.khan_academy_api_key
        self.edx_api_key = settings.edx_api_key
        # Cache for API responses to avoid rate limiting
        self._cache = {}
        self._cache_ttl = 3600  # 1 hour

        # Resolve data directory robustly
        # backend/app/services -> backend
        self._base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    def load_careers_data(self) -> Dict[str, Any]:
        """Load careers data from JSON file"""
        try:
            path = os.path.join(self._base_dir, "data", "careers_stem.json")
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading careers data: {e}")
            return {}
    
    def load_resources_data(self) -> Dict[str, Any]:
        """Load resources data from JSON file"""
        try:
            path = os.path.join(self._base_dir, "data", "resources_massive.json")
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading resources data: {e}")
            return {}
    
    async def get_career_skills(self, career_name: str) -> Dict[str, Any]:
        """Get required skills for a specific career"""
        try:
            careers_data = self.load_careers_data()
            
            # Search for career in the data (careers_stem.json structure)
            if career_name in careers_data:
                career_data = careers_data[career_name]
                return {
                    "career": career_name,
                    "skills": career_data.get("skills", []),
                    "degree_required": career_data.get("degree_required", "Not specified"),
                    "description": career_data.get("description", ""),
                    "growth_rate": career_data.get("growth_rate", ""),
                    "avg_salary": career_data.get("avg_salary", ""),
                    "category": career_data.get("category", ""),
                    "subjects": career_data.get("subjects", {})
                }
            
            # If not found in data, try to generate with AI
            return await self._generate_career_skills_with_ai(career_name)
            
        except Exception as e:
            logger.error(f"Error getting career skills: {e}")
            return {
                "career": career_name,
                "skills": [],
                "error": f"Failed to retrieve skills: {str(e)}"
            }
    
    async def _generate_career_skills_with_ai(self, career_name: str) -> Dict[str, Any]:
        """Generate career skills using AI if not found in database"""
        try:
            prompt = f"""Generate a comprehensive list of required skills for a {career_name} career. 
            Include:
            1. Technical skills (programming languages, tools, technologies)
            2. Mathematical skills (calculus, statistics, linear algebra, etc.)
            3. Soft skills (communication, problem-solving, teamwork, etc.)
            4. Domain-specific knowledge
            
            Format the response as a JSON object with these categories."""
            
            response = self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.3
            )
            
            ai_response = response.choices[0].message.content
            
            # Try to parse JSON response
            try:
                skills_data = json.loads(ai_response)
                return {
                    "career": career_name,
                    "skills": skills_data.get("skills", []),
                    "technical_skills": skills_data.get("technical_skills", []),
                    "math_skills": skills_data.get("math_skills", []),
                    "soft_skills": skills_data.get("soft_skills", []),
                    "domain_knowledge": skills_data.get("domain_knowledge", [])
                }
            except json.JSONDecodeError:
                # If JSON parsing fails, extract skills from text
                return {
                    "career": career_name,
                    "skills": self._extract_skills_from_text(ai_response),
                    "raw_response": ai_response
                }
                
        except Exception as e:
            logger.error(f"Error generating skills with AI: {e}")
            return {
                "career": career_name,
                "skills": [],
                "error": f"Failed to generate skills: {str(e)}"
            }
    
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from AI-generated text response"""
        # Simple skill extraction - in production, use more sophisticated NLP
        skills = []
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['•', '-', '*', 'skill', 'knowledge']):
                skill = line.strip().replace('•', '').replace('-', '').replace('*', '').strip()
                if skill and len(skill) > 3:
                    skills.append(skill)
        return skills[:20]  # Limit to 20 skills
    
    async def get_youtube_resources(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Fetch YouTube resources for learning"""
        if not self.youtube_api_key:
            logger.warning("YouTube API key not configured")
            return []
        
        cache_key = f"youtube_{query}_{max_results}"
        if cache_key in self._cache:
            cache_time, cache_data = self._cache[cache_key]
            if datetime.now().timestamp() - cache_time < self._cache_ttl:
                return cache_data
        
        try:
            url = "https://www.googleapis.com/youtube/v3/search"
            params = {
                'part': 'snippet',
                'q': f"{query} tutorial course",
                'type': 'video',
                'maxResults': max_results,
                'order': 'relevance',
                'videoDuration': 'medium',
                'key': self.youtube_api_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            resources = []
            
            for item in data.get('items', []):
                snippet = item['snippet']
                resources.append({
                    'title': snippet['title'],
                    'description': snippet['description'][:200] + '...' if len(snippet['description']) > 200 else snippet['description'],
                    'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
                    'platform': 'YouTube',
                    'duration': 'Variable',
                    'rating': '4.5',
                    'instructor': snippet.get('channelTitle', 'Unknown'),
                    'image_url': snippet.get('thumbnails', {}).get('medium', {}).get('url', ''),
                    'published_at': snippet.get('publishedAt', ''),
                    'view_count': 'N/A'
                })
            
            # Cache the results
            self._cache[cache_key] = (datetime.now().timestamp(), resources)
            return resources
            
        except Exception as e:
            logger.error(f"Error fetching YouTube resources: {e}")
            return []
    
    async def get_coursera_resources(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Fetch Coursera resources for learning"""
        if not self.coursera_api_key:
            logger.warning("Coursera API key not configured")
            return []
        
        cache_key = f"coursera_{query}_{max_results}"
        if cache_key in self._cache:
            cache_time, cache_data = self._cache[cache_key]
            if datetime.now().timestamp() - cache_time < self._cache_ttl:
                return cache_data
        
        try:
            # Coursera API endpoint (this is a mock - replace with actual API)
            url = "https://api.coursera.org/api/courses.v1"
            params = {
                'q': 'search',
                'query': query,
                'limit': max_results,
                'fields': 'id,name,description,shortDescription,instructorIds,primaryLanguages,startDate'
            }
            
            headers = {
                'Authorization': f'Bearer {self.coursera_api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            resources = []
            
            for course in data.get('linked', {}).get('courses', []):
                resources.append({
                    'title': course.get('name', 'Unknown Course'),
                    'description': course.get('shortDescription', course.get('description', ''))[:200] + '...',
                    'url': f"https://www.coursera.org/learn/{course.get('slug', '')}",
                    'platform': 'Coursera',
                    'duration': '8-12 weeks',
                    'rating': '4.6',
                    'instructor': 'Multiple Instructors',
                    'image_url': '',
                    'language': ', '.join(course.get('primaryLanguages', ['English'])),
                    'start_date': course.get('startDate', 'Rolling')
                })
            
            # Cache the results
            self._cache[cache_key] = (datetime.now().timestamp(), resources)
            return resources
            
        except Exception as e:
            logger.error(f"Error fetching Coursera resources: {e}")
            return []
    
    async def get_khan_academy_resources(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Fetch Khan Academy resources for learning"""
        if not self.khan_api_key:
            logger.warning("Khan Academy API key not configured")
            return []
        
        cache_key = f"khan_{query}_{max_results}"
        if cache_key in self._cache:
            cache_time, cache_data = self._cache[cache_key]
            if datetime.now().timestamp() - cache_time < self._cache_ttl:
                return cache_data
        
        try:
            # Khan Academy API endpoint
            url = "https://www.khanacademy.org/api/v1/topic"
            params = {
                'query': query,
                'limit': max_results
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            resources = []
            
            for item in data.get('topics', []):
                resources.append({
                    'title': item.get('title', 'Unknown Topic'),
                    'description': item.get('description', '')[:200] + '...',
                    'url': f"https://www.khanacademy.org{item.get('url', '')}",
                    'platform': 'Khan Academy',
                    'duration': 'Variable',
                    'rating': '4.8',
                    'instructor': 'Khan Academy',
                    'image_url': '',
                    'subject': item.get('subject', ''),
                    'grade_level': item.get('gradeLevel', '')
                })
            
            # Cache the results
            self._cache[cache_key] = (datetime.now().timestamp(), resources)
            return resources
            
        except Exception as e:
            logger.error(f"Error fetching Khan Academy resources: {e}")
            return []
    
    async def get_edx_resources(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """Fetch edX resources for learning"""
        if not self.edx_api_key:
            logger.warning("edX API key not configured")
            return []
        
        cache_key = f"edx_{query}_{max_results}"
        if cache_key in self._cache:
            cache_time, cache_data = self._cache[cache_key]
            if datetime.now().timestamp() - cache_time < self._cache_ttl:
                return cache_data
        
        try:
            # edX API endpoint
            url = "https://api.edx.org/catalog/v1/catalogs/edx/courses/"
            params = {
                'search_query': query,
                'limit': max_results,
                'content_type': 'course'
            }
            
            headers = {
                'Authorization': f'Bearer {self.edx_api_key}',
                'Content-Type': 'application/json'
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            resources = []
            
            for course in data.get('results', []):
                resources.append({
                    'title': course.get('title', 'Unknown Course'),
                    'description': course.get('short_description', '')[:200] + '...',
                    'url': course.get('url', ''),
                    'platform': 'edX',
                    'duration': course.get('length', 'Variable'),
                    'rating': '4.5',
                    'instructor': ', '.join([instructor.get('name', '') for instructor in course.get('staff', [])]),
                    'image_url': course.get('image', {}).get('src', ''),
                    'language': course.get('language', 'English'),
                    'effort': course.get('effort', '')
                })
            
            # Cache the results
            self._cache[cache_key] = (datetime.now().timestamp(), resources)
            return resources
            
        except Exception as e:
            logger.error(f"Error fetching edX resources: {e}")
            return []
    
    async def generate_ai_roadmap(self, career_name: str, career_data: Dict[str, Any], 
                           user_level: str = "beginner") -> Dict[str, Any]:
        """Generate a comprehensive AI-powered roadmap"""
        try:
            # Create a detailed prompt for the AI
            prompt = f"""Create a comprehensive learning roadmap for becoming a {career_name}.
            
            Career Information:
            - Skills: {', '.join(career_data.get('skills', []))}
            - Description: {career_data.get('description', '')}
            - User Level: {user_level}
            
            Generate a structured roadmap with:
            1. Overview and career description
            2. Estimated duration based on user level
            3. Skill domains (math, programming, soft skills)
            4. Learning phases with topics and difficulty
            5. Milestones and success criteria
            6. Timeline recommendations
            
            Format as JSON with this structure:
            {{
                "career": "career_name",
                "overview": "description",
                "estimated_duration": "timeframe",
                "skill_domains": {{
                    "math": ["skill1", "skill2"],
                    "programming": ["skill1", "skill2"],
                    "soft_skills": ["skill1", "skill2"]
                }},
                "phases": [
                    {{
                        "name": "phase_name",
                        "duration": "timeframe",
                        "description": "description",
                        "topics": ["topic1", "topic2"],
                        "difficulty": "beginner/intermediate/advanced"
                    }}
                ],
                "milestones": [
                    {{
                        "name": "milestone_name",
                        "description": "description",
                        "target_date": "relative_date",
                        "criteria": ["criteria1", "criteria2"]
                    }}
                ]
            }}
            
            Make it practical and achievable for a {user_level} level learner."""
            
            response = self.openai_client.chat.completions.create(
                model=self.openai_model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.3
            )
            
            ai_response = response.choices[0].message.content
            
            try:
                roadmap_data = json.loads(ai_response)
                return roadmap_data
            except json.JSONDecodeError:
                logger.error("Failed to parse AI roadmap response as JSON")
                return self.generate_basic_roadmap(career_name, career_data, user_level)
                
        except Exception as e:
            logger.error(f"Error generating AI roadmap: {e}")
            return self.generate_basic_roadmap(career_name, career_data, user_level)
    
    def generate_basic_roadmap(self, career_name: str, career_data: Dict[str, Any], 
                             user_level: str = "beginner") -> Dict[str, Any]:
        """Generate enhanced roadmap with career-specific content"""
        # Check for specific career roadmaps
        if "software" in career_name.lower() or "engineer" in career_name.lower():
            return self._get_software_engineer_roadmap(user_level, career_data)
        elif "data" in career_name.lower() and "scientist" in career_name.lower():
            return self._get_data_scientist_roadmap(user_level, career_data)
        elif "ai" in career_name.lower() or "artificial intelligence" in career_name.lower():
            return self._get_ai_engineer_roadmap(user_level, career_data)
        
        # Fallback to enhanced generic roadmap
        skills = career_data.get('skills', [])
        
        # Determine duration based on user level
        duration_map = {
            "beginner": "2-3 years",
            "intermediate": "1-2 years", 
            "advanced": "6-12 months"
        }
        
        # Create basic phases with fallback topics for generic careers
        if not skills:
            # For careers without specific skills, use generic topics
            skills = [
                "Core Concepts & Theory",
                "Basic Tools & Technologies", 
                "Fundamental Principles",
                "Industry Standards",
                "Essential Skills",
                "Practical Applications",
                "Real-world Projects",
                "Advanced Techniques",
                "Industry Best Practices",
                "Problem-solving Skills",
                "Specialized Knowledge",
                "Leadership & Communication"
            ]
        
        phases = [
            {
                "name": "Foundation",
                "duration": "3-6 months",
                "description": "Build fundamental knowledge and core skills",
                "topics": skills[:5] if len(skills) >= 5 else skills,
                "difficulty": "beginner"
            },
            {
                "name": "Intermediate",
                "duration": "6-12 months", 
                "description": "Develop practical skills and hands-on experience",
                "topics": skills[5:10] if len(skills) >= 10 else skills[5:] if len(skills) > 5 else skills[:5],
                "difficulty": "intermediate"
            },
            {
                "name": "Advanced",
                "duration": "6-12 months",
                "description": "Master advanced concepts and specialize in your area of interest",
                "topics": skills[10:] if len(skills) > 10 else skills[5:10] if len(skills) >= 10 else skills[:5],
                "difficulty": "advanced"
            }
        ]
        
        # Ensure all phases have topics (never filter out phases completely)
        for phase in phases:
            if not phase["topics"]:
                phase["topics"] = skills[:3]  # Use first 3 skills as fallback
        
        return {
            "career": career_name,
            "overview": career_data.get('description', f'Comprehensive learning path for {career_name}'),
            "estimated_duration": duration_map.get(user_level, "1-2 years"),
            "skill_domains": {
                "math": [skill for skill in skills if any(math_term in skill.lower() for math_term in ['math', 'calculus', 'statistics', 'algebra', 'geometry'])],
                "programming": [skill for skill in skills if any(prog_term in skill.lower() for prog_term in ['programming', 'coding', 'software', 'development', 'python', 'java', 'javascript'])],
                "soft_skills": [skill for skill in skills if any(soft_term in skill.lower() for soft_term in ['communication', 'leadership', 'teamwork', 'problem-solving', 'critical thinking'])]
            },
            "phases": phases,
            "milestones": [
                {
                    "name": "Foundation Complete",
                    "description": "Mastered basic concepts and skills",
                    "target_date": "3-6 months",
                    "criteria": ["Completed foundation phase", "Basic skills demonstrated", "Ready for intermediate level"]
                },
                {
                    "name": "Intermediate Complete", 
                    "description": "Developed practical skills and experience",
                    "target_date": "9-18 months",
                    "criteria": ["Completed intermediate phase", "Practical projects completed", "Ready for advanced concepts"]
                },
                {
                    "name": "Career Ready",
                    "description": "Achieved professional competency",
                    "target_date": "15-30 months", 
                    "criteria": ["All phases completed", "Portfolio of work", "Industry knowledge", "Professional network"]
                }
            ]
        }
    
    async def enhance_roadmap_with_resources(self, roadmap: Dict[str, Any], career_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance roadmap with learning resources from multiple platforms"""
        try:
            # Get skills for resource search
            skills = career_data.get('skills', [])
            career_name = roadmap.get('career', '')

            # Search for resources on multiple platforms
            all_resources: List[Dict[str, Any]] = []

            # Aggregate tasks for concurrent fetches
            tasks: List[asyncio.Task] = []

            if career_name:
                tasks.extend([
                    asyncio.create_task(self.get_youtube_resources(career_name, 3)),
                    asyncio.create_task(self.get_coursera_resources(career_name, 3)),
                    asyncio.create_task(self.get_khan_academy_resources(career_name, 3)),
                    asyncio.create_task(self.get_edx_resources(career_name, 3)),
                ])

            for skill in skills[:5]:
                tasks.extend([
                    asyncio.create_task(self.get_youtube_resources(skill, 2)),
                    asyncio.create_task(self.get_coursera_resources(skill, 2)),
                ])

            if tasks:
                results = await asyncio.gather(*tasks, return_exceptions=True)
                for r in results:
                    if isinstance(r, Exception):
                        logger.warning(f"Resource fetch task failed: {r}")
                    elif isinstance(r, list):
                        all_resources.extend(r)

            # Add career-specific curated resources
            career_specific_resources = self._get_career_specific_resources(career_name)
            all_resources.extend(career_specific_resources)

            # Remove duplicates and limit total resources
            unique_resources: List[Dict[str, Any]] = []
            seen_urls = set()
            for resource in all_resources:
                url = resource.get('url')
                if not url:
                    continue
                if url not in seen_urls and len(unique_resources) < 40:
                    unique_resources.append(resource)
                    seen_urls.add(url)

            # Add resources to roadmap phases
            if unique_resources:
                roadmap['resources'] = unique_resources

                for i, phase in enumerate(roadmap.get('phases', [])):
                    start = i * 5
                    end = (i + 1) * 5
                    phase_resources = unique_resources[start:end]
                    if phase_resources:
                        phase['resources'] = phase_resources

            return roadmap

        except Exception as e:
            logger.error(f"Error enhancing roadmap with resources: {e}")
            return roadmap
    
    async def generate_roadmap(self, career_name: str, user_level: str = "beginner", 
                        completed_topics: Optional[List[str]] = None) -> Dict[str, Any]:
        """Main method to generate a complete roadmap"""
        try:
            # Load career data
            careers_data = self.load_careers_data()
            career_data = None
            
            # Find career in database (careers_stem.json structure)
            if career_name in careers_data:
                career_data = careers_data[career_name]
                # Convert to expected format
                career_data = {
                    "name": career_name,
                    "description": career_data.get("description", ""),
                    "skills": career_data.get("skills", []),
                    "category": career_data.get("category", ""),
                    "subjects": career_data.get("subjects", {})
                }
            
            # If career not found, create basic data
            if not career_data:
                career_data = {
                    "name": career_name,
                    "description": f"Career path for {career_name}",
                    "skills": []
                }
            
            # Generate roadmap (try AI first, fallback to basic)
            try:
                roadmap = await self.generate_ai_roadmap(career_name, career_data, user_level)
            except Exception as e:
                logger.warning(f"AI roadmap generation failed, using basic: {e}")
                roadmap = self.generate_basic_roadmap(career_name, career_data, user_level)

            # Enhance with resources
            roadmap = await self.enhance_roadmap_with_resources(roadmap, career_data)

            # Ensure minimum number of milestones (at least 10)
            roadmap = self._ensure_minimum_milestones(roadmap)
            
            # Add completion tracking if topics provided
            if completed_topics:
                for phase in roadmap.get('phases', []):
                    phase['completed_topics'] = [topic for topic in phase.get('topics', []) 
                                              if topic in completed_topics]
                    total_topics = len(phase.get('topics', []))
                    completed_count = len(phase.get('completed_topics', []))
                    phase['completion_percentage'] = int((completed_count / total_topics) * 100) if total_topics > 0 else 0
            
            return roadmap
            
        except Exception as e:
            logger.error(f"Error generating roadmap: {e}")
            return {
                "career": career_name,
                "overview": f"Failed to generate roadmap for {career_name}",
                "error": str(e),
                "phases": [],
                "milestones": []
            }

    def _get_career_specific_resources(self, career_name: str) -> List[Dict[str, Any]]:
        """Get curated career-specific learning resources"""
        career_lower = career_name.lower()
        resources = []
        
        # Software Engineering resources
        if 'software' in career_lower or 'engineer' in career_lower:
            resources.extend([
                {
                    'title': 'LeetCode - Programming Practice',
                    'description': 'Practice coding problems and algorithms for technical interviews',
                    'url': 'https://leetcode.com/',
                    'platform': 'LeetCode',
                    'duration': 'Ongoing',
                    'rating': '4.8',
                    'instructor': 'Various',
                    'difficulty': 'Beginner to Advanced',
                    'tags': ['coding', 'algorithms', 'data structures', 'interview prep']
                },
                {
                    'title': 'HackerRank - Coding Challenges',
                    'description': 'Practice coding skills with challenges and competitions',
                    'url': 'https://www.hackerrank.com/',
                    'platform': 'HackerRank',
                    'duration': 'Ongoing',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Beginner to Advanced',
                    'tags': ['coding', 'challenges', 'competitions', 'skills']
                },
                {
                    'title': 'MDN Web Docs',
                    'description': 'Comprehensive web development documentation and tutorials',
                    'url': 'https://developer.mozilla.org/',
                    'platform': 'Mozilla',
                    'duration': 'Reference',
                    'rating': '4.9',
                    'instructor': 'Mozilla',
                    'difficulty': 'All Levels',
                    'tags': ['web development', 'documentation', 'tutorials', 'reference']
                },
                {
                    'title': 'System Design Primer',
                    'description': 'Learn how to design large-scale systems',
                    'url': 'https://github.com/donnemartin/system-design-primer',
                    'platform': 'GitHub',
                    'duration': 'Self-paced',
                    'rating': '4.9',
                    'instructor': 'Donne Martin',
                    'difficulty': 'Intermediate to Advanced',
                    'tags': ['system design', 'architecture', 'scalability', 'distributed systems']
                }
            ])
        
        # Data Science resources
        if 'data' in career_lower and 'scientist' in career_lower:
            resources.extend([
                {
                    'title': 'Machine Learning Course by Andrew Ng',
                    'description': 'Stanford\'s famous machine learning course',
                    'url': 'https://www.coursera.org/learn/machine-learning',
                    'platform': 'Coursera',
                    'duration': '11 weeks',
                    'rating': '4.9',
                    'instructor': 'Andrew Ng',
                    'difficulty': 'Intermediate',
                    'tags': ['machine learning', 'AI', 'statistics', 'algorithms']
                },
                {
                    'title': 'Statistics and Probability Course',
                    'description': 'Comprehensive statistics course for data science',
                    'url': 'https://www.khanacademy.org/math/statistics-probability',
                    'platform': 'Khan Academy',
                    'duration': '8-12 weeks',
                    'rating': '4.7',
                    'instructor': 'Khan Academy',
                    'difficulty': 'Beginner to Intermediate',
                    'tags': ['statistics', 'probability', 'data analysis', 'mathematics']
                },
                {
                    'title': 'Python for Data Science Handbook',
                    'description': 'Essential Python libraries for data analysis',
                    'url': 'https://jakevdp.github.io/PythonDataScienceHandbook/',
                    'platform': 'GitHub',
                    'duration': 'Self-paced',
                    'rating': '4.8',
                    'instructor': 'Jake VanderPlas',
                    'difficulty': 'Intermediate',
                    'tags': ['python', 'pandas', 'numpy', 'data analysis']
                },
                {
                    'title': 'Kaggle - Data Science Competitions',
                    'description': 'Practice data science with real-world datasets and competitions',
                    'url': 'https://www.kaggle.com/',
                    'platform': 'Kaggle',
                    'duration': 'Ongoing',
                    'rating': '4.8',
                    'instructor': 'Community',
                    'difficulty': 'All Levels',
                    'tags': ['data science', 'competitions', 'datasets', 'machine learning']
                }
            ])
        
        # AI/ML Engineering resources
        if 'ai' in career_lower or 'artificial intelligence' in career_lower or 'ml' in career_lower:
            resources.extend([
                {
                    'title': 'Deep Learning Specialization',
                    'description': 'Comprehensive deep learning course by Andrew Ng',
                    'url': 'https://www.coursera.org/specializations/deep-learning',
                    'platform': 'Coursera',
                    'duration': '16 weeks',
                    'rating': '4.8',
                    'instructor': 'Andrew Ng',
                    'difficulty': 'Intermediate to Advanced',
                    'tags': ['deep learning', 'neural networks', 'AI', 'machine learning']
                },
                {
                    'title': 'Fast.ai - Practical Deep Learning',
                    'description': 'Practical deep learning for coders',
                    'url': 'https://course.fast.ai/',
                    'platform': 'Fast.ai',
                    'duration': '8 weeks',
                    'rating': '4.9',
                    'instructor': 'Jeremy Howard',
                    'difficulty': 'Intermediate',
                    'tags': ['deep learning', 'practical', 'pytorch', 'computer vision']
                },
                {
                    'title': '3Blue1Brown - Neural Networks',
                    'description': 'Intuitive explanations of neural networks and deep learning',
                    'url': 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi',
                    'platform': 'YouTube',
                    'duration': 'Self-paced',
                    'rating': '4.9',
                    'instructor': 'Grant Sanderson',
                    'difficulty': 'Beginner to Intermediate',
                    'tags': ['neural networks', 'deep learning', 'mathematics', 'visualization']
                },
                {
                    'title': 'Papers With Code',
                    'description': 'Latest machine learning research papers with code implementations',
                    'url': 'https://paperswithcode.com/',
                    'platform': 'Papers With Code',
                    'duration': 'Ongoing',
                    'rating': '4.8',
                    'instructor': 'Research Community',
                    'difficulty': 'Advanced',
                    'tags': ['research', 'papers', 'implementations', 'state-of-the-art']
                }
            ])
        
        # Mathematics resources
        if 'math' in career_lower or 'mathematics' in career_lower:
            resources.extend([
                {
                    'title': 'MIT OpenCourseWare - Mathematics',
                    'description': 'Free mathematics courses from MIT',
                    'url': 'https://ocw.mit.edu/courses/mathematics/',
                    'platform': 'MIT OCW',
                    'duration': 'Self-paced',
                    'rating': '4.9',
                    'instructor': 'MIT Faculty',
                    'difficulty': 'Intermediate to Advanced',
                    'tags': ['mathematics', 'calculus', 'linear algebra', 'advanced math']
                },
                {
                    'title': 'Khan Academy - Mathematics',
                    'description': 'Comprehensive mathematics courses from basic to advanced',
                    'url': 'https://www.khanacademy.org/math',
                    'platform': 'Khan Academy',
                    'duration': 'Self-paced',
                    'rating': '4.8',
                    'instructor': 'Khan Academy',
                    'difficulty': 'All Levels',
                    'tags': ['mathematics', 'algebra', 'calculus', 'statistics']
                },
                {
                    'title': '3Blue1Brown - Mathematics',
                    'description': 'Beautiful visual explanations of mathematical concepts',
                    'url': 'https://www.youtube.com/c/3blue1brown',
                    'platform': 'YouTube',
                    'duration': 'Self-paced',
                    'rating': '4.9',
                    'instructor': 'Grant Sanderson',
                    'difficulty': 'All Levels',
                    'tags': ['mathematics', 'visualization', 'intuition', 'concepts']
                }
            ])
        
        return resources

    def _ensure_minimum_milestones(self, roadmap: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure there are at least 10 milestones by deriving from phases/topics if needed"""
        try:
            milestones: List[Dict[str, Any]] = roadmap.get('milestones', []) or []
            if len(milestones) >= 10:
                roadmap['milestones'] = milestones
                return roadmap

            # Derive additional milestones from phases and topics
            derived: List[Dict[str, Any]] = []
            for phase in roadmap.get('phases', []):
                phase_name = phase.get('name', 'Phase')
                for topic in phase.get('topics', [])[:5]:  # cap per phase to avoid huge lists
                    derived.append({
                        "name": f"Complete: {topic}",
                        "description": f"Finish {topic} in {phase_name}",
                        "target_date": phase.get('duration', 'TBD'),
                        "criteria": [f"Watch/Read core materials for {topic}", f"Complete 2-3 exercises on {topic}"]
                    })
                    if len(milestones) + len(derived) >= 12:  # a bit over 10 for buffer
                        break
                if len(milestones) + len(derived) >= 12:
                    break

            roadmap['milestones'] = milestones + derived
            return roadmap
        except Exception:
            return roadmap
    
    def _get_software_engineer_roadmap(self, user_level: str, career_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive Software Engineer roadmap"""
        duration_map = {"beginner": "18-24 months", "intermediate": "12-18 months", "advanced": "6-12 months"}
        
        phases = [
            {
                "name": "Programming Fundamentals",
                "duration": "2-4 months",
                "description": "Master core programming concepts and your first language",
                "topics": ["Variables and Data Types", "Control Flow", "Functions", "Object-Oriented Programming", "Basic Algorithms"],
                "difficulty": "beginner"
            },
            {
                "name": "Data Structures & Algorithms",
                "duration": "3-4 months",
                "description": "Learn essential CS concepts for technical interviews",
                "topics": ["Arrays and Lists", "Stacks and Queues", "Trees and Graphs", "Sorting Algorithms", "Hash Tables"],
                "difficulty": "intermediate"
            },
            {
                "name": "Web Development",
                "duration": "3-5 months",
                "description": "Build full-stack web applications",
                "topics": ["HTML/CSS/JavaScript", "Frontend Framework (React/Vue)", "Backend APIs", "Databases", "DevOps Basics"],
                "difficulty": "intermediate"
            },
            {
                "name": "System Design & Architecture",
                "duration": "4-6 months",
                "description": "Learn to design scalable systems",
                "topics": ["Microservices", "Load Balancing", "Caching", "Database Design", "Cloud Platforms"],
                "difficulty": "advanced"
            }
        ]
        
        return {
            "career": "Software Engineer",
            "overview": "Comprehensive roadmap to become a professional software engineer with strong technical skills.",
            "estimated_duration": duration_map.get(user_level, "18-24 months"),
            "skill_domains": {
                "programming": ["Python", "JavaScript", "Java", "TypeScript", "Git"],
                "web_development": ["React", "Node.js", "REST APIs", "Databases", "HTML/CSS"],
                "computer_science": ["Data Structures", "Algorithms", "System Design", "Networking"],
                "tools": ["Docker", "AWS/GCP", "CI/CD", "Testing Frameworks"]
            },
            "phases": phases,
            "math_prerequisites": ["Basic Algebra", "Discrete Mathematics", "Statistics", "Linear Algebra"],
            "milestones": [
                {
                    "name": "Programming Proficient",
                    "description": "Can write clean, working code in at least one language",
                    "target_date": "2-4 months",
                    "criteria": ["Complete programming projects", "Understand OOP", "Debug effectively"]
                },
                {
                    "name": "Technical Interview Ready",
                    "description": "Can solve coding problems and explain solutions",
                    "target_date": "6-8 months",
                    "criteria": ["Solve coding problems", "Explain algorithms", "System design basics"]
                }
            ]
        }
    
    def _get_data_scientist_roadmap(self, user_level: str, career_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive Data Scientist roadmap"""
        duration_map = {"beginner": "20-30 months", "intermediate": "15-20 months", "advanced": "8-12 months"}
        
        phases = [
            {
                "name": "Mathematics & Statistics Foundation",
                "duration": "3-5 months",
                "description": "Build essential mathematical foundation for data science",
                "topics": ["Statistics", "Probability", "Linear Algebra", "Calculus", "Hypothesis Testing"],
                "difficulty": "beginner"
            },
            {
                "name": "Programming & Data Manipulation",
                "duration": "3-4 months",
                "description": "Master Python/R and data manipulation libraries",
                "topics": ["Python Programming", "Pandas/NumPy", "Data Cleaning", "SQL", "Jupyter Notebooks"],
                "difficulty": "intermediate"
            },
            {
                "name": "Machine Learning Fundamentals",
                "duration": "4-6 months",
                "description": "Learn core ML algorithms and techniques",
                "topics": ["Supervised Learning", "Unsupervised Learning", "Feature Engineering", "Model Evaluation"],
                "difficulty": "intermediate"
            },
            {
                "name": "Advanced ML & Deep Learning",
                "duration": "4-6 months",
                "description": "Master advanced techniques and neural networks",
                "topics": ["Deep Learning", "Neural Networks", "Computer Vision", "NLP", "Time Series"],
                "difficulty": "advanced"
            }
        ]
        
        return {
            "career": "Data Scientist",
            "overview": "Complete roadmap to become a professional data scientist with strong mathematical and ML skills.",
            "estimated_duration": duration_map.get(user_level, "20-30 months"),
            "skill_domains": {
                "mathematics": ["Statistics", "Linear Algebra", "Calculus", "Probability Theory"],
                "programming": ["Python", "R", "SQL", "Pandas", "NumPy"],
                "machine_learning": ["Scikit-learn", "TensorFlow", "PyTorch", "Feature Engineering"],
                "visualization": ["Matplotlib", "Seaborn", "Plotly", "Tableau"]
            },
            "phases": phases,
            "math_prerequisites": ["Statistics & Probability", "Linear Algebra", "Calculus", "Discrete Math"],
            "milestones": [
                {
                    "name": "Data Analysis Proficient",
                    "description": "Can perform exploratory data analysis and statistical tests",
                    "target_date": "6-8 months",
                    "criteria": ["Clean and analyze datasets", "Create visualizations", "Statistical tests"]
                }
            ]
        }
    
    def _get_ai_engineer_roadmap(self, user_level: str, career_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive AI Engineer roadmap"""
        return {
            "career": "AI Engineer",
            "overview": "Specialized roadmap for AI engineering focusing on deep learning and production AI systems.",
            "estimated_duration": "18-24 months",
            "skill_domains": {
                "programming": ["Python", "C++", "PyTorch", "TensorFlow"],
                "ai_ml": ["Deep Learning", "Transformers", "Computer Vision", "NLP"],
                "mathematics": ["Linear Algebra", "Calculus", "Statistics", "Information Theory"],
                "infrastructure": ["GPU Computing", "Distributed Training", "Model Optimization"]
            },
            "phases": [
                {
                    "name": "AI Fundamentals",
                    "duration": "3-4 months",
                    "description": "Build foundation in AI and machine learning",
                    "topics": ["Machine Learning Basics", "Neural Networks", "Python Programming"],
                    "difficulty": "beginner"
                },
                {
                    "name": "Deep Learning Mastery",
                    "duration": "4-6 months",
                    "description": "Master deep learning architectures and frameworks",
                    "topics": ["CNNs", "RNNs", "Transformers", "PyTorch/TensorFlow"],
                    "difficulty": "intermediate"
                }
            ],
            "math_prerequisites": ["Linear Algebra", "Calculus", "Statistics", "Information Theory"],
            "milestones": []
        } 