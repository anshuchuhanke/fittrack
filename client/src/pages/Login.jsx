import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, secret);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-10 max-w-sm mx-auto safe-top">
      <div className="mb-10 text-center">
        <h1 className="font-display text-5xl text-chalk tracking-tight">FitTrack</h1>
        <p className="text-muted mt-2 text-sm">Macros and workouts, in one place.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-muted mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
            placeholder="••••••••"
          />
        </div>

        {mode === "signup" && (
          <div>
            <label className="block text-xs text-muted mb-1.5">Signup secret</label>
            <input
              type="password"
              required
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full bg-surface rounded-xl px-4 py-3 text-chalk outline-none focus:ring-2 focus:ring-ember"
              placeholder="The secret you set on the server"
            />
          </div>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-ember text-graphite font-semibold rounded-xl py-3.5 mt-2 active:scale-[0.98] transition disabled:opacity-60"
        >
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="text-muted text-sm mt-6 text-center"
      >
        {mode === "login" ? "First time here? Create an account" : "Already have an account? Log in"}
      </button>
    </div>
  );
}
