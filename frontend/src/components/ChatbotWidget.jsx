 
// ═══════════════════════════════════════════════════════
// FILE: src/components/ChatbotWidget.jsx — Obsidian Green
// ═══════════════════════════════════════════════════════
import React, { useState, useRef, useEffect } from "react";
 
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi! Ask me anything — content ideas, trends, or try: \"How is @mrbeast doing on YouTube?\"" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
 
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);
 
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setMessages((p) => [...p, { role: "user", text: msg }]);
    setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessages((p) => [...p, { role: "assistant", text: data.reply, stats: data.channelStats }]);
    } catch (err) { setMessages((p) => [...p, { role: "assistant", text: `⚠️ ${err.message}` }]); }
    finally { setLoading(false); }
  };
 
  return (
    <>
      {/* Toggle button */}
      <button onClick={() => setOpen((p) => !p)} style={{
        position: "fixed", bottom: "20px", right: "20px", width: "52px", height: "52px", borderRadius: "50%",
        background: "linear-gradient(135deg,#059669,#10b981)", border: "none", color: "#fff",
        fontSize: "22px", cursor: "pointer", zIndex: 1000, boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.15s",
      }}>
        {open ? "✕" : "💬"}
      </button>
 
      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "84px", right: "20px", width: "340px", height: "440px",
          background: "linear-gradient(180deg,#0d1f18,#080f0c)", border: "1px solid #1a3028",
          borderRadius: "16px", boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.1)",
          display: "flex", flexDirection: "column", zIndex: 999, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1a3028", background: "rgba(16,185,129,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
              <p style={{ fontSize: "13px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>AI Co-Pilot</p>
            </div>
            <p style={{ fontSize: "11px", color: "#3d6b57", margin: "2px 0 0 16px" }}>Competitors · Trends · Content Ideas</p>
          </div>
 
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "10px 12px", borderRadius: "12px", fontSize: "13px", lineHeight: "1.5",
                  background: msg.role === "user" ? "linear-gradient(135deg,#059669,#10b981)" : "#111d18",
                  color: msg.role === "user" ? "#fff" : "#e2f5ee",
                  border: msg.role === "user" ? "none" : "1px solid #1a3028",
                }}>
                  {msg.text}
                  {msg.stats && (
                    <div style={{ marginTop: "8px", background: "#080f0c", border: "1px solid #1a3028", borderRadius: "8px", padding: "8px 10px", fontSize: "12px" }}>
                      <p style={{ fontWeight: "700", color: "#6ee7b7", margin: "0 0 4px" }}>{msg.stats.title}</p>
                      <p style={{ color: "#3d6b57", margin: "2px 0" }}>👥 {Number(msg.stats.subscribers).toLocaleString()} subscribers</p>
                      <p style={{ color: "#3d6b57", margin: "2px 0" }}>👁️ {Number(msg.stats.totalViews).toLocaleString()} views</p>
                      <p style={{ color: "#3d6b57", margin: 0 }}>🎬 {msg.stats.videoCount} videos</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#111d18", border: "1px solid #1a3028", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", color: "#3d6b57" }}>Thinking...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
 
          {/* Input */}
          <div style={{ padding: "10px", borderTop: "1px solid #1a3028", display: "flex", gap: "8px" }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              style={{ flex: 1, background: "#0a1510", border: "1px solid #1a3028", color: "#e2f5ee", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", outline: "none" }} />
            <button onClick={handleSend} disabled={loading} style={{
              background: "linear-gradient(135deg,#059669,#10b981)", border: "none", color: "#fff",
              borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: "700", cursor: "pointer", opacity: loading ? 0.6 : 1,
            }}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}
 