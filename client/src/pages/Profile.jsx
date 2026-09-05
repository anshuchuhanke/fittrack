import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary — little/no exercise" },
  { value: "light", label: "Light — exercise 1-3 days/week" },
  { value: "moderate", label: "Moderate — exercise 3-5 days/week" },
  { value: "active", label: "Active — hard exercise 6-7 days/week" },
  { value: "very_active", label: "Very active — physical job + training" },
];

const GOAL_OPTIONS = [
  { value: "bulk", label: "Bulk", desc: "Calorie surplus to build muscle" },
  { value: "lean", label: "Lean / Cut", desc: "Calorie deficit to lose fat" },
  { value: "maintain", label: "Maintain", desc: "Stay at current weight" },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    age: "",
    gender: "male",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
    goalType: "maintain",
  });
  const [saved, setSaved] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/profile").then((p) => {
      if (p) {
        setForm({
          age: p.age ?? "",
          gender: p.gender ?? "male",
          heightCm: p.heightCm ?? "",
          weightKg: p.weightKg ?? "",
          activityLevel: p.activityLevel ?? "moderate",
          goalType: p.goalType ?? "maintain",
        });
        setSaved(p);
      }
    });
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        age: Number(form.age),
        gender: form.gender,
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        activityLevel: form.activityLevel,
        goalType: form.goalType,
      };
      const p = await api.put("/profile", payload);
      setSaved(p);
      setMessage("Saved — your targets have been updated.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="safe-top px-5 pt-6 pb-4">
      <h1 className="font-display text-3xl mb-1">Profile & goal</h1>
      <p className="text-muted text-sm mb-6">{user?.email}</p>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1.5">Age</label>
            <input
              type="number"
              required
              value={form.age}
              onChange={(e) => update("age", e.target.value)}
              className="w-full bg-surface rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="w-full bg-surface rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted mb-1.5">Height (cm)</label>
            <input
              type="number"
              required
              value={form.heightCm}
              onChange={(e) => update("heightCm", e.target.value)}
              className="w-full bg-surface rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Weight (kg)</label>
            <input
              type="number"
              required
              value={form.weightKg}
              onChange={(e) => update("weightKg", e.target.value)}
              className="w-full bg-surface rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Activity level</label>
          <select
            value={form.activityLevel}
            onChange={(e) => update("activityLevel", e.target.value)}
            className="w-full bg-surface rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-muted mb-2">Goal</label>
          <div className="grid grid-cols-3 gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => update("goalType", opt.value)}
                className={`rounded-xl p-3 text-left ${
                  form.goalType === opt.value ? "bg-ember text-graphite" : "bg-surface text-chalk"
                }`}
              >
                <p className="font-medium text-sm">{opt.label}</p>
                <p className={`text-[11px] mt-0.5 ${form.goalType === opt.value ? "text-graphite/70" : "text-muted"}`}>
                  {opt.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {message && <p className="text-sprout text-sm">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-ember text-graphite font-semibold rounded-xl py-3.5 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save & recalculate targets"}
        </button>
      </form>

      {saved && (
        <div className="bg-surface rounded-2xl p-4 mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted">BMR</p>
            <p className="stat-number text-2xl">{saved.bmr}</p>
          </div>
          <div>
            <p className="text-xs text-muted">TDEE</p>
            <p className="stat-number text-2xl">{saved.tdee}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Daily calorie target</p>
            <p className="stat-number text-2xl text-ember">{saved.calorieTarget}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Daily protein target</p>
            <p className="stat-number text-2xl text-sprout">{saved.proteinTarget}g</p>
          </div>
        </div>
      )}

      <button
        onClick={logout}
        className="w-full text-danger text-sm font-medium mt-8 py-3"
      >
        Log out
      </button>
    </div>
  );
}
