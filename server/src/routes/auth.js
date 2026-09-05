const express = require("express");
const prisma = require("../lib/prisma");
const { hashPassword, comparePassword, signToken } = require("../lib/auth");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 90 * 24 * 60 * 60 * 1000,
};

// Signup is gated by SIGNUP_SECRET so strangers can't self-register on your public URL.
router.post("/signup", async (req, res) => {
  const { email, password, secret } = req.body;
  if (!email || !password || !secret) {
    return res.status(400).json({ error: "Email, password and secret are required" });
  }
  if (secret !== process.env.SIGNUP_SECRET) {
    return res.status(403).json({ error: "Invalid signup secret" });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash } });
  const token = signToken({ userId: user.id });
  res.cookie("token", token, COOKIE_OPTS);
  res.json({ id: user.id, email: user.email, token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });
  const token = signToken({ userId: user.id });
  res.cookie("token", token, COOKIE_OPTS);
  res.json({ id: user.id, email: user.email, token });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTS);
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, createdAt: true },
  });
  res.json(user);
});

module.exports = router;
