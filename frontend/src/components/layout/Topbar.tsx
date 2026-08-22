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
    <div className="card mb-6 flex flex-col gap-4 bg-gradient-to-r from-white/8 via-white/3 to-white/8 p-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Daily Status</p>
        <h1 className="mt-2 text-3xl font-bold text-white">How are you doing today, {name.split(" ")[0]}?</h1>
        <p className="mt-2 text-slate-300">Show up for the routine, protect the streak, and turn consistency into XP.</p>
        <button
          onClick={handleResetToday}
          disabled={resetting}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-white/25 hover:bg-white/5 disabled:opacity-50"
        >
          <RotateCcw size={14} className={resetting ? "animate-spin" : undefined} />
          {resetting ? "Resetting…" : "Reset today's status to zero"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <Flame className="mx-auto mb-2 text-ember" />
          <p className="text-2xl font-bold">{stats.current_streak}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Workout Streak</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <Salad className="mx-auto mb-2 text-glow" />
          <p className="text-2xl font-bold">{stats.healthy_streak}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Clean Days</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
          <Star className="mx-auto mb-2 text-gold" />
          <p className="text-2xl font-bold">{stats.total_xp.toLocaleString()}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total XP</p>
        </div>
      </div>
      <button onClick={onLogout} className="self-start rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
        Log out
      </button>
    </div>
  );
}
