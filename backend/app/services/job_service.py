import os
import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

class JobService:
    def __init__(self):
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        self.linkedin_host = "linkedin-jobs-search.p.rapidapi.com"
        self.base_url = "https://linkedin-jobs-search.p.rapidapi.com"
        
        # Fallback job data for when API is not available
        self.fallback_jobs = {
            "Software Engineer": [
                {
                    "title": "Software Engineer",
                    "company": "Google",
                    "location": "Mountain View, CA",
                    "salary": "$150K - $200K",
                    "type": "Full-time",
                    "posted_date": "2024-01-15",
                    "description": "Build scalable software solutions...",
                    "requirements": ["Python", "JavaScript", "System Design"],
                    "url": "https://www.linkedin.com/jobs/view/123456"
                },
                {
                    "title": "Senior Software Engineer",
                    "company": "Microsoft",
                    "location": "Seattle, WA",
                    "salary": "$160K - $220K",
                    "type": "Full-time",
                    "posted_date": "2024-01-14",
                    "description": "Lead development of cloud services...",
                    "requirements": ["C#", "Azure", "Microservices"],
                    "url": "https://www.linkedin.com/jobs/view/123457"
                }
            ],
            "Data Scientist": [
                {
                    "title": "Data Scientist",
                    "company": "Netflix",
                    "location": "Los Gatos, CA",
                    "salary": "$140K - $190K",
                    "type": "Full-time",
                    "posted_date": "2024-01-13",
                    "description": "Analyze user behavior and content performance...",
                    "requirements": ["Python", "SQL", "Machine Learning"],
                    "url": "https://www.linkedin.com/jobs/view/123458"
                }
            ],
            "Product Manager": [
                {
                    "title": "Product Manager",
                    "company": "Apple",
                    "location": "Cupertino, CA",
                    "salary": "$130K - $180K",
                    "type": "Full-time",
                    "posted_date": "2024-01-12",
                    "description": "Define product strategy and roadmap...",
                    "requirements": ["Product Strategy", "User Research", "Data Analysis"],
                    "url": "https://www.linkedin.com/jobs/view/123459"
                }
            ]
        }

    async def search_jobs(self, career: str, location: str = None, limit: int = 10) -> Dict[str, Any]:
        """
        Search for jobs using LinkedIn API or fallback data
        """
        try:
            if not self.rapidapi_key:
                logger.warning("RapidAPI key not found, using fallback job data")
                return await self._get_fallback_jobs(career, limit)
            
            headers = {
                "X-RapidAPI-Key": self.rapidapi_key,
                "X-RapidAPI-Host": self.linkedin_host
            }
            
            params = {
                "search_terms": career,
                "location": location or "United States",
                "page": "1"
            }
            
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.base_url}/search",
                    headers=headers,
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return self._process_linkedin_response(data, career)
                else:
                    logger.error(f"LinkedIn API error: {response.status_code}")
                    return await self._get_fallback_jobs(career, limit)
                    
        except Exception as e:
            logger.error(f"Error searching jobs: {e}")
            return await self._get_fallback_jobs(career, limit)

    def _process_linkedin_response(self, data: Dict[str, Any], career: str) -> Dict[str, Any]:
        """
        Process LinkedIn API response
        """
        try:
            jobs = data.get("data", [])
            processed_jobs = []
            
            for job in jobs[:10]:  # Limit to 10 jobs
                processed_job = {
                    "title": job.get("title", ""),
                    "company": job.get("company", ""),
                    "location": job.get("location", ""),
                    "salary": job.get("salary", "Not specified"),
                    "type": job.get("employment_type", "Full-time"),
                    "posted_date": job.get("posted_date", ""),
                    "description": job.get("description", "")[:200] + "...",
                    "requirements": self._extract_requirements(job.get("description", "")),
                    "url": job.get("job_url", ""),
                    "source": "LinkedIn"
                }
                processed_jobs.append(processed_job)
            
            return {
                "career": career,
                "jobs": processed_jobs,
                "total_found": len(processed_jobs),
                "source": "LinkedIn API",
                "searched_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing LinkedIn response: {e}")
            return {"error": str(e)}

    def _extract_requirements(self, description: str) -> List[str]:
        """
        Extract requirements from job description
        """
        # Simple keyword extraction - in production, use NLP
        keywords = [
            "Python", "JavaScript", "Java", "C++", "React", "Angular", "Vue",
            "Node.js", "Django", "Flask", "AWS", "Azure", "Docker", "Kubernetes",
            "SQL", "MongoDB", "PostgreSQL", "Machine Learning", "Data Science",
            "Product Management", "Agile", "Scrum", "User Research", "Analytics"
        ]
        
        found_requirements = []
        description_lower = description.lower()
        
        for keyword in keywords:
            if keyword.lower() in description_lower:
                found_requirements.append(keyword)
        
        return found_requirements[:5]  # Return top 5 requirements

    async def _get_fallback_jobs(self, career: str, limit: int) -> Dict[str, Any]:
        """
        Get fallback job data when API is not available
        """
        try:
            # Find the best matching career in fallback data
            matching_career = None
            for key in self.fallback_jobs.keys():
                if career.lower() in key.lower() or key.lower() in career.lower():
                    matching_career = key
                    break
            
            if not matching_career:
                # Default to Software Engineer if no match
                matching_career = "Software Engineer"
            
            jobs = self.fallback_jobs.get(matching_career, [])
            
            return {
                "career": career,
                "jobs": jobs[:limit],
                "total_found": len(jobs),
                "source": "Fallback Data",
                "searched_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting fallback jobs: {e}")
            return {"error": str(e)}

    async def get_job_trends(self, career: str) -> Dict[str, Any]:
        """
        Get job market trends for a career
        """
        try:
            # Mock trend data - in production, this would analyze historical data
            trends = {
                "Software Engineer": {
                    "growth_rate": "22%",
                    "demand_level": "High",
                    "salary_trend": "Increasing",
                    "remote_work": "80%",
                    "top_skills": ["Python", "JavaScript", "Cloud Computing"],
                    "top_companies": ["Google", "Microsoft", "Amazon", "Meta", "Apple"]
                },
                "Data Scientist": {
                    "growth_rate": "36%",
                    "demand_level": "Very High",
                    "salary_trend": "Increasing",
                    "remote_work": "70%",
                    "top_skills": ["Python", "SQL", "Machine Learning", "Statistics"],
                    "top_companies": ["Netflix", "Uber", "Airbnb", "Spotify", "LinkedIn"]
                },
                "Product Manager": {
                    "growth_rate": "10%",
                    "demand_level": "High",
                    "salary_trend": "Stable",
                    "remote_work": "60%",
                    "top_skills": ["Product Strategy", "User Research", "Data Analysis"],
                    "top_companies": ["Apple", "Google", "Microsoft", "Amazon", "Meta"]
                }
            }
            
            # Find matching career
            matching_career = None
            for key in trends.keys():
                if career.lower() in key.lower() or key.lower() in career.lower():
                    matching_career = key
                    break
            
            if not matching_career:
                matching_career = "Software Engineer"  # Default
            
            trend_data = trends.get(matching_career, {})
            
            return {
                "career": career,
                "trends": trend_data,
                "analyzed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting job trends: {e}")
            return {"error": str(e)}

    async def get_salary_data(self, career: str, location: str = "United States") -> Dict[str, Any]:
        """
        Get salary data for a career
        """
        try:
            # Mock salary data - in production, this would come from salary APIs
            salary_data = {
                "Software Engineer": {
                    "entry_level": "$80,000 - $120,000",
                    "mid_level": "$120,000 - $180,000",
                    "senior_level": "$180,000 - $250,000",
                    "average": "$110,140",
                    "top_10_percent": "$200,000+"
                },
                "Data Scientist": {
                    "entry_level": "$70,000 - $110,000",
                    "mid_level": "$110,000 - $160,000",
                    "senior_level": "$160,000 - $220,000",
                    "average": "$100,910",
                    "top_10_percent": "$180,000+"
                },
                "Product Manager": {
                    "entry_level": "$80,000 - $120,000",
                    "mid_level": "$120,000 - $180,000",
                    "senior_level": "$180,000 - $250,000",
                    "average": "$115,000",
                    "top_10_percent": "$200,000+"
                }
            }
            
            # Find matching career
            matching_career = None
            for key in salary_data.keys():
                if career.lower() in key.lower() or key.lower() in career.lower():
                    matching_career = key
                    break
            
            if not matching_career:
                matching_career = "Software Engineer"  # Default
            
            career_salary = salary_data.get(matching_career, {})
            
            return {
                "career": career,
                "location": location,
                "salary_data": career_salary,
                "analyzed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting salary data: {e}")
            return {"error": str(e)}

    async def get_company_insights(self, company: str) -> Dict[str, Any]:
        """
        Get insights about a specific company
        """
        try:
            # Mock company data - in production, this would come from company APIs
            company_data = {
                "Google": {
                    "industry": "Technology",
                    "size": "100,000+ employees",
                    "founded": "1998",
                    "headquarters": "Mountain View, CA",
                    "culture": "Innovative, collaborative, data-driven",
                    "benefits": ["Great healthcare", "Free meals", "Generous PTO"],
                    "interview_process": "Technical + behavioral rounds",
                    "remote_policy": "Hybrid"
                },
                "Microsoft": {
                    "industry": "Technology",
                    "size": "200,000+ employees",
                    "founded": "1975",
                    "headquarters": "Redmond, WA",
                    "culture": "Collaborative, growth-focused, inclusive",
                    "benefits": ["Comprehensive benefits", "Professional development", "Work-life balance"],
                    "interview_process": "Technical + system design",
                    "remote_policy": "Flexible"
                }
            }
            
            company_info = company_data.get(company, {})
            
            return {
                "company": company,
                "insights": company_info,
                "analyzed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting company insights: {e}")
            return {"error": str(e)}

    async def search_jobs_by_skills(self, skills: List[str], location: str = None) -> Dict[str, Any]:
        """
        Search for jobs based on specific skills
        """
        try:
            # Combine skills into search terms
            search_terms = " ".join(skills)
            
            # Search for jobs using the combined skills
            return await self.search_jobs(search_terms, location)
            
        except Exception as e:
            logger.error(f"Error searching jobs by skills: {e}")
            return {"error": str(e)}

    async def get_job_alerts(self, career: str, location: str = None) -> Dict[str, Any]:
        """
        Set up job alerts for a career
        """
        try:
            # Mock job alert setup - in production, this would integrate with job alert services
            alert_id = f"alert_{datetime.now().timestamp()}"
            
            return {
                "alert_id": alert_id,
                "career": career,
                "location": location or "United States",
                "status": "Active",
                "frequency": "Daily",
                "created_at": datetime.now().isoformat(),
                "message": f"Job alerts set up for {career} positions in {location or 'United States'}"
            }
            
        except Exception as e:
            logger.error(f"Error setting up job alerts: {e}")
            return {"error": str(e)} 