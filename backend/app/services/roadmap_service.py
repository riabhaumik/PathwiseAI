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
        if not settings.openai_api_key or settings.openai_api_key == "your_openai_api_key":
            raise ValueError("OpenAI API key not configured")
        
        self.openai_client = OpenAI(api_key=settings.openai_api_key)
        self.openai_model = settings.openai_model
        
        # API keys for external services
        self.youtube_api_key = settings.youtube_api_key
        self.coursera_api_key = settings.coursera_api_key
        self.khan_api_key = settings.khan_academy_api_key
        self.edx_api_key = settings.edx_api_key
        
        # Cache for API responses to avoid rate limiting
        self._cache = {}
        self._cache_ttl = 3600  # 1 hour
    
    def load_careers_data(self) -> Dict[str, Any]:
        """Load careers data from JSON file"""
        try:
            with open("../data/careers_massive.json", "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading careers data: {e}")
            return {}
    
    def load_resources_data(self) -> Dict[str, Any]:
        """Load resources data from JSON file"""
        try:
            with open("../data/resources_massive.json", "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading resources data: {e}")
            return {}
    
    async def get_career_skills(self, career_name: str) -> Dict[str, Any]:
        """Get required skills for a specific career"""
        try:
            careers_data = self.load_careers_data()
            
            # Search for career in the data
            for career in careers_data.get("careers", []):
                if career.get("name", "").lower() == career_name.lower():
                    return {
                        "career": career_name,
                        "skills": career.get("skills", []),
                        "degree_required": career.get("degree_required", "Not specified"),
                        "description": career.get("description", ""),
                        "growth_rate": career.get("growth_rate", ""),
                        "avg_salary": career.get("avg_salary", "")
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
        """Generate a basic roadmap when AI generation fails"""
        skills = career_data.get('skills', [])
        
        # Determine duration based on user level
        duration_map = {
            "beginner": "2-3 years",
            "intermediate": "1-2 years", 
            "advanced": "6-12 months"
        }
        
        # Create basic phases
        phases = [
            {
                "name": "Foundation",
                "duration": "3-6 months",
                "description": "Build fundamental knowledge and skills",
                "topics": skills[:5] if len(skills) >= 5 else skills,
                "difficulty": "beginner"
            },
            {
                "name": "Intermediate",
                "duration": "6-12 months", 
                "description": "Develop intermediate skills and practical experience",
                "topics": skills[5:10] if len(skills) >= 10 else skills[5:] if len(skills) > 5 else [],
                "difficulty": "intermediate"
            },
            {
                "name": "Advanced",
                "duration": "6-12 months",
                "description": "Master advanced concepts and specialization",
                "topics": skills[10:] if len(skills) > 10 else [],
                "difficulty": "advanced"
            }
        ]
        
        # Filter out empty phases
        phases = [phase for phase in phases if phase["topics"]]
        
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
    
    def enhance_roadmap_with_resources(self, roadmap: Dict[str, Any], career_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance roadmap with learning resources from multiple platforms"""
        try:
            # Get skills for resource search
            skills = career_data.get('skills', [])
            career_name = roadmap.get('career', '')
            
            # Search for resources on multiple platforms
            all_resources = []
            
            # Search for general career resources
            if career_name:
                # YouTube resources
                youtube_resources = asyncio.run(self.get_youtube_resources(career_name, 3))
                all_resources.extend(youtube_resources)
                
                # Coursera resources
                coursera_resources = asyncio.run(self.get_coursera_resources(career_name, 3))
                all_resources.extend(coursera_resources)
                
                # Khan Academy resources
                khan_resources = asyncio.run(self.get_khan_academy_resources(career_name, 3))
                all_resources.extend(khan_resources)
                
                # edX resources
                edx_resources = asyncio.run(self.get_edx_resources(career_name, 3))
                all_resources.extend(edx_resources)
            
            # Search for skill-specific resources
            for skill in skills[:5]:  # Limit to first 5 skills to avoid API rate limits
                try:
                    # YouTube resources for specific skills
                    skill_youtube = asyncio.run(self.get_youtube_resources(skill, 2))
                    all_resources.extend(skill_youtube)
                    
                    # Coursera resources for specific skills
                    skill_coursera = asyncio.run(self.get_coursera_resources(skill, 2))
                    all_resources.extend(skill_coursera)
                except Exception as e:
                    logger.warning(f"Failed to fetch resources for skill {skill}: {e}")
                    continue
            
            # Remove duplicates and limit total resources
            unique_resources = []
            seen_urls = set()
            for resource in all_resources:
                if resource['url'] not in seen_urls and len(unique_resources) < 20:
                    unique_resources.append(resource)
                    seen_urls.add(resource['url'])
            
            # Add resources to roadmap phases
            if unique_resources:
                roadmap['resources'] = unique_resources
                
                # Distribute resources across phases
                for i, phase in enumerate(roadmap.get('phases', [])):
                    phase_resources = unique_resources[i*4:(i+1)*4]  # 4 resources per phase
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
            
            # Find career in database
            for career in careers_data.get("careers", []):
                if career.get("name", "").lower() == career_name.lower():
                    career_data = career
                    break
            
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
            roadmap = self.enhance_roadmap_with_resources(roadmap, career_data)
            
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