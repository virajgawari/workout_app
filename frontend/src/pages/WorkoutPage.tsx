import { Download, Play, Save, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

import { getSessionExportUrl, updateSession } from "../api";
import { Card } from "../components/shared/Card";
import type { TodayWorkoutResponse, WorkoutSet } from "../types";

type Props = {
  todayWorkout: TodayWorkoutResponse | null;
  refresh: () => Promise<void>;
};

export function WorkoutPage({ todayWorkout, refresh }: Props) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("COMPLETED");
  const [notes, setNotes] = useState("");
  const [draftSets, setDraftSets] = useState<Record<string, WorkoutSet>>({});

  const mergedGroups = useMemo(() => {
    if (!todayWorkout) {
      return [];
    }
    return todayWorkout.grouped_sets.map((group) => ({
      ...group,
      sets: group.sets.map((set) => draftSets[`${set.exercise_id}-${set.set_number}`] ?? set)
    }));
  }, [draftSets, todayWorkout]);

  if (!todayWorkout || !todayWorkout.session) {
    return (
      <Card title="No workout scheduled today" subtitle="Rest, recover, or create a routine for this weekday.">
        <p className="text-slate-300">You can still head to Routines and assign a training block to this day.</p>
      </Card>
    );
  }

  const session = todayWorkout.session;

  async function saveWorkout() {
    setSaving(true);
    try {
      await updateSession(session.id, {
        status,
        notes,
        workout_sets: mergedGroups.flatMap((group) => group.sets)
      });
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card
        className="bg-gradient-to-r from-glow/10 via-white/5 to-pulse/10"
        title={todayWorkout.routine?.name ?? "Today's Session"}
        subtitle="Track every set, including the exact weight used, then collect the XP."
        action={
          <div className="flex gap-2">
            <button
              onClick={saveWorkout}
              disabled={saving}
              className="rounded-full bg-glow px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60"
            >
              <Save size={16} className="mr-2 inline-block" />
              Save Workout
            </button>
            <a href={getSessionExportUrl(todayWorkout.session.id)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">
              <Download size={16} className="mr-2 inline-block" />
              TXT
            </a>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Session Status</p>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-3 w-full rounded-2xl border border-white/10 bg-panel p-3 text-white">
              <option value="COMPLETED">Completed</option>
              <option value="PARTIAL">Partially Completed</option>
              <option value="SKIPPED">Skipped</option>
            </select>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workout XP Potential</p>
            <p className="mt-4 font-display text-5xl uppercase text-gold">+150</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Streak Reward</p>
            <p className="mt-4 flex items-center gap-2 text-2xl font-semibold text-ember">
              <Sparkles size={20} /> Protect the streak
            </p>
          </div>
        </div>
      </Card>

      {mergedGroups.map((group) => (
        <Card key={group.exercise_id} title={group.exercise_name} subtitle="Planned vs actual performance">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-3">Set</th>
                  <th className="pb-3">Target</th>
                  <th className="pb-3">Actual</th>
                  <th className="pb-3">Weight (kg)</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {group.sets.map((set) => {
                  const key = `${set.exercise_id}-${set.set_number}`;
                  const current = draftSets[key] ?? set;
                  return (
                    <tr key={key} className="border-t border-white/5">
                      <td className="py-3">{set.set_number}</td>
                      <td className="py-3">{set.target_reps} reps</td>
                      <td className="py-3">
                        <input
                          type="number"
                          value={current.actual_reps ?? ""}
                          onChange={(event) =>
                            setDraftSets((previous) => ({
                              ...previous,
                              [key]: { ...current, actual_reps: Number(event.target.value) }
                            }))
                          }
                          className="w-20 rounded-xl border border-white/10 bg-panel p-2 text-white"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          step="0.5"
                          value={current.weight ?? ""}
                          onChange={(event) =>
                            setDraftSets((previous) => ({
                              ...previous,
                              [key]: { ...current, weight: Number(event.target.value) }
                            }))
                          }
                          className="w-24 rounded-xl border border-white/10 bg-panel p-2 text-white"
                        />
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() =>
                            setDraftSets((previous) => ({
                              ...previous,
                              [key]: { ...current, completed: !current.completed }
                            }))
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            current.completed ? "bg-glow text-ink" : "border border-white/10 text-slate-300"
                          }`}
                        >
                          {current.completed ? "Completed" : "Pending"}
                        </button>
                      </td>
                      <td className="py-3">
                        <input
                          value={current.notes ?? ""}
                          onChange={(event) =>
                            setDraftSets((previous) => ({
                              ...previous,
                              [key]: { ...current, notes: event.target.value }
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-panel p-2 text-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <p className="mb-3 text-sm text-slate-400">
              Each set's weight is saved with the session, used for PR detection, and included in TXT exports.
            </p>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Overall workout notes"
              className="w-full rounded-2xl border border-white/10 bg-panel p-3 text-white"
            />
          </div>
        </Card>
      ))}

      <Card className="border-glow/30 bg-gradient-to-r from-glow/15 via-transparent to-ember/15">
        <div className="flex items-center gap-3 text-2xl font-semibold text-white">
          <Play className="text-glow" />
          Workout complete moment
        </div>
        <p className="mt-3 text-slate-300">When you save as completed, the backend updates XP, streaks, achievements, PR checks, and the monthly score in PostgreSQL.</p>
      </Card>
    </div>
  );
}
