import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function History() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/workouts/history").then((data) => {
      setWorkouts(data.filter((w) => w.exercises.length > 0));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-muted safe-top">Loading…</div>;

  return (
    <div className="safe-top px-5 pt-6">
      <h1 className="font-display text-3xl mb-4">Workout history</h1>

      {workouts.length === 0 ? (
        <p className="text-muted text-sm py-6">No workouts logged yet. Head to the Workout tab to log your first session.</p>
      ) : (
        <div className="space-y-4">
          {workouts.map((w) => (
            <div key={w.id} className="bg-surface rounded-2xl p-4">
              <p className="text-sm text-muted mb-2">
                {new Date(w.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <div className="space-y-2">
                {w.exercises.map((ex) => (
                  <div key={ex.id} className="flex justify-between items-center">
                    <span className="text-sm">{ex.name}</span>
                    <span className="text-xs text-muted">
                      {ex.sets.length} set{ex.sets.length !== 1 ? "s" : ""}
                      {ex.sets[0]?.weightKg ? ` · up to ${Math.max(...ex.sets.map((s) => s.weightKg || 0))}kg` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
