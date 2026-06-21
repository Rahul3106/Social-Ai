// File: server/routes/marketingAgent.js
// Digital Marketing Agent — scrapes YouTube + Reddit + web search for market trends
// Then uses Groq AI to analyze and give strategic suggestions

require("dotenv").config();
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { BrandProfile } = require("../models");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY; // free at serpapi.com — 100 searches/month
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── Helper: Groq AI call ──────────────────────────────────────────
async function askGroq(systemPrompt, userMessage, maxTokens = 1500) {
  const res = await fetch(GROQ_URL, {
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
      max_tokens: maxTokens,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API failed");
  return data.choices?.[0]?.message?.content || "";
}

// ── Helper: YouTube trend scraper ─────────────────────────────────
async function scrapeYouTubeTrends(query, maxResults = 8) {
  if (!YOUTUBE_API_KEY) return [];
  try {
    // Search YouTube for videos related to the product/niche
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&order=viewCount&publishedAfter=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.items?.length) return [];

    const videoIds = searchData.items.map(v => v.id.videoId).join(",");

    // Get video stats
    const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const statsRes = await fetch(statsUrl);
    const statsData = await statsRes.json();

    return (statsData.items || []).map(v => ({
      title: v.snippet.title,
      channel: v.snippet.channelTitle,
      views: parseInt(v.statistics.viewCount || 0),
      likes: parseInt(v.statistics.likeCount || 0),
      comments: parseInt(v.statistics.commentCount || 0),
      publishedAt: v.snippet.publishedAt,
      description: v.snippet.description?.slice(0, 200),
    })).sort((a, b) => b.views - a.views);
  } catch (err) {
    console.error("YouTube scrape error:", err.message);
    return [];
  }
}

// ── Helper: Reddit trend scraper (no auth needed for public search) ──
async function scrapeRedditTrends(query, subreddit = "") {
  try {
    const sub = subreddit ? `r/${subreddit}/` : "";
    const url = `https://www.reddit.com/${sub}search.json?q=${encodeURIComponent(query)}&sort=top&t=month&limit=10`;
    const res = await fetch(url, {
      headers: { "User-Agent": process.env.REDDIT_USER_AGENT || "SocialAI/1.0" },
    });
    const data = await res.json();

    return (data?.data?.children || []).map(post => ({
      title: post.data.title,
      subreddit: post.data.subreddit,
      upvotes: post.data.score,
      comments: post.data.num_comments,
      url: `https://reddit.com${post.data.permalink}`,
      text: post.data.selftext?.slice(0, 300) || "",
    })).sort((a, b) => b.upvotes - a.upvotes);
  } catch (err) {
    console.error("Reddit scrape error:", err.message);
    return [];
  }
}

// ── Helper: Web search via SerpAPI (optional, free tier) ──────────
async function webSearch(query) {
  if (!SERPAPI_KEY) return [];
  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&num=5&api_key=${SERPAPI_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.organic_results || []).map(r => ({
      title: r.title,
      snippet: r.snippet,
      link: r.link,
    }));
  } catch (err) {
    console.error("Web search error:", err.message);
    return [];
  }
}

// ════════════════════════════════════════════════════════════════
// POST /api/marketing-agent/analyze
// Main endpoint — full market analysis pipeline
// ════════════════════════════════════════════════════════════════
router.post("/marketing-agent/analyze", auth, async (req, res) => {
  try {
    const { productDescription, competitors = [], targetNiche } = req.body;
    const userId = req.user.id;

    // Get brand profile for context
    const profile = await BrandProfile.findOne({ userId });

    const product = productDescription || profile?.productDescription || "";
    const niche = targetNiche || profile?.niche || "";
    const searchQuery = `${product} ${niche} 2025 2026`;

    if (!product) {
      return res.status(400).json({ error: "Product description is required. Complete Brand Setup first." });
    }

    // ── Parallel data collection ──────────────────────────────────
    const [youtubeTrends, redditTrends, webResults, competitorData] = await Promise.all([
      scrapeYouTubeTrends(searchQuery),
      scrapeRedditTrends(searchQuery),
      webSearch(`${searchQuery} market trends`),
      Promise.all(
        (competitors || []).slice(0, 3).map(async (competitor) => {
          const [ytData, rdData] = await Promise.all([
            scrapeYouTubeTrends(`${competitor} ${niche}`),
            scrapeRedditTrends(competitor),
          ]);
          return {
            name: competitor,
            youtubePresence: ytData.slice(0, 3),
            redditPresence: rdData.slice(0, 3),
          };
        })
      ),
    ]);

    // ── Build context for AI ──────────────────────────────────────
    const dataContext = `
PRODUCT/BRAND: ${profile?.brandName || "Unknown"} — ${product}
NICHE: ${niche}
TARGET AUDIENCE: ${profile?.targetAudience || "Unknown"}

YOUTUBE TRENDS (top videos in last 30 days):
${youtubeTrends.slice(0, 5).map((v, i) => `${i+1}. "${v.title}" by ${v.channel} — ${v.views.toLocaleString()} views, ${v.likes.toLocaleString()} likes, ${v.comments.toLocaleString()} comments`).join("\n") || "No data found"}

REDDIT BUZZ (top posts in last month):
${redditTrends.slice(0, 5).map((p, i) => `${i+1}. "${p.title}" in r/${p.subreddit} — ${p.upvotes.toLocaleString()} upvotes, ${p.comments} comments`).join("\n") || "No data found"}

WEB SEARCH INSIGHTS:
${webResults.slice(0, 3).map((r, i) => `${i+1}. ${r.title}: ${r.snippet}`).join("\n") || "No data found"}

COMPETITOR ANALYSIS:
${competitorData.map(c => `
Competitor: ${c.name}
  YouTube: ${c.youtubePresence.map(v => `"${v.title}" (${v.views?.toLocaleString()} views)`).join(", ") || "No presence found"}
  Reddit: ${c.redditPresence.map(p => `"${p.title}" (${p.upvotes} upvotes in r/${p.subreddit})`).join(", ") || "No presence found"}
`).join("\n") || "No competitors provided"}
`.trim();

    // ── AI analysis ───────────────────────────────────────────────
    const systemPrompt = `You are an expert digital marketing strategist with deep knowledge of social media trends, content marketing, and competitor analysis.

Your job is to analyze real market data (YouTube views, Reddit discussions, web trends) and give specific, actionable marketing suggestions for a brand.

Respond ONLY in valid JSON. No markdown, no extra text. Use this exact structure:
{
  "marketSummary": "2-3 sentence overview of current market conditions for this product/niche",
  "trendingTopics": [
    { "topic": "...", "evidence": "...", "opportunity": "..." }
  ],
  "competitorInsights": [
    { "competitor": "...", "strength": "...", "weakness": "...", "whatToSteal": "..." }
  ],
  "contentSuggestions": [
    { "platform": "...", "format": "...", "topic": "...", "reasoning": "..." }
  ],
  "adCopySuggestions": [
    { "hook": "...", "body": "...", "cta": "..." }
  ],
  "strategyRecommendations": [
    { "priority": "High/Medium/Low", "action": "...", "expectedImpact": "..." }
  ],
  "bestTimeToPost": {
    "Instagram": "...", "YouTube": "...", "Reddit": "..."
  },
  "quickWins": ["...", "...", "..."]
}`;

    const aiResponse = await askGroq(systemPrompt, `Analyze this market data and give strategic recommendations:\n\n${dataContext}`, 2000);

    let analysis;
    try {
      const cleaned = aiResponse.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponse);
      return res.status(500).json({ error: "AI analysis failed to parse. Try again." });
    }

    return res.json({
      success: true,
      rawData: {
        youtubeTrends: youtubeTrends.slice(0, 5),
        redditTrends: redditTrends.slice(0, 5),
        webResults: webResults.slice(0, 3),
        competitorData,
      },
      analysis,
      scrapedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error("Marketing agent error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

// ════════════════════════════════════════════════════════════════
// POST /api/marketing-agent/chat
// Conversational follow-up questions about the analysis
// ════════════════════════════════════════════════════════════════
router.post("/marketing-agent/chat", auth, async (req, res) => {
  try {
    const { message, analysisContext } = req.body;
    const userId = req.user.id;
    const profile = await BrandProfile.findOne({ userId });

    const systemPrompt = `You are a digital marketing expert AI agent for the brand: ${profile?.brandName || "Unknown"} (${profile?.productDescription || ""}).

You have access to recent market analysis data. Answer the user's marketing question concisely and specifically.
Previous analysis context: ${analysisContext ? JSON.stringify(analysisContext).slice(0, 2000) : "None"}

Be specific, actionable, and data-driven. Reference the actual trends and competitor data when relevant.`;

    const reply = await askGroq(systemPrompt, message, 600);

    return res.json({ reply });
  } catch (err) {
    console.error("Marketing agent chat error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;