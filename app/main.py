import sys
from pathlib import Path
import shutil
from uuid import uuid4
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

# 1. Bulletproof Paths: Find the project root automatically
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# 2. Bulletproof Imports
try:
    from app.services.audio_pipeline import transcribe_audio, answer_from_text, generate_speech
except ModuleNotFoundError:
    from app.services.audio_pipeline import transcribe_audio, answer_from_text, generate_speech

app = FastAPI()

# 3. Bulletproof Folders: Force the folders to exist so FastAPI never crashes
STATIC_DIR = ROOT_DIR / "static"
AUDIO_DIR = ROOT_DIR / "data" / "audio"
STATIC_DIR.mkdir(parents=True, exist_ok=True)
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Mount the folders
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.mount("/audio", StaticFiles(directory=str(AUDIO_DIR)), name="audio")

class TextRequest(BaseModel):
    text: str

@app.get("/", response_class=HTMLResponse)
async def read_index():
    index_path = STATIC_DIR / "index.html"
    if not index_path.exists():
        return HTMLResponse("<h1>Error: index.html is missing from the static folder! Please create it.</h1>")
    with open(index_path, "r", encoding="utf-8") as f:
        return f.read()

@app.post("/api/text")
async def process_text(request: TextRequest):
    answer = answer_from_text(request.text)
    audio_path = generate_speech(answer)
    return {
        "transcript": request.text,
        "answer": answer,
        "audio_url": f"/audio/{audio_path.name}"
    }

@app.post("/api/voice")
async def process_voice(audio: UploadFile = File(...)):
    temp_file = ROOT_DIR / "data" / f"temp_{uuid4().hex}.webm"
    with temp_file.open("wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
        
    transcript = transcribe_audio(temp_file)
    answer = answer_from_text(transcript)
    audio_path = generate_speech(answer)
    if temp_file.exists():
        temp_file.unlink()
        
    return {
        "transcript": transcript,
        "answer": answer,
        "audio_url": f"/audio/{audio_path.name}"
    }