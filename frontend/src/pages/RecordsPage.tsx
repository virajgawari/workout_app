import { Card } from "../components/shared/Card";

type Props = {
  records: {
    exercise_name: string;
    best_weight: number;
    best_reps: number;
    estimated_one_rm: number;
    achieved_on?: string | null;
  }[];
};

export function RecordsPage({ records }: Props) {
  return (
    <Card title="Personal Records" subtitle="Automatic PR tracking from completed workout sets.">
      <div className="grid gap-4 md:grid-cols-2">
        {records.map((record) => (
          <div key={record.exercise_name} className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-lg font-semibold text-white">{record.exercise_name}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Best Weight</p>
                <p className="mt-2 text-2xl font-bold text-glow">{record.best_weight} kg</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Best Reps</p>
                <p className="mt-2 text-2xl font-bold text-pulse">{record.best_reps}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">Estimated 1RM: {record.estimated_one_rm}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
