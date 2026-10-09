document.addEventListener("DOMContentLoaded", () => {

    // --- CORE ELEMENTS ---
    const textInput = document.getElementById("textInput");
    const textActionBtn = document.getElementById("textActionBtn");
    const textBtn = document.getElementById("textBtn");
    const recordBtn = document.getElementById("recordBtn");
    const recordBtnText = document.getElementById("recordBtnText");
    const micIcon = document.getElementById("micIcon");
    const clearBtn = document.getElementById("clearBtn");
    const answerText = document.getElementById("answerText");
    const audioPlayer = document.getElementById("audioPlayer");
    const statusContainer = document.getElementById("statusContainer");
    const statusText = document.getElementById("statusText");
    const copyBtn = document.getElementById("copyBtn");

    // --- LAYOUT ELEMENTS ---
    const leftSidebar = document.getElementById("leftSidebar");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const navHomeBtn = document.getElementById("navHomeBtn");
    const navVoiceBtn = document.getElementById("navVoiceBtn");
    const navTextBtn = document.getElementById("navTextBtn");
    const navFaqBtn = document.getElementById("navFaqBtn");
    const faqSectionBlock = document.getElementById("faqSectionBlock");
    const appHomeSection = document.getElementById("appHomeSection");

    // --- FEATURE ELEMENTS ---
    const downloadHistoryBtn = document.getElementById("downloadHistoryBtn");
    const downloadAudioBtn = document.getElementById("downloadAudioBtn");
    const openHelpBtn = document.getElementById("openHelpBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const helpModal = document.getElementById("helpModal");

    // --- STATE TRACKERS ---
    let isProcessing = false;
    let recognition = null;
    let isListening = false;
    let finalTranscriptChunks = "";

    // --- FORCE RESET BUTTON STATES ON LOAD ---
    if (recordBtn) recordBtn.classList.remove("listening", "sending");
    if (statusContainer) statusContainer.classList.add("modal-hidden");

    // --- ENHANCED GRAMMAR & NXTWAVE AUTO-CORRECT ENGINE ---
    function formatSpokenText(rawText) {
        if (!rawText) return "";
        let text = rawText.trim();

        // 1. NxtWave Specific Auto-Corrects (Fixes mispronunciations)
        text = text.replace(/\b(next wave|next web|nextwave)\b/gi, "NxtWave");
        text = text.replace(/\b(ccbp|cc bp|c c b p)\b/gi, "CCBP");
        text = text.replace(/\b(gen ai|gen i|jedi)\b/gi, "GenAI");
        text = text.replace(/\b(ram ai|ram a i)\b/gi, "RAM AI");

        // 2. Fix conjunctions and spoken punctuation
        text = text.replace(/\b(but|because|however|although)\b/gi, ", $1");
        text = text.replace(/\b(period|full stop)\b/gi, ".");
        text = text.replace(/\b(comma)\b/gi, ",");
        text = text.replace(/\b(question mark)\b/gi, "?");

        // 3. Clean extra spaces
        text = text.replace(/\s+/g, " ").replace(/ ,/g, ",").replace(/ \./g, ".").replace(/ \?/g, "?").trim();

        // 4. Capitalize first letter
        if (text.length > 0) {
            text = text.charAt(0).toUpperCase() + text.slice(1);
        }

        // 5. Intelligent Auto-Punctuation
        const questionWords = ["what", "why", "how", "when", "where", "who", "which", "can", "is", "are", "do", "does", "should", "could", "would", "will"];
        const firstWord = text.split(" ")[0].toLowerCase();

        if (questionWords.includes(firstWord) && !/[.?!]$/.test(text)) {
            text += "?";
        } else if (!/[.?!]$/.test(text)) {
            text += ".";
        }
        return text;
    }

    // --- SIDEBAR TOGGLE ---
    if (sidebarToggleBtn && leftSidebar) {
        sidebarToggleBtn.addEventListener("click", () => {
            leftSidebar.classList.toggle("sidebar-collapsed");
        });
    }

    // --- HELP MODAL ---
    if (openHelpBtn) openHelpBtn.addEventListener("click", () => helpModal.classList.remove("modal-hidden"));
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => helpModal.classList.add("modal-hidden"));
    if (helpModal) {
        helpModal.addEventListener("click", (e) => {
            if (e.target === helpModal) helpModal.classList.add("modal-hidden");
        });
    }

    // --- NAVIGATION ROUTING & HOME BOUNCE ---
    if (navHomeBtn) {
        navHomeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo(0, 0);
            appHomeSection.classList.add("home-bounce");
            setTimeout(() => {
                appHomeSection.classList.remove("home-bounce");
            }, 500);
        });
    }

    if (navVoiceBtn) navVoiceBtn.addEventListener("click", (e) => {
        e.preventDefault();
        recordBtn.click();
    });
    if (navTextBtn) navTextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        textInput.focus();
    });

    if (navFaqBtn) {
        navFaqBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (leftSidebar.classList.contains("sidebar-collapsed")) leftSidebar.classList.remove("sidebar-collapsed");
            faqSectionBlock.classList.add("faq-pop-active");
            setTimeout(() => {
                faqSectionBlock.classList.remove("faq-pop-active");
            }, 800);
        });
    }

    // --- 20+ NXTWAVE FAQS ---
    const nxtWaveFaqs = [
        "What is NxtWave Academy Program?", "What is CCBP 4.0?",
        "What is the difference between Smart and Genius track?",
        "How does the placement process work?", "What courses are included in CCBP?",
        "Tell me about the GenAI course and its benefits.",
        "Is coding background required for CCBP 4.0?", "What is the growth cycle in NxtWave?",
        "How does NxtWave help with resume building?", "What is the duration of the Smart Track?",
        "What is the duration of the Genius Track?", "Are there any mock interviews provided?",
        "How to access recorded sessions?", "What is the XPM learning method?",
        "Does NxtWave provide certificates?", "How many projects will I build?",
        "What programming languages are taught?", "How do I clear my doubts during the course?",
        "Is there a dedicated placement team?", "What is the fee structure for CCBP 4.0?",
        "Can I join if I am from a non-BTech background?", "What is the refund policy?"
    ];

    function renderFaqs() {
        const container = document.getElementById("dynamicFaqList");
        if (container) {
            container.innerHTML = nxtWaveFaqs.map(q =>
                `<button class="faq-btn" type="button" onclick="window.sendQuickFAQ('${q}')">
                    <span>${q}</span> <i class="fa-solid fa-chevron-right text-secondary" style="font-size: 0.8rem;"></i>
                </button>`
            ).join("");
        }
    }
    renderFaqs();

    window.sendQuickFAQ = function(question) {
        if (textInput) textInput.value = question;
        askQuestion(question, "text");
    };

    // --- STATS & HISTORY ---
    function loadStats() {
        const textCount = parseInt(localStorage.getItem("ramAI_text_count")) || 0;
        const voiceCount = parseInt(localStorage.getItem("ramAI_voice_count")) || 0;
        if (document.getElementById("statTextQueries")) document.getElementById("statTextQueries").innerText = textCount;
        if (document.getElementById("statVoiceQueries")) document.getElementById("statVoiceQueries").innerText = voiceCount;
        if (document.getElementById("statTotalQueries")) document.getElementById("statTotalQueries").innerText = textCount + voiceCount;
    }

    function updateStatCounters(source) {
        let key = source === "voice" ? "ramAI_voice_count" : "ramAI_text_count";
        let count = parseInt(localStorage.getItem(key)) || 0;
        localStorage.setItem(key, count + 1);
        loadStats();
    }

    function getHistory() {
        return JSON.parse(localStorage.getItem("ramAI_history")) || [];
    }

    function saveHistory(history) {
        localStorage.setItem("ramAI_history", JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        const historyList = document.getElementById("historyList");
        if (!historyList) return;
        const history = getHistory();
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="text-center p-3 mt-4">
                    <i class="fa-regular fa-clock fs-4 text-secondary mb-2"></i>
                    <h6 class="fw-bold mb-1">No recent conversations</h6>
                    <p class="small text-secondary m-0">Your recent questions will appear here.</p>
                </div>`;
            return;
        }
        historyList.innerHTML = history.slice(0, 10).map(item => `
            <div class="history-item d-flex align-items-center" onclick="window.openHistoryItem('${item.id}')">
                <i class="fa-regular ${item.source === 'voice' ? 'fa-microphone' : 'fa-comment-dots'} text-secondary me-2"></i>
                <div class="flex-grow-1 overflow-hidden">
                    <div class="history-title">${item.question}</div>
                    <div class="small text-secondary" style="font-size: 0.75rem;">${new Date(parseInt(item.id)).toLocaleTimeString()}</div>
                </div>
            </div>
        `).join("");
    }

    window.openHistoryItem = function(id) {
        const item = getHistory().find(h => h.id === id);
        if (item) {
            textInput.value = item.question;
            answerText.innerText = item.answer;
            if (item.audioUrl) {
                audioPlayer.src = item.audioUrl;
                audioPlayer.load();
            }
        }
    };

    // --- DOWNLOADS ---
    if (downloadHistoryBtn) {
        downloadHistoryBtn.addEventListener("click", () => {
            const history = getHistory();
            if (history.length === 0) {
                alert("No history to download yet!");
                return;
            }
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "ramAI_history.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    if (downloadAudioBtn) {
        downloadAudioBtn.addEventListener("click", async () => {
            const url = audioPlayer.src;
            if (!url || url === "" || url.endsWith(window.location.host + "/") || url === window.location.href) {
                alert("No audio response is available to download right now. Ask a question first!");
                return;
            }
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Audio fetch failed.");
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const tempLink = document.createElement("a");
                tempLink.href = blobUrl;
                tempLink.download = `RAM_AI_Response_${Date.now()}.mp3`;
                document.body.appendChild(tempLink);
                tempLink.click();
                URL.revokeObjectURL(blobUrl);
                tempLink.remove();
            } catch (error) {
                const fallbackLink = document.createElement("a");
                fallbackLink.href = url;
                fallbackLink.download = "RAM_AI_Response.mp3";
                fallbackLink.target = "_blank";
                document.body.appendChild(fallbackLink);
                fallbackLink.click();
                fallbackLink.remove();
            }
        });
    }

    // --- MAIN API CALL ---
    async function askQuestion(text, source = "text") {
        const cleanText = text.trim();
        if (!cleanText || isProcessing) return;

        isProcessing = true;
        textInput.value = cleanText;
        answerText.innerText = "Generating response...";
        statusContainer.classList.remove("modal-hidden");
        statusText.innerText = "Processing AI Response...";

        try {
            const response = await fetch("/api/text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text: cleanText
                })
            });

            if (!response.ok) throw new Error("Server error");
            const data = await response.json();
            answerText.innerText = data.answer;

            if (data.audio_url) {
                audioPlayer.src = data.audio_url;
                audioPlayer.load();
                audioPlayer.play().catch(() => console.log("Autoplay prevented by browser"));
            }

            const history = getHistory();
            history.unshift({
                id: Date.now().toString(),
                question: cleanText,
                answer: data.answer,
                source: source,
                audioUrl: data.audio_url || ""
            });
            saveHistory(history.slice(0, 20));
            updateStatCounters(source);

        } catch (error) {
            answerText.innerText = "Error connecting to AI. Please try again.";
        } finally {
            isProcessing = false;
            statusContainer.classList.add("modal-hidden");

            // Reset Button states entirely
            recordBtn.classList.remove("sending", "listening");
            micIcon.className = "fa-solid fa-microphone";
            recordBtnText.innerText = "Speak Now";
        }
    }

    // --- "ASK VIA TEXT" BUTTON FIX (NO MORE POPPING ANIMATION) ---
    function handleTextSubmit(e) {
        if (e) e.preventDefault();

        const val = textInput.value.trim();

        if (val === "") {
            // Instantly focuses the box, activating the smooth premium CSS border glow
            textInput.focus();
        } else {
            // Sends the text to the AI if it is not empty
            askQuestion(val, "text");
        }
    }

    if (textBtn) {
        textBtn.addEventListener("click", handleTextSubmit);
    }
    if (textActionBtn) {
        textActionBtn.addEventListener("click", handleTextSubmit);
    }

    // --- CLEAR BUTTON WITH WARNING ---
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            const confirmClear = confirm("This will completely reset your recent history, stats, and current chat. Continue?");
            if (confirmClear) {
                textInput.value = "";
                answerText.innerText = "Your answer will appear here...";
                audioPlayer.removeAttribute("src");
                audioPlayer.load();
                if (recognition && isListening) recognition.stop();

                localStorage.clear();
                loadStats();
                renderHistory();
            }
        });
    }

    // --- BULLETPROOF COPY BUTTON FIX ---
    if (copyBtn) {
        copyBtn.addEventListener("click", async function(e) {
            e.preventDefault();
            const textToCopy = answerText.innerText;
            if (!textToCopy || textToCopy === "Your answer will appear here..." || textToCopy === "Generating response...") return;

            const successUI = () => {
                this.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
                this.classList.add("bg-success", "text-white", "border-success");
                setTimeout(() => {
                    this.innerHTML = `<i class="fa-regular fa-copy"></i> Copy`;
                    this.classList.remove("bg-success", "text-white", "border-success");
                }, 2000);
            };

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(textToCopy);
                    successUI();
                } else {
                    throw new Error("Clipboard API not available or not secure.");
                }
            } catch (err) {
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                textArea.style.position = "fixed";
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand("copy");
                    successUI();
                } catch (e) {
                    console.error("Copy failed", e);
                }
                document.body.removeChild(textArea);
            }
        });
    }

    // --- SPEECH RECOGNITION (CONTINUOUS - WAIT FOR USER TO CLICK STOP) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && recordBtn) {
        recognition = new SpeechRecognition();

        // Wait for physical click to stop
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English for better local accuracy
        recognition.maxAlternatives = 1;

        recordBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (isProcessing) return;

            if (isListening) {
                // Manual Stop Trigger
                recognition.stop();
                return;
            }

            textInput.value = "";
            finalTranscriptChunks = "";
            recognition.start();
        });

        recognition.onstart = () => {
            isListening = true;
            recordBtn.classList.add("listening");
            recordBtn.classList.remove("sending");
            micIcon.className = "fa-solid fa-square"; // Change to Stop Square
            recordBtnText.innerText = "Stop Recording";

            statusContainer.classList.remove("modal-hidden");
            statusText.innerText = "Listening... (Click stop when done)";
        };

        // Combines chunks without cutting off
        recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            finalTranscriptChunks += finalTranscript;
            textInput.value = finalTranscriptChunks + interimTranscript;
        };

        // Triggers ONLY when user clicks Stop Recording
        recognition.onend = () => {
            isListening = false;

            // Format the final captured text
            let rawText = finalTranscriptChunks.trim();
            if (!rawText && textInput.value) rawText = textInput.value.trim();

            let finalFormattedText = formatSpokenText(rawText);
            textInput.value = finalFormattedText;

            if (finalFormattedText && !isProcessing) {
                // Switch to "Sending" Transparent State
                recordBtn.classList.remove("listening");
                recordBtn.classList.add("sending");
                micIcon.className = "fa-solid fa-spinner fa-spin";
                recordBtnText.innerText = "Sending...";

                askQuestion(finalFormattedText, "voice");
            } else {
                recordBtn.classList.remove("listening", "sending");
                micIcon.className = "fa-solid fa-microphone";
                recordBtnText.innerText = "Speak Now";
                statusContainer.classList.add("modal-hidden");
            }
        };

        recognition.onerror = (event) => {
            isListening = false;
            isProcessing = false;
            recordBtn.classList.remove("listening", "sending");
            micIcon.className = "fa-solid fa-microphone";
            recordBtnText.innerText = "Speak Now";
            statusContainer.classList.add("modal-hidden");
            console.error("Microphone error:", event.error);
        };
    }

    loadStats();
    renderHistory();
});
