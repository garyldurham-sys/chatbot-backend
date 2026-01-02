document.addEventListener("DOMContentLoaded", async () => {
  const backendUrl = "https://YOUR-RENDER-URL.onrender.com"; // keep your real backend URL

  /* ==========================
     CREATE CHAT CONTAINER
  ========================== */
  const container = document.createElement("div");
  container.id = "ai-chat-container";
  container.innerHTML = `
    <div id="ai-chat-header">
      <span>Chat with us</span>
      <button id="ai-chat-minimize">–</button>
    </div>

    <div id="ai-chat-body">
      <div id="ai-chat-messages"></div>

      <div id="ai-chat-input-wrap">
        <input id="ai-chat-input" placeholder="Type your message..." />
        <button id="ai-chat-send">Send</button>
      </div>

      <div id="ai-chat-lead">
        <input id="lead-email" placeholder="Email (optional)" />
        <input id="lead-phone" placeholder="Phone (optional)" />
        <button id="lead-send">Send Info</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  /* ==========================
     STYLES
  ========================== */
  const style = document.createElement("style");
  style.textContent = `
    #ai-chat-container {
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 380px;
      max-height: 640px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,.15);
      display: flex;
      flex-direction: column;
      font-family: system-ui, sans-serif;
      z-index: 999999;
      overflow: hidden;
    }

    #ai-chat-header {
      background: #0f172a;
      color: #fff;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }

    #ai-chat-header button {
      background: none;
      border: none;
      color: #fff;
      font-size: 22px;
      cursor: pointer;
    }

    #ai-chat-body {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    #ai-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
    }

    .msg {
      max-width: 80%;
      margin-bottom: 10px;
      padding: 10px 14px;
      border-radius: 16px;
      line-height: 1.4;
      font-size: 14px;
    }

    .user { background: #2563eb; color: #fff; margin-left: auto; }
    .ai { background: #f1f5f9; color: #000; }

    #ai-chat-input-wrap {
      display: flex;
      border-top: 1px solid #e5e7eb;
    }

    #ai-chat-input {
      flex: 1;
      padding: 12px;
      border: none;
      outline: none;
    }

    #ai-chat-send {
      padding: 12px 16px;
      background: #2563eb;
      border: none;
      color: #fff;
      cursor: pointer;
    }

    #ai-chat-lead {
      padding: 12px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    #ai-chat-lead input,
    #ai-chat-lead button {
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #ccc;
    }

    #ai-chat-lead button {
      background: #0f172a;
      color: #fff;
      cursor: pointer;
    }

    /* ==========================
       MOBILE BEHAVIOR
    ========================== */
    @media (max-width: 640px) {
      #ai-chat-container {
        width: calc(100% - 32px);
        right: 16px;
        left: 16px;
        max-height: 90vh;
      }

      #ai-chat-container.minimized {
        height: auto;
      }

      #ai-chat-container.minimized #ai-chat-body {
        display: none;
      }
    }

    .minimized #ai-chat-body {
      display: none;
    }
  `;
  document.head.appendChild(style);

  /* ==========================
     ELEMENT REFERENCES
  ========================== */
  const messages = container.querySelector("#ai-chat-messages");
  const input = container.querySelector("#ai-chat-input");
  const sendBtn = container.querySelector("#ai-chat-send");
  const minimizeBtn = container.querySelector("#ai-chat-minimize");
  const header = container.querySelector("#ai-chat-header");
  const leadSend = container.querySelector("#lead-send");

  /* ==========================
     MOBILE DEFAULT MINIMIZED
  ========================== */
  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  if (isMobile) container.classList.add("minimized");

  /* ==========================
     TOGGLE OPEN / CLOSE
  ========================== */
  header.addEventListener("click", () => {
    container.classList.toggle("minimized");
  });

  minimizeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    container.classList.add("minimized");
  });

  /* ==========================
     DEFAULT MESSAGE
  ========================== */
  addMessage("ai", "Hi! How can I help you today?");

  /* ==========================
     CHAT FUNCTIONS
  ========================== */
  function addMessage(sender, text) {
    const div = document.createElement("div");
    div.className = `msg ${sender}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage("user", text);
    input.value = "";

    try {
      const res = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      addMessage("ai", data.reply);
    } catch {
      addMessage("ai", "Sorry, something went wrong.");
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => e.key === "Enter" && sendMessage());

  /* ==========================
     LEAD SUBMIT
  ========================== */
  leadSend.addEventListener("click", async () => {
    const email = container.querySelector("#lead-email").value;
    const phone = container.querySelector("#lead-phone").value;

    if (!email && !phone) return;

    try {
      await fetch(`${backendUrl}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone })
      });
      addMessage("ai", "Thanks! We’ll be in touch.");
    } catch {
      addMessage("ai", "Could not save info. Try again.");
    }
  });
});
