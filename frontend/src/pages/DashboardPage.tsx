import { Dumbbell, ShieldCheck, Trophy } from "lucide-react";

import { upsertHabit } from "../api";
import type { DashboardData } from "../types";
import { ConsistencyCalendar } from "../components/dashboard/ConsistencyCalendar";
import { LevelCard } from "../components/dashboard/LevelCard";
import { ScoreBreakdown } from "../components/dashboard/ScoreBreakdown";
import { StatCard } from "../components/dashboard/StatCard";
import { Card } from "../components/shared/Card";
import { formatDate } from "../utils/format";

type Props = {
  data: DashboardData;
  refresh: () => Promise<void>;
};

export function DashboardPage({ data, refresh }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <Card className="overflow-hidden bg-gradient-to-br from-ember/20 via-white/5 to-pulse/20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Today's Workout</p>
              <h2 className="mt-3 font-display text-5xl uppercase tracking-[0.08em] text-white">{data.today_summary.routine_name}</h2>
              <p className="mt-3 max-w-xl text-slate-300">
                Today’s answer to “How am I doing?” is based on your scheduled session status, live completion percentage, and streak momentum.
              </p>
            </div>
            <div
              className="metric-ring flex h-40 w-40 items-center justify-center rounded-full"
              style={{ ["--progress" as string]: `${data.today_summary.completion_percent}%` }}
            >
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{data.today_summary.completion_percent}%</p>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{data.today_summary.status}</p>
              </div>
            </div>
          </div>
        </Card>
        <LevelCard level={data.stats.level} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly Score" value={data.monthly_score.total_score} hint={data.monthly_score.rating} accent="gold" />
        <StatCard label="Workouts This Month" value={data.stats.monthly_workouts_completed} hint={`${data.stats.completion_percentage}% completion`} accent="glow" />
        <StatCard label="Junk-Food-Free Days" value={data.stats.junk_food_free_days} hint="Healthy-food streak builder" accent="pulse" />
        <StatCard label="Longest Streak" value={data.stats.longest_streak} hint="Best run so far" accent="ember" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ScoreBreakdown score={data.monthly_score} />
        <ConsistencyCalendar days={data.calendar} />
      </div>

      <Card title="Daily Habit Check" subtitle="Did you eat junk food today?">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={async () => {
              await upsertHabit({ date: new Date().toISOString().slice(0, 10), junk_food: false });
              await refresh();
            }}
            className="rounded-full bg-glow px-5 py-3 font-semibold text-ink hover:brightness-110"
          >
            NO, stayed clean
          </button>
          <button
            onClick={async () => {
              await upsertHabit({ date: new Date().toISOString().slice(0, 10), junk_food: true });
              await refresh();
            }}
            className="rounded-full border border-ember/30 px-5 py-3 font-semibold text-ember hover:bg-ember/10"
          >
            YES, had junk food
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-400">A clean day adds XP and extends your healthy-food streak without overpowering the workout score.</p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card title="Recent Workout History" subtitle="Your latest quest log">
          <div className="space-y-3">
            {data.recent_sessions.map((session) => (
              <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{session.routine_name ?? "Custom Session"}</p>
                    <p className="text-sm text-slate-400">{formatDate(session.workout_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{session.total_xp} XP</p>
                    <p className="text-sm text-slate-400">{session.status}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-pulse to-glow" style={{ width: `${session.completion_percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Personal Bests" subtitle="PR radar">
          <div className="space-y-3">
            {data.personal_records.map((record) => (
              <div key={record.exercise_name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-gold/20 p-3 text-gold">
                    <Trophy size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{record.exercise_name}</p>
                    <p className="text-sm text-slate-400">
                      {record.best_weight ?? "-"} kg × {record.best_reps ?? "-"} reps
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <Dumbbell className="mx-auto mb-2 text-pulse" />
              <p className="text-sm text-slate-400">Work</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <ShieldCheck className="mx-auto mb-2 text-glow" />
              <p className="text-sm text-slate-400">Consistency</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <Trophy className="mx-auto mb-2 text-gold" />
              <p className="text-sm text-slate-400">Progress</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
