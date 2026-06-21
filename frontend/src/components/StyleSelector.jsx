// ═══════════════════════════════════════════════════════
// FILE: src/components/StyleSelector.jsx — Obsidian Green
// ═══════════════════════════════════════════════════════
import React, { useState } from "react";
 
const STYLES = [
  { id: "minimal", name: "Minimal", desc: "Clean, white space, simple type", preview: "bg-gray-100 text-gray-900", accent: "#6b7280" },
  { id: "bold", name: "Bold", desc: "High contrast, vibrant colors", preview: "bg-yellow-300 text-black", accent: "#000000" },
  { id: "playful", name: "Playful", desc: "Gradients, bright, fun", preview: "linear-gradient(135deg,#f472b6,#a855f7)", accent: "#ec4899" },
  { id: "corporate", name: "Corporate", desc: "Professional, structured", preview: "#1d4ed8", accent: "#1e40af" },
  { id: "luxury", name: "Luxury", desc: "Black & gold, elegant", preview: "#000000", accent: "#d97706" },
  { id: "earthy", name: "Earthy", desc: "Warm tones, organic", preview: "linear-gradient(135deg,#d97706,#92400e)", accent: "#d97706" },
];
 
const card = { background: "linear-gradient(135deg, #111d18, #0d1a15)", border: "1px solid #1a3028", borderRadius: "16px", padding: "28px" };
 
export default function StyleSelector({ onComplete }) {
  const [selected, setSelected] = useState(null);
 
  return (
    <div style={{ maxWidth: "640px" }}>
      <div style={card}>
        <div style={{ marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #1a3028" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🎨</div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>Choose a Style</h2>
          </div>
          <p style={{ fontSize: "13px", color: "#3d6b57", margin: 0 }}>Pick a visual theme for your post layouts and images.</p>
        </div>
 
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
          {STYLES.map((s) => {
            const active = selected === s.id;
            const isGradient = s.preview.startsWith("linear");
            return (
              <div key={s.id} onClick={() => setSelected(s.id)} style={{
                cursor: "pointer", borderRadius: "12px", overflow: "hidden",
                border: `2px solid ${active ? "#10b981" : "#1a3028"}`,
                boxShadow: active ? "0 0 0 1px rgba(16,185,129,0.25), 0 0 12px rgba(16,185,129,0.1)" : "none",
                transition: "all 0.15s",
              }}>
                <div style={{
                  height: "72px", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", fontWeight: "800", color: s.preview === "#000000" ? "#d97706" : "#fff",
                  background: isGradient ? s.preview : s.preview,
                }}>Aa</div>
                <div style={{ padding: "10px 10px 12px", background: "#0a1510" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.accent }} />
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>{s.name}</p>
                  </div>
                  <p style={{ fontSize: "10px", color: "#3d6b57", margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
 
        <button onClick={() => { if (selected && onComplete) onComplete({ style: STYLES.find((s) => s.id === selected) }); }} disabled={!selected} style={{
          width: "100%", padding: "12px", background: selected ? "linear-gradient(135deg,#059669,#10b981)" : "#0d1a15",
          border: `1px solid ${selected ? "#10b981" : "#1a3028"}`, borderRadius: "10px",
          color: selected ? "#fff" : "#1f4035", fontSize: "14px", fontWeight: "700", cursor: selected ? "pointer" : "not-allowed",
        }}>
          Continue to Calendar →
        </button>
      </div>
    </div>
  );
}