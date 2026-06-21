// src/components/AuthPage.jsx
// Login + Signup page — Obsidian Green theme
// Toggle between login and signup with smooth transition

import React, { useState } from "react";

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "", general: "" }));
  };

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (mode === "signup" && form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || "Something went wrong" });
        return;
      }

      // Save token to localStorage
      localStorage.setItem("socialai_token", data.token);
      localStorage.setItem("socialai_user", JSON.stringify(data.user));

      // Pass user up to App
      if (onAuth) onAuth(data.user);
    } catch (err) {
      setErrors({ general: "Network error. Is the server running?" });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    background: "#080f0c",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "#1a3028"}`,
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "14px",
    color: "#e2f5ee",
    outline: "none",
    boxSizing: "border-box",
    transition: "border 0.15s, box-shadow 0.15s",
  });

  const focus = (e) => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 2px rgba(16,185,129,0.12)"; };
  const blur  = (e) => { e.target.style.borderColor = errors[e.target.name] ? "rgba(239,68,68,0.5)" : "#1a3028"; e.target.style.boxShadow = "none"; };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#080f0c",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background glow effects */}
      <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "10%", width: "400px", height: "300px", background: "radial-gradient(ellipse, rgba(5,150,105,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg,#059669,#10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>⚡</div>
            <span style={{ fontSize: "26px", fontWeight: "800", background: "linear-gradient(135deg,#10b981,#34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SocialAI</span>
          </div>
          <p style={{ fontSize: "13px", color: "#3d6b57", margin: 0 }}>AI-powered social media management</p>
        </div>

        {/* Card */}
        <div style={{ background: "linear-gradient(135deg,#111d18,#0d1a15)", border: "1px solid #1a3028", borderRadius: "20px", padding: "36px 36px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.05)" }}>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#080f0c", borderRadius: "10px", padding: "4px", marginBottom: "28px", border: "1px solid #1a3028" }}>
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  flex: 1, padding: "9px", borderRadius: "7px", fontSize: "13px", fontWeight: "700",
                  cursor: "pointer", border: "none", transition: "all 0.2s",
                  background: mode === m ? "linear-gradient(135deg,#059669,#10b981)" : "transparent",
                  color: mode === m ? "#fff" : "#3d6b57",
                  boxShadow: mode === m ? "0 2px 8px rgba(16,185,129,0.25)" : "none",
                }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Title */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#e2f5ee", margin: "0 0 4px" }}>
              {mode === "login" ? "Welcome back 👋" : "Get started free 🚀"}
            </h2>
            <p style={{ fontSize: "13px", color: "#3d6b57", margin: 0 }}>
              {mode === "login"
                ? "Sign in to your SocialAI account"
                : "Create your account and start generating content"}
            </p>
          </div>

          {/* General error */}
          {errors.general && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px" }}>
              <p style={{ color: "#f87171", fontSize: "13px", margin: 0 }}>⚠️ {errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name — signup only */}
            {mode === "signup" && (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#7aad97", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Full Name</label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  style={inputStyle(errors.name)}
                  onFocus={focus}
                  onBlur={blur}
                />
                {errors.name && <p style={{ color: "#f87171", fontSize: "11px", marginTop: "5px" }}>{errors.name}</p>}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#7aad97", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={inputStyle(errors.email)}
                onFocus={focus}
                onBlur={blur}
              />
              {errors.email && <p style={{ color: "#f87171", fontSize: "11px", marginTop: "5px" }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: mode === "signup" ? "16px" : "24px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#7aad97", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  name="password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "Enter your password"}
                  style={{ ...inputStyle(errors.password), paddingRight: "48px" }}
                  onFocus={focus}
                  onBlur={blur}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#3d6b57", cursor: "pointer", fontSize: "16px", padding: 0 }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p style={{ color: "#f87171", fontSize: "11px", marginTop: "5px" }}>{errors.password}</p>}
            </div>

            {/* Confirm password — signup only */}
            {mode === "signup" && (
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#7aad97", marginBottom: "7px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Confirm Password</label>
                <input
                  name="confirmPassword"
                  type={showPass ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  style={inputStyle(errors.confirmPassword)}
                  onFocus={focus}
                  onBlur={blur}
                />
                {errors.confirmPassword && <p style={{ color: "#f87171", fontSize: "11px", marginTop: "5px" }}>{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: "linear-gradient(135deg,#059669,#10b981)",
                border: "none", borderRadius: "10px",
                color: "#fff", fontSize: "15px", fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
                letterSpacing: "0.01em",
              }}
            >
              {loading && (
                <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              )}
              {loading
                ? (mode === "login" ? "Signing in..." : "Creating account...")
                : (mode === "login" ? "Sign In →" : "Create Account →")}
            </button>
          </form>

          {/* Switch mode link */}
          <p style={{ textAlign: "center", fontSize: "13px", color: "#3d6b57", marginTop: "20px", marginBottom: 0 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              style={{ background: "none", border: "none", color: "#10b981", fontWeight: "700", fontSize: "13px", cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p style={{ textAlign: "center", fontSize: "11px", color: "#1f4035", marginTop: "20px" }}>
          Hackfluence 2026 · Built with SocialAI ✦
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}