import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

function MacroBar({ label, current, target, unit, color }) {
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const remaining = target ? Math.max(0, Math.round(target - current)) : null;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm text-muted">{label}</span>
        <span className="text-sm">
          <span className="stat-number text-lg text-chalk">{Math.round(current)}</span>
          <span className="text-muted"> / {target ?? "—"} {unit}</span>
        </span>
      </div>
      <div className="h-2.5 bg-surface2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {target != null && (
        <p className="text-xs text-muted mt-1">
          {remaining > 0 ? `${remaining} ${unit} left` : "Goal reached"}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [mealsData, setMealsData] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [p, m, w] = await Promise.all([
      api.get("/profile"),
      api.get("/meals"),
      api.get("/workouts"),
    ]);
    setProfile(p);
    setMealsData(m);
    setWorkouts(w);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (loading) {
    return <div className="p-6 text-muted safe-top">Loading…</div>;
  }

  if (!profile) {
    return (
      <div className="p-6 safe-top">
        <h1 className="font-display text-3xl mb-2">Welcome</h1>
        <p className="text-muted mb-6">Set up your profile to get personalized calorie and protein targets.</p>
        <Link to="/profile" className="inline-block bg-ember text-graphite font-semibold rounded-xl px-5 py-3">
          Set up profile
        </Link>
      </div>
    );
  }

  const totals = mealsData?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const totalSets = workouts.reduce(
    (sum, w) => sum + w.exercises.reduce((s, ex) => s + ex.sets.length, 0),
    0
  );

  return (
    <div className="safe-top">
      <div className="px-5 pt-6 pb-4">
        <p className="text-muted text-sm">{today}</p>
        <h1 className="font-display text-3xl text-chalk mt-0.5">
          Goal: <span className="capitalize text-ember">{profile.goalType}</span>
        </h1>
      </div>

      <div className="px-5">
        <div className="bg-surface rounded-2xl p-5 space-y-5">
          <MacroBar
            label="Calories"
            current={totals.calories}
            target={profile.calorieTarget}
            unit="kcal"
            color="#FF6B35"
          />
          <MacroBar
            label="Protein"
            current={totals.protein}
            target={profile.proteinTarget}
            unit="g"
            color="#8BC53F"
          />
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <p className="text-xs text-muted">Carbs</p>
              <p className="stat-number text-xl">{Math.round(totals.carbs)}g</p>
            </div>
            <div>
              <p className="text-xs text-muted">Fat</p>
              <p className="stat-number text-xl">{Math.round(totals.fat)}g</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-surface rounded-2xl p-4">
            <p className="text-xs text-muted mb-1">BMR</p>
            <p className="stat-number text-2xl">{profile.bmr}</p>
            <p className="text-xs text-muted">kcal/day</p>
          </div>
          <div className="bg-surface rounded-2xl p-4">
            <p className="text-xs text-muted mb-1">TDEE</p>
            <p className="stat-number text-2xl">{profile.tdee}</p>
            <p className="text-xs text-muted">kcal/day</p>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-4 mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted mb-1">Today's workout</p>
            <p className="stat-number text-2xl">
              {workouts.length === 0 ? "Rest day" : `${totalSets} sets`}
            </p>
          </div>
          <Link
            to="/workout"
            className="bg-surface2 text-chalk text-sm font-medium rounded-xl px-4 py-2.5"
          >
            {workouts.length === 0 ? "Log workout" : "View"}
          </Link>
        </div>

        <div className="mt-6 mb-2">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm text-muted">Meals today</h2>
            <Link to="/food" className="text-ember text-sm font-medium">+ Add food</Link>
          </div>
          {mealsData.meals.length === 0 ? (
            <p className="text-muted text-sm py-4">Nothing logged yet today.</p>
          ) : (
            <div className="space-y-2">
              {mealsData.meals.map((meal) => (
                <div key={meal.id} className="bg-surface rounded-xl p-3.5 flex justify-between items-center">
                  <div>
                    <p className="capitalize text-sm font-medium">{meal.mealType}</p>
                    <p className="text-xs text-muted">{meal.items.length} item(s)</p>
                  </div>
                  <p className="stat-number text-lg">{meal.calories} kcal</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
