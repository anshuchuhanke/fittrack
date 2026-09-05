import React from "react";
import { NavLink } from "react-router-dom";

const ICONS = {
  dashboard: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z"
        fill={active ? "#FF6B35" : "#948E85"} />
    </svg>
  ),
  food: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 2v8a2 2 0 0 0 2 2v10h2V12a2 2 0 0 0 2-2V2h-2v7h-.5V2h-1v7H9V2H7Zm10 0c-1.7 0-3 2.2-3 5s1.3 5 3 5v9h2V2h-2Z"
        fill={active ? "#FF6B35" : "#948E85"} />
    </svg>
  ),
  workout: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M20.6 10.4 18.2 8l-1.4 1.4 1.1 1.1-4.2 4.2-1.1-1.1L14 12.2 11.8 10l-1.4 1.4 1.1 1.1-1.1 1.1-1.1-1.1L7.9 14l1.1 1.1-1.1 1.1 2.4 2.4 1.1-1.1 1.1 1.1 1.4-1.4-1.1-1.1 4.2-4.2 1.1 1.1 1.4-1.4-1.1-1.1 2.2-2.1ZM4.5 3 3 4.5 5 6.5 3.5 8 2 6.5.5 8l1.5 1.5L0 11l1.4 1.4L3 10.9l1.5 1.5L6 10.9 4.5 9.4 6 7.9l1.5 1.5L9 7.9 4.5 3Z"
        fill={active ? "#FF6B35" : "#948E85"} />
    </svg>
  ),
  history: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-7-7V3ZM12 3v6l4 2" stroke={active ? "#FF6B35" : "#948E85"} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  profile: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={active ? "#FF6B35" : "#948E85"} />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke={active ? "#FF6B35" : "#948E85"} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),
};

const ITEMS = [
  { to: "/", label: "Today", icon: "dashboard", end: true },
  { to: "/food", label: "Food", icon: "food" },
  { to: "/workout", label: "Workout", icon: "workout" },
  { to: "/history", label: "History", icon: "history" },
  { to: "/profile", label: "Profile", icon: "profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-white/5 safe-bottom">
      <div className="max-w-md mx-auto flex justify-around">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex-1 flex flex-col items-center gap-1 py-2.5"
          >
            {({ isActive }) => (
              <>
                {ICONS[item.icon](isActive)}
                <span
                  className={`text-[11px] font-medium ${isActive ? "text-ember" : "text-muted"}`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
