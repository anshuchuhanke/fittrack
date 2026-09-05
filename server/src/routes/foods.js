const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const Anthropic = require("@anthropic-ai/sdk");

const router = express.Router();
router.use(requireAuth);

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Search the local food database by name (case-insensitive substring match)
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json([]);
  const foods = await prisma.food.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    orderBy: { name: "asc" },
    take: 20,
  });
  res.json(foods);
});

// If a food isn't found locally, ask AI to estimate its macros and save it for next time.
router.post("/ai-lookup", async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Food name is required" });
  }

  const existing = await prisma.food.findFirst({
    where: { name: { equals: name.trim(), mode: "insensitive" } },
  });
  if (existing) return res.json(existing);

  if (!anthropic) {
    return res.status(503).json({
      error: "AI food lookup is not configured. Set ANTHROPIC_API_KEY on the server, or add this food manually.",
    });
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `Estimate typical nutrition values per 100 grams for this food, which may be an Indian dish: "${name}".
Respond with ONLY a raw JSON object, no markdown, no explanation, in exactly this shape:
{"name": "Cleaned up food name", "category": "short category", "caloriesPer100g": number, "proteinPer100g": number, "carbsPer100g": number, "fatPer100g": number}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const cleaned = (textBlock?.text || "").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const food = await prisma.food.create({
      data: {
        name: parsed.name || name,
        category: parsed.category || "AI estimated",
        caloriesPer100g: Number(parsed.caloriesPer100g) || 0,
        proteinPer100g: Number(parsed.proteinPer100g) || 0,
        carbsPer100g: Number(parsed.carbsPer100g) || 0,
        fatPer100g: Number(parsed.fatPer100g) || 0,
        source: "ai",
      },
    });

    res.json(food);
  } catch (err) {
    console.error("AI food lookup failed:", err);
    res.status(502).json({ error: "AI lookup failed. Try adding the food manually." });
  }
});

// Manually add a custom food
router.post("/", async (req, res) => {
  const { name, category, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g } = req.body;
  if (!name || caloriesPer100g == null || proteinPer100g == null) {
    return res.status(400).json({ error: "name, caloriesPer100g and proteinPer100g are required" });
  }
  const food = await prisma.food.create({
    data: {
      name,
      category: category || "Custom",
      caloriesPer100g,
      proteinPer100g,
      carbsPer100g: carbsPer100g || 0,
      fatPer100g: fatPer100g || 0,
      source: "custom",
    },
  });
  res.json(food);
});

module.exports = router;
