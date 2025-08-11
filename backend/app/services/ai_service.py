import os
import json
import logging
import uuid
from typing import List, Dict, Any, Optional
from openai import OpenAI
from datetime import datetime
from app.core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        if not settings.openai_api_key or settings.openai_api_key == "your_openai_api_key":
            raise ValueError("OpenAI API key not configured")
        
        self.client = OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
        self.max_tokens = settings.openai_max_tokens
        self.temperature = settings.openai_temperature
        
        # Enhanced function definitions for AI function calling
        self.functions = [
            {
                "name": "get_career_recommendations",
                "description": "Get personalized career recommendations based on user skills and interests",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "user_skills": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of user's current skills"
                        },
                        "interests": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of user's interests"
                        },
                        "experience_level": {
                            "type": "string",
                            "enum": ["beginner", "intermediate", "advanced"],
                            "description": "User's experience level"
                        },
                        "preferred_industries": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Preferred industries or sectors"
                        }
                    },
                    "required": ["user_skills"]
                }
            },
            {
                "name": "generate_learning_path",
                "description": "Generate a personalized learning path for a specific career",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "career_name": {
                            "type": "string",
                            "description": "Name of the target career"
                        },
                        "current_skills": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "User's current skills"
                        },
                        "timeframe": {
                            "type": "string",
                            "enum": ["3_months", "6_months", "1_year", "2_years"],
                            "description": "Desired timeframe for learning"
                        },
                        "learning_style": {
                            "type": "string",
                            "enum": ["visual", "hands_on", "theoretical", "mixed"],
                            "description": "Preferred learning style"
                        },
                        "budget_constraints": {
                            "type": "string",
                            "enum": ["free", "low_cost", "moderate", "flexible"],
                            "description": "Budget constraints for learning resources"
                        }
                    },
                    "required": ["career_name", "current_skills"]
                }
            },
            {
                "name": "analyze_skill_gaps",
                "description": "Analyze skill gaps for a specific career path",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "career_name": {
                            "type": "string",
                            "description": "Target career name"
                        },
                        "user_skills": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "User's current skills"
                        },
                        "priority_level": {
                            "type": "string",
                            "enum": ["critical", "important", "nice_to_have"],
                            "description": "Priority level for skill development"
                        }
                    },
                    "required": ["career_name", "user_skills"]
                }
            },
            {
                "name": "get_interview_prep",
                "description": "Get interview preparation resources and tips",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "career_name": {
                            "type": "string",
                            "description": "Target career for interview preparation"
                        },
                        "interview_type": {
                            "type": "string",
                            "enum": ["technical", "behavioral", "case_study", "general"],
                            "description": "Type of interview"
                        },
                        "experience_level": {
                            "type": "string",
                            "enum": ["entry", "mid", "senior"],
                            "description": "Experience level for the position"
                        },
                        "company_type": {
                            "type": "string",
                            "enum": ["startup", "corporate", "government", "nonprofit"],
                            "description": "Type of company"
                        }
                    },
                    "required": ["career_name"]
                }
            },
            {
                "name": "get_skill_development_plan",
                "description": "Create a personalized skill development plan",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "target_skills": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Skills the user wants to develop"
                        },
                        "current_level": {
                            "type": "string",
                            "enum": ["beginner", "intermediate", "advanced"],
                            "description": "Current skill level"
                        },
                        "preferred_methods": {
                            "type": "array",
                            "items": {"type": "string"},
                            "enum": ["online_courses", "books", "projects", "mentorship", "workshops", "certifications"],
                            "description": "Preferred learning methods"
                        },
                        "time_availability": {
                            "type": "string",
                            "enum": ["minimal", "moderate", "extensive"],
                            "description": "Time available for learning per week"
                        }
                    },
                    "required": ["target_skills"]
                }
            },
            {
                "name": "explore_career_path",
                "description": "Explore a specific career path with detailed information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "career_name": {
                            "type": "string",
                            "description": "Name of the career to explore"
                        },
                        "exploration_depth": {
                            "type": "string",
                            "enum": ["overview", "detailed", "comprehensive"],
                            "description": "Depth of exploration"
                        },
                        "focus_areas": {
                            "type": "array",
                            "items": {"type": "string"},
                            "enum": ["salary", "skills", "education", "growth", "work_life", "challenges"],
                            "description": "Specific areas to focus on"
                        }
                    },
                    "required": ["career_name"]
                }
            }
        ]
        
        # Enhanced conversation memory for context-aware responses
        self._conversation_memory = {}
        self._max_memory_length = 15
        self._user_preferences = {}
    
    async def chat_with_ai(
        self, 
        message: str, 
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Main method for AI chat with enhanced function calling support"""
        try:
            # Generate conversation ID if not provided
            conversation_id = str(uuid.uuid4())
            
            # Get conversation history
            conversation_history = self._get_conversation_history(user_id) if user_id else []
            
            # Update user preferences from context
            if context and user_id:
                self._update_user_preferences(user_id, context)
            
            # Prepare messages for OpenAI
            messages = self._prepare_messages(message, context, conversation_history, user_id)
            
            # Call OpenAI API with function calling
            response = await self._call_openai_api_with_functions(messages)
            
            # Process function calls if any
            if response.get("function_calls"):
                function_results = await self._process_function_calls(response["function_calls"], context, user_id)
                # Generate final response with function results
                final_response = await self._generate_final_response(message, function_results, context, user_id)
            else:
                final_response = response.get("response", "I'm sorry, I couldn't process your request.")
            
            # Update conversation memory
            if user_id:
                self._update_conversation_memory(user_id, message, final_response, context)
            
            # Generate enhanced suggestions for next steps
            suggestions = self._generate_enhanced_suggestions(message, context, user_id, conversation_history)
            
            # Generate follow-up questions
            follow_up_questions = self._generate_follow_up_questions(message, context, user_id)
            
            return {
                "response": final_response,
                "suggestions": suggestions,
                "follow_up_questions": follow_up_questions,
                "conversation_id": conversation_id,
                "function_calls": response.get("function_calls", []),
                "context": context,
                "user_preferences": self._get_user_preferences(user_id) if user_id else {}
            }
            
        except Exception as e:
            logger.error(f"Error in chat_with_ai: {e}")
            return {
                "response": self._get_fallback_response(message),
                "suggestions": ["Try rephrasing your question", "Ask about career guidance", "Get learning recommendations"],
                "follow_up_questions": [],
                "conversation_id": str(uuid.uuid4()),
                "error": str(e)
            }
    
    def _get_fallback_response(self, message: str) -> str:
        """Generate a fallback response when AI fails"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['career', 'job', 'profession']):
            return "I'd be happy to help you explore STEM careers! Could you tell me more about your interests and skills?"
        elif any(word in message_lower for word in ['learn', 'study', 'course', 'skill']):
            return "Learning new skills is exciting! What specific area would you like to focus on?"
        elif any(word in message_lower for word in ['interview', 'apply', 'resume']):
            return "Interview preparation is crucial! What type of position are you preparing for?"
        else:
            return "I'm here to help with your STEM career journey! What would you like to know more about?"
    
    def _prepare_messages(self, message: str, context: Optional[Dict[str, Any]], history: List[Dict[str, Any]], user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Prepare messages for OpenAI API call with enhanced context"""
        messages = [self._get_enhanced_system_message(context, user_id)]
        
        # Add conversation history with more context
        for hist_msg in history[-8:]:  # Last 8 messages for better context
            messages.append({
                "role": "user" if hist_msg["type"] == "user" else "assistant",
                "content": hist_msg["content"]
            })
        
        # Add current message
        messages.append({
            "role": "user",
            "content": message
        })
        
        return messages
    
    def _get_enhanced_system_message(self, context: Optional[Dict[str, Any]] = None, user_id: Optional[str] = None) -> str:
        """Generate enhanced system message for OpenAI"""
        base_message = """You are Pathwise AI, a knowledgeable and friendly career guidance assistant specializing in STEM careers. 

Your role is to:
1. Help users explore career paths in science, technology, engineering, and mathematics
2. Provide personalized learning recommendations and skill development advice
3. Analyze skill gaps and suggest improvement strategies
4. Offer interview preparation guidance
5. Create customized learning paths
6. Understand user preferences and adapt responses accordingly

Always be:
- Encouraging and supportive
- Specific and actionable in your advice
- Professional yet approachable
- Focused on practical, achievable steps
- Context-aware and personalized

Current context: You're helping a user with career guidance and learning path development."""
        
        if context:
            if context.get('career_path'):
                base_message += f"\n\nUser is interested in: {context['career_path']}"
            if context.get('user_skills'):
                base_message += f"\nUser's current skills: {', '.join(context['user_skills'])}"
            if context.get('experience_level'):
                base_message += f"\nUser's experience level: {context['experience_level']}"
            if context.get('learning_goals'):
                base_message += f"\nUser's learning goals: {context['learning_goals']}"
        
        # Add user preferences if available
        if user_id and user_id in self._user_preferences:
            prefs = self._user_preferences[user_id]
            if prefs.get('preferred_learning_style'):
                base_message += f"\nUser prefers {prefs['preferred_learning_style']} learning style"
            if prefs.get('career_interests'):
                base_message += f"\nUser has shown interest in: {', '.join(prefs['career_interests'])}"
        
        return base_message
    
    async def _call_openai_api_with_functions(self, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Call OpenAI API with function calling support"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                functions=self.functions,
                function_call="auto",
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            message = response.choices[0].message
            
            # Check if function was called
            if message.function_call:
                return {
                    "function_calls": [{
                        "name": message.function_call.name,
                        "arguments": json.loads(message.function_call.arguments)
                    }]
                }
            else:
                return {
                    "response": message.content
                }
                
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            raise
    
    async def _process_function_calls(self, function_calls: List[Dict[str, Any]], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Process function calls and return results"""
        results = []
        
        for function_call in function_calls:
            try:
                function_name = function_call["name"]
                arguments = function_call["arguments"]
                
                result = await self._execute_function(function_name, arguments, context, user_id)
                results.append({
                    "function_name": function_name,
                    "arguments": arguments,
                    "result": result
                })
                
            except Exception as e:
                logger.error(f"Error executing function {function_call.get('name')}: {e}")
                results.append({
                    "function_name": function_call.get("name"),
                    "arguments": function_call.get("arguments"),
                    "error": str(e)
                })
        
        return results
    
    async def _generate_final_response(self, original_message: str, function_results: List[Dict[str, Any]], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> str:
        """Generate final response incorporating function results"""
        try:
            # Prepare context for final response
            context_summary = ""
            if function_results:
                context_summary = "Based on my analysis:\n\n"
                for result in function_results:
                    if "error" not in result:
                        context_summary += f"• {result['function_name'].replace('_', ' ').title()}: "
                        if isinstance(result['result'], dict):
                            context_summary += f"{result['result'].get('summary', 'Analysis complete')}\n"
                        else:
                            context_summary += f"{str(result['result'])[:100]}...\n"
                    else:
                        context_summary += f"• {result['function_name'].replace('_', ' ').title()}: Unable to complete analysis\n"
            
            # Generate final response using OpenAI
            messages = [
                self._get_enhanced_system_message(context, user_id),
                {
                    "role": "user",
                    "content": f"""Original question: {original_message}

{context_summary}

Please provide a comprehensive, helpful response based on this analysis. Be conversational and actionable."""
                }
            ]
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating final response: {e}")
            return "I've analyzed your request and can provide some insights. Please let me know if you need more specific information."
    
    def _generate_enhanced_suggestions(self, message: str, context: Optional[Dict[str, Any]], user_id: Optional[str] = None, history: List[Dict[str, Any]] = None) -> List[str]:
        """Generate enhanced contextual suggestions based on conversation history"""
        message_lower = message.lower()
        
        # Base suggestions based on message content
        if any(word in message_lower for word in ['career', 'job', 'profession']):
            base_suggestions = [
                "Explore specific career paths",
                "Get skill gap analysis",
                "Find learning resources",
                "Learn about job market trends"
            ]
        elif any(word in message_lower for word in ['learn', 'study', 'course', 'skill']):
            base_suggestions = [
                "Get personalized learning path",
                "Find online courses",
                "Discover practice projects",
                "Get skill development tips"
            ]
        elif any(word in message_lower for word in ['interview', 'apply', 'resume']):
            base_suggestions = [
                "Get interview preparation tips",
                "Learn about common questions",
                "Practice technical skills",
                "Build your portfolio"
            ]
        else:
            base_suggestions = [
                "Explore STEM careers",
                "Get career recommendations",
                "Analyze your skills",
                "Find learning resources"
            ]
        
        # Add personalized suggestions based on user preferences
        if user_id and user_id in self._user_preferences:
            prefs = self._user_preferences[user_id]
            if prefs.get('career_interests'):
                base_suggestions.append(f"Learn more about {prefs['career_interests'][0]}")
            if prefs.get('preferred_learning_style'):
                base_suggestions.append(f"Find {prefs['preferred_learning_style']} learning resources")
        
        # Add contextual suggestions based on conversation history
        if history and len(history) > 2:
            recent_topics = [msg["content"].lower() for msg in history[-4:] if msg["type"] == "user"]
            if any('python' in topic for topic in recent_topics):
                base_suggestions.append("Explore Python-based careers")
            if any('data' in topic for topic in recent_topics):
                base_suggestions.append("Learn about data science careers")
        
        return base_suggestions[:6]  # Limit to 6 suggestions
    
    def _generate_follow_up_questions(self, message: str, context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> List[str]:
        """Generate follow-up questions to keep conversation engaging"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['career', 'job']):
            return [
                "What specific skills would you like to develop?",
                "Are you interested in any particular industry?",
                "What's your timeline for making a career change?"
            ]
        elif any(word in message_lower for word in ['learn', 'study']):
            return [
                "How much time can you dedicate to learning?",
                "Do you prefer online courses or in-person learning?",
                "What's your preferred learning pace?"
            ]
        elif any(word in message_lower for word in ['interview', 'apply']):
            return [
                "What type of company are you targeting?",
                "Do you have any specific concerns about interviews?",
                "What's your current experience level?"
            ]
        
        return [
            "What interests you most about STEM?",
            "What are your current strengths?",
            "Where do you see yourself in 5 years?"
        ]
    
    def _update_user_preferences(self, user_id: str, context: Dict[str, Any]):
        """Update user preferences based on conversation context"""
        if user_id not in self._user_preferences:
            self._user_preferences[user_id] = {}
        
        prefs = self._user_preferences[user_id]
        
        if context.get('career_path'):
            if 'career_interests' not in prefs:
                prefs['career_interests'] = []
            if context['career_path'] not in prefs['career_interests']:
                prefs['career_interests'].append(context['career_path'])
        
        if context.get('user_skills'):
            prefs['current_skills'] = context['user_skills']
        
        if context.get('experience_level'):
            prefs['experience_level'] = context['experience_level']
        
        if context.get('learning_style'):
            prefs['preferred_learning_style'] = context['learning_style']
    
    def _get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences for personalization"""
        return self._user_preferences.get(user_id, {})
    
    def _get_conversation_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get conversation history for a user"""
        return self._conversation_memory.get(user_id, [])
    
    def _update_conversation_memory(self, user_id: str, user_message: str, ai_response: str, context: Optional[Dict[str, Any]] = None):
        """Update conversation memory with enhanced context"""
        if user_id not in self._conversation_memory:
            self._conversation_memory[user_id] = []
        
        # Add new messages with context
        self._conversation_memory[user_id].extend([
            {
                "type": "user", 
                "content": user_message, 
                "timestamp": datetime.now(),
                "context": context
            },
            {
                "type": "assistant", 
                "content": ai_response, 
                "timestamp": datetime.now(),
                "context": context
            }
        ])
        
        # Keep only recent messages
        if len(self._conversation_memory[user_id]) > self._max_memory_length:
            self._conversation_memory[user_id] = self._conversation_memory[user_id][-self._max_memory_length:]
    
    async def _execute_function(self, function_name: str, args: Dict[str, Any], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Execute a specific function based on name"""
        try:
            if function_name == "get_career_recommendations":
                return await self._get_career_recommendations(args, context, user_id)
            elif function_name == "generate_learning_path":
                return await self._generate_learning_path(args, context, user_id)
            elif function_name == "analyze_skill_gaps":
                return await self._analyze_skill_gaps(args, context, user_id)
            elif function_name == "get_interview_prep":
                return await self._get_interview_prep(args, context, user_id)
            elif function_name == "get_skill_development_plan":
                return await self._get_skill_development_plan(args, context, user_id)
            elif function_name == "explore_career_path":
                return await self._explore_career_path(args, context, user_id)
            else:
                return {"error": f"Unknown function: {function_name}"}
        except Exception as e:
            logger.error(f"Error executing function {function_name}: {e}")
            return {"error": str(e)}
    
    async def _get_career_recommendations(self, args: Dict[str, Any], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get personalized career recommendations"""
        try:
            user_skills = args.get("user_skills", [])
            interests = args.get("interests", [])
            experience_level = args.get("experience_level", "beginner")
            preferred_industries = args.get("preferred_industries", [])
            
            # Generate career recommendations using AI
            prompt = f"""Based on these skills: {', '.join(user_skills)}
            And interests: {', '.join(interests) if interests else 'Not specified'}
            Experience level: {experience_level}
            Preferred industries: {', '.join(preferred_industries) if preferred_industries else 'Not specified'}
            
            Recommend 5 STEM careers that would be a great fit. For each career, provide:
            1. Why it's a good match
            2. Required skills
            3. Growth potential
            4. Entry requirements
            
            Format as a structured analysis."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "summary": f"Generated {len(user_skills)} career recommendations based on your skills",
                "careers": analysis,
                "skills_analyzed": user_skills,
                "experience_level": experience_level,
                "preferred_industries": preferred_industries
            }
            
        except Exception as e:
            logger.error(f"Error getting career recommendations: {e}")
            return {"error": f"Failed to generate career recommendations: {str(e)}"}
    
    async def _generate_learning_path(self, args: Dict[str, Any], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate a personalized learning path"""
        try:
            career_name = args.get("career_name", "")
            current_skills = args.get("current_skills", [])
            timeframe = args.get("timeframe", "1_year")
            learning_style = args.get("learning_style", "mixed")
            budget_constraints = args.get("budget_constraints", "free")
            
            prompt = f"""Create a learning path for {career_name} career.
            
            Current skills: {', '.join(current_skills)}
            Timeframe: {timeframe}
            Learning style: {learning_style}
            Budget constraints: {budget_constraints}
            
            Provide a structured learning plan with:
            1. Phase-by-phase breakdown
            2. Specific resources and courses
            3. Milestones and checkpoints
            4. Time estimates for each phase
            5. Practice projects and exercises
            
            Make it practical and achievable within the specified timeframe."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.3
            )
            
            learning_path = response.choices[0].message.content
            
            return {
                "summary": f"Created personalized learning path for {career_name}",
                "learning_path": learning_path,
                "timeframe": timeframe,
                "learning_style": learning_style,
                "budget_constraints": budget_constraints
            }
            
        except Exception as e:
            logger.error(f"Error generating learning path: {e}")
            return {"error": f"Failed to generate learning path: {str(e)}"}
    
    async def _analyze_skill_gaps(self, args: Dict[str, Any], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Analyze skill gaps for a career path"""
        try:
            career_name = args.get("career_name", "")
            user_skills = args.get("user_skills", [])
            priority_level = args.get("priority_level", "important")
            
            prompt = f"""Analyze skill gaps for {career_name} career.
            
            User's current skills: {', '.join(user_skills)}
            Priority level: {priority_level}
            
            Provide:
            1. Critical missing skills
            2. Skills that need improvement
            3. Priority order for skill development
            4. Estimated time to acquire each skill
            5. Recommended learning resources
            
            Focus on actionable insights and practical steps."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "summary": f"Analyzed skill gaps for {career_name}",
                "skill_analysis": analysis,
                "career": career_name,
                "skills_assessed": len(user_skills),
                "priority_level": priority_level
            }
            
        except Exception as e:
            logger.error(f"Error analyzing skill gaps: {e}")
            return {"error": f"Failed to analyze skill gaps: {str(e)}"}
    
    async def _get_interview_prep(self, args: Dict[str, Any], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Get interview preparation guidance"""
        try:
            career_name = args.get("career_name", "")
            interview_type = args.get("interview_type", "general")
            experience_level = args.get("experience_level", "entry")
            company_type = args.get("company_type", "corporate")
            
            prompt = f"""Provide interview preparation guidance for {career_name} position.
            
            Interview type: {interview_type}
            Experience level: {experience_level}
            Company type: {company_type}
            
            Include:
            1. Common interview questions
            2. Technical assessment tips
            3. Behavioral question strategies
            4. Portfolio preparation
            5. Follow-up best practices
            
            Make it specific to the career and experience level."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            guidance = response.choices[0].message.content
            
            return {
                "summary": f"Generated interview prep for {career_name}",
                "interview_guidance": guidance,
                "interview_type": interview_type,
                "experience_level": experience_level,
                "company_type": company_type
            }
            
        except Exception as e:
            logger.error(f"Error getting interview prep: {e}")
            return {"error": f"Failed to generate interview prep: {str(e)}"}
    
    async def _get_skill_development_plan(self, args: Dict[str, Any], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a skill development plan"""
        try:
            target_skills = args.get("target_skills", [])
            current_level = args.get("current_level", "beginner")
            preferred_methods = args.get("preferred_methods", ["online_courses"])
            time_availability = args.get("time_availability", "moderate")
            
            prompt = f"""Create a skill development plan for: {', '.join(target_skills)}
            
            Current level: {current_level}
            Preferred methods: {', '.join(preferred_methods)}
            Time availability: {time_availability}
            
            Provide:
            1. Learning sequence and timeline
            2. Specific resources and courses
            3. Practice exercises and projects
            4. Progress tracking methods
            5. Milestones and success criteria
            
            Make it realistic and achievable."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            plan = response.choices[0].message.content
            
            return {
                "summary": f"Created development plan for {len(target_skills)} skills",
                "development_plan": plan,
                "target_skills": target_skills,
                "current_level": current_level,
                "preferred_methods": preferred_methods,
                "time_availability": time_availability
            }
            
        except Exception as e:
            logger.error(f"Error creating skill development plan: {e}")
            return {"error": f"Failed to create development plan: {str(e)}"}
    
    async def _explore_career_path(self, args: Dict[str, Any], context: Optional[Dict[str, Any]], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Explore a specific career path with detailed information"""
        try:
            career_name = args.get("career_name", "")
            exploration_depth = args.get("exploration_depth", "overview")
            focus_areas = args.get("focus_areas", ["salary", "skills", "education", "growth", "work_life", "challenges"])
            
            prompt = f"""Provide a detailed exploration of the {career_name} career path.
            
            Exploration depth: {exploration_depth}
            Focus areas: {', '.join(focus_areas)}
            
            Include:
            1. Current market trends and demand
            2. Salary ranges and growth potential
            3. Required education and certifications
            4. Day-to-day responsibilities
            5. Career advancement opportunities
            6. Work-life balance considerations
            7. Industry challenges and opportunities
            
            Make it informative and actionable for someone considering this career."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1200,
                temperature=0.3
            )
            
            insights = response.choices[0].message.content
            
            return {
                "career": career_name,
                "insights": insights,
                "generated_at": datetime.now().isoformat(),
                "summary": f"Generated comprehensive insights for {career_name}",
                "exploration_depth": exploration_depth,
                "focus_areas": focus_areas
            }
            
        except Exception as e:
            logger.error(f"Error exploring career path: {e}")
            return {
                "career": career_name,
                "error": f"Failed to explore career path: {str(e)}"
            }
    
    async def generate_career_insights(self, career_name: str) -> Dict[str, Any]:
        """Generate AI-powered insights about a specific career"""
        try:
            prompt = f"""Provide comprehensive insights about {career_name} career.
            
            Include:
            1. Current market trends and demand
            2. Salary ranges and growth potential
            3. Required education and certifications
            4. Day-to-day responsibilities
            5. Career advancement opportunities
            6. Work-life balance considerations
            7. Industry challenges and opportunities
            
            Make it informative and actionable for someone considering this career."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1200,
                temperature=0.3
            )
            
            insights = response.choices[0].message.content
            
            return {
                "career": career_name,
                "insights": insights,
                "generated_at": datetime.now().isoformat(),
                "summary": f"Generated comprehensive insights for {career_name}"
            }
            
        except Exception as e:
            logger.error(f"Error generating career insights: {e}")
            return {
                "career": career_name,
                "error": f"Failed to generate insights: {str(e)}"
            }
    
    async def analyze_user_profile(self, skills: List[str], interests: List[str], experience: str) -> Dict[str, Any]:
        """Analyze user profile and provide comprehensive recommendations"""
        try:
            prompt = f"""Analyze this user profile and provide comprehensive career guidance:
            
            Skills: {', '.join(skills)}
            Interests: {', '.join(interests)}
            Experience Level: {experience}
            
            Provide:
            1. Career path recommendations
            2. Skill development priorities
            3. Learning resource suggestions
            4. Networking opportunities
            5. Portfolio building tips
            6. Short-term and long-term goals
            
            Be specific, actionable, and encouraging."""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.4
            )
            
            analysis = response.choices[0].message.content
            
            return {
                "profile_analysis": analysis,
                "skills_analyzed": len(skills),
                "interests_considered": len(interests),
                "experience_level": experience,
                "recommendations_count": 6,
                "summary": "Comprehensive profile analysis completed"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing user profile: {e}")
            return {
                "error": f"Failed to analyze profile: {str(e)}",
                "skills_analyzed": len(skills),
                "interests_considered": len(interests)
            } 