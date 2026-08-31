import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
key = os.getenv("GEMINI_API_KEY")

if not key:
    raise RuntimeError("GEMINI_API_KEY is missing in your .env file!")

# Initialize the official Google GenAI client
client = genai.Client(api_key=key)

class ModernGeminiWrapper:
    def generate_content(self, prompt: str):
        try:
            # Using the fast, lightweight model with the massive free tier allowance
            response = client.models.generate_content(
                model='gemini-3.5-flash-lite',
                contents=prompt,
            )
            class Result:
                pass
            res = Result()
            res.text = response.text
            return res
        except Exception as e:
            class Result:
                pass
            res = Result()
            error_msg = str(e)
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                res.text = "Rate limit reached. Please wait a moment and try again."
            else:
                res.text = f"API Error: {error_msg}"
            return res

llm_client = ModernGeminiWrapper()