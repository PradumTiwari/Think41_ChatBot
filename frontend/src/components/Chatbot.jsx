import React, { useState } from "react";
import axios from "axios";

const Chatbot = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add user's message to UI
    const userMessage = { sender: "USER", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/api/chat", {
        userId,
        message: trimmed,
        conversation_id: sessionId,
      });

      const { sessionId: newSessionId, messages: [userMsg, aiMsg] } = res.data;

      // Set session ID if it's first message
      if (!sessionId) setSessionId(newSessionId);

      // Replace the last message (user input) with consistent backend version, then add AI reply
      setMessages((prev) => [...prev.slice(0, -1), userMsg, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "AI", content: "❌ Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbox">
      <h2>🧠 Customer Support Chat</h2>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender.toLowerCase()}`}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
