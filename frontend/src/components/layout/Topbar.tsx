import { useState } from "react";
import { Flame, RotateCcw, Salad, Star } from "lucide-react";

import { resetTodayStatus } from "../../api";

type Props = {
  name: string;
  stats: {
    current_streak: number;
    healthy_streak: number;
    total_xp: number;
  };
  onLogout: () => void;
  refresh: () => Promise<void>;
};

export function Topbar({ name, stats, onLogout, refresh }: Props) {
  const [resetting, setResetting] = useState(false);

  async function handleResetToday() {
    if (!window.confirm("Reset today's status to zero? This clears workout progress, habit log, and all XP earned today.")) {
      return;
    }
    setResetting(true);
    try {
      await resetTodayStatus();
      await refresh();
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="card mb-4 lg:mb-6 flex flex-col gap-4 bg-gradient-to-r from-white/8 via-white/3 to-white/8 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-slate-400">Daily Status</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white">How are you doing, {name.split(" ")[0]}?</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">Show up for the routine, protect the streak, and turn consistency into XP.</p>
        </div>
        <button
          onClick={onLogout}
          className="shrink-0 rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 active:scale-95"
        >
          Log out
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 sm:p-3 text-center">
          <Flame className="mx-auto mb-1 text-ember" size={20} />
          <p className="text-xl sm:text-2xl font-bold">{stats.current_streak}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400">Workout</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 sm:p-3 text-center">
          <Salad className="mx-auto mb-1 text-glow" size={20} />
          <p className="text-xl sm:text-2xl font-bold">{stats.healthy_streak}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400">Clean Days</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 sm:p-3 text-center">
          <Star className="mx-auto mb-1 text-gold" size={20} />
          <p className="text-xl sm:text-2xl font-bold">{stats.total_xp.toLocaleString()}</p>
          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400">Total XP</p>
        </div>
      </div>

      <div>
        <button
          onClick={handleResetToday}
          disabled={resetting}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-slate-300 transition hover:border-white/25 hover:bg-white/5 active:scale-95 disabled:opacity-50"
        >
          <RotateCcw size={13} className={resetting ? "animate-spin" : undefined} />
          {resetting ? "Resetting…" : "Reset today's status to zero"}
        </button>
      </div>
    </div>
  );
}
