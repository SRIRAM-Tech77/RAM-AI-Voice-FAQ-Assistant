# RAM AI Voice FAQ Assistant — LLM Meet Speech

A beginner-friendly, end-to-end AI voice assistant built for the **LLMs Meet Speech — Take-Home Assessment**.

RAM AI integrates **Speech-to-Text (STT), Large Language Models (LLM), Retrieval-Augmented Generation (RAG), and Text-to-Speech (TTS)** into a single interactive application.

The assistant provides **RAG-based answers about NxtWave Academy and its courses**, while also supporting **general questions across a wide range of topics**.
**Live Deployment:** [https://ram-ai-voice-faq-assistant.onrender.com]

---

##  What It Does

This is an end-to-end interactive AI project that seamlessly handles both text and voice inputs. It transforms user queries—whether typed or spoken—into intelligent, voice-synthesized responses tailored for NxtWave Academy.

RAM AI allows users to communicate with the assistant through multiple input and output modes:

* **Text Mode:** User Input → Gemini LLM (RAG) → Microsoft edge-tts → Audio Playback.
* **Voice Mode:** Microphone (Web Speech API) → Speech-to-Text → Gemini LLM (RAG) → Microsoft edge-tts → Audio Playback.
* **Custom Knowledge Base:** Replaces generic LLM answers with verified facts from a local NxtWave `faq.txt`.
* **Aesthetic Interface:** A responsive Glassmorphism UI with real-time status indicators (Listening, Thinking, Speaking).

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, and Vanilla JavaScript (Built entirely without heavy frameworks for a lightweight, lightning-fast UI).
* **Backend:** Python, FastAPI, and Uvicorn.
* **LLM Engine:** Google Gemini 1.5 Flash (Optimized for high-speed reasoning and RAG inference).
* **Audio Processing:** Microsoft `edge-tts` (High-quality voice synthesis).

## ⚙️ How to Run Locally

1. **Clone the repository and move into the folder:**
   ```bash
   git clone [https://github.com/SRIRAM-Tech77/RAM-AI-Voice-FAQ-Assistant.git](https://github.com/SRIRAM-Tech77/RAM-AI-Voice-FAQ-Assistant.git)
   cd Voice_Bot_project

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create the environment file:**
Copy the provided .env.example file to create a new .env file in the root directory. Add your private API key:
   ```
   Gemini_API_KEY=your-real-key-here
   ```
   Get a free Gemini API key from **Google AI Studio**.(no credit card requided.)

4. **Start the local server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

5. **Open** `http://127.0.0.1:9090/` or `http://127.0.0.1:9090/`  in your browser and try it out.

## Architecture & Approach
**Linear Pipeline**: The architecture intentionally keeps the pipeline simple and linear (Speech → STT → LLM → TTS → Audio) so the data flow remains highly visible and easy to debug.

**Cost Optimization**: By utilizing standard Web Speech APIs for STT and edge-tts for voice synthesis, the project relies on a single free API key (Google Gemini) to operate fully, completely bypassing expensive third-party TTS/STT services.

 ## Development Challenges
**Git & Terminal Configuration**: Overcame initial PowerShell environment blocks and fatal: unable to auto-detect email address errors by restructuring global Git identity credentials and clearing hanging processes.

**Audio Buffer Codecs**: Raw byte streaming from the backend to the frontend caused HTML5 player failures. Resolved this by saving temporary .webm/.mp3 files locally before serving them to the client browser.

**Asynchronous UI Freezes**: The "Bot is thinking" UI state occasionally broke during long LLM response times. Fixed this by implementing strict JavaScript promise chaining to handle asynchronous events smoothly without locking the Ui.

## 📌 Assumptions & Known Limitations

- **Hardware Dependencies:** Voice interaction assumes a functional microphone and required browser permissions.
- **Single-User Architecture:** The application currently operates without authentication, user accounts, or persistent session management.
- **API Retry Handling:** Automated retry and backoff mechanisms are not currently implemented for API rate limits or temporary failures.
- **Speech Recognition:** Browser-based STT may experience reduced accuracy in noisy environments or with unclear audio input.

## 🤖 AI Assistant Disclosure

*AI coding assistants were used as a supporting development tool during this*
*project to help debug issues, explore solutions, refine implementation details,*
*and structure technical documentation. All relevant suggestions were reviewed,*
*adapted, integrated, and tested as part of the development process.*

### 🔄 Development Pipeline

**Issue → AI-Assisted Debugging → Implementation → Testing → Refinement**

### 🛠️ Assistance Areas

- **Debugging:** Terminal, runtime, and integration errors.
- **Frontend:** CSS animations and JavaScript behavior.
- **Backend:** FastAPI routing and endpoint structure.
- **Async Logic:** JavaScript Promise and execution-flow issues.
- **Audio Pipeline:** STT → LLM/RAG → TTS troubleshooting.
- **Documentation:** README structure and technical writing.

**AI was used as a development aid; the final implementation was tested and
validated through the project's actual execution.**