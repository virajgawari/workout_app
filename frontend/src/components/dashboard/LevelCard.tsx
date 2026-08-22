import { Card } from "../shared/Card";

type Props = {
  level: {
    level: number;
    title: string;
    current_xp: number;
    next_level_xp: number;
    level_floor: number;
    progress_percent: number;
  };
};

export function LevelCard({ level }: Props) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-pulse/20 via-white/5 to-glow/20">
      <p className="font-display text-5xl uppercase tracking-[0.18em] text-white">Level {level.level}</p>
      <p className="mt-1 text-sm uppercase tracking-[0.35em] text-pulse">{level.title}</p>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
          <span>{level.current_xp.toLocaleString()} XP</span>
          <span>{level.next_level_xp.toLocaleString()} XP</span>
        </div>
        <div className="h-3 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pulse to-glow transition-all duration-500"
            style={{ width: `${level.progress_percent}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
