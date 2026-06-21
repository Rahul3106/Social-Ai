// File: server/models.js
// All database models (Brand Profile + Scheduled Posts)

const mongoose = require("mongoose");

// ── Brand Profile ──────────────────────────────────────────
const brandProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "demo-user" },
    brandName: { type: String, required: true },
    productDescription: { type: String, required: true },
    targetAudience: { type: String, required: true },
    tone: { type: String, default: "Friendly" },
    niche: { type: String, required: true },
    website: { type: String, default: "" },
  },
  { timestamps: true }
);

// ── Scheduled Post ─────────────────────────────────────────
const postSchema = new mongoose.Schema(
  {
    userId: { type: String, default: "demo-user" },
    platform: { type: String, required: true },
    goal: { type: String },
    caption: { type: String, required: true },
    hashtags: [String],
    adCopy: {
      headline: String,
      cta: String,
    },
    style: {
      id: String,
      name: String,
      preview: String,
      accent: String,
    },
    scheduledDate: { type: String },
    scheduledTime: { type: String },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

const BrandProfile = mongoose.model("BrandProfile", brandProfileSchema);
const Post = mongoose.model("Post", postSchema);

module.exports = { BrandProfile, Post };