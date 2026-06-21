// src/components/Dashboard.jsx — Obsidian Green Theme

import React from "react";

const card = {
  background: "linear-gradient(135deg, #111d18, #0d1a15)",
  border: "1px solid #1a3028",
  borderRadius: "14px",
  padding: "18px",
};

export default function Dashboard({ brandProfile, scheduledPosts = [], onNavigate }) {
  const stats = [
    { label: "Scheduled Posts", value: scheduledPosts.length, icon: "📅", color: "#6ee7b7" },
    { label: "Connected Platforms", value: "1", icon: "🔗", color: "#34d399" },
    { label: "Content Generated", value: scheduledPosts.length, icon: "✨", color: "#10b981" },
    { label: "Avg. Engagement", value: "—", icon: "📈", color: "#6ee7b7" },
  ];

  const btnPrimary = {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "#fff",
    border: "none",
    padding: "9px 18px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.15s",
  };

  const btnSecondary = {
    background: "rgba(16,185,129,0.07)",
    color: "#7aad97",
    border: "1px solid #1a3028",
    padding: "9px 18px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.15s",
  };

  return (
    <div style={{ padding: "28px", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>
          Welcome back{brandProfile?.brandName ? `, ${brandProfile.brandName}` : ""} 👋
        </h1>
        <p style={{ fontSize: "13px", color: "#3d6b57", marginTop: "6px" }}>
          Here's an overview of your social media activity.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ ...card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: "60px", height: "60px", background: `radial-gradient(circle, ${s.color}18, transparent)`, borderRadius: "0 14px 0 60px" }} />
            <div style={{ fontSize: "20px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontSize: "26px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#3d6b57", marginTop: "2px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ ...card, marginBottom: "20px" }}>
        <p style={{ fontSize: "13px", fontWeight: "600", color: "#7aad97", marginBottom: "14px" }}>Quick Actions</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <button style={btnPrimary} onClick={() => onNavigate("create")}>✨ Create New Content</button>
          <button style={btnSecondary} onClick={() => onNavigate("calendar")}>📅 View Calendar</button>
          <button style={btnSecondary} onClick={() => onNavigate("analytics")}>📊 Analytics</button>
        </div>
      </div>

      {/* Gradient divider */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #1f4035, transparent)", marginBottom: "20px" }} />

      {/* Recent posts */}
      <div style={card}>
        <p style={{ fontSize: "13px", fontWeight: "600", color: "#7aad97", marginBottom: "14px" }}>Recent / Scheduled Posts</p>
        {scheduledPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>📭</div>
            <p style={{ fontSize: "13px", color: "#3d6b57" }}>No posts yet.</p>
            <button onClick={() => onNavigate("create")} style={{ marginTop: "10px", background: "none", border: "none", color: "#10b981", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}>
              Create your first post
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {scheduledPosts.map((post, i) => (
              <div key={post._id || i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#0a1510", border: "1px solid #1a3028", borderRadius: "10px", padding: "12px 14px",
              }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: "#e2f5ee", margin: "0 0 2px" }}>{post.platform}</p>
                  <p style={{ fontSize: "12px", color: "#3d6b57", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "280px" }}>
                    {post.caption || post.content?.caption}
                  </p>
                </div>
                <span style={{
                  fontSize: "11px", background: "rgba(16,185,129,0.1)", color: "#34d399",
                  border: "1px solid rgba(16,185,129,0.2)", padding: "4px 10px", borderRadius: "99px", whiteSpace: "nowrap",
                }}>
                  {post.scheduledDate ? new Date(post.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"} • {post.scheduledTime || "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}