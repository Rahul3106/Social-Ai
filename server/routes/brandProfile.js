// File: server/routes/brandProfile.js
// Uses real userId from JWT token — each user gets their own brand profile

const express = require("express");
const router = express.Router();
const { BrandProfile } = require("../models");
const auth = require("../middleware/authMiddleware");

// POST /api/brand-profile — create or update for logged-in user
router.post("/brand-profile", auth, async (req, res) => {
  try {
    const { brandName, productDescription, targetAudience, tone, niche, website } = req.body;

    if (!brandName || !productDescription || !targetAudience || !niche) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const userId = req.user.id; // ← real user ID from JWT

    const profile = await BrandProfile.findOneAndUpdate(
      { userId },
      { brandName, productDescription, targetAudience, tone, niche, website },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(201).json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/brand-profile — get profile for logged-in user
router.get("/brand-profile", auth, async (req, res) => {
  try {
    const userId = req.user.id; // ← real user ID from JWT
    const profile = await BrandProfile.findOne({ userId });

    if (!profile) return res.status(404).json({ error: "No profile found" });

    return res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;