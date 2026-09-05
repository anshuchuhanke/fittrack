const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");
const { calculateTargets } = require("../lib/calc");

const router = express.Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.userId } });
  res.json(profile || null);
});

// Save profile info + goal, and recompute BMR/TDEE/targets
router.put("/", async (req, res) => {
  const { age, gender, heightCm, weightKg, activityLevel, goalType, proteinOverride, calorieOverride } = req.body;

  if (!age || !gender || !heightCm || !weightKg || !activityLevel || !goalType) {
    return res.status(400).json({ error: "age, gender, heightCm, weightKg, activityLevel and goalType are all required" });
  }

  const targets = calculateTargets({ age, gender, heightCm, weightKg, activityLevel, goalType });

  const data = {
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    goalType,
    bmr: targets.bmr,
    tdee: targets.tdee,
    calorieTarget: calorieOverride ?? targets.calorieTarget,
    proteinTarget: proteinOverride ?? targets.proteinTarget,
  };

  const profile = await prisma.profile.upsert({
    where: { userId: req.userId },
    update: data,
    create: { userId: req.userId, ...data },
  });

  res.json(profile);
});

module.exports = router;
