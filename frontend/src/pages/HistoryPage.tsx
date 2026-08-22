import { Card } from "../components/shared/Card";
import type { WorkoutSession } from "../types";
import { formatDate } from "../utils/format";

type Props = {
  sessions: WorkoutSession[];
};

export function HistoryPage({ sessions }: Props) {
  return (
    <Card title="Workout History" subtitle="Every logged session stored in PostgreSQL.">
      <div className="space-y-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{formatDate(session.workout_date)}</p>
                <p className="text-sm text-slate-400">{session.status}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-white">{session.total_xp} XP</p>
                <p className="text-sm text-slate-400">{session.completion_percent}% completion</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
