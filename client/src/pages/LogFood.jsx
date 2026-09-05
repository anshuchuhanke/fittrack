import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function LogFood() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState("breakfast");
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [todayItems, setTodayItems] = useState([]);

  async function loadToday() {
    const data = await api.get("/meals");
    setTodayItems(data.meals.flatMap((m) => m.items.map((i) => ({ ...i, mealType: m.mealType }))));
  }

  useEffect(() => {
    loadToday();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    const handle = setTimeout(async () => {
      try {
        const res = await api.get(`/foods/search?q=${encodeURIComponent(q)}`);
        setResults(res);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  async function handleAiLookup() {
    if (!query.trim()) return;
    setAiLoading(true);
    setMessage("");
    try {
      const food = await api.post("/foods/ai-lookup", { name: query.trim() });
      setSelectedFood(food);
      setResults([]);
      setQuery("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAddToLog() {
    if (!selectedFood) return;
    await api.post("/meals/log", {
      mealType,
      foodId: selectedFood.id,
      quantityGrams: Number(quantity),
    });
    setSelectedFood(null);
    setQuantity(100);
    setMessage(`Added ${selectedFood.name} to ${mealType}`);
    loadToday();
    setTimeout(() => setMessage(""), 2500);
  }

  async function handleRemove(itemId) {
    await api.delete(`/meals/item/${itemId}`);
    loadToday();
  }

  return (
    <div className="safe-top px-5 pt-6">
      <h1 className="font-display text-3xl mb-4">Log food</h1>

      <div className="relative mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods, e.g. paneer, dal, roti…"
          className="w-full bg-surface rounded-xl px-4 py-3.5 text-chalk outline-none focus:ring-2 focus:ring-ember"
        />
      </div>

      {message && <p className="text-sprout text-sm mb-3">{message}</p>}

      {query && (
        <div className="mb-4">
          {searching && <p className="text-muted text-sm py-2">Searching…</p>}
          {!searching && results.length === 0 && (
            <button
              onClick={handleAiLookup}
              disabled={aiLoading}
              className="w-full text-left bg-surface rounded-xl px-4 py-3.5 flex items-center justify-between disabled:opacity-60"
            >
              <span className="text-sm">
                Not found — <span className="text-ember">estimate "{query}" with AI</span>
              </span>
              {aiLoading && <span className="text-xs text-muted">Working…</span>}
            </button>
          )}
          <div className="space-y-2 mt-2">
            {results.map((food) => (
              <button
                key={food.id}
                onClick={() => {
                  setSelectedFood(food);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full text-left bg-surface rounded-xl px-4 py-3 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium">{food.name}</p>
                  <p className="text-xs text-muted">{food.category}</p>
                </div>
                <p className="text-xs text-muted">
                  {food.caloriesPer100g} kcal / {food.proteinPer100g}g P per 100g
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedFood && (
        <div className="bg-surface rounded-2xl p-4 mb-6 space-y-4">
          <div>
            <p className="text-sm font-medium">{selectedFood.name}</p>
            <p className="text-xs text-muted">
              Per 100g: {selectedFood.caloriesPer100g} kcal, {selectedFood.proteinPer100g}g protein
            </p>
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Quantity (grams)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-surface2 rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1.5">Meal</label>
            <div className="grid grid-cols-4 gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt}
                  onClick={() => setMealType(mt)}
                  className={`capitalize text-xs font-medium rounded-lg py-2.5 ${
                    mealType === mt ? "bg-ember text-graphite" : "bg-surface2 text-muted"
                  }`}
                >
                  {mt}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted">
            ≈ {Math.round((selectedFood.caloriesPer100g * quantity) / 100)} kcal ·{" "}
            {Math.round((selectedFood.proteinPer100g * quantity) / 100)}g protein
          </div>

          <button
            onClick={handleAddToLog}
            className="w-full bg-ember text-graphite font-semibold rounded-xl py-3"
          >
            Add to log
          </button>
        </div>
      )}

      <div>
        <h2 className="text-sm text-muted mb-2">Logged today</h2>
        {todayItems.length === 0 ? (
          <p className="text-muted text-sm py-4">No items logged yet.</p>
        ) : (
          <div className="space-y-2">
            {todayItems.map((item) => (
              <div key={item.id} className="bg-surface rounded-xl px-4 py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{item.food.name}</p>
                  <p className="text-xs text-muted capitalize">
                    {item.mealType} · {item.quantityGrams}g · {item.calories} kcal
                  </p>
                </div>
                <button onClick={() => handleRemove(item.id)} className="text-danger text-xs font-medium">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
