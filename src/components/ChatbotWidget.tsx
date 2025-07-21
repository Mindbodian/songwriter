import React, { useState } from "react";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: "bot", text: "Hi! How can I help you?" }]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    // Simple canned response (replace with real AI call if desired)
    setTimeout(() => {
      setMessages(msgs => [...msgs, { from: "bot", text: "I'm just a demo bot, but I'm here to help!" }]);
    }, 600);
    setInput("");
  };

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 99999,
      width: open ? 320 : 60, height: open ? 400 : 60,
      background: "#222", borderRadius: 16, boxShadow: "0 2px 16px #0008",
      transition: "width 0.2s, height 0.2s"
    }}>
      {open ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ background: "#ff1744", color: "#fff", padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, fontWeight: 700 }}>
            Chatbot <button onClick={() => setOpen(false)} style={{ float: "right", background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 12, background: "#222" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ margin: "8px 0", textAlign: msg.from === "user" ? "right" : "left" }}>
                <span style={{
                  display: "inline-block",
                  background: msg.from === "user" ? "#ffea00" : "#fff",
                  color: "#222",
                  borderRadius: 12,
                  padding: "6px 12px",
                  maxWidth: 200
                }}>{msg.text}</span>
              </div>
            ))}
          </div>
          <div style={{ padding: 8, background: "#111" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              style={{ width: "75%", borderRadius: 8, border: "none", padding: 8, marginRight: 8 }}
              placeholder="Type your question..."
            />
            <button onClick={handleSend} style={{ padding: "8px 16px", borderRadius: 8, background: "#ff1744", color: "#fff", border: "none" }}>Send</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{
          width: 60, height: 60, borderRadius: "50%", background: "#ff1744", color: "#fff", border: "none", fontSize: 28, cursor: "pointer"
        }}>💬</button>
      )}
    </div>
  );
} 