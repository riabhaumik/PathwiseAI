
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()  # ⬅️ This loads the .env file so os.getenv() can read values


supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_ANON_KEY'))

def sign_up(email: str, password: str):
    try:
        user = supabase.auth.sign_up({'email': email, 'password': password})
        return user, None
    except Exception as e:
        return None, str(e)

def login(email: str, password: str):
    try:
        user = supabase.auth.sign_in_with_password({'email': email, 'password': password})
        return user, None
    except Exception as e:
        return None, str(e)

def get_user_profile(user):
    return {'email': user.email, 'selected_career': None, 'completed_topics': []}

def update_user_progress(user, career: str, completed_topics: list):
    return {'email': user.email, 'selected_career': career, 'completed_topics': completed_topics}
