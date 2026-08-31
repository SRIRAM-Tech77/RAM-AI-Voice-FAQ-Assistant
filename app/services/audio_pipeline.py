import subprocess
import speech_recognition as sr
from pathlib import Path
from uuid import uuid4

try:
    from app.services.gemini_client import llm_client
except ModuleNotFoundError:
    from services.gemini_client import llm_client

AUDIO_DIR = Path("data/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

def load_knowledge_base() -> str:
    """Reads the custom FAQ file if available."""
    faq_path = Path("faq.txt")
    if faq_path.exists():
        try:
            with open(faq_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            return ""
    return ""

def transcribe_audio(audio_path: Path) -> str:
    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(str(audio_path)) as source:
            audio_data = recognizer.record(source)
            return recognizer.recognize_google(audio_data)
    except Exception:
        return "I could not understand the audio. Please try speaking clearly."

def answer_from_text(user_text: str) -> str:
    knowledge_base = load_knowledge_base()
    
    prompt = (
        "You are an intelligent Voice Assistant. "
        "NOTE: The user's input was transcribed from a microphone in a noisy room. It may contain severe spelling mistakes, wrong words, or missing punctuation. Please infer their true meaning and ignore the typos. "
        "If the user asks about the college or academy, use the KNOWLEDGE BASE below. "
        "If the user asks a general question, answer it naturally using your general knowledge. "
        "Always keep answers polite, clear, and strictly under 3 sentences.\n\n"
        f"--- KNOWLEDGE BASE ---\n{knowledge_base}\n-----------------------\n\n"
        f"User Question: {user_text}"
    )
    
    try:
        response = llm_client.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"API Connection Error: {str(e)}"

def generate_speech(text: str) -> Path:
    output_file = AUDIO_DIR / f"response_{uuid4().hex}.mp3"
    
    # ULTIMATE LOOPHOLE: Free Microsoft Neural Voice (Male - Ryan)
    try:
        # This securely calls the edge-tts tool we just installed
        subprocess.run([
            "edge-tts", 
            "--voice", "en-GB-RyanNeural", 
            "--text", text, 
            "--write-media", str(output_file)
        ], check=True)
        
    except Exception as e:
        print(f"DEBUG: Speech generation failed - {e}")
        output_file.touch()
        
    return output_file