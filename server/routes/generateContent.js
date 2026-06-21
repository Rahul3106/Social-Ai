// File: server/routes/generateContent.js
// Uses real userId from JWT — fetches that user's brand profile for generation

require("dotenv").config();
const express = require("express");
const router = express.Router();
const { BrandProfile } = require("../models");
const auth = require("../middleware/authMiddleware");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

router.post("/generate-content", auth, async (req, res) => {
  try {
    const { platform, goal } = req.body;
    const userId = req.user.id; // ← real user ID

    // Fetch THIS user's brand profile
    const profile = await BrandProfile.findOne({ userId });
    if (!profile) {
      return res.status(400).json({ error: "Brand profile not found. Complete Brand Setup first." });
    }

    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY not set in .env" });
    }

    const prompt = `You are a social media marketing expert.

Brand: ${profile.brandName}
Product/Service: ${profile.productDescription}
Target Audience: ${profile.targetAudience}
Niche: ${profile.niche}
Tone: ${profile.tone}
Platform: ${platform || "Instagram"}
Goal: ${goal || "Engagement"}

Generate 3 different social media post variants for this brand. For each variant include:
- A caption (platform-appropriate length)
- 5 relevant hashtags
- A short ad copy version (headline + CTA)

Respond ONLY in valid JSON, no markdown, no extra text:
{
  "variants": [
    {
      "caption": "...",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "adCopy": { "headline": "...", "cta": "..." }
    }
  ]
}`;

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(500).json({ error: "AI generation failed", details: data });
    }

    const rawText = data.choices?.[0]?.message?.content || "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      return res.status(500).json({ error: "Could not parse AI response", raw: rawText });
    }

    return res.json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;