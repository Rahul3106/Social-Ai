// src/components/PublishPanel.jsx — uses apiFetch with JWT token

import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const PLATFORM_META = {
  Instagram: { icon: "📷", color: "#e1306c", oauthPath: "/api/auth/instagram" },
  "YouTube Shorts": { icon: "▶️", color: "#ff0000", oauthPath: "/api/auth/youtube" },
  LinkedIn: { icon: "💼", color: "#0077b5", oauthPath: null },
  Facebook: { icon: "👍", color: "#1877f2", oauthPath: null },
  "X (Twitter)": { icon: "✖️", color: "#1da1f2", oauthPath: null },
};

export default function PublishPanel({ contentData, onPublished }) {
  const [connections, setConnections] = useState({
    Instagram: false, LinkedIn: false, "X (Twitter)": false, Facebook: false, "YouTube Shorts": false,
  });
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const platform = contentData?.platform || "Instagram";

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiFetch("/api/auth/status");
        const data = await res.json();
        setConnections({
          Instagram: data.instagram?.connected || false,
          "YouTube Shorts": data.youtube?.connected || false,
          LinkedIn: data.linkedin?.connected || false,
          Facebook: data.facebook?.connected || false,
          "X (Twitter)": data.twitter?.connected || false,
        });
      } catch (err) { console.error("Failed to check auth status:", err); }
    };
    checkStatus();

    const params = new URLSearchParams(window.location.search);
    if (params.get("connected")) {
      setStatusMsg(`✅ ${params.get("connected")} connected successfully!`);
      window.history.replaceState({}, "", window.location.pathname);
      checkStatus();
    }
    if (params.get("error")) {
      setError(`Connection failed: ${params.get("error").replace(/_/g, " ")}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnect = (p) => {
    const meta = PLATFORM_META[p];
    if (connections[p]) {
      apiFetch(`/api/auth/disconnect/${p.toLowerCase().replace(/\s+/g, "")}`, { method: "DELETE" })
        .then(() => setConnections((prev) => ({ ...prev, [p]: false })));
      return;
    }
    if (meta.oauthPath) {
      const token = localStorage.getItem("socialai_token");
      window.location.href = `${meta.oauthPath}?token=${token}`;
    } else {
      setError(`${p} integration coming soon. Instagram and YouTube are currently supported.`);
    }
  };

  const handlePublish = async () => {
    if (!connections[platform]) { setError(`Connect your ${platform} account first.`); return; }
    setError(""); setPublishing(true);
    try {
      const res = await apiFetch("/api/publish", {
        method: "POST",
        body: JSON.stringify({
          platform, caption: contentData?.content?.caption, hashtags: contentData?.content?.hashtags,
          adCopy: contentData?.content?.adCopy, style: contentData?.style, goal: contentData?.goal,
          scheduledDate: contentData?.scheduledDate, scheduledTime: contentData?.scheduledTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publishing failed");
      setPublished(true);
      setStatusMsg(data.message);
      if (onPublished) onPublished(data.post);
    } catch (err) { setError(err.message); }
    finally { setPublishing(false); }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", background: "linear-gradient(135deg,#111d18,#0d1a15)", border: "1px solid #1a3028", borderRadius: "20px", padding: "36px 40px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🚀</div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#e2f5ee", margin: 0 }}>Publishing</h2>
        </div>
        <p style={{ fontSize: "13px", color: "#3d6b57", margin: "0 0 6px 54px" }}>Connect your accounts and schedule or publish your content.</p>
        <p style={{ fontSize: "12px", color: "#1f4035", margin: "0 0 24px 54px" }}>✦ Instagram and YouTube Shorts support real publishing</p>
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1f4035,transparent)", marginBottom: "28px" }} />

        {statusMsg && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
            <p style={{ color: "#34d399", fontSize: "13px", margin: 0 }}>{statusMsg}</p>
          </div>
        )}

        <p style={{ fontSize: "11px", fontWeight: "700", color: "#7aad97", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>Your Accounts</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
          {Object.keys(connections).map((p) => {
            const connected = connections[p];
            const isSelected = p === platform;
            const meta = PLATFORM_META[p];
            const hasRealOAuth = !!meta.oauthPath;

            return (
              <div key={p} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: isSelected ? "rgba(16,185,129,0.05)" : "#080f0c",
                border: `1px solid ${isSelected ? "rgba(16,185,129,0.25)" : "#1a3028"}`,
                borderRadius: "12px", padding: "14px 18px", transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "20px" }}>{meta.icon}</span>
                  <div>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#e2f5ee" }}>{p}</span>
                    {!hasRealOAuth && <span style={{ fontSize: "10px", color: "#1f4035", marginLeft: "8px" }}>coming soon</span>}
                  </div>
                  {isSelected && (
                    <span style={{ fontSize: "10px", fontWeight: "700", background: "rgba(16,185,129,0.12)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)", padding: "3px 10px", borderRadius: "99px" }}>SELECTED</span>
                  )}
                </div>
                <button onClick={() => handleConnect(p)} style={{
                  fontSize: "12px", fontWeight: "700", padding: "7px 18px", borderRadius: "99px", cursor: hasRealOAuth || connected ? "pointer" : "default", border: "1px solid", transition: "all 0.15s",
                  background: connected ? "rgba(16,185,129,0.12)" : "transparent",
                  borderColor: connected ? "rgba(16,185,129,0.35)" : "#1a3028",
                  color: connected ? "#34d399" : !hasRealOAuth ? "#1f4035" : "#7aad97",
                  boxShadow: connected ? "0 0 8px rgba(16,185,129,0.15)" : "none",
                  opacity: !hasRealOAuth && !connected ? 0.4 : 1,
                }}>
                  {connected ? "Disconnect" : hasRealOAuth ? "Connect →" : "Coming soon"}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1f4035,transparent)", marginBottom: "24px" }} />

        <p style={{ fontSize: "11px", fontWeight: "700", color: "#7aad97", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>Post Preview</p>
        <div style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "14px", padding: "18px 20px", marginBottom: "24px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", color: "#3d6b57", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>{platform}</p>
          <p style={{ fontSize: "14px", color: "#e2f5ee", margin: "0 0 8px", lineHeight: "1.7" }}>{contentData?.content?.caption}</p>
          <p style={{ fontSize: "13px", color: "#34d399", margin: "0 0 10px" }}>{contentData?.content?.hashtags?.join(" ")}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "10px", borderTop: "1px solid #1a3028" }}>
            <span style={{ fontSize: "12px", color: "#3d6b57" }}>
              📅 {contentData?.scheduledDate ? new Date(contentData.scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—"} at {contentData?.scheduledTime || "—"}
            </span>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
            <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        {published ? (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "14px", padding: "28px", textAlign: "center" }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>✅</div>
            <p style={{ color: "#6ee7b7", fontWeight: "700", fontSize: "16px", margin: "0 0 6px" }}>Post Scheduled Successfully!</p>
            <p style={{ color: "#3d6b57", fontSize: "13px", margin: 0 }}>Goes live on {platform} at the scheduled time.</p>
          </div>
        ) : (
          <button onClick={handlePublish} disabled={publishing} style={{
            width: "100%", padding: "14px", background: "linear-gradient(135deg,#059669,#10b981)", border: "none", borderRadius: "12px",
            color: "#fff", fontSize: "15px", fontWeight: "700", cursor: publishing ? "not-allowed" : "pointer",
            opacity: publishing ? 0.7 : 1, boxShadow: "0 4px 20px rgba(16,185,129,0.25)", letterSpacing: "0.01em",
          }}>
            {publishing ? "Publishing..." : `Schedule Post on ${platform} 🚀`}
          </button>
        )}
      </div>
    </div>
  );
}