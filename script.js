// --- 1. API & DOM SETUP ---
let API_KEY = localStorage.getItem("jarvis_api_key");
if (!API_KEY) {
  API_KEY = prompt("Enter your Gemini API Key:");
  if (API_KEY) localStorage.setItem("jarvis_api_key", API_KEY.trim());
}
  }'

const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic");

// --- 2. HELPER TO ADD MESSAGES TO CHAT ---
function add(text, cls = "") {
  const div = document.createElement("div");
  div.className = cls;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// --- 3. GEMINI AI CONNECTION ---
async function askGemini(promptText) {
  if (!API_KEY) {
    add("J.A.R.V.I.S: ERROR - No API Key found. Refresh page to enter it.");
    return;
  }
  add("J.A.R.V.I.S: THINKING...");
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      }
    );

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    const reply = data.candidates[0].content.parts[0].text;
    chat.lastChild.innerText = "J.A.R.V.I.S: " + reply;
    speak(reply);
  } catch (e) {
    chat.lastChild.innerText = "J.A.R.V.I.S: ERROR - " + e.message;
  }
}

// --- 4. SEND BUTTON & ENTER KEY ---
function handleSend() {
  const text = msgInput.value.trim();
  if (!text) return;
  add("YOU: " + text, "user");
  msgInput.value = "";
  askGemini(text);
}

if (sendBtn) sendBtn.onclick = handleSend;
if (msgInput) {
  msgInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
  });
}

// --- 5. SPEECH RECOGNITION (MIC) ---
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SR) {
  const rec = new SR();
  rec.lang = "en-US";

  rec.onresult = (e) => {
    const t = e.results[0][0].transcript;
    add("YOU: " + t, "user");
    askGemini(t);
  };

  if (micBtn) {
    micBtn.onclick = () => {
      rec.start();
      micBtn.innerText = "LISTENING...";
    };
  }

  rec.onend = () => {
    if (micBtn) micBtn.innerText = "🎤";
  };
}

// --- 6. TEXT-TO-SPEECH (VOICE) ---
let voices = [];
function loadVoices() {
  voices = speechSynthesis.getVoices();
}
loadVoices();
speechSynthesis.onvoiceschanged = loadVoices;

function speak(t) {
  const u = new SpeechSynthesisUtterance(t);
  u.rate = 1.05;
  u.pitch = 0.85;
  if (voices.length > 0) {
    u.voice = voices.find(v => v.lang.includes("en")) || voices[0];
  }
  speechSynthesis.speak(u);
}
