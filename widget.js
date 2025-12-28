// widget.js
document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     MAIN CONTAINER (LiveChat style)
     =============================== */
  const container = document.createElement("div");
  container.id = "chat-widget-container";
  container.style.cssText = `
    position: fixed;
    bottom: 0;
    right: 0;
    width: 392px;
    height: 714px;
    max-width: 100%;
    background: transparent;
    z-index: 2147483639;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    pointer-events: auto;
  `;
  document.body.appendChild(container);

  /* ===============================
     CHAT PANEL
     =============================== */
  const chat = document.createElement("div");
  chat.id = "ai-chat";
  chat.style.cssText = `
    width: 100%;
    height: 100%;
    background: #ffffff;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 10px 40px rgba(0,0,0,0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform .25s ease, opacity .25s ease;
  `;
  container.appendChild(chat);

  /* ===============================
     HEADER
     =============================== */
  const header = document.createElement("div");
  header.style.cssText = `
    height: 56px;
    background: #0b5cff;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
  `;
  header.textContent = "Chat with us";

  const minimize = document.createElement("span");
  minimize.textContent = "—";
  minimize.style.cssText = `
    font-size: 20px;
    cursor: pointer;
    line-height: 1;
  `;
  header.appendChild(minimize);
  chat.appendChild(header);

  /* ===============================
     BODY
     =============================== */
  const body = document.createElement("div");
  body.style.cssText = `
    flex: 1;
    background: #f7f7f8;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
  `;
  chat.appendChild(body);

  const messages = document.createElement("div");
  messages.style.cssText = `
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;
  body.appendChild(messages);

  /* ===============================
     DEFAULT MESSAGE
     =============================== */
  const welcome = document.createElement("div");
  welcome.textContent = "Hi! How can I help you today?";
  welcome.style.cssText = `
    background: #0b5cff;
    color: white;
    padding: 12px 16px;
    border-radius: 18px;
    max-width: 80%;
    align-self: flex-start;
  `;
  messages.appendChild(welcome);

  /* ===============================
     OPTIONAL CONTACT INPUTS
     =============================== */
  const email = document.createElement("input");
  email.placeholder = "Email (optional)";
  email.style.cssText = `
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #ddd;
  `;
  body.appendChild(email);

  const phone = document.createElement("input");
  phone.placeholder = "Phone (optional)";
  phone.style.cssText = `
    padding: 10px;
    border-radius: 10px;
    border: 1px solid #ddd;
  `;
  body.appendChild(phone);

  const sendInfo = document.createElement("button");
  sendInfo.textContent = "Send info";
  sendInfo.style.cssText = `
    background: #0b5cff;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
  `;
  body.appendChild(sendInfo);
sendInfo.addEventListener("click", async () => {
  const emailValue = email.value.trim();
  const phoneValue = phone.value.trim();

  if (!emailValue && !phoneValue) {
    alert("Please enter an email or phone number.");
    return;
  }

  sendInfo.disabled = true;
  sendInfo.textContent = "Sending…";

  try {
    // LEAD SUBMIT
const res = await fetch("https://YOUR-DOMAIN.com/lead", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
  body: JSON.stringify({
    email: emailValue,
    phone: phoneValue,
    source: "chat-widget",
    timestamp: new Date().toISOString()
  })
});


    if (!res.ok) throw new Error("Failed");

    sendInfo.textContent = "Saved ✓";
    sendInfo.style.background = "#28a745";

    email.disabled = true;
    phone.disabled = true;

  } catch (err) {
    sendInfo.disabled = false;
    sendInfo.textContent = "Send info";
    alert("Could not save info. Try again.");
  }
});

  /* ===============================
     INPUT BAR
     =============================== */
  const input = document.createElement("input");
  input.placeholder = "Type your message…";
  input.style.cssText = `
    border: none;
    border-top: 1px solid #e5e5e5;
    padding: 14px;
    font-size: 14px;
    outline: none;
  `;
  chat.appendChild(input);

  /* ===============================
     MESSAGE HELPER
     =============================== */
  function addMessage(text, user = false) {
    const msg = document.createElement("div");
    msg.textContent = text;
    msg.style.cssText = `
      padding: 12px 16px;
      border-radius: 18px;
      max-width: 80%;
      align-self: ${user ? "flex-end" : "flex-start"};
      background: ${user ? "#e6f0ff" : "#0b5cff"};
      color: ${user ? "#000" : "#fff"};
    `;
    messages.appendChild(msg);
    body.scrollTop = body.scrollHeight;
  }

  /* ===============================
     SEND MESSAGE
     =============================== */
  input.addEventListener("keydown", async e => {
    if (e.key !== "Enter" || !input.value.trim()) return;

    const msg = input.value;
    input.value = "";
    addMessage(msg, true);

    try {
      // CHAT MESSAGE
const res = await fetch("https://confidently-unobligative-aura.ngrok-free.dev/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
  body: JSON.stringify({ message: msg })
});

      const data = await res.json();
      addMessage(data.reply || "…");
    } catch {
      addMessage("Something went wrong.");
    }
  });

  /* ===============================
     MINIMIZE
     =============================== */
  let minimized = false;
  minimize.onclick = e => {
    e.stopPropagation();
    minimized = !minimized;
    chat.style.transform = minimized ? "translateY(92%)" : "translateY(0)";
  };

});
