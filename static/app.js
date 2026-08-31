const textBtn = document.getElementById("textBtn");
const textActionBtn = document.getElementById("textActionBtn");
const recordBtn = document.getElementById("recordBtn");
const recordBtnText = document.getElementById("recordBtnText");
const micIcon = document.getElementById("micIcon");
const clearBtn = document.getElementById("clearBtn");
const textInput = document.getElementById("textInput");
const textareaContainer = document.getElementById("textareaContainer");
const statusContainer = document.getElementById("statusContainer");
const statusText = document.getElementById("statusText");
const statusDescription = document.getElementById("statusDescription");
const answerText = document.getElementById("answerText");
const audioPlayer = document.getElementById("audioPlayer");
const copyBtn = document.getElementById("copyBtn");

let isListening = false;
let isProcessing = false;
let finalTranscript = "";
let recognition = null;
let copyTimeout = null;

// Bulletproof Copy Text Logic with Class-based Glass UI
copyBtn.addEventListener("click", () => {
    const textToCopy = answerText.innerText;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
        copyBtn.classList.add("copied-state");

        clearTimeout(copyTimeout);
        copyTimeout = setTimeout(() => {
            copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
            copyBtn.classList.remove("copied-state");
        }, 2000);
    } catch (err) {
        console.error('Failed to copy text', err);
    }
    document.body.removeChild(textArea);
});

textInput.addEventListener("input", () => {
    if (textInput.value.trim().length > 0) {
        textActionBtn.classList.add("active-ready");
    } else {
        textActionBtn.classList.remove("active-ready");
    }
});

// "Ask via Text" triggers visual focus pop
textBtn.addEventListener("click", () => {
    const val = textInput.value.trim();
    if (val) {
        askQuestion(val, "text");
    } else {
        textInput.focus();
        textareaContainer.classList.add("active-focus");
        setTimeout(() => textareaContainer.classList.remove("active-focus"), 800);
    }
});

function showStatus(title, description = "") {
    if (statusText) statusText.innerText = title;
    if (statusDescription) statusDescription.innerText = description;
    if (statusContainer) statusContainer.classList.remove("hidden");
}
function hideStatus() { if (statusContainer) statusContainer.classList.add("hidden"); }

function setListeningState(listening) {
    isListening = listening;
    if (!recordBtn) return;
    if (listening) {
        recordBtn.className = "btn btn-gradient-purple listening";
        if (recordBtnText) recordBtnText.innerText = "Stop Recording";
        if (micIcon) micIcon.className = "fa-solid fa-square";
    } else {
        recordBtn.className = "btn btn-gradient-purple";
        if (recordBtnText) recordBtnText.innerText = "Speak Now";
        if (micIcon) micIcon.className = "fa-solid fa-microphone";
    }
}

function setSendingAnimation(isSending) {
    if (!recordBtn) return;
    if (isSending) {
        recordBtn.className = "btn btn-gradient-purple sending";
        if (recordBtnText) recordBtnText.innerText = "Sending...";
        if (micIcon) micIcon.className = "fa-solid fa-spinner fa-spin";
    } else {
        setListeningState(false);
    }
}

function setProcessingState(processing) {
    isProcessing = processing;
    if (textBtn) textBtn.disabled = processing;
    if (textActionBtn) textActionBtn.disabled = processing;
    if (recordBtn) recordBtn.disabled = processing;
}

async function askQuestion(text, source = "text") {
    const cleanText = text.trim();
    if (!cleanText || isProcessing) return;

    setProcessingState(true);
    showStatus("Thinking...", "Processing your request.");

    try {
        const response = await fetch("/api/text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: cleanText })
        });

        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        answerText.innerText = data.answer || "No response found.";

        if (data.audio_url) {
            showStatus("Speaking...", "Voice response ready.");
            audioPlayer.src = data.audio_url;
            audioPlayer.load();
            try { await audioPlayer.play(); } catch (e) { }
        }
    } catch (error) {
        answerText.innerText = "Error connecting to the voice service.";
    } finally {
        setProcessingState(false);
        setSendingAnimation(false);
        setTimeout(hideStatus, 2500);
    }
}

if (textActionBtn) textActionBtn.addEventListener("click", () => askQuestion(textInput.value, "text"));
textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        askQuestion(textInput.value, "text");
    }
});

// Clear Button resets EVERYTHING including the copy button
clearBtn.addEventListener("click", () => {
    if (recognition && isListening) { try { recognition.stop(); } catch (e) { } }
    finalTranscript = "";
    setListeningState(false);
    textInput.value = "";
    textActionBtn.classList.remove("active-ready");
    answerText.innerText = "Your answer will appear here...";
    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    hideStatus();

    // Reset Copy Button instantly
    clearTimeout(copyTimeout);
    copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
    copyBtn.classList.remove("copied-state");
});

function formatSpokenText(rawText) {
    if (!rawText) return "";
    let text = rawText.trim();
    text = text.replace(/\b(but|because|however|although)\b/gi, ", $1");
    text = text.replace(/\bperiod\b|\bfull stop\b/gi, ".").replace(/\bcomma\b/gi, ",").replace(/\bquestion mark\b/gi, "?");
    text = text.replace(/\s+/g, " ").replace(/ ,/g, ",");
    if (text.length > 0) text = text.charAt(0).toUpperCase() + text.slice(1);
    const questionWords = ["what", "why", "how", "when", "where", "who", "which", "can", "is", "are", "do", "does", "should", "could", "would", "will"];
    const firstWord = text.split(" ")[0].toLowerCase();
    if (questionWords.includes(firstWord) && !/[.?!]$/.test(text)) text += "?";
    else if (!/[.?!]$/.test(text)) text += ".";
    return text;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recordBtn.addEventListener("click", () => {
        if (isListening) {
            try { recognition.stop(); } catch (e) { setListeningState(false); }
            return;
        }
        if (isProcessing) return;
        finalTranscript = "";
        textInput.value = "";
        textActionBtn.classList.remove("active-ready");

        // Reset Copy Button on new recording
        clearTimeout(copyTimeout);
        copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
        copyBtn.classList.remove("copied-state");

        try { recognition.start(); } catch (e) { }
    });

    recognition.onstart = () => {
        setListeningState(true);
        showStatus("Listening...", "Speak clearly now.");
    };

    recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalTranscript += transcript + " ";
            else interimTranscript += transcript;
        }
        textInput.value = `${finalTranscript} ${interimTranscript}`.trim();
        textActionBtn.classList.add("active-ready");
    };

    recognition.onend = async () => {
        const wasListening = isListening;
        setListeningState(false);
        if (!wasListening) return;

        let spokenText = finalTranscript.trim();
        if (!spokenText) {
            hideStatus();
            textInput.value = "";
            textActionBtn.classList.remove("active-ready");
            return;
        }

        spokenText = formatSpokenText(spokenText);
        textInput.value = spokenText;
        textActionBtn.classList.add("active-ready");

        setSendingAnimation(true);
        showStatus("Sending...", "Submitting your query.");

        setTimeout(() => {
            askQuestion(spokenText, "voice");
        }, 1000);
    };

    recognition.onerror = () => {
        setListeningState(false);
        showStatus("Microphone Error", "Please verify microphone permissions.");
        setTimeout(hideStatus, 2000);
    };
}