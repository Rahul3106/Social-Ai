// File: server/routes/oauth.js
// Real OAuth integration for Instagram (Meta) and YouTube (Google)
//
// SETUP REQUIRED:
//
// ── INSTAGRAM / FACEBOOK ──────────────────────────────────────────
// 1. Go to https://developers.facebook.com/apps/
// 2. Create App → Business → add "Instagram Graph API" product
// 3. Settings → Basic → copy App ID and App Secret
// 4. Add to .env:
//    META_APP_ID=your_app_id
//    META_APP_SECRET=your_app_secret
//    BASE_URL=http://localhost:5000
//
// ── YOUTUBE / GOOGLE ─────────────────────────────────────────────
// 1. Go to https://console.cloud.google.com
// 2. APIs & Services → Credentials → Create OAuth 2.0 Client ID
// 3. Application type: Web → add redirect URI: http://localhost:5000/api/auth/youtube/callback
// 4. Add to .env:
//    GOOGLE_CLIENT_ID=your_client_id
//    GOOGLE_CLIENT_SECRET=your_client_secret

require("dotenv").config();
const express = require("express");
const router = express.Router();

// In-memory token store (replace with DB in production)
const connectedAccounts = {};

// ══════════════════════════════════════════════════════════════════
// INSTAGRAM / FACEBOOK OAUTH
// ══════════════════════════════════════════════════════════════════

// Step 1: Redirect user to Facebook login
router.get("/auth/instagram", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: `${process.env.BASE_URL}/api/auth/instagram/callback`,
    scope: "instagram_basic,instagram_content_publish,pages_read_engagement,pages_manage_posts",
    response_type: "code",
  });
  res.redirect(`https://www.facebook.com/v18.0/dialog/oauth?${params}`);
});

// Step 2: Facebook redirects back with a code
router.get("/auth/instagram/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}?error=instagram_denied`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.BASE_URL}/api/auth/instagram/callback`,
        code,
      })
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) throw new Error("No access token received");

    // Get user's Facebook pages
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
    );
    const pagesData = await pagesRes.json();

    // Get Instagram Business Account connected to first page
    let igAccountId = null;
    if (pagesData.data?.length > 0) {
      const pageId = pagesData.data[0].id;
      const pageToken = pagesData.data[0].access_token;

      const igRes = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
      );
      const igData = await igRes.json();
      igAccountId = igData.instagram_business_account?.id;

      // Store tokens
      connectedAccounts["demo-user"] = {
        ...connectedAccounts["demo-user"],
        instagram: {
          accessToken: pageToken,
          pageId,
          igAccountId,
          connectedAt: new Date().toISOString(),
        },
      };
    }

    // Redirect back to frontend with success
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}?connected=instagram`);
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}?error=instagram_failed`);
  }
});

// ══════════════════════════════════════════════════════════════════
// YOUTUBE / GOOGLE OAUTH
// ══════════════════════════════════════════════════════════════════

// Step 1: Redirect user to Google login
router.get("/auth/youtube", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: `${process.env.BASE_URL}/api/auth/youtube/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    prompt: "consent",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// Step 2: Google redirects back with a code
router.get("/auth/youtube/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}?error=youtube_denied`);
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BASE_URL}/api/auth/youtube/callback`,
        grant_type: "authorization_code",
        code,
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) throw new Error("No access token received");

    // Get channel info
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const channelData = await channelRes.json();
    const channel = channelData.items?.[0];

    // Store tokens
    connectedAccounts["demo-user"] = {
      ...connectedAccounts["demo-user"],
      youtube: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        channelId: channel?.id,
        channelName: channel?.snippet?.title,
        connectedAt: new Date().toISOString(),
      },
    };

    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}?connected=youtube`);
  } catch (err) {
    console.error("YouTube OAuth error:", err);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}?error=youtube_failed`);
  }
});

// ══════════════════════════════════════════════════════════════════
// GET /api/auth/status — check which accounts are connected
// ══════════════════════════════════════════════════════════════════
router.get("/auth/status", (req, res) => {
  const userId = "demo-user";
  const accounts = connectedAccounts[userId] || {};

  return res.json({
    instagram: accounts.instagram
      ? { connected: true, connectedAt: accounts.instagram.connectedAt }
      : { connected: false },
    youtube: accounts.youtube
      ? { connected: true, channelName: accounts.youtube.channelName, connectedAt: accounts.youtube.connectedAt }
      : { connected: false },
    linkedin: { connected: false },
    facebook: { connected: false },
    twitter: { connected: false },
  });
});

// ══════════════════════════════════════════════════════════════════
// DELETE /api/auth/disconnect/:platform — disconnect an account
// ══════════════════════════════════════════════════════════════════
router.delete("/auth/disconnect/:platform", (req, res) => {
  const { platform } = req.params;
  const userId = "demo-user";

  if (connectedAccounts[userId]) {
    delete connectedAccounts[userId][platform];
  }

  return res.json({ success: true });
});

// Export accounts for use in publish route
module.exports = router;
module.exports.connectedAccounts = connectedAccounts;