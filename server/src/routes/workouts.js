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

router.get("/", async (req, res) => {
  const { start, end } = dayRange(req.query.date);
  const workouts = await prisma.workout.findMany({
    where: { userId: req.userId, date: { gte: start, lte: end } },
    include: { exercises: { include: { sets: true }, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  res.json(workouts);
});

// History: list of dates with workouts in a range, for the calendar/history view
router.get("/history", async (req, res) => {
  const workouts = await prisma.workout.findMany({
    where: { userId: req.userId },
    include: { exercises: { include: { sets: true } } },
    orderBy: { date: "desc" },
    take: 60,
  });
  res.json(workouts);
});

router.post("/", async (req, res) => {
  const { name, date } = req.body;
  const workout = await prisma.workout.create({
    data: { userId: req.userId, name: name || null, date: date ? new Date(date) : new Date() },
  });
  res.json(workout);
});

router.post("/:workoutId/exercises", async (req, res) => {
  const { name, sets } = req.body; // sets: [{ reps, weightKg }]
  const workout = await prisma.workout.findUnique({ where: { id: req.params.workoutId } });
  if (!workout || workout.userId !== req.userId) return res.status(404).json({ error: "Not found" });

  const count = await prisma.exercise.count({ where: { workoutId: req.params.workoutId } });

  const exercise = await prisma.exercise.create({
    data: {
      workoutId: req.params.workoutId,
      name,
      order: count,
      sets: {
        create: (sets || []).map((s, i) => ({
          setNumber: i + 1,
          reps: s.reps,
          weightKg: s.weightKg ?? null,
        })),
      },
    },
    include: { sets: true },
  });

  res.json(exercise);
});

router.delete("/exercise/:exerciseId", async (req, res) => {
  const exercise = await prisma.exercise.findUnique({
    where: { id: req.params.exerciseId },
    include: { workout: true },
  });
  if (!exercise || exercise.workout.userId !== req.userId) {
    return res.status(404).json({ error: "Not found" });
  }
  await prisma.exercise.delete({ where: { id: req.params.exerciseId } });
  res.json({ ok: true });
});

router.delete("/:workoutId", async (req, res) => {
  const workout = await prisma.workout.findUnique({ where: { id: req.params.workoutId } });
  if (!workout || workout.userId !== req.userId) return res.status(404).json({ error: "Not found" });
  await prisma.workout.delete({ where: { id: req.params.workoutId } });
  res.json({ ok: true });
});

module.exports = router;
