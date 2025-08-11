import os
import openai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("Warning: OPENAI_API_KEY not found. Chatbot will be disabled.")
    OPENAI_ENABLED = False
else:
    # Initialize the OpenAI client with the new syntax
    client = openai.OpenAI(api_key=api_key)
    OPENAI_ENABLED = True

def get_guidance(query: str, career_context: str = "general STEM") -> str:
    if not OPENAI_ENABLED:
        return "Chatbot is disabled because the OpenAI API key is not configured."

    system_prompt = f"""
    You are Pathwise AI, a career advisor for students interested in STEM.
    Be encouraging, practical, and clear. Format using markdown.
    Context: {career_context}
    """

    try:
        # Use the new client-based syntax
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"An error occurred: {str(e)}"

def upload_file_analysis(file_content: str, filename: str) -> str:
    if not OPENAI_ENABLED:
        return f"Analysis for {filename}:\n\n{file_content[:500]}..."
    
    try:
        system_prompt = """
        You are an AI assistant analyzing uploaded files. Provide a comprehensive analysis including:
        1. File type and content overview
        2. Key insights and observations
        3. Recommendations or suggestions
        4. Any potential issues or improvements
        Format your response using markdown.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this file ({filename}):\n\n{file_content[:4000]}"},
            ],
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Analysis for {filename}:\n\n{file_content[:500]}...\n\nError during AI analysis: {str(e)}"

def clear_conversation_history():
    # This function can be used to clear chat history if needed
    pass
