import { Card } from "../shared/Card";
import { scoreTone } from "../../utils/format";

type Props = {
  score: {
    month: string;
    total_score: number;
    workout_score: number;
    consistency_score: number;
    nutrition_score: number;
    progress_score: number;
    streak_score: number;
    rating: string;
  };
};

export function ScoreBreakdown({ score }: Props) {
  const bars = [
    ["Consistency", score.consistency_score, 40],
    ["Completion", score.workout_score, 25],
    ["Nutrition", score.nutrition_score, 20],
    ["PRs", score.progress_score, 10],
    ["Streak", score.streak_score, 5]
  ] as const;

  return (
    <Card title="Monthly Fitness Score" subtitle={score.month}>
      <div className="mb-5 flex items-center gap-4">
        <div
          className="metric-ring flex h-24 w-24 items-center justify-center rounded-full"
          style={{ ["--progress" as string]: `${score.total_score}%` }}
        >
          <div className="text-center">
            <p className={`text-3xl font-bold ${scoreTone(score.total_score)}`}>{score.total_score}</p>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">out of 100</p>
          </div>
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Rating</p>
          <p className="font-display text-4xl uppercase text-white">{score.rating}</p>
        </div>
      </div>
      <div className="space-y-3">
        {bars.map(([label, value, max]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-sm text-slate-300">
              <span>{label}</span>
              <span>
                {value}/{max}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-ember via-gold to-glow" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
