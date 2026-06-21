// src/App.js — with Market Agent page added

import React, { useState, useEffect } from "react";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Analytics from "./components/Analytics";
import BrandOnboarding from "./components/BrandOnboarding";
import ContentGenerator from "./components/ContentGenerator";
import StyleSelector from "./components/StyleSelector";
import ContentCalendar from "./components/ContentCalendar";
import PublishPanel from "./components/PublishPanel";
import ChatbotWidget from "./components/ChatbotWidget";
import MarketingAgent from "./components/MarketingAgent";
import { apiFetch } from "./utils/api";

const DUMMY_CONTENT = {
  platform: "Instagram", goal: "Engagement",
  content: {
    caption: "✨ Glow up your routine with our new skincare range! Made for every skin type, loved by thousands. Your skin deserves the best. 💧",
    hashtags: ["#skincare", "#glowup", "#selfcare", "#beautyroutine", "#GlowSkin"],
    adCopy: { headline: "Get Radiant Skin in 7 Days", cta: "Shop Now & Save 20%" },
  },
};

const CREATE_STEPS = { ONBOARDING: "onboarding", GENERATE: "generate", STYLE: "style" };

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [brandProfile, setBrandProfile] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(DUMMY_CONTENT);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [createStep, setCreateStep] = useState(CREATE_STEPS.ONBOARDING);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("socialai_token");
      if (!token) { setAuthLoading(false); return; }
      try {
        const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          await loadAppData();
        } else {
          localStorage.removeItem("socialai_token");
          localStorage.removeItem("socialai_user");
        }
      } catch (err) { console.error("Auth check failed:", err); }
      finally { setAuthLoading(false); }
    };
    checkAuth();
  }, []);

  const loadAppData = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([apiFetch("/api/brand-profile"), apiFetch("/api/publish")]);
      if (profileRes.ok) { const p = await profileRes.json(); setBrandProfile(p); setCreateStep(CREATE_STEPS.GENERATE); }
      if (postsRes.ok) { const d = await postsRes.json(); setScheduledPosts(d.posts || []); }
    } catch (err) { console.error("Failed to load data:", err); }
  };

  const handleAuth = async (u) => { setUser(u); await loadAppData(); };

  const handleLogout = () => {
    localStorage.removeItem("socialai_token"); localStorage.removeItem("socialai_user");
    setUser(null); setBrandProfile(null); setScheduledPosts([]);
    setActivePage("dashboard"); setCreateStep(CREATE_STEPS.ONBOARDING);
  };

  const handleNavigate = (page) => {
    setActivePage(page);
    if (page === "create") setCreateStep(brandProfile ? CREATE_STEPS.GENERATE : CREATE_STEPS.ONBOARDING);
  };

  const handleCalendarUpdate = async (data) => {
    setGeneratedContent(data);
    try { const res = await apiFetch("/api/publish"); if (res.ok) { const d = await res.json(); setScheduledPosts(d.posts || []); } } catch {}
  };

  const renderCreatePage = () => {
    if (createStep === CREATE_STEPS.ONBOARDING) return <BrandOnboarding onComplete={(p) => { setBrandProfile(p); setCreateStep(CREATE_STEPS.GENERATE); }} />;
    if (createStep === CREATE_STEPS.GENERATE) return (
      <div>
        <ContentGenerator onComplete={(data) => { setGeneratedContent(data); setCreateStep(CREATE_STEPS.STYLE); }} />
        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button onClick={() => setCreateStep(CREATE_STEPS.STYLE)} style={{ background: "none", border: "none", color: "#3d6b57", fontSize: "12px", cursor: "pointer", textDecoration: "underline" }}>Skip — use sample content for testing</button>
        </div>
      </div>
    );
    if (createStep === CREATE_STEPS.STYLE) return <StyleSelector onComplete={(data) => { setGeneratedContent((prev) => ({ ...prev, ...data })); setActivePage("calendar"); }} />;
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard brandProfile={brandProfile} scheduledPosts={scheduledPosts} onNavigate={handleNavigate} />;
      case "create": return renderCreatePage();
      case "calendar": return <ContentCalendar contentData={generatedContent} onComplete={handleCalendarUpdate} />;
      case "publish": return <PublishPanel contentData={generatedContent} onPublished={(post) => setScheduledPosts((p) => [post, ...p])} />;
      case "analytics": return <Analytics />;
      case "agent": return <MarketingAgent />;
      case "settings": return <BrandOnboarding onComplete={(p) => { setBrandProfile(p); setActivePage("dashboard"); }} />;
      default: return null;
    }
  };

  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#080f0c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "36px", height: "36px", border: "2px solid #1a3028", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#3d6b57", fontSize: "13px" }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user) return <AuthPage onAuth={handleAuth} />;

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } html, body, #root { background-color: #080f0c !important; min-height: 100vh; }`}</style>
      <div style={{ display: "flex", minHeight: "100vh", width: "100%", backgroundColor: "#080f0c" }}>
        <Sidebar activePage={activePage} onNavigate={handleNavigate} brandName={brandProfile?.brandName} user={user} onLogout={handleLogout} />
        <div style={{ flex: 1, backgroundColor: "#080f0c", overflowY: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "32px 24px", minHeight: "100vh" }}>
          <div style={{ width: "100%", maxWidth: "860px" }}>{renderPage()}</div>
        </div>
        <ChatbotWidget />
      </div>
    </>
  );
}