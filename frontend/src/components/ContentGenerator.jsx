// src/components/ContentGenerator.jsx
// Adds inline edit mode for selected variant - user can tweak caption/hashtags/ad copy before continuing

import React, { useState } from "react";
import { apiFetch } from "../utils/api";

const platforms = ["Instagram", "LinkedIn", "X (Twitter)", "Facebook", "YouTube Shorts"];
const goals = ["Engagement", "Sales / Conversions", "Brand Awareness", "Education"];

const Pill = ({ label, active, onClick }) => (
  <button type="button" onClick={onClick} style={{
    padding: "8px 20px", borderRadius: "99px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "1px solid", transition: "all 0.15s",
    background: active ? "linear-gradient(135deg,#059669,#10b981)" : "transparent",
    borderColor: active ? "#10b981" : "#1a3028",
    color: active ? "#fff" : "#3d6b57",
    boxShadow: active ? "0 0 12px rgba(16,185,129,0.25)" : "none",
  }}>{label}</button>
);

const inputStyle = {
  width: "100%", background: "#080f0c", border: "1px solid #1a3028", borderRadius: "10px",
  padding: "12px 14px", fontSize: "13px", color: "#e2f5ee", outline: "none",
  boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.6",
};

export default function ContentGenerator({ onComplete }) {
  const [platform, setPlatform] = useState("Instagram");
  const [goal, setGoal] = useState("Engagement");
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  // Editing state — null when not editing, otherwise holds editable copy of the variant
  const [editingIndex, setEditingIndex] = useState(null);
  const [editDraft, setEditDraft] = useState(null);

  const handleGenerate = async () => {
    setLoading(true); setError(""); setVariants([]); setSelected(null); setEditingIndex(null);
    try {
      const res = await apiFetch("/api/generate-content", { method: "POST", body: JSON.stringify({ platform, goal }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      setVariants(data.variants || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── Enter edit mode for a variant ─────────────────────────────────
  const startEditing = (i, v) => {
    setEditingIndex(i);
    setSelected(i);
    setEditDraft({
      caption: v.caption,
      hashtagsText: (v.hashtags || []).join(" "),
      headline: v.adCopy?.headline || "",
      cta: v.adCopy?.cta || "",
    });
  };

  // ── Save edits back into the variants array ───────────────────────
  const saveEdit = (i) => {
    const updated = [...variants];
    updated[i] = {
      ...updated[i],
      caption: editDraft.caption,
      hashtags: editDraft.hashtagsText.split(/\s+/).filter(Boolean).map((h) => (h.startsWith("#") ? h : `#${h}`)),
      adCopy: { headline: editDraft.headline, cta: editDraft.cta },
    };
    setVariants(updated);
    setEditingIndex(null);
    setEditDraft(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditDraft(null);
  };

  const handleContinue = () => {
    if (selected === null) { setError("Please select a variant to continue"); return; }
    if (editingIndex !== null) { setError("Please save or cancel your edits first"); return; }
    if (onComplete) onComplete({ platform, goal, content: variants[selected] });
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", background: "linear-gradient(135deg,#111d18,#0d1a15)", border: "1px solid #1a3028", borderRadius: "20px", padding: "36px 40px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>✨</div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#e2f5ee", margin: 0 }}>Generate Content</h2>
        </div>
        <p style={{ fontSize: "13px", color: "#3d6b57", margin: "0 0 24px 54px" }}>AI creates post captions + ad copy based on your brand profile.</p>
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1f4035,transparent)", marginBottom: "28px" }} />

        <div style={{ marginBottom: "22px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: "#7aad97", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Platform</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {platforms.map((p) => <Pill key={p} label={p} active={platform === p} onClick={() => setPlatform(p)} />)}
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: "#7aad97", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Goal</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {goals.map((g) => <Pill key={g} label={g} active={goal === g} onClick={() => setGoal(g)} />)}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} style={{
          width: "100%", padding: "14px", background: "linear-gradient(135deg,#059669,#10b981)", border: "none", borderRadius: "12px",
          color: "#fff", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          boxShadow: "0 4px 20px rgba(16,185,129,0.25)", letterSpacing: "0.01em",
        }}>
          {loading && <span style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
          {loading ? "Generating..." : "Generate Content"}
        </button>

        {error && (
          <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid #1f4035", borderRadius: "10px", padding: "12px 16px", marginTop: "14px" }}>
            <p style={{ color: "#34d399", fontSize: "13px", margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        {variants.length > 0 && (
          <div style={{ marginTop: "28px" }}>
            <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1f4035,transparent)", marginBottom: "22px" }} />
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#7aad97", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "14px" }}>Select a variant — edit if needed</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {variants.map((v, i) => {
                const active = selected === i;
                const isEditing = editingIndex === i;

                // ── EDIT MODE for this card ───────────────────────
                if (isEditing) {
                  return (
                    <div key={i} style={{
                      border: "1px solid #10b981", borderRadius: "14px", padding: "18px 20px",
                      background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))",
                      boxShadow: "0 0 0 1px rgba(16,185,129,0.2), 0 4px 20px rgba(16,185,129,0.1)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                        <span style={{ fontSize: "14px" }}>✏️</span>
                        <p style={{ fontSize: "12px", fontWeight: "700", color: "#6ee7b7", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>Editing</p>
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#7aad97", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Caption</label>
                        <textarea
                          value={editDraft.caption}
                          onChange={(e) => setEditDraft((p) => ({ ...p, caption: e.target.value }))}
                          rows={3}
                          style={{ ...inputStyle, resize: "vertical", minHeight: "70px" }}
                        />
                      </div>

                      <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#7aad97", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hashtags <span style={{ color: "#1f4035", fontWeight: "400" }}>(space separated)</span></label>
                        <input
                          value={editDraft.hashtagsText}
                          onChange={(e) => setEditDraft((p) => ({ ...p, hashtagsText: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#7aad97", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ad Headline</label>
                          <input
                            value={editDraft.headline}
                            onChange={(e) => setEditDraft((p) => ({ ...p, headline: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: "#7aad97", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>CTA</label>
                          <input
                            value={editDraft.cta}
                            onChange={(e) => setEditDraft((p) => ({ ...p, cta: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => saveEdit(i)} style={{
                          flex: 1, padding: "10px", background: "linear-gradient(135deg,#059669,#10b981)",
                          border: "none", borderRadius: "8px", color: "#fff", fontSize: "13px", fontWeight: "700", cursor: "pointer",
                        }}>
                          ✓ Save Changes
                        </button>
                        <button onClick={cancelEdit} style={{
                          flex: 1, padding: "10px", background: "transparent",
                          border: "1px solid #1a3028", borderRadius: "8px", color: "#3d6b57", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                        }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                // ── NORMAL VIEW MODE for this card ────────────────
                return (
                  <div key={i} style={{
                    border: `1px solid ${active ? "#10b981" : "#1a3028"}`,
                    borderRadius: "14px", padding: "18px 20px", transition: "all 0.15s",
                    background: active ? "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(5,150,105,0.04))" : "#080f0c",
                    boxShadow: active ? "0 0 0 1px rgba(16,185,129,0.15), 0 4px 16px rgba(16,185,129,0.08)" : "none",
                  }}>
                    <div onClick={() => setSelected(i)} style={{ cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", marginBottom: "10px" }}>
                        <p style={{ fontSize: "14px", color: "#e2f5ee", margin: 0, lineHeight: "1.7", flex: 1 }}>{v.caption}</p>
                        {active && <span style={{ color: "#10b981", fontSize: "18px", flexShrink: 0, marginTop: "2px" }}>✓</span>}
                      </div>
                      <p style={{ fontSize: "13px", color: "#34d399", marginBottom: "12px" }}>{v.hashtags?.join(" ")}</p>
                      <div style={{ background: "#111d18", border: "1px solid #1a3028", borderRadius: "10px", padding: "12px 14px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#3d6b57", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ad Copy: </span>
                        <span style={{ fontSize: "13px", color: "#7aad97" }}>{v.adCopy?.headline} — <em style={{ color: "#6ee7b7" }}>{v.adCopy?.cta}</em></span>
                      </div>
                    </div>

                    {/* Edit button — always visible per card */}
                    <button
                      onClick={(e) => { e.stopPropagation(); startEditing(i, v); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        background: "rgba(16,185,129,0.06)", border: "1px solid #1a3028",
                        borderRadius: "8px", padding: "6px 14px", color: "#7aad97",
                        fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)"; e.currentTarget.style.color = "#34d399"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a3028"; e.currentTarget.style.color = "#7aad97"; }}
                    >
                      ✏️ Edit this variant
                    </button>
                  </div>
                );
              })}
            </div>

            <button onClick={handleContinue} style={{
              width: "100%", marginTop: "16px", padding: "14px",
              background: "linear-gradient(135deg,#065f46,#059669)", border: "1px solid rgba(16,185,129,0.4)",
              borderRadius: "12px", color: "#6ee7b7", fontSize: "15px", fontWeight: "700", cursor: "pointer",
              letterSpacing: "0.01em",
            }}>
              Continue to Style Selection →
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}