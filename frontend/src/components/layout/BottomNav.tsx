import { useState } from "react";
import { Award, Calendar, Dumbbell, Gauge, History, Home, Medal, MoreHorizontal, Settings, Sparkles, X } from "lucide-react";
import { NavLink } from "react-router-dom";

const primaryNavItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/workout", label: "Workout", icon: Dumbbell },
  { to: "/routines", label: "Routines", icon: Sparkles },
  { to: "/calendar", label: "Calendar", icon: Calendar }
];

const secondaryNavItems = [
  { to: "/progress", label: "Progress & Charts", icon: Gauge, desc: "XP growth and bodyweight trends" },
  { to: "/achievements", label: "Achievements", icon: Award, desc: "Unlocked badges and milestones" },
  { to: "/records", label: "Personal Records", icon: Medal, desc: "All-time PRs across exercises" },
  { to: "/history", label: "Workout History", icon: History, desc: "Completed training logs" },
  { to: "/settings", label: "Settings", icon: Settings, desc: "Account and quest preferences" }
];

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Slide-up sheet for secondary navigation */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="card mx-2 mb-2 max-h-[80vh] overflow-y-auto rounded-3xl border border-white/15 bg-panel/95 p-5 pb-safe-nav shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">More Sections</span>
              <button
                onClick={() => setMoreOpen(false)}
                className="rounded-full bg-white/10 p-1.5 text-slate-300 active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-2">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 rounded-2xl p-3.5 transition active:scale-[0.98] ${
                        isActive
                          ? "bg-glow/20 text-glow border border-glow/30"
                          : "border border-white/5 bg-white/5 text-slate-200 hover:bg-white/10"
                      }`
                    }
                  >
                    <div className="rounded-xl bg-white/10 p-2 text-white">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating iOS Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden pointer-events-none p-3 pb-safe-nav">
        <nav className="pointer-events-auto mx-auto max-w-md rounded-full border border-white/15 bg-panel/90 p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
          <div className="flex items-center justify-around">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center rounded-full py-2 px-3 text-xs transition duration-150 active:scale-95 ${
                      isActive
                        ? "bg-glow/20 text-glow font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`
                  }
                >
                  <Icon size={20} className="mb-0.5" />
                  <span className="text-[11px] leading-tight">{item.label}</span>
                </NavLink>
              );
            })}

            <button
              type="button"
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex flex-col items-center justify-center rounded-full py-2 px-3 text-xs transition duration-150 active:scale-95 ${
                moreOpen ? "bg-glow/20 text-glow font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MoreHorizontal size={20} className="mb-0.5" />
              <span className="text-[11px] leading-tight">More</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}
