// STEP 6 BACKEND: AI Chatbot (general chat + competitor analysis)
// File: server/routes/chatbot.js
//
// Setup:
// 1. YouTube Data API key (free): https://console.cloud.google.com/apis/credentials
//    - Create project -> Enable "YouTube Data API v3" -> Create API Key
//    - Add to server/.env as YOUTUBE_API_KEY=your_key_here
// 2. Uses GROQ_API_KEY (already set up in step 2) for the chat reasoning
//
// Flow:
// - User asks something like "How is @mrbeast doing on YouTube?"
// - If message looks like a competitor question, fetch YouTube channel stats
// - Pass stats + user's brand profile + question to Groq for a natural-language answer
// - Otherwise, just answer the general question directly via Groq

require("dotenv").config();
const express = require("express");
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const { brandProfiles } = require("./brandProfile");

// --- Helper: detect if message is asking about a competitor / channel ---
function extractChannelQuery(message) {
  // Looks for @handle or "channel" keyword patterns
  const handleMatch = message.match(/@([a-zA-Z0-9_]+)/);
  if (handleMatch) return handleMatch[1];

  const channelMatch = message.match(/(?:channel|competitor|brand)\s+([a-zA-Z0-9_\s]+)/i);
  if (channelMatch) return channelMatch[1].trim();

  return null;
}

// --- Helper: fetch YouTube channel stats ---
async function getYoutubeChannelStats(query) {
  if (!YOUTUBE_API_KEY) return null;

  try {
    // Search for the channel by name/handle
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
      query
    )}&key=${YOUTUBE_API_KEY}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const channelId = searchData.items?.[0]?.snippet?.channelId || searchData.items?.[0]?.id?.channelId;
    if (!channelId) return null;

    // Get channel statistics
    const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    const channel = statsData.items?.[0];
    if (!channel) return null;

    return {
      title: channel.snippet.title,
      description: channel.snippet.description?.slice(0, 200),
      subscribers: channel.statistics.subscriberCount,
      totalViews: channel.statistics.viewCount,
      videoCount: channel.statistics.videoCount,
    };
  } catch (err) {
    console.error("YouTube API error:", err);
    return null;
  }
}

// --- Helper: call Groq for chat response ---
async function askGroq(systemPrompt, userMessage) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Groq API error:", data);
    throw new Error("AI response failed");
  }
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
}

// POST /api/chat
// body: { message: "..." }
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || "demo-user";
    const profile = brandProfiles[userId];

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!GROQ_API_KEY) return res.status(500).json({ error: "GROQ_API_KEY not set" });

    // Check if this looks like a competitor analysis question
    const channelQuery = extractChannelQuery(message);
    let channelStats = null;

    if (channelQuery) {
      channelStats = await getYoutubeChannelStats(channelQuery);
    }

    let systemPrompt = `You are an AI assistant inside a social media management app.
You help users with content strategy questions, trends, and competitor analysis.
Be concise, friendly, and actionable.`;

    if (profile) {
      systemPrompt += `\n\nThe user's brand: ${profile.brandName}, Niche: ${profile.niche}, Tone: ${profile.tone}, Audience: ${profile.targetAudience}.`;
    }

    if (channelStats) {
      systemPrompt += `\n\nCompetitor channel data (from YouTube):
- Channel: ${channelStats.title}
- Subscribers: ${channelStats.subscribers}
- Total Views: ${channelStats.totalViews}
- Video Count: ${channelStats.videoCount}
- Description: ${channelStats.description}

Use this real data to answer the user's question with specific numbers and insights.`;
    } else if (channelQuery) {
      systemPrompt += `\n\nThe user asked about a channel/competitor "${channelQuery}" but no data was found. Let them know you couldn't find that channel, and ask them to check the name/handle.`;
    }

    const reply = await askGroq(systemPrompt, message);

    return res.json({
      reply,
      channelStats: channelStats || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;