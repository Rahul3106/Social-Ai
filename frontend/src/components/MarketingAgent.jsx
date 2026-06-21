// src/components/MarketingAgent.jsx
// Digital Marketing Agent — full page with web scraping + AI analysis + chat

import React, { useState, useRef, useEffect } from "react";
import { apiFetch } from "../utils/api";

const S = {
  card: { width: "100%", background: "linear-gradient(135deg,#111d18,#0d1a15)", border: "1px solid #1a3028", borderRadius: "20px", padding: "28px 32px", marginBottom: "16px" },
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#7aad97", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.07em" },
  input: { width: "100%", background: "#080f0c", border: "1px solid #1a3028", borderRadius: "10px", padding: "11px 14px", fontSize: "13px", color: "#e2f5ee", outline: "none", boxSizing: "border-box" },
  tag: { display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "99px", padding: "4px 12px", fontSize: "12px", color: "#34d399", margin: "3px" },
};

function PriorityBadge({ priority }) {
  const colors = { High: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" }, Medium: { bg: "rgba(251,146,60,0.1)", color: "#fb923c", border: "rgba(251,146,60,0.3)" }, Low: { bg: "rgba(16,185,129,0.1)", color: "#34d399", border: "rgba(16,185,129,0.3)" } };
  const c = colors[priority] || colors.Low;
  return <span style={{ fontSize: "10px", fontWeight: "700", background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: "2px 8px", borderRadius: "99px" }}>{priority}</span>;
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
      <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{icon}</div>
      <p style={{ fontSize: "15px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>{title}</p>
    </div>
  );
}

export default function MarketingAgent() {
  const [productDesc, setProductDesc] = useState("");
  const [competitors, setCompetitors] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("strategy");

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: "assistant", text: "Analysis ready! Ask me anything about the market data, competitors, or content strategy." }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const addCompetitor = () => setCompetitors((p) => [...p, ""]);
  const updateCompetitor = (i, val) => setCompetitors((p) => p.map((c, idx) => idx === i ? val : c));
  const removeCompetitor = (i) => setCompetitors((p) => p.filter((_, idx) => idx !== i));

  const handleAnalyze = async () => {
    if (!productDesc.trim()) { setError("Enter a product description to analyze"); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const res = await apiFetch("/api/marketing-agent/analyze", {
        method: "POST",
        body: JSON.stringify({
          productDescription: productDesc,
          competitors: competitors.filter(c => c.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setChatOpen(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput.trim();
    setChatMessages((p) => [...p, { role: "user", text: msg }]);
    setChatInput(""); setChatLoading(true);
    try {
      const res = await apiFetch("/api/marketing-agent/chat", {
        method: "POST",
        body: JSON.stringify({ message: msg, analysisContext: result?.analysis }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setChatMessages((p) => [...p, { role: "assistant", text: data.reply }]);
    } catch (err) { setChatMessages((p) => [...p, { role: "assistant", text: `⚠️ ${err.message}` }]); }
    finally { setChatLoading(false); }
  };

  const focus = (e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 2px rgba(16,185,129,0.12)"; };
  const blur = (e) => { e.target.style.borderColor = "#1a3028"; e.target.style.boxShadow = "none"; };

  const tabs = [
    { id: "strategy", label: "📋 Strategy" },
    { id: "trends", label: "🔥 Trends" },
    { id: "competitors", label: "🎯 Competitors" },
    { id: "content", label: "✨ Content Ideas" },
    { id: "ads", label: "📣 Ad Copy" },
    { id: "data", label: "📊 Raw Data" },
  ];

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ ...S.card }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🤖</div>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#e2f5ee", margin: 0 }}>Digital Marketing Agent</h2>
            <p style={{ fontSize: "13px", color: "#3d6b57", margin: 0 }}>Scrapes YouTube + Reddit + Web → AI analyzes market trends and gives strategy</p>
          </div>
        </div>

        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1f4035,transparent)", margin: "20px 0" }} />

        {/* Product input */}
        <div style={{ marginBottom: "16px" }}>
          <label style={S.label}>What product/niche do you want to analyze?</label>
          <textarea
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
            placeholder="e.g. Organic skincare products for women aged 18-35 in India"
            rows={2}
            style={{ ...S.input, resize: "none", lineHeight: "1.6" }}
            onFocus={focus} onBlur={blur}
          />
        </div>

        {/* Competitors */}
        <div style={{ marginBottom: "20px" }}>
          <label style={S.label}>Competitors to analyze (optional)</label>
          {competitors.map((c, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input
                value={c}
                onChange={(e) => updateCompetitor(i, e.target.value)}
                placeholder={`e.g. Mamaearth, Plum, WOW Skincare`}
                style={{ ...S.input, flex: 1 }}
                onFocus={focus} onBlur={blur}
              />
              {competitors.length > 1 && (
                <button onClick={() => removeCompetitor(i)} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "0 12px", color: "#f87171", cursor: "pointer", fontSize: "16px" }}>×</button>
              )}
            </div>
          ))}
          <button onClick={addCompetitor} style={{ background: "transparent", border: "1px dashed #1a3028", borderRadius: "8px", padding: "7px 16px", color: "#3d6b57", fontSize: "12px", cursor: "pointer", marginTop: "4px" }}>
            + Add competitor
          </button>
        </div>

        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "10px 14px", marginBottom: "14px" }}><p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>⚠️ {error}</p></div>}

        <button onClick={handleAnalyze} disabled={loading} style={{
          width: "100%", padding: "14px", background: "linear-gradient(135deg,#059669,#10b981)", border: "none", borderRadius: "12px",
          color: "#fff", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          boxShadow: "0 4px 20px rgba(16,185,129,0.25)",
        }}>
          {loading && <span style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
          {loading ? "Scraping web + analyzing with AI..." : "🔍 Run Market Analysis"}
        </button>

        {loading && (
          <div style={{ marginTop: "14px", padding: "12px 16px", background: "#080f0c", borderRadius: "10px", border: "1px solid #1a3028" }}>
            <p style={{ fontSize: "12px", color: "#3d6b57", margin: 0 }}>
              🔄 Scraping YouTube trends... Reddit buzz... Web search... AI analyzing...
            </p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Market summary bar */}
          <div style={{ ...S.card, background: "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(5,150,105,0.06))", border: "1px solid rgba(16,185,129,0.25)" }}>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#34d399", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>Market Overview</p>
            <p style={{ fontSize: "14px", color: "#e2f5ee", margin: "0 0 12px", lineHeight: "1.7" }}>{result.analysis.marketSummary}</p>
            <p style={{ fontSize: "11px", fontWeight: "700", color: "#34d399", margin: "0 0 8px" }}>Quick Wins</p>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {(result.analysis.quickWins || []).map((win, i) => (
                <span key={i} style={S.tag}>✓ {win}</span>
              ))}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                background: activeTab === t.id ? "linear-gradient(135deg,#059669,#10b981)" : "#0d1a15",
                borderColor: activeTab === t.id ? "#10b981" : "#1a3028",
                color: activeTab === t.id ? "#fff" : "#7aad97",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Strategy tab */}
          {activeTab === "strategy" && (
            <div style={S.card}>
              <SectionTitle icon="📋" title="Strategy Recommendations" />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(result.analysis.strategyRecommendations || []).map((s, i) => (
                  <div key={i} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "12px", padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <PriorityBadge priority={s.priority} />
                      <p style={{ fontSize: "13px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>{s.action}</p>
                    </div>
                    <p style={{ fontSize: "12px", color: "#7aad97", margin: 0 }}>Expected: {s.expectedImpact}</p>
                  </div>
                ))}
              </div>

              <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1f4035,transparent)", margin: "20px 0" }} />
              <SectionTitle icon="⏰" title="Best Times to Post" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {Object.entries(result.analysis.bestTimeToPost || {}).map(([platform, time]) => (
                  <div key={platform} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "10px", padding: "12px 14px", textAlign: "center" }}>
                    <p style={{ fontSize: "11px", color: "#3d6b57", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{platform}</p>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#10b981", margin: 0 }}>{time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends tab */}
          {activeTab === "trends" && (
            <div style={S.card}>
              <SectionTitle icon="🔥" title="Trending Topics in Your Niche" />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(result.analysis.trendingTopics || []).map((t, i) => (
                  <div key={i} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "12px", padding: "14px 16px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "700", color: "#e2f5ee", margin: "0 0 6px" }}>🔥 {t.topic}</p>
                    <p style={{ fontSize: "12px", color: "#3d6b57", margin: "0 0 4px" }}>Evidence: {t.evidence}</p>
                    <p style={{ fontSize: "12px", color: "#34d399", margin: 0 }}>Opportunity: {t.opportunity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitors tab */}
          {activeTab === "competitors" && (
            <div style={S.card}>
              <SectionTitle icon="🎯" title="Competitor Analysis" />
              {(result.analysis.competitorInsights || []).length === 0 ? (
                <p style={{ fontSize: "13px", color: "#3d6b57" }}>No competitors were added for analysis. Add competitor names on the left and re-run.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(result.analysis.competitorInsights || []).map((c, i) => (
                    <div key={i} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "12px", padding: "16px" }}>
                      <p style={{ fontSize: "15px", fontWeight: "700", color: "#e2f5ee", margin: "0 0 10px" }}>🏢 {c.competitor}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                        <div style={{ background: "#111d18", borderRadius: "8px", padding: "10px" }}>
                          <p style={{ fontSize: "10px", fontWeight: "700", color: "#34d399", textTransform: "uppercase", margin: "0 0 4px" }}>Strength</p>
                          <p style={{ fontSize: "12px", color: "#7aad97", margin: 0 }}>{c.strength}</p>
                        </div>
                        <div style={{ background: "#111d18", borderRadius: "8px", padding: "10px" }}>
                          <p style={{ fontSize: "10px", fontWeight: "700", color: "#f87171", textTransform: "uppercase", margin: "0 0 4px" }}>Weakness</p>
                          <p style={{ fontSize: "12px", color: "#7aad97", margin: 0 }}>{c.weakness}</p>
                        </div>
                        <div style={{ background: "#111d18", borderRadius: "8px", padding: "10px" }}>
                          <p style={{ fontSize: "10px", fontWeight: "700", color: "#fb923c", textTransform: "uppercase", margin: "0 0 4px" }}>What to borrow</p>
                          <p style={{ fontSize: "12px", color: "#7aad97", margin: 0 }}>{c.whatToSteal}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content tab */}
          {activeTab === "content" && (
            <div style={S.card}>
              <SectionTitle icon="✨" title="AI Content Suggestions" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {(result.analysis.contentSuggestions || []).map((s, i) => (
                  <div key={i} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "12px", padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <span style={{ ...S.tag, margin: 0 }}>{s.platform}</span>
                      <span style={{ ...S.tag, margin: 0, background: "rgba(251,146,60,0.1)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.2)" }}>{s.format}</span>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "#e2f5ee", margin: "0 0 6px" }}>{s.topic}</p>
                    <p style={{ fontSize: "11px", color: "#3d6b57", margin: 0 }}>{s.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad copy tab */}
          {activeTab === "ads" && (
            <div style={S.card}>
              <SectionTitle icon="📣" title="AI Ad Copy Suggestions" />
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {(result.analysis.adCopySuggestions || []).map((ad, i) => (
                  <div key={i} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "12px", padding: "16px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#7aad97", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Hook</p>
                    <p style={{ fontSize: "15px", fontWeight: "700", color: "#6ee7b7", margin: "0 0 10px" }}>"{ad.hook}"</p>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#7aad97", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Body</p>
                    <p style={{ fontSize: "13px", color: "#e2f5ee", margin: "0 0 10px", lineHeight: "1.6" }}>{ad.body}</p>
                    <div style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.1),rgba(5,150,105,0.05))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "8px 12px", display: "inline-block" }}>
                      <p style={{ fontSize: "13px", fontWeight: "700", color: "#10b981", margin: 0 }}>👉 {ad.cta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw data tab */}
          {activeTab === "data" && (
            <div style={S.card}>
              <SectionTitle icon="📊" title="Raw Scraped Data" />

              <p style={{ fontSize: "13px", fontWeight: "700", color: "#7aad97", marginBottom: "10px" }}>YouTube — Top Videos (Last 30 days)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
                {(result.rawData?.youtubeTrends || []).map((v, i) => (
                  <div key={i} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "8px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", color: "#e2f5ee", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "500px" }}>{v.title}</p>
                      <p style={{ fontSize: "11px", color: "#3d6b57", margin: 0 }}>{v.channel}</p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "11px", color: "#7aad97", marginLeft: "12px", whiteSpace: "nowrap" }}>
                      <p style={{ margin: 0 }}>👁️ {v.views?.toLocaleString()}</p>
                      <p style={{ margin: 0 }}>❤️ {v.likes?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {!result.rawData?.youtubeTrends?.length && <p style={{ fontSize: "12px", color: "#3d6b57" }}>No YouTube data — check YOUTUBE_API_KEY in .env</p>}
              </div>

              <p style={{ fontSize: "13px", fontWeight: "700", color: "#7aad97", marginBottom: "10px" }}>Reddit — Top Posts (Last 30 days)</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(result.rawData?.redditTrends || []).map((p, i) => (
                  <div key={i} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "8px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", color: "#e2f5ee", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "500px" }}>{p.title}</p>
                      <p style={{ fontSize: "11px", color: "#3d6b57", margin: 0 }}>r/{p.subreddit}</p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "11px", color: "#7aad97", marginLeft: "12px", whiteSpace: "nowrap" }}>
                      <p style={{ margin: 0 }}>⬆️ {p.upvotes?.toLocaleString()}</p>
                      <p style={{ margin: 0 }}>💬 {p.comments}</p>
                    </div>
                  </div>
                ))}
                {!result.rawData?.redditTrends?.length && <p style={{ fontSize: "12px", color: "#3d6b57" }}>No Reddit data found for this query</p>}
              </div>
            </div>
          )}

          {/* Floating chat */}
          <div style={{ position: "fixed", bottom: "84px", right: "20px", zIndex: 999 }}>
            {chatOpen && (
              <div style={{
                width: "340px", height: "400px", background: "linear-gradient(180deg,#0d1f18,#080f0c)",
                border: "1px solid #1a3028", borderRadius: "16px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.1)",
                display: "flex", flexDirection: "column", overflow: "hidden", marginBottom: "10px",
              }}>
                <div style={{ padding: "12px 14px", borderBottom: "1px solid #1a3028", background: "rgba(16,185,129,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>🤖 Marketing Agent Chat</p>
                    <p style={{ fontSize: "10px", color: "#3d6b57", margin: 0 }}>Ask follow-up questions about the analysis</p>
                  </div>
                  <button onClick={() => setChatOpen(false)} style={{ background: "none", border: "none", color: "#3d6b57", cursor: "pointer", fontSize: "16px" }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "85%", padding: "9px 12px", borderRadius: "10px", fontSize: "12px", lineHeight: "1.5",
                        background: m.role === "user" ? "linear-gradient(135deg,#059669,#10b981)" : "#111d18",
                        color: m.role === "user" ? "#fff" : "#e2f5ee",
                        border: m.role === "user" ? "none" : "1px solid #1a3028",
                      }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && <div style={{ display: "flex", justifyContent: "flex-start" }}><div style={{ background: "#111d18", border: "1px solid #1a3028", borderRadius: "10px", padding: "9px 12px", fontSize: "12px", color: "#3d6b57" }}>Thinking...</div></div>}
                  <div ref={chatEndRef} />
                </div>

                <div style={{ padding: "8px", borderTop: "1px solid #1a3028", display: "flex", gap: "6px" }}>
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleChat()}
                    placeholder="Ask about strategy, trends..." style={{ flex: 1, background: "#080f0c", border: "1px solid #1a3028", color: "#e2f5ee", borderRadius: "8px", padding: "7px 10px", fontSize: "12px", outline: "none" }} />
                  <button onClick={handleChat} disabled={chatLoading} style={{ background: "linear-gradient(135deg,#059669,#10b981)", border: "none", color: "#fff", borderRadius: "8px", padding: "7px 12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", opacity: chatLoading ? 0.6 : 1 }}>↑</button>
                </div>
              </div>
            )}

            <button onClick={() => setChatOpen((p) => !p)} style={{
              width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg,#059669,#10b981)", border: "none",
              color: "#fff", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
            }}>
              {chatOpen ? "✕" : "🤖"}
            </button>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}