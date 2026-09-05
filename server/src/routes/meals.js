const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function dayRange(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Get all meals for a given date (default today), with computed totals
router.get("/", async (req, res) => {
  const { start, end } = dayRange(req.query.date);
  const meals = await prisma.meal.findMany({
    where: { userId: req.userId, date: { gte: start, lte: end } },
    include: { items: { include: { food: true } } },
    orderBy: { createdAt: "asc" },
  });

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const mealsWithTotals = meals.map((meal) => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    const items = meal.items.map((item) => {
      const factor = item.quantityGrams / 100;
      const itemCalories = item.food.caloriesPer100g * factor;
      const itemProtein = item.food.proteinPer100g * factor;
      const itemCarbs = item.food.carbsPer100g * factor;
      const itemFat = item.food.fatPer100g * factor;
      calories += itemCalories;
      protein += itemProtein;
      carbs += itemCarbs;
      fat += itemFat;
      return {
        id: item.id,
        quantityGrams: item.quantityGrams,
        food: item.food,
        calories: Math.round(itemCalories),
        protein: Math.round(itemProtein * 10) / 10,
        carbs: Math.round(itemCarbs * 10) / 10,
        fat: Math.round(itemFat * 10) / 10,
      };
    });
    totalCalories += calories;
    totalProtein += protein;
    totalCarbs += carbs;
    totalFat += fat;
    return {
      id: meal.id,
      mealType: meal.mealType,
      date: meal.date,
      items,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    };
  });

  res.json({
    meals: mealsWithTotals,
    totals: {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
    },
  });
});

// Add a food item to a meal (creates the meal for that day/type if it doesn't exist)
router.post("/log", async (req, res) => {
  const { mealType, foodId, quantityGrams, date } = req.body;
  if (!mealType || !foodId || !quantityGrams) {
    return res.status(400).json({ error: "mealType, foodId and quantityGrams are required" });
  }

  const { start, end } = dayRange(date);

  let meal = await prisma.meal.findFirst({
    where: { userId: req.userId, mealType, date: { gte: start, lte: end } },
  });

  if (!meal) {
    meal = await prisma.meal.create({
      data: { userId: req.userId, mealType, date: date ? new Date(date) : new Date() },
    });
  }

  const item = await prisma.mealItem.create({
    data: { mealId: meal.id, foodId, quantityGrams },
    include: { food: true },
  });

  res.json(item);
});

router.delete("/item/:itemId", async (req, res) => {
  const item = await prisma.mealItem.findUnique({
    where: { id: req.params.itemId },
    include: { meal: true },
  });
  if (!item || item.meal.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }
  await prisma.mealItem.delete({ where: { id: req.params.itemId } });
  res.json({ ok: true });
});

module.exports = router;
