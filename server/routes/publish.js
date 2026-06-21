// File: server/routes/publish.js
// Uses real userId from JWT token

const express = require("express");
const router = express.Router();
const { Post } = require("../models");
const auth = require("../middleware/authMiddleware");

// POST /api/publish
router.post("/publish", auth, async (req, res) => {
  try {
    const { platform, caption, hashtags, adCopy, style, goal, scheduledDate, scheduledTime } = req.body;

    if (!platform || !caption) {
      return res.status(400).json({ error: "Missing platform or caption" });
    }

    const userId = req.user.id; // ← real user ID

    const post = await Post.create({
      userId,
      platform,
      caption,
      hashtags: hashtags || [],
      adCopy: adCopy || {},
      style: style || {},
      goal: goal || "",
      scheduledDate,
      scheduledTime,
      status: "scheduled",
    });

    return res.status(201).json({ success: true, post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/publish — only this user's posts
router.get("/publish", auth, async (req, res) => {
  try {
    const userId = req.user.id; // ← real user ID
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    return res.json({ posts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;