// src/components/ContentCalendar.jsx
// Real multi-post calendar — shows ALL scheduled posts in a month grid.
// Clicking a day lets you schedule the current draft content for that day,
// and multiple posts can exist on the same day.

import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const BEST_TIMES = { Instagram: "11:00 AM", LinkedIn: "9:00 AM", "X (Twitter)": "1:00 PM", Facebook: "3:00 PM", "YouTube Shorts": "6:00 PM" };

const PLATFORM_COLORS = {
  Instagram: "#e1306c",
  LinkedIn: "#0077b5",
  "X (Twitter)": "#1da1f2",
  Facebook: "#1877f2",
  "YouTube Shorts": "#ff0000",
};

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startWeekday = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.toDateString() === new Date(b).toDateString();
}

export default function ContentCalendar({ contentData, onComplete }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [allPosts, setAllPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [selectedDay, setSelectedDay] = useState(null); // Date clicked on grid
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(BEST_TIMES[contentData?.platform] || "11:00 AM");
  const [overriding, setOverriding] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmedMsg, setConfirmedMsg] = useState("");

  const platform = contentData?.platform || "Instagram";

  // Load all existing scheduled posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await apiFetch("/api/publish");
        if (res.ok) {
          const data = await res.json();
          setAllPosts(data.posts || []);
        }
      } catch (err) { console.error("Failed to load posts:", err); }
      finally { setLoadingPosts(false); }
    };
    loadPosts();
  }, []);

  const grid = getMonthGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const getPostsForDay = (day) => {
    if (!day) return [];
    return allPosts.filter((p) => p.scheduledDate && isSameDay(day, p.scheduledDate));
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const openScheduleModal = (day) => {
    setSelectedDay(day);
    setScheduledTime(BEST_TIMES[platform] || "11:00 AM");
    setOverriding(false);
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async () => {
    if (!selectedDay) return;
    setConfirming(true);
    try {
      const res = await apiFetch("/api/publish", {
        method: "POST",
        body: JSON.stringify({
          platform,
          caption: contentData?.content?.caption,
          hashtags: contentData?.content?.hashtags,
          adCopy: contentData?.content?.adCopy,
          style: contentData?.style,
          goal: contentData?.goal,
          scheduledDate: selectedDay.toDateString(),
          scheduledTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule");

      setAllPosts((prev) => [data.post, ...prev]);
      setConfirmedMsg(`Scheduled for ${selectedDay.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${scheduledTime}`);
      setShowScheduleModal(false);

      if (onComplete) onComplete({ ...contentData, scheduledDate: selectedDay.toDateString(), scheduledTime });
    } catch (err) {
      alert(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", background: "linear-gradient(135deg,#111d18,#0d1a15)", border: "1px solid #1a3028", borderRadius: "20px", padding: "32px 36px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📅</div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#e2f5ee", margin: 0 }}>Content Calendar</h2>
          </div>
        </div>
        <p style={{ fontSize: "13px", color: "#3d6b57", margin: "0 0 24px 54px" }}>
          Click any day to schedule your current draft. You can schedule multiple posts per day.
        </p>
        <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,#1f4035,transparent)", marginBottom: "24px" }} />

        {confirmedMsg && (
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
            <p style={{ color: "#34d399", fontSize: "13px", margin: 0 }}>✅ {confirmedMsg}</p>
          </div>
        )}

        {/* Current draft preview */}
        <div style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "12px", padding: "14px 16px", marginBottom: "24px" }}>
          <p style={{ fontSize: "10px", fontWeight: "700", color: "#3d6b57", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>Current draft — {platform}</p>
          <p style={{ fontSize: "13px", color: "#e2f5ee", margin: 0, lineHeight: "1.6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {contentData?.content?.caption || "No content yet"}
          </p>
        </div>

        {/* Month navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <button onClick={goToPrevMonth} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "8px", width: "34px", height: "34px", color: "#7aad97", fontSize: "16px", cursor: "pointer" }}>‹</button>
          <p style={{ fontSize: "15px", fontWeight: "700", color: "#e2f5ee", margin: 0 }}>{monthLabel}</p>
          <button onClick={goToNextMonth} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "8px", width: "34px", height: "34px", color: "#7aad97", fontSize: "16px", cursor: "pointer" }}>›</button>
        </div>

        {/* Weekday labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "6px", marginBottom: "6px" }}>
          {weekdayLabels.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#3d6b57", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "6px", marginBottom: "8px" }}>
          {grid.map((day, idx) => {
            const isToday = day && isSameDay(day, today);
            const dayPosts = getPostsForDay(day);

            return (
              <div
                key={idx}
                onClick={() => day && openScheduleModal(day)}
                style={{
                  minHeight: "76px",
                  background: day ? "#080f0c" : "transparent",
                  border: day ? `1px solid ${isToday ? "rgba(16,185,129,0.4)" : "#1a3028"}` : "none",
                  borderRadius: "10px",
                  padding: "6px",
                  cursor: day ? "pointer" : "default",
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (day) e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; }}
                onMouseLeave={(e) => { if (day) e.currentTarget.style.borderColor = isToday ? "rgba(16,185,129,0.4)" : "#1a3028"; }}
              >
                {day && (
                  <>
                    <p style={{ fontSize: "11px", fontWeight: isToday ? "800" : "600", color: isToday ? "#10b981" : "#7aad97", margin: "0 0 4px" }}>
                      {day.getDate()}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {dayPosts.slice(0, 2).map((p, i) => (
                        <div key={i} style={{
                          fontSize: "9px", padding: "2px 5px", borderRadius: "4px",
                          background: `${PLATFORM_COLORS[p.platform] || "#10b981"}22`,
                          color: PLATFORM_COLORS[p.platform] || "#34d399",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          fontWeight: "600",
                        }}>
                          {p.scheduledTime?.split(" ")[0]} {p.platform}
                        </div>
                      ))}
                      {dayPosts.length > 2 && (
                        <p style={{ fontSize: "9px", color: "#3d6b57", margin: 0 }}>+{dayPosts.length - 2} more</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!loadingPosts && (
          <p style={{ fontSize: "12px", color: "#3d6b57", textAlign: "center", marginTop: "16px" }}>
            {allPosts.length} post{allPosts.length !== 1 ? "s" : ""} scheduled total
          </p>
        )}
      </div>

      {/* ── Schedule Modal ───────────────────────────────────────── */}
      {showScheduleModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
        }}>
          <div style={{
            width: "100%", maxWidth: "440px", background: "linear-gradient(135deg,#111d18,#0d1a15)",
            border: "1px solid #1a3028", borderRadius: "18px", padding: "28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}>
            <p style={{ fontSize: "16px", fontWeight: "700", color: "#e2f5ee", margin: "0 0 4px" }}>
              Schedule for {selectedDay?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <p style={{ fontSize: "12px", color: "#3d6b57", margin: "0 0 20px" }}>
              {getPostsForDay(selectedDay).length > 0
                ? `${getPostsForDay(selectedDay).length} post(s) already scheduled this day — this will add another.`
                : "No posts scheduled yet for this day."}
            </p>

            {/* Existing posts on this day */}
            {getPostsForDay(selectedDay).length > 0 && (
              <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
                {getPostsForDay(selectedDay).map((p, i) => (
                  <div key={i} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "8px", padding: "8px 10px", fontSize: "11px", color: "#7aad97" }}>
                    <strong style={{ color: PLATFORM_COLORS[p.platform] }}>{p.platform}</strong> at {p.scheduledTime} — {p.caption?.slice(0, 40)}...
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: "13px", color: "#6ee7b7", margin: 0 }}>🤖 Suggested: <strong>{BEST_TIMES[platform]}</strong></p>
                <button onClick={() => setOverriding((p) => !p)} style={{ background: "none", border: "none", color: "#10b981", fontSize: "12px", fontWeight: "600", cursor: "pointer", textDecoration: "underline" }}>
                  {overriding ? "Cancel" : "Change"}
                </button>
              </div>
              {overriding && (
                <div style={{ marginTop: "10px" }}>
                  <input type="time" onChange={(e) => {
                    const [h, m] = e.target.value.split(":");
                    const hr = parseInt(h);
                    setScheduledTime(`${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`);
                  }} style={{ background: "#080f0c", border: "1px solid #1a3028", color: "#e2f5ee", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", outline: "none" }} />
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleConfirmSchedule} disabled={confirming} style={{
                flex: 1, padding: "12px", background: "linear-gradient(135deg,#059669,#10b981)",
                border: "none", borderRadius: "10px", color: "#fff", fontSize: "14px", fontWeight: "700",
                cursor: confirming ? "not-allowed" : "pointer", opacity: confirming ? 0.7 : 1,
              }}>
                {confirming ? "Scheduling..." : `Schedule at ${scheduledTime}`}
              </button>
              <button onClick={() => setShowScheduleModal(false)} style={{
                padding: "12px 20px", background: "transparent", border: "1px solid #1a3028",
                borderRadius: "10px", color: "#3d6b57", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}