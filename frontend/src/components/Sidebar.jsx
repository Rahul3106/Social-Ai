// src/components/Sidebar.jsx — with Market Agent added

import React from "react";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",       icon: "🏠" },
  { id: "create",     label: "Create Content",  icon: "✨" },
  { id: "calendar",   label: "Calendar",        icon: "📅" },
  { id: "publish",    label: "Publishing",      icon: "🚀" },
  { id: "analytics",  label: "Analytics",       icon: "📊" },
  { id: "agent",      label: "Market Agent",    icon: "🤖" },
  { id: "settings",   label: "Brand Settings",  icon: "⚙️" },
];

export default function Sidebar({ activePage, onNavigate, brandName, user, onLogout }) {
  return (
    <div style={{ width: "220px", minHeight: "100vh", background: "linear-gradient(180deg,#0d1f18 0%,#080f0c 100%)", borderRight: "1px solid #1a3028", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 16px 16px", borderBottom: "1px solid #1a3028" }}>
        <div style={{ background: "linear-gradient(135deg,#10b981,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.5px", marginBottom: "4px" }}>SocialAI</div>
        {brandName && <div style={{ fontSize: "11px", color: "#3d6b57", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brandName}</div>}
      </div>

      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {NAV_ITEMS.map((item) => {
          const active = activePage === item.id;
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 12px",
              borderRadius: "10px", border: active ? "1px solid #1f4035" : "1px solid transparent",
              background: active ? "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.08))" : "transparent",
              color: active ? "#6ee7b7" : "#3d6b57", fontSize: "13px", fontWeight: active ? "600" : "400",
              cursor: "pointer", marginBottom: "2px", transition: "all 0.15s", textAlign: "left",
            }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(16,185,129,0.06)"; e.currentTarget.style.color = "#7aad97"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#3d6b57"; } }}
            >
              <span style={{ fontSize: "15px" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {user && (
        <div style={{ padding: "12px 10px", borderTop: "1px solid #1a3028" }}>
          <div style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "10px", padding: "10px 12px", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: "#fff", flexShrink: 0 }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ fontSize: "12px", fontWeight: "600", color: "#e2f5ee", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</p>
                <p style={{ fontSize: "10px", color: "#3d6b57", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
              </div>
            </div>
          </div>
          <button onClick={onLogout} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", background: "transparent", border: "1px solid #1a3028", color: "#3d6b57", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1a3028"; e.currentTarget.style.color = "#3d6b57"; e.currentTarget.style.background = "transparent"; }}
          >🚪 Sign Out</button>
          <p style={{ fontSize: "10px", color: "#1f4035", textAlign: "center", marginTop: "10px", marginBottom: 0 }}>Hackfluence 2026 ✦</p>
        </div>
      )}
    </div>
  );
}