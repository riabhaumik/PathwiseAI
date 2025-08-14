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

            # Ensure we have at least some resources
            if not unique_resources:
                unique_resources = career_specific_resources

            # Add resources to roadmap phases - ensure each phase has at least 2 resources
            if unique_resources:
                roadmap['resources'] = unique_resources

                for i, phase in enumerate(roadmap.get('phases', [])):
                    start = i * 5
                    end = (i + 1) * 5
                    phase_resources = unique_resources[start:end]
                    
                    # Ensure each phase has at least 2 resources
                    if len(phase_resources) < 2:
                        # Fill with career-specific resources if available
                        if career_specific_resources:
                            phase_resources = career_specific_resources[:2]
                        else:
                            # Create generic resources for the phase
                            phase_resources = [
                                {
                                    'title': f'Learning Resource for {phase.get("name", "Phase")}',
                                    'description': f'Comprehensive learning materials for {phase.get("name", "Phase")}',
                                    'url': 'https://www.khanacademy.org/',
                                    'platform': 'Khan Academy',
                                    'duration': 'Self-paced',
                                    'rating': '4.8',
                                    'instructor': 'Khan Academy',
                                    'difficulty': phase.get('difficulty', 'beginner')
                                },
                                {
                                    'title': f'Advanced Course for {phase.get("name", "Phase")}',
                                    'description': f'Advanced learning path for {phase.get("name", "Phase")}',
                                    'url': 'https://ocw.mit.edu/',
                                    'platform': 'MIT OCW',
                                    'duration': 'Self-paced',
                                    'rating': '4.9',
                                    'instructor': 'MIT Faculty',
                                    'difficulty': phase.get('difficulty', 'beginner')
                                }
                            ]
                    
                    phase['resources'] = phase_resources

            # Ensure roadmap has proper structure and no circular references
            roadmap = self._clean_roadmap_structure(roadmap)
            return roadmap

        except Exception as e:
            logger.error(f"Error enhancing roadmap with resources: {e}")
            # Fallback: ensure basic resources are available
            try:
                career_name = roadmap.get('career', '')
                career_specific_resources = self._get_career_specific_resources(career_name)
                
                if career_specific_resources:
                    roadmap['resources'] = career_specific_resources
                    
                    # Ensure each phase has resources
                    for phase in roadmap.get('phases', []):
                        phase['resources'] = career_specific_resources[:2]
                
                return roadmap
            except Exception as fallback_error:
                logger.error(f"Fallback resource enhancement also failed: {fallback_error}")
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
        
        # Software Engineer (Computer Science)
        if ('software' in career_lower and 'engineer' in career_lower) or 'software engineer' in career_lower or 'computer science' in career_lower:
            resources.extend([
                {
                    'title': 'FreeCodeCamp: Full Stack Development Curriculum',
                    'description': 'A comprehensive, free resource covering programming fundamentals, data structures, algorithms, and full-stack web development with projects.',
                    'url': 'https://www.freecodecamp.org/learn/',
                    'platform': 'FreeCodeCamp',
                    'duration': 'Self-paced',
                    'rating': '4.8',
                    'instructor': 'FreeCodeCamp',
                    'difficulty': 'Beginner to Advanced',
                    'tags': ['programming', 'web development', 'full-stack', 'free']
                },
                {
                    'title': 'Coursera: Introduction to Computer Science and Programming Specialization (University of London)',
                    'description': 'Covers programming, data structures, algorithms, and system design concepts for intermediate learners.',
                    'url': 'https://www.coursera.org/specializations/computer-science',
                    'platform': 'Coursera',
                    'duration': '16-24 weeks',
                    'rating': '4.7',
                    'instructor': 'University of London',
                    'difficulty': 'Intermediate',
                    'tags': ['computer science', 'programming', 'algorithms', 'university']
                }
            ])
        
        # Data Scientist (Data Science)
        elif ('data' in career_lower and 'scientist' in career_lower) or 'data science' in career_lower:
            resources.extend([
                {
                    'title': 'DataCamp: Data Scientist with Python Career Track',
                    'description': 'A complete learning path covering Python, statistics, machine learning, and deep learning with hands-on projects.',
                    'url': 'https://www.datacamp.com/tracks/data-scientist-with-python',
                    'platform': 'DataCamp',
                    'duration': 'Self-paced',
                    'rating': '4.6',
                    'instructor': 'DataCamp',
                    'difficulty': 'Intermediate',
                    'tags': ['python', 'statistics', 'machine learning', 'data science']
                },
                {
                    'title': 'edX: Data Science MicroMasters (UC San Diego)',
                    'description': 'Advanced program focusing on mathematics, statistics, machine learning, and production-ready data science skills.',
                    'url': 'https://www.edx.org/micromasters/data-science',
                    'platform': 'edX',
                    'duration': '1-2 years',
                    'rating': '4.8',
                    'instructor': 'UC San Diego',
                    'difficulty': 'Advanced',
                    'tags': ['data science', 'statistics', 'machine learning', 'micromasters']
                }
            ])
        
        # AI Engineer (Artificial Intelligence)
        elif ('ai' in career_lower and 'engineer' in career_lower) or 'artificial intelligence' in career_lower:
            resources.extend([
                {
                    'title': 'DeepLearning.AI: AI For Everyone',
                    'description': 'A beginner-to-intermediate course introducing AI fundamentals, neural networks, and practical AI applications.',
                    'url': 'https://www.deeplearning.ai/courses/ai-for-everyone/',
                    'platform': 'DeepLearning.AI',
                    'duration': '4 weeks',
                    'rating': '4.8',
                    'instructor': 'DeepLearning.AI',
                    'difficulty': 'Beginner to Intermediate',
                    'tags': ['AI fundamentals', 'neural networks', 'practical applications']
                },
                {
                    'title': 'Coursera: Deep Learning Specialization (DeepLearning.AI)',
                    'description': 'Advanced specialization covering neural networks, deep learning frameworks, and production AI systems.',
                    'url': 'https://www.coursera.org/specializations/deep-learning',
                    'platform': 'Coursera',
                    'duration': '16 weeks',
                    'rating': '4.8',
                    'instructor': 'Andrew Ng',
                    'difficulty': 'Advanced',
                    'tags': ['deep learning', 'neural networks', 'production AI', 'frameworks']
                }
            ])

        # Machine Learning Engineer (Machine Learning)
        elif ('machine learning' in career_lower and 'engineer' in career_lower) or 'machine learning' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Machine Learning by Stanford Online',
                    'description': 'A foundational course on ML algorithms, model development, and deployment by Andrew Ng.',
                    'url': 'https://www.coursera.org/learn/machine-learning',
                    'platform': 'Coursera',
                    'duration': '11 weeks',
                    'rating': '4.9',
                    'instructor': 'Andrew Ng',
                    'difficulty': 'Intermediate',
                    'tags': ['machine learning', 'algorithms', 'model development', 'deployment']
                },
                {
                    'title': 'Udacity: Machine Learning Engineer Nanodegree',
                    'description': 'Focuses on advanced ML techniques, MLOps, and production-ready machine learning systems.',
                    'url': 'https://www.udacity.com/course/machine-learning-engineer-nanodegree--nd009t',
                    'platform': 'Udacity',
                    'duration': '4 months',
                    'rating': '4.7',
                    'instructor': 'Udacity',
                    'difficulty': 'Advanced',
                    'tags': ['MLOps', 'production systems', 'advanced techniques']
                }
            ])
        
        # Data Engineer (Data Engineering)
        elif 'data engineer' in career_lower:
            resources.extend([
                {
                    'title': 'DataCamp: Data Engineer with Python Track',
                    'description': 'Covers databases, ETL processes, and big data technologies like Spark for intermediate learners.',
                    'url': 'https://www.datacamp.com/tracks/data-engineer-with-python',
                    'platform': 'DataCamp',
                    'duration': 'Self-paced',
                    'rating': '4.6',
                    'instructor': 'DataCamp',
                    'difficulty': 'Intermediate',
                    'tags': ['databases', 'ETL', 'big data', 'Spark', 'Python']
                },
                {
                    'title': 'Udemy: The Complete Data Engineering Course',
                    'description': 'A practical course on data pipelines, databases, and big data tools for building robust data infrastructure.',
                    'url': 'https://www.udemy.com/course/data-engineering/',
                    'platform': 'Udemy',
                    'duration': 'Self-paced',
                    'rating': '4.5',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['data pipelines', 'databases', 'big data tools', 'infrastructure']
                }
            ])

        # DevOps Engineer (DevOps)
        elif 'devops' in career_lower and 'engineer' in career_lower:
            resources.extend([
                {
                    'title': 'Udemy: AWS Certified DevOps Engineer – Professional',
                    'description': 'Covers CI/CD pipelines, cloud-native development, and infrastructure automation using AWS tools.',
                    'url': 'https://www.udemy.com/course/aws-certified-devops-engineer-professional/',
                    'platform': 'Udemy',
                    'duration': 'Self-paced',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate to Advanced',
                    'tags': ['AWS', 'CI/CD', 'cloud-native', 'infrastructure automation']
                },
                {
                    'title': 'Pluralsight: DevOps Fundamentals',
                    'description': 'A learning path focusing on Linux, Docker, Kubernetes, and DevOps practices for intermediate learners.',
                    'url': 'https://www.pluralsight.com/paths/devops-fundamentals',
                    'platform': 'Pluralsight',
                    'duration': 'Self-paced',
                    'rating': '4.5',
                    'instructor': 'Pluralsight',
                    'difficulty': 'Intermediate',
                    'tags': ['Linux', 'Docker', 'Kubernetes', 'DevOps practices']
                }
            ])

        # Cybersecurity Engineer (Cybersecurity)
        elif 'cybersecurity' in career_lower and 'engineer' in career_lower:
            resources.extend([
                {
                    'title': 'Cybrary: Cybersecurity Fundamentals',
                    'description': 'Covers security fundamentals, network security, and incident response for intermediate to advanced learners.',
                    'url': 'https://www.cybrary.it/course/cybersecurity-fundamentals/',
                    'platform': 'Cybrary',
                    'duration': 'Self-paced',
                    'rating': '4.6',
                    'instructor': 'Cybrary',
                    'difficulty': 'Intermediate to Advanced',
                    'tags': ['security fundamentals', 'network security', 'incident response']
                },
                {
                    'title': 'Coursera: IBM Cybersecurity Analyst Professional Certificate',
                    'description': 'Focuses on ethical hacking, network security, and incident response with practical labs.',
                    'url': 'https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst',
                    'platform': 'Coursera',
                    'duration': '8 months',
                    'rating': '4.7',
                    'instructor': 'IBM',
                    'difficulty': 'Intermediate',
                    'tags': ['ethical hacking', 'network security', 'incident response', 'labs']
                }
            ])

        # Full Stack Developer (Web Development)
        elif ('full stack' in career_lower and 'developer' in career_lower) or 'web development' in career_lower:
            resources.extend([
                {
                    'title': 'The Odin Project: Full Stack JavaScript Path',
                    'description': 'A free, open-source curriculum covering frontend, backend, and database development with JavaScript.',
                    'url': 'https://www.theodinproject.com/paths/full-stack-javascript',
                    'platform': 'The Odin Project',
                    'duration': 'Self-paced',
                    'rating': '4.8',
                    'instructor': 'The Odin Project',
                    'difficulty': 'Intermediate',
                    'tags': ['JavaScript', 'frontend', 'backend', 'database', 'free']
                },
                {
                    'title': 'Coursera: Full-Stack Web Development with React Specialization (HKUST)',
                    'description': 'Intermediate course on frontend, backend, and deployment using React and Node.js.',
                    'url': 'https://www.coursera.org/specializations/full-stack-react',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.6',
                    'instructor': 'HKUST',
                    'difficulty': 'Intermediate',
                    'tags': ['React', 'Node.js', 'full-stack', 'deployment']
                }
            ])

        # Mobile Developer (Mobile Development)
        elif ('mobile' in career_lower and 'developer' in career_lower) or 'mobile development' in career_lower:
            resources.extend([
                {
                    'title': 'Udemy: The Complete React Native + Hooks Course',
                    'description': 'Covers cross-platform mobile development with React Native for iOS and Android.',
                    'url': 'https://www.udemy.com/course/the-complete-react-native-and-redux-course/',
                    'platform': 'Udemy',
                    'duration': 'Self-paced',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['React Native', 'cross-platform', 'iOS', 'Android', 'mobile']
                },
                {
                    'title': 'Coursera: Android App Development Specialization (Vanderbilt University)',
                    'description': 'Focuses on native Android development with Java and Kotlin for intermediate learners.',
                    'url': 'https://www.coursera.org/specializations/android-app-development',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.7',
                    'instructor': 'Vanderbilt University',
                    'difficulty': 'Intermediate',
                    'tags': ['Android', 'Java', 'Kotlin', 'native development']
                }
            ])

        # Cloud Architect (Cloud Computing)
        elif ('cloud' in career_lower and 'architect' in career_lower) or 'cloud computing' in career_lower:
            resources.extend([
                {
                    'title': 'AWS Skill Builder: AWS Certified Solutions Architect – Associate',
                    'description': 'Covers AWS cloud infrastructure design and cloud-native architecture.',
                    'url': 'https://aws.amazon.com/training/digital/aws-certified-solutions-architect-associate/',
                    'platform': 'AWS Skill Builder',
                    'duration': 'Self-paced',
                    'rating': '4.8',
                    'instructor': 'AWS',
                    'difficulty': 'Intermediate',
                    'tags': ['AWS', 'cloud infrastructure', 'architecture', 'certification']
                },
                {
                    'title': 'Pluralsight: Microsoft Azure Architect Design (AZ-304)',
                    'description': 'Advanced course on Azure-based cloud architecture and multi-cloud strategies.',
                    'url': 'https://www.pluralsight.com/paths/microsoft-azure-architect-design-az-304',
                    'platform': 'Pluralsight',
                    'duration': 'Self-paced',
                    'rating': '4.7',
                    'instructor': 'Pluralsight',
                    'difficulty': 'Advanced',
                    'tags': ['Azure', 'cloud architecture', 'multi-cloud', 'design']
                }
            ])

        # Blockchain Developer (Blockchain)
        elif ('blockchain' in career_lower and 'developer' in career_lower) or 'blockchain' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Blockchain Specialization (University at Buffalo)',
                    'description': 'Covers blockchain fundamentals, smart contracts, and Solidity for Web3 development.',
                    'url': 'https://www.coursera.org/specializations/blockchain',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.6',
                    'instructor': 'University at Buffalo',
                    'difficulty': 'Intermediate',
                    'tags': ['blockchain', 'smart contracts', 'Solidity', 'Web3']
                },
                {
                    'title': 'Dapp University: Blockchain Developer Bootcamp',
                    'description': 'A practical course on building decentralized applications with Ethereum and Solidity.',
                    'url': 'https://www.dappuniversity.com/bootcamp',
                    'platform': 'Dapp University',
                    'duration': 'Self-paced',
                    'rating': '4.7',
                    'instructor': 'Dapp University',
                    'difficulty': 'Intermediate',
                    'tags': ['Ethereum', 'Solidity', 'DApps', 'decentralized applications']
                }
            ])

        # Game Developer (Game Development)
        elif ('game' in career_lower and 'developer' in career_lower) or 'game development' in career_lower:
            resources.extend([
                {
                    'title': 'Udemy: Complete C# Unity Game Developer 2D',
                    'description': 'Covers game development with Unity, focusing on game design and graphics programming.',
                    'url': 'https://www.udemy.com/course/unitycourse/',
                    'platform': 'Udemy',
                    'duration': 'Self-paced',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['Unity', 'C#', 'game design', '2D games', 'graphics programming']
                },
                {
                    'title': 'Coursera: Game Design and Development with Unity (Michigan State University)',
                    'description': 'Intermediate course on game engines, graphics, and game design principles.',
                    'url': 'https://www.coursera.org/specializations/game-development',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.6',
                    'instructor': 'Michigan State University',
                    'difficulty': 'Intermediate',
                    'tags': ['game engines', 'graphics', 'game design', 'Unity']
                }
            ])

        # Embedded Systems Engineer (Embedded Systems)
        elif ('embedded' in career_lower and 'systems' in career_lower and 'engineer' in career_lower) or 'embedded systems' in career_lower:
            resources.extend([
                {
                    'title': 'edX: Embedded Systems Essentials with Arm',
                    'description': 'Covers embedded C, real-time systems, and hardware-software integration.',
                    'url': 'https://www.edx.org/course/embedded-systems-essentials-with-arm',
                    'platform': 'edX',
                    'duration': 'Self-paced',
                    'rating': '4.6',
                    'instructor': 'Arm',
                    'difficulty': 'Intermediate',
                    'tags': ['embedded C', 'real-time systems', 'hardware-software integration', 'Arm']
                },
                {
                    'title': 'Udemy: Mastering Microcontroller and Embedded Driver Development',
                    'description': 'Advanced course on embedded systems and IoT device development.',
                    'url': 'https://www.udemy.com/course/mastering-microcontroller-with-embedded-driver-development/',
                    'platform': 'Udemy',
                    'duration': 'Self-paced',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['microcontrollers', 'embedded systems', 'IoT', 'driver development']
                }
            ])

        # Computer Vision Engineer (Computer Vision)
        elif ('computer vision' in career_lower and 'engineer' in career_lower) or 'computer vision' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Computer Vision Basics (University at Buffalo)',
                    'description': 'Introduces image processing and computer vision algorithms for advanced learners.',
                    'url': 'https://www.coursera.org/learn/computer-vision-basics',
                    'platform': 'Coursera',
                    'duration': '4 weeks',
                    'rating': '4.6',
                    'instructor': 'University at Buffalo',
                    'difficulty': 'Advanced',
                    'tags': ['computer vision', 'image processing', 'algorithms']
                },
                {
                    'title': 'DeepLearning.AI: Computer Vision with Deep Learning',
                    'description': 'Focuses on deep learning for computer vision tasks like object detection and image segmentation.',
                    'url': 'https://www.deeplearning.ai/courses/computer-vision-with-deep-learning/',
                    'platform': 'DeepLearning.AI',
                    'duration': '8 weeks',
                    'rating': '4.8',
                    'instructor': 'DeepLearning.AI',
                    'difficulty': 'Advanced',
                    'tags': ['computer vision', 'deep learning', 'object detection', 'image segmentation']
                }
            ])

        # NLP Engineer (Natural Language Processing)
        elif ('nlp' in career_lower and 'engineer' in career_lower) or 'natural language processing' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Natural Language Processing Specialization (DeepLearning.AI)',
                    'description': 'Advanced specialization on NLP, text processing, and language model development.',
                    'url': 'https://www.coursera.org/specializations/natural-language-processing',
                    'platform': 'Coursera',
                    'duration': '16 weeks',
                    'rating': '4.8',
                    'instructor': 'DeepLearning.AI',
                    'difficulty': 'Advanced',
                    'tags': ['NLP', 'text processing', 'language models', 'deep learning']
                },
                {
                    'title': 'Fast.ai: Practical Deep Learning for NLP',
                    'description': 'A practical course on building NLP models with modern frameworks like Transformers.',
                    'url': 'https://course.fast.ai/',
                    'platform': 'Fast.ai',
                    'duration': '8 weeks',
                    'rating': '4.9',
                    'instructor': 'Jeremy Howard',
                    'difficulty': 'Intermediate',
                    'tags': ['NLP', 'deep learning', 'Transformers', 'practical']
                }
            ])

        # Robotics Engineer (Robotics)
        elif ('robotics' in career_lower and 'engineer' in career_lower) or 'robotics' in career_lower:
            resources.extend([
                {
                    'title': 'edX: Robotics MicroMasters (University of Pennsylvania)',
                    'description': 'Covers robotics fundamentals, control systems, and autonomous robot development.',
                    'url': 'https://www.edx.org/micromasters/upenn-robotics',
                    'platform': 'edX',
                    'duration': '1-2 years',
                    'rating': '4.7',
                    'instructor': 'University of Pennsylvania',
                    'difficulty': 'Advanced',
                    'tags': ['robotics', 'control systems', 'autonomous robots', 'micromasters']
                },
                {
                    'title': 'Udemy: Robotics and ROS – Learn Robot Operating System',
                    'description': 'Advanced course on ROS, control systems, and robotics programming.',
                    'url': 'https://www.udemy.com/course/robotics-and-ros-learn-robot-operating-system/',
                    'platform': 'Udemy',
                    'duration': 'Self-paced',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['ROS', 'control systems', 'robotics programming']
                }
            ])

        # Quantum Computing Engineer (Quantum Computing)
        elif ('quantum' in career_lower and 'computing' in career_lower and 'engineer' in career_lower) or 'quantum computing' in career_lower:
            resources.extend([
                {
                    'title': 'Qiskit: Learn Quantum Computation Using Qiskit',
                    'description': 'Free resource covering quantum mechanics, quantum algorithms, and Qiskit programming.',
                    'url': 'https://qiskit.org/learn/',
                    'platform': 'Qiskit',
                    'duration': 'Self-paced',
                    'rating': '4.7',
                    'instructor': 'IBM',
                    'difficulty': 'Intermediate',
                    'tags': ['quantum computing', 'Qiskit', 'quantum algorithms', 'free']
                },
                {
                    'title': 'edX: Quantum Computing Fundamentals (MIT)',
                    'description': 'Advanced course on quantum mechanics, linear algebra, and quantum software development.',
                    'url': 'https://www.edx.org/course/quantum-computing-fundamentals',
                    'platform': 'edX',
                    'duration': '12 weeks',
                    'rating': '4.8',
                    'instructor': 'MIT',
                    'difficulty': 'Advanced',
                    'tags': ['quantum mechanics', 'linear algebra', 'quantum software', 'MIT']
                }
            ])

        # Bioinformatics Engineer (Bioinformatics)
        elif ('bioinformatics' in career_lower and 'engineer' in career_lower) or 'bioinformatics' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Bioinformatics Specialization (UC San Diego)',
                    'description': 'Covers biological data analysis, computational biology, and bioinformatics tools.',
                    'url': 'https://www.coursera.org/specializations/bioinformatics',
                    'platform': 'Coursera',
                    'duration': '8 months',
                    'rating': '4.6',
                    'instructor': 'UC San Diego',
                    'difficulty': 'Advanced',
                    'tags': ['bioinformatics', 'biological data', 'computational biology', 'tools']
                },
                {
                    'title': 'edX: Introduction to Computational Biology and Bioinformatics',
                    'description': 'Focuses on programming and data analysis for biological applications.',
                    'url': 'https://www.edx.org/course/introduction-to-computational-biology-and-bioinformatics',
                    'platform': 'edX',
                    'duration': '8 weeks',
                    'rating': '4.5',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['computational biology', 'programming', 'data analysis', 'biology']
                }
            ])

        # Financial Technology Engineer (FinTech)
        elif ('financial technology' in career_lower and 'engineer' in career_lower) or 'fintech' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: FinTech Foundations and Overview (HKUST)',
                    'description': 'Covers financial systems, algorithmic trading, and fintech application development.',
                    'url': 'https://www.coursera.org/learn/fintech-foundations',
                    'platform': 'Coursera',
                    'duration': '4 weeks',
                    'rating': '4.6',
                    'instructor': 'HKUST',
                    'difficulty': 'Intermediate',
                    'tags': ['fintech', 'financial systems', 'algorithmic trading', 'applications']
                },
                {
                    'title': 'Udemy: Algorithmic Trading & Quantitative Analysis Using Python',
                    'description': 'Advanced course on building fintech applications and algorithmic trading systems.',
                    'url': 'https://www.udemy.com/course/algorithmic-trading-quantitative-analysis-using-python/',
                    'platform': 'Udemy',
                    'duration': 'Self-paced',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['algorithmic trading', 'quantitative analysis', 'Python', 'fintech']
                }
            ])

        # Space Systems Engineer (Aerospace)
        elif ('space' in career_lower and 'systems' in career_lower and 'engineer' in career_lower) or 'aerospace' in career_lower:
            resources.extend([
                {
                    'title': 'edX: Introduction to Aerospace Engineering (MIT)',
                    'description': 'Covers spacecraft design, orbital mechanics, and systems engineering.',
                    'url': 'https://www.edx.org/course/introduction-to-aerospace-engineering',
                    'platform': 'edX',
                    'duration': '16 weeks',
                    'rating': '4.8',
                    'instructor': 'MIT',
                    'difficulty': 'Advanced',
                    'tags': ['aerospace', 'spacecraft design', 'orbital mechanics', 'systems engineering']
                },
                {
                    'title': 'Coursera: Spacecraft Dynamics and Control Specialization (University of Colorado Boulder)',
                    'description': 'Advanced specialization on space mission planning and orbital mechanics.',
                    'url': 'https://www.coursera.org/specializations/spacecraft-dynamics-control',
                    'platform': 'Coursera',
                    'duration': '8 months',
                    'rating': '4.7',
                    'instructor': 'University of Colorado Boulder',
                    'difficulty': 'Advanced',
                    'tags': ['spacecraft dynamics', 'control systems', 'mission planning', 'orbital mechanics']
                }
            ])
        
        # ML Engineer
        elif 'ml engineer' in career_lower or 'machine learning engineer' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Machine Learning Engineering for Production',
                    'description': 'Learn to build, deploy, and maintain ML systems in production',
                    'url': 'https://www.coursera.org/specializations/machine-learning-engineering-production',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.8',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['ML engineering', 'production systems', 'deployment', 'maintenance']
                },
                {
                    'title': 'edX: MLOps Fundamentals',
                    'description': 'Learn machine learning operations and production ML workflows',
                    'url': 'https://www.edx.org/course/mlops-fundamentals',
                    'platform': 'edX',
                    'duration': '8 weeks',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['MLOps', 'production workflows', 'machine learning operations']
                }
            ])
        
        # Research Scientist
        elif 'research scientist' in career_lower or 'research' in career_lower:
            resources.extend([
                {
                    'title': 'MIT OpenCourseWare - Research Methods',
                    'description': 'Free courses on research methodology and scientific methods',
                    'url': 'https://ocw.mit.edu/courses/',
                    'platform': 'MIT OCW',
                    'duration': 'Self-paced',
                    'rating': '4.9',
                    'instructor': 'MIT Faculty',
                    'difficulty': 'Intermediate to Advanced',
                    'tags': ['research methods', 'scientific methods', 'academic research']
                },
                {
                    'title': 'Coursera: Research Design and Methods',
                    'description': 'Learn research design, data collection, and analysis methods',
                    'url': 'https://www.coursera.org/learn/research-methods',
                    'platform': 'Coursera',
                    'duration': '6 weeks',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['research design', 'data collection', 'analysis methods']
                }
            ])
        
        # Research Analyst
        elif 'research analyst' in career_lower or 'research analysis' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Data Analysis and Statistical Inference',
                    'description': 'Learn data analysis techniques and statistical inference methods',
                    'url': 'https://www.coursera.org/learn/data-analysis',
                    'platform': 'Coursera',
                    'duration': '8 weeks',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['data analysis', 'statistical inference', 'research methods']
                },
                {
                    'title': 'edX: Research Methods and Statistics',
                    'description': 'Learn research methodology and statistical analysis techniques',
                    'url': 'https://www.edx.org/course/research-methods-and-statistics',
                    'platform': 'edX',
                    'duration': '10 weeks',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['research methods', 'statistics', 'analysis techniques']
                }
            ])
        
        # Mathematician
        elif 'mathematician' in career_lower or 'mathematics' in career_lower:
            resources.extend([
                {
                    'title': 'MIT OpenCourseWare - Advanced Mathematics',
                    'description': 'Free advanced mathematics courses from MIT',
                    'url': 'https://ocw.mit.edu/courses/mathematics/',
                    'platform': 'MIT OCW',
                    'duration': 'Self-paced',
                    'rating': '4.9',
                    'instructor': 'MIT Faculty',
                    'difficulty': 'Advanced',
                    'tags': ['advanced mathematics', 'theoretical math', 'mathematical research']
                },
                {
                    'title': 'Coursera: Mathematics for Machine Learning',
                    'description': 'Learn the mathematical foundations needed for machine learning',
                    'url': 'https://www.coursera.org/specializations/mathematics-machine-learning',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['mathematics', 'machine learning', 'mathematical foundations']
                }
            ])
        
        # Cryptographer
        elif 'cryptographer' in career_lower or 'cryptography' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Cryptography Specialization',
                    'description': 'Learn cryptographic protocols, algorithms, and security principles',
                    'url': 'https://www.coursera.org/specializations/cryptography',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.8',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['cryptography', 'security protocols', 'algorithms', 'security principles']
                },
                {
                    'title': 'edX: Applied Cryptography',
                    'description': 'Learn practical cryptography applications and implementations',
                    'url': 'https://www.edx.org/course/applied-cryptography',
                    'platform': 'edX',
                    'duration': '10 weeks',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['applied cryptography', 'practical applications', 'implementations']
                }
            ])
        
        # System Architect
        elif 'system architect' in career_lower or 'systems architect' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Software Architecture Specialization',
                    'description': 'Learn software architecture principles, patterns, and design',
                    'url': 'https://www.coursera.org/specializations/software-architecture',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['software architecture', 'design patterns', 'system design']
                },
                {
                    'title': 'edX: System Design and Architecture',
                    'description': 'Learn to design scalable and maintainable software systems',
                    'url': 'https://www.edx.org/course/system-design-and-architecture',
                    'platform': 'edX',
                    'duration': '10 weeks',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['system design', 'architecture', 'scalability', 'maintainability']
                }
            ])
        
        # Team Lead
        elif 'team lead' in career_lower or 'team leadership' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Leadership and Management Specialization',
                    'description': 'Learn leadership skills, team management, and organizational behavior',
                    'url': 'https://www.coursera.org/specializations/leadership-management',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['leadership', 'team management', 'organizational behavior']
                },
                {
                    'title': 'edX: Leadership in Engineering',
                    'description': 'Learn to lead engineering teams and manage technical projects',
                    'url': 'https://www.edx.org/course/leadership-in-engineering',
                    'platform': 'edX',
                    'duration': '8 weeks',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['engineering leadership', 'team management', 'technical projects']
                }
            ])
        
        # Innovation Lead
        elif 'innovation lead' in career_lower or 'innovation' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Innovation Management Specialization',
                    'description': 'Learn innovation strategies, design thinking, and creative problem solving',
                    'url': 'https://www.coursera.org/specializations/innovation-management',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['innovation management', 'design thinking', 'creative problem solving']
                },
                {
                    'title': 'edX: Innovation and Entrepreneurship',
                    'description': 'Learn to develop innovative ideas and turn them into successful businesses',
                    'url': 'https://www.edx.org/course/innovation-and-entrepreneurship',
                    'platform': 'edX',
                    'duration': '10 weeks',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['innovation', 'entrepreneurship', 'business development']
                }
            ])
        
        # Operations Research
        elif 'operations research' in career_lower or 'operations' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Operations Management Specialization',
                    'description': 'Learn operations management, supply chain, and process optimization',
                    'url': 'https://www.coursera.org/specializations/operations-management',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['operations management', 'supply chain', 'process optimization']
                },
                {
                    'title': 'edX: Introduction to Operations Management',
                    'description': 'Learn the fundamentals of operations and supply chain management',
                    'url': 'https://www.edx.org/course/introduction-to-operations-management',
                    'platform': 'edX',
                    'duration': '8 weeks',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['operations', 'supply chain', 'management fundamentals']
                }
            ])
        
        # Quantitative Analyst
        elif 'quantitative analyst' in career_lower or 'quant' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Financial Engineering and Risk Management',
                    'description': 'Learn quantitative finance, risk management, and financial modeling',
                    'url': 'https://www.coursera.org/specializations/financial-engineering',
                    'platform': 'Coursera',
                    'duration': '8 months',
                    'rating': '4.8',
                    'instructor': 'Columbia University',
                    'difficulty': 'Advanced',
                    'tags': ['quantitative finance', 'risk management', 'financial modeling']
                },
                {
                    'title': 'edX: Quantitative Methods for Finance',
                    'description': 'Advanced course on mathematical and statistical methods in finance',
                    'url': 'https://www.edx.org/course/quantitative-methods-for-finance',
                    'platform': 'edX',
                    'duration': '12 weeks',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['quantitative methods', 'finance', 'mathematical methods', 'statistics']
                }
            ])
        
        # Product Manager
        elif 'product manager' in career_lower or 'product management' in career_lower:
            resources.extend([
                {
                    'title': 'Coursera: Product Management Specialization',
                    'description': 'Learn product management fundamentals, strategy, and execution',
                    'url': 'https://www.coursera.org/specializations/product-management',
                    'platform': 'Coursera',
                    'duration': '6 months',
                    'rating': '4.7',
                    'instructor': 'Various',
                    'difficulty': 'Intermediate',
                    'tags': ['product management', 'strategy', 'execution', 'fundamentals']
                },
                {
                    'title': 'edX: Product Management MicroMasters',
                    'description': 'Advanced program on product management and innovation',
                    'url': 'https://www.edx.org/micromasters/product-management',
                    'platform': 'edX',
                    'duration': '1 year',
                    'rating': '4.6',
                    'instructor': 'Various',
                    'difficulty': 'Advanced',
                    'tags': ['product management', 'innovation', 'micromasters', 'advanced']
                }
            ])
        
        # Mathematics resources
        elif 'math' in career_lower or 'mathematics' in career_lower:
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
        
        # General fallback for other careers - ALWAYS ensure at least 2 links
        if len(resources) < 2:
            # Add generic STEM resources to ensure minimum of 2 links
            generic_resources = [
                {
                    'title': 'Khan Academy - STEM Courses',
                    'description': 'Free comprehensive courses in science, technology, engineering, and mathematics.',
                    'url': 'https://www.khanacademy.org/',
                    'platform': 'Khan Academy',
                    'duration': 'Self-paced',
                    'rating': '4.8',
                    'instructor': 'Khan Academy',
                    'difficulty': 'All Levels',
                    'tags': ['STEM', 'free', 'comprehensive', 'all levels']
                },
                {
                    'title': 'MIT OpenCourseWare',
                    'description': 'Free access to MIT course materials across all STEM disciplines.',
                    'url': 'https://ocw.mit.edu/',
                    'platform': 'MIT OCW',
                    'duration': 'Self-paced',
                    'rating': '4.9',
                    'instructor': 'MIT Faculty',
                    'difficulty': 'Intermediate to Advanced',
                    'tags': ['MIT', 'free', 'university level', 'comprehensive']
                }
            ]
            
            # Add generic resources to fill up to 2 minimum
            for i, resource in enumerate(generic_resources):
                if len(resources) < 2:
                    resources.append(resource)
        
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
                        "criteria": [f"Watch/Read core materials for {topic}", f"Watch/Read core materials for {topic}", f"Complete 2-3 exercises on {topic}"]
                    })
                    if len(milestones) + len(derived) >= 12:  # a bit over 10 for buffer
                        break
                if len(milestones) + len(derived) >= 12:
                    break

            roadmap['milestones'] = milestones + derived
            return roadmap
        except Exception:
            return roadmap
    
    def _clean_roadmap_structure(self, roadmap: Dict[str, Any]) -> Dict[str, Any]:
        """Clean roadmap structure to prevent circular references and ensure proper format"""
        try:
            # Create a clean copy to avoid modifying the original
            clean_roadmap = {}
            
            # Copy basic fields
            for key in ['career', 'overview', 'estimated_duration', 'skill_domains']:
                if key in roadmap:
                    clean_roadmap[key] = roadmap[key]
            
            # Clean phases - ensure no circular references
            if 'phases' in roadmap:
                clean_phases = []
                for phase in roadmap['phases']:
                    clean_phase = {
                        'name': phase.get('name', ''),
                        'duration': phase.get('duration', ''),
                        'description': phase.get('description', ''),
                        'topics': phase.get('topics', [])[:10],  # Limit topics to prevent huge lists
                        'difficulty': phase.get('difficulty', 'beginner')
                    }
                    
                    # Add resources if they exist (limit to prevent circular references)
                    if 'resources' in phase and isinstance(phase['resources'], list):
                        clean_phase['resources'] = phase['resources'][:5]  # Limit resources per phase
                    
                    clean_phases.append(clean_phase)
                
                clean_roadmap['phases'] = clean_phases
            
            # Clean milestones
            if 'milestones' in roadmap:
                clean_milestones = []
                for milestone in roadmap['milestones'][:15]:  # Limit to 15 milestones
                    clean_milestone = {
                        'name': milestone.get('name', ''),
                        'description': milestone.get('description', ''),
                        'target_date': milestone.get('target_date', ''),
                        'criteria': milestone.get('criteria', [])[:5]  # Limit criteria
                    }
                    clean_milestones.append(clean_milestone)
                
                clean_roadmap['milestones'] = clean_milestones
            
            # Add overall resources (limit to prevent circular references)
            if 'resources' in roadmap and isinstance(roadmap['resources'], list):
                clean_roadmap['resources'] = roadmap['resources'][:20]  # Limit total resources
            
            return clean_roadmap
            
        except Exception as e:
            logger.error(f"Error cleaning roadmap structure: {e}")
            # Return a basic roadmap if cleaning fails
            return {
                'career': roadmap.get('career', 'Unknown Career'),
                'overview': 'Roadmap structure could not be processed',
                'phases': [],
                'milestones': []
            }
    
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