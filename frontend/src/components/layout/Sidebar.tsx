import { Award, Calendar, Dumbbell, Gauge, History, Home, Medal, Settings, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/routines", label: "Routines", icon: Sparkles },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/progress", label: "Progress", icon: Gauge },
  { to: "/achievements", label: "Achievements", icon: Award },
  { to: "/records", label: "PRs", icon: Medal },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="card sticky top-4 hidden h-[calc(100vh-2rem)] w-72 flex-col overflow-hidden lg:flex">
      <div className="border-b border-white/10 p-6">
        <p className="font-display text-5xl uppercase tracking-[0.25em] text-white">WQ</p>
        <p className="mt-2 text-sm text-slate-300">Workout Quest</p>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                  isActive ? "bg-glow/20 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
