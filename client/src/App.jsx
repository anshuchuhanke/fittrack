import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LogFood from "./pages/LogFood.jsx";
import LogWorkout from "./pages/LogWorkout.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";

function Splash() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-graphite">
      <span className="font-display text-3xl text-ember tracking-tight">FitTrack</span>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <Splash />;

  return (
    <div className="min-h-screen bg-graphite text-chalk">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <div className="pb-20 max-w-md mx-auto min-h-screen">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/food" element={<LogFood />} />
                  <Route path="/workout" element={<LogWorkout />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <BottomNav />
            </RequireAuth>
          }
        />
      </Routes>
    </div>
  );
}
