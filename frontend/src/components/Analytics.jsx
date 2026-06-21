// src/components/Analytics.jsx — Obsidian Green Theme

import React from "react";

const PERF = [
  { date: "Mon", reach: 1200, engagement: 85 },
  { date: "Tue", reach: 1900, engagement: 140 },
  { date: "Wed", reach: 1500, engagement: 110 },
  { date: "Thu", reach: 2400, engagement: 210 },
  { date: "Fri", reach: 2100, engagement: 180 },
  { date: "Sat", reach: 3000, engagement: 260 },
  { date: "Sun", reach: 2700, engagement: 230 },
];

const TOP_POSTS = [
  { caption: "✨ Glow up your routine with our new skincare range!", platform: "Instagram", likes: 1240, comments: 58 },
  { caption: "Behind the scenes: how we make our products 🎬", platform: "Instagram", likes: 980, comments: 41 },
  { caption: "5 skincare myths debunked 🧴", platform: "LinkedIn", likes: 540, comments: 22 },
];

const card = {
  background: "linear-gradient(135deg, #111d18, #0d1a15)",
  border: "1px solid #1a3028",
  borderRadius: "14px",
  padding: "20px",
};

function BarChart({ data, valueKey, gradientFrom, gradientTo }) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "120px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "100%",
            height: `${(d[valueKey] / max) * 100}%`,
            background: `linear-gradient(180deg, ${gradientFrom}, ${gradientTo})`,
            borderRadius: "4px 4px 0 0",
            minHeight: "4px",
            transition: "height 0.3s",
          }} />
          <span style={{ fontSize: "10px", color: "#3d6b57" }}>{d.date}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const totalReach = PERF.reduce((s, d) => s + d.reach, 0);
  const totalEng = PERF.reduce((s, d) => s + d.engagement, 0);
  const rate = ((totalEng / totalReach) * 100).toFixed(1);

  const summaryStats = [
    { label: "Total Reach (7 days)", value: totalReach.toLocaleString(), color: "#6ee7b7" },
    { label: "Total Engagement", value: totalEng.toLocaleString(), color: "#34d399" },
    { label: "Engagement Rate", value: `${rate}%`, color: "#10b981" },
  ];

  return (
    <div style={{ padding: "28px", maxWidth: "900px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>Performance Analytics</h1>
        <p style={{ fontSize: "13px", color: "#3d6b57", marginTop: "6px" }}>
          Sample data shown. Connect a platform to see real metrics.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "12px", marginBottom: "20px" }}>
        {summaryStats.map((s) => (
          <div key={s.label} style={{ ...card, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, right: 0, width: "50px", height: "50px", background: `radial-gradient(circle, ${s.color}15, transparent)` }} />
            <p style={{ fontSize: "11px", color: "#3d6b57", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: "26px", fontWeight: "700", color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: "14px", marginBottom: "20px" }}>
        <div style={card}>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#7aad97", marginBottom: "16px" }}>Reach — last 7 days</p>
          <BarChart data={PERF} valueKey="reach" gradientFrom="#34d399" gradientTo="#064e3b" />
        </div>
        <div style={card}>
          <p style={{ fontSize: "13px", fontWeight: "600", color: "#7aad97", marginBottom: "16px" }}>Engagement — last 7 days</p>
          <BarChart data={PERF} valueKey="engagement" gradientFrom="#6ee7b7" gradientTo="#065f46" />
        </div>
      </div>

      {/* Top posts */}
      <div style={card}>
        <p style={{ fontSize: "13px", fontWeight: "600", color: "#7aad97", marginBottom: "14px" }}>Top Performing Posts</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {TOP_POSTS.map((post, i) => (
            <div key={i} style={{ background: "#0a1510", border: "1px solid #1a3028", borderRadius: "10px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "13px", color: "#e2f5ee", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "340px" }}>{post.caption}</p>
                <p style={{ fontSize: "11px", color: "#3d6b57", margin: 0 }}>{post.platform}</p>
              </div>
              <div style={{ textAlign: "right", fontSize: "12px", color: "#7aad97", marginLeft: "16px" }}>
                <p style={{ margin: "0 0 2px" }}>❤️ {post.likes.toLocaleString()}</p>
                <p style={{ margin: 0 }}>💬 {post.comments}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}