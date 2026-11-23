// --- 1. API & DOM SETUP ---
const API_KEY = let API_KEY = localStorage.getItem("gemini_api_key");
if (!API_KEY) {
  API_KEY = prompt("Enter your Gemini API Key:");
  if (API_KEY) localStorage.setItem("gemini_api_key", API_KEY.trim());
}
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic"); // Make sure you have <button id="mic">🎤</button> in index.html

// --- 2. HELPER TO ADD MESSAGES TO CHAT ---
function add(text, cls = "") {
  const div = document.createElement("div");
  div.className = cls;
  div.innerText = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// --- 3. GEMINI AI CONNECTION ---
async function askGemini(prompt) {
  add("J.A.R.V.I.S: THINKING...");
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    const reply = data.candidates[0].content.parts[0].text;
    chat.lastChild.innerText = "J.A.R.V.I.S: " + reply;
    speak(reply); // Speak the reply aloud
  } catch (e) {
    chat.lastChild.innerText = "J.A.R.V.I.S: ERROR - " + e.message;
  }
}

// --- 4. SPEECH RECOGNITION (MIC) ---
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

// --- 5. TEXT-TO-SPEECH (VOICE) ---
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
  const v = voices.find((v) => v.lang.startsWith("en"));
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

// --- 6. TEXT SEND ---
sendBtn.onclick = () => {
  const t = msgInput.value.trim();
  if (!t) return;
  add("YOU: " + t, "user");
  msgInput.value = "";
  askGemini(t);
};

// Allow pressing Enter key to send
msgInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});
