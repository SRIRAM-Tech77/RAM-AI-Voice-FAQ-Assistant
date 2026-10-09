# 🤖 RAM AI Voice FAQ Assistant

A simple AI voice assistant built using Python, FastAPI, and Google Gemini. It accepts text or voice input, generates AI responses using a custom FAQ knowledge base (RAG), and converts answers into speech.

🔗 **Live Demo:** https://ram-ai-voice-faq-assistant.onrender.com

## ✨ Features

- 💬 **Text Chat:** Ask questions and receive AI-generated answers.
- 🎙️ **Voice Chat:** Speak through your microphone and get voice responses.
- 🧠 **RAG Integration:** Answers questions using a custom `faq.txt` knowledge base.
- 🔊 **Text-to-Speech:** Converts AI responses into audio using Microsoft Edge TTS.
- 🌐 **General Questions:** Supports questions beyond the custom FAQ.
- 🎨 **Simple UI:** Responsive interface with real-time status indicators.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, FastAPI, Uvicorn
- **AI Model:** Google Gemini
- **Speech Recognition:** Browser Web Speech API
- **Text-to-Speech:** Microsoft Edge TTS

## 🚀 Run Locally

**1. Clone the repository**

```bash
git clone https://github.com/SRIRAM-Tech77/RAM-AI-Voice-FAQ-Assistant.git
cd RAM-AI-Voice-FAQ-Assistant
```

**2. Install dependencies**

```bash
pip install -r requirements.txt
```

**3. Configure your API key**

Create a `.env` file in the project root and add your Google Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

Get your API key from [Google AI Studio](https://aistudio.google.com/).

**4. Start the server**

```bash
python -m uvicorn app.main:app --reload
```

**5. Open the application**

Visit http://127.0.0.1:8000/ in your browser.

## 📁 Project Highlights

- Simple and beginner-friendly architecture.
- Custom FAQ-based question answering using RAG.
- Integrated text and voice interaction.
- Asynchronous frontend and backend communication.

## ⚠️ Requirements

- Python installed on your system.
- A valid Google Gemini API key.
- Microphone access for voice input.
- Required dependencies installed.

## 🤖 AI Assistance

AI coding assistants were used to help with debugging, implementation, and documentation. Suggestions were reviewed and tested during development.

---

**Built with ❤️ by [SRIRAM-Tech77](https://github.com/SRIRAM-Tech77)**
