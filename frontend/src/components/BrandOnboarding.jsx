// src/components/BrandOnboarding.jsx — uses apiFetch with JWT token

import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

const S = {
  card: { width: "100%", background: "linear-gradient(135deg,#111d18,#0d1a15)", border: "1px solid #1a3028", borderRadius: "20px", padding: "36px 40px" },
  header: { display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" },
  icon: { width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 },
  title: { fontSize: "22px", fontWeight: "800", color: "#e2f5ee", margin: 0 },
  subtitle: { fontSize: "13px", color: "#3d6b57", margin: "0 0 24px 54px" },
  divider: { height: "1px", background: "linear-gradient(90deg,transparent,#1f4035,transparent)", margin: "0 0 28px" },
  label: { display: "block", fontSize: "11px", fontWeight: "700", color: "#7aad97", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.07em" },
  input: { width: "100%", background: "#080f0c", border: "1px solid #1a3028", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#e2f5ee", outline: "none", transition: "border 0.15s, box-shadow 0.15s", boxSizing: "border-box" },
  textarea: { width: "100%", background: "#080f0c", border: "1px solid #1a3028", borderRadius: "10px", padding: "12px 16px", fontSize: "14px", color: "#e2f5ee", outline: "none", transition: "border 0.15s, box-shadow 0.15s", boxSizing: "border-box", resize: "none", minHeight: "100px" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  section: { marginBottom: "22px" },
  error: { color: "#34d399", fontSize: "11px", marginTop: "5px" },
  primaryBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg,#059669,#10b981)", border: "none", borderRadius: "12px", color: "#fff", fontSize: "15px", fontWeight: "700", cursor: "pointer", letterSpacing: "0.01em", boxShadow: "0 4px 20px rgba(16,185,129,0.25)" },
};

const toneOptions = ["Friendly", "Professional", "Witty", "Bold", "Minimal", "Luxury"];

function ProfileView({ profile, onEdit, onContinue }) {
  const fields = [
    { label: "Brand / Product Name", value: profile.brandName, full: false },
    { label: "Brand Tone", value: profile.tone, full: false },
    { label: "Description", value: profile.productDescription, full: true },
    { label: "Target Audience", value: profile.targetAudience, full: false },
    { label: "Niche / Category", value: profile.niche, full: false },
    { label: "Website", value: profile.website || "—", full: false },
  ];

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div style={S.icon}>⚡</div>
        <div style={{ flex: 1 }}><h2 style={S.title}>Brand Profile</h2></div>
        <button onClick={onEdit} style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", padding: "8px 16px", color: "#34d399", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
          ✏️ Edit
        </button>
      </div>
      <p style={S.subtitle}>Your brand info is saved. AI will use this for all content generation.</p>
      <div style={S.divider} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "24px" }}>
        {fields.map((f) => (
          <div key={f.label} style={{ background: "#080f0c", border: "1px solid #1a3028", borderRadius: "12px", padding: "16px 18px", gridColumn: f.full ? "1 / -1" : "auto" }}>
            <p style={{ fontSize: "10px", fontWeight: "700", color: "#3d6b57", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{f.label}</p>
            {f.label === "Brand Tone" ? (
              <span style={{ background: "linear-gradient(135deg,#059669,#10b981)", color: "#fff", fontSize: "12px", fontWeight: "700", padding: "4px 14px", borderRadius: "99px" }}>{f.value}</span>
            ) : (
              <p style={{ fontSize: "14px", color: "#e2f5ee", margin: 0, lineHeight: "1.6" }}>{f.value}</p>
            )}
          </div>
        ))}
      </div>
      <div style={S.divider} />
      <button onClick={onContinue} style={S.primaryBtn}>Continue to Content Creation →</button>
    </div>
  );
}

function ProfileForm({ initial, onSave, onCancel, isEditing }) {
  const [form, setForm] = useState({ tone: "Friendly", ...initial });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.brandName?.trim()) e.brandName = "Required";
    if (!form.productDescription?.trim()) e.productDescription = "Required";
    if (!form.targetAudience?.trim()) e.targetAudience = "Required";
    if (!form.niche?.trim()) e.niche = "Required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({}); setSubmitting(true);
    try {
      const res = await apiFetch("/api/brand-profile", { method: "POST", body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      onSave(data);
    } catch { setErrors({ submit: "Something went wrong. Please try again." }); }
    finally { setSubmitting(false); }
  };

  const focus = (e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 2px rgba(16,185,129,0.12)"; };
  const blur  = (e) => { e.target.style.borderColor = "#1a3028"; e.target.style.boxShadow = "none"; };

  return (
    <div style={S.card}>
      <div style={S.header}>
        <div style={S.icon}>⚡</div>
        <div style={{ flex: 1 }}><h2 style={S.title}>{isEditing ? "Edit Brand Profile" : "Brand Setup"}</h2></div>
        {isEditing && onCancel && (
          <button onClick={onCancel} style={{ background: "transparent", border: "1px solid #1a3028", borderRadius: "8px", padding: "8px 16px", color: "#3d6b57", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
        )}
      </div>
      <p style={S.subtitle}>{isEditing ? "Update your brand info. Changes apply to all future AI-generated content." : "Tell us about your brand so AI can generate on-brand content every time."}</p>
      <div style={S.divider} />

      <form onSubmit={handleSubmit}>
        <div style={S.section}>
          <label style={S.label}>Brand / Product Name</label>
          <input name="brandName" value={form.brandName || ""} onChange={handleChange} placeholder="e.g. GlowSkin Cosmetics" style={S.input} onFocus={focus} onBlur={blur} />
          {errors.brandName && <p style={S.error}>{errors.brandName}</p>}
        </div>
        <div style={S.section}>
          <label style={S.label}>Product / Service Description</label>
          <textarea name="productDescription" value={form.productDescription || ""} onChange={handleChange} placeholder="What do you sell or offer?" style={S.textarea} onFocus={focus} onBlur={blur} />
          {errors.productDescription && <p style={S.error}>{errors.productDescription}</p>}
        </div>
        <div style={{ ...S.section, ...S.grid2 }}>
          <div>
            <label style={S.label}>Target Audience</label>
            <input name="targetAudience" value={form.targetAudience || ""} onChange={handleChange} placeholder="e.g. Women 18–30" style={S.input} onFocus={focus} onBlur={blur} />
            {errors.targetAudience && <p style={S.error}>{errors.targetAudience}</p>}
          </div>
          <div>
            <label style={S.label}>Niche / Category</label>
            <input name="niche" value={form.niche || ""} onChange={handleChange} placeholder="e.g. Beauty & Skincare" style={S.input} onFocus={focus} onBlur={blur} />
            {errors.niche && <p style={S.error}>{errors.niche}</p>}
          </div>
        </div>
        <div style={S.section}>
          <label style={S.label}>Brand Tone</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {toneOptions.map((tone) => {
              const active = form.tone === tone;
              return (
                <button key={tone} type="button" onClick={() => setForm((p) => ({ ...p, tone }))} style={{ padding: "8px 20px", borderRadius: "99px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "1px solid", transition: "all 0.15s", background: active ? "linear-gradient(135deg,#059669,#10b981)" : "transparent", borderColor: active ? "#10b981" : "#1a3028", color: active ? "#fff" : "#3d6b57", boxShadow: active ? "0 0 12px rgba(16,185,129,0.25)" : "none" }}>{tone}</button>
              );
            })}
          </div>
        </div>
        <div style={S.section}>
          <label style={S.label}>Website / Social Link <span style={{ textTransform: "none", color: "#1f4035", fontWeight: "400", letterSpacing: 0 }}>(optional)</span></label>
          <input name="website" value={form.website || ""} onChange={handleChange} placeholder="https://..." style={S.input} onFocus={focus} onBlur={blur} />
        </div>
        {errors.submit && <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid #1f4035", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}><p style={{ color: "#34d399", fontSize: "13px", margin: 0 }}>⚠️ {errors.submit}</p></div>}
        <button type="submit" disabled={submitting} style={{ ...S.primaryBtn, opacity: submitting ? 0.7 : 1 }}>
          {submitting ? "Saving..." : isEditing ? "Save Changes" : "Continue to Content Creation →"}
        </button>
      </form>
    </div>
  );
}

export default function BrandOnboarding({ onComplete }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/brand-profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Could not load profile:", err);
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  const handleSave = (savedProfile) => { setProfile(savedProfile); setEditing(false); };
  const handleContinue = () => { if (onComplete) onComplete(profile); };

  if (pageLoading) {
    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "32px", height: "32px", border: "2px solid #1a3028", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#3d6b57", fontSize: "13px" }}>Loading profile...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) return <ProfileForm initial={{}} onSave={handleSave} isEditing={false} />;
  if (editing) return <ProfileForm initial={profile} onSave={handleSave} onCancel={() => setEditing(false)} isEditing={true} />;
  return <ProfileView profile={profile} onEdit={() => setEditing(true)} onContinue={handleContinue} />;
}