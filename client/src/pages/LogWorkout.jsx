import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function LogWorkout() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState([{ reps: "", weightKg: "" }]);

  async function load() {
    setLoading(true);
    const data = await api.get("/workouts");
    setWorkouts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function ensureWorkout() {
    if (workouts.length > 0) return workouts[0].id;
    const w = await api.post("/workouts", {});
    return w.id;
  }

  function updateSet(index, field, value) {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function addSetRow() {
    setSets((prev) => [...prev, { reps: prev[prev.length - 1]?.reps || "", weightKg: prev[prev.length - 1]?.weightKg || "" }]);
  }

  function removeSetRow(index) {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleAddExercise() {
    if (!exerciseName.trim() || sets.length === 0) return;
    const workoutId = await ensureWorkout();
    await api.post(`/workouts/${workoutId}/exercises`, {
      name: exerciseName.trim(),
      sets: sets
        .filter((s) => s.reps !== "")
        .map((s) => ({ reps: Number(s.reps), weightKg: s.weightKg ? Number(s.weightKg) : null })),
    });
    setExerciseName("");
    setSets([{ reps: "", weightKg: "" }]);
    load();
  }

  async function handleRemoveExercise(exerciseId) {
    await api.delete(`/workouts/exercise/${exerciseId}`);
    load();
  }

  if (loading) return <div className="p-6 text-muted safe-top">Loading…</div>;

  const workout = workouts[0];
  const exercises = workout?.exercises || [];

  return (
    <div className="safe-top px-5 pt-6">
      <h1 className="font-display text-3xl mb-4">Today's workout</h1>

      {exercises.length > 0 && (
        <div className="space-y-3 mb-6">
          {exercises.map((ex) => (
            <div key={ex.id} className="bg-surface rounded-2xl p-4">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-sm">{ex.name}</p>
                <button onClick={() => handleRemoveExercise(ex.id)} className="text-danger text-xs font-medium">
                  Remove
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ex.sets.map((s) => (
                  <span key={s.id} className="bg-surface2 text-xs rounded-lg px-2.5 py-1.5 text-chalk">
                    {s.reps} reps{s.weightKg ? ` × ${s.weightKg}kg` : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-surface rounded-2xl p-4 space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1.5">Exercise name</label>
          <input
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            placeholder="e.g. Bench press"
            className="w-full bg-surface2 rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
          />
        </div>

        <div>
          <label className="block text-xs text-muted mb-1.5">Sets</label>
          <div className="space-y-2">
            {sets.map((s, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs text-muted w-5">{i + 1}</span>
                <input
                  type="number"
                  placeholder="Reps"
                  value={s.reps}
                  onChange={(e) => updateSet(i, "reps", e.target.value)}
                  className="flex-1 bg-surface2 rounded-lg px-3 py-2.5 text-chalk outline-none focus:ring-2 focus:ring-ember"
                />
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={s.weightKg}
                  onChange={(e) => updateSet(i, "weightKg", e.target.value)}
                  className="flex-1 bg-surface2 rounded-lg px-3 py-2.5 text-chalk outline-none focus:ring-2 focus:ring-ember"
                />
                {sets.length > 1 && (
                  <button onClick={() => removeSetRow(i)} className="text-danger text-xs px-1">✕</button>
                )}
              </div>
            ))}
          </div>
          <button onClick={addSetRow} className="text-ember text-sm font-medium mt-2">
            + Add set
          </button>
        </div>

        <button
          onClick={handleAddExercise}
          className="w-full bg-ember text-graphite font-semibold rounded-xl py-3"
        >
          Add exercise
        </button>
      </div>
    </div>
  );
}
