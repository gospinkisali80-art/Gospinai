const chat = document.getElementById("chat");
const input = document.getElementById("message");
const button = document.getElementById("send");

function sendMessage() {
    let message = input.value.trim();
    if (message === "") return;

    // 1. Render User Message Bubble
    chat.innerHTML += `<div class="message user-msg">${escapeHtml(message)}</div>`;
    input.value = "";
    scrollToBottom();

    // 2. Render Temporary "AI is typing..." Indicator
    const typingId = "typing-" + Date.now();
    chat.innerHTML += `
        <div class="message ai-msg" id="${typingId}">
            <div class="typing-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    `;
    scrollToBottom();

    // 3. Request AI response from Flask backend
    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
    })
    .then(res => res.json())
    .then(data => {
        // Remove typing indicator
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();

        // Parse Markdown formatting (bold, headers, tables)
        let formattedReply = marked.parse(data.reply);

        // Render AI Message Bubble
        chat.innerHTML += `<div class="message ai-msg">${formattedReply}</div>`;
        scrollToBottom();
    })
    .catch(err => {
        console.error("Error:", err);
        const typingElem = document.getElementById(typingId);
        if (typingElem) typingElem.remove();

        chat.innerHTML += `<div class="message ai-msg" style="color:#ff6b6b;">Failed to connect to backend server.</div>`;
        scrollToBottom();
    });
}

// Helper: Scroll to bottom of chat
function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
}

// Helper: Prevent HTML injection from user input
function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Event Listeners
button.onclick = sendMessage;
input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});
