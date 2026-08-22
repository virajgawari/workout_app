import { Award, Lock } from "lucide-react";

import { Card } from "../components/shared/Card";
import type { Achievement } from "../types";

type Props = {
  achievements: Achievement[];
};

export function AchievementsPage({ achievements }: Props) {
  return (
    <Card title="Achievements" subtitle="Unlocked badges and the next milestones to chase.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-3xl border p-5 ${achievement.unlocked ? "border-gold/30 bg-gold/10" : "border-white/10 bg-white/5"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-2xl p-3 ${achievement.unlocked ? "bg-gold/20 text-gold" : "bg-white/10 text-slate-400"}`}>
                {achievement.unlocked ? <Award size={20} /> : <Lock size={20} />}
              </div>
              <div>
                <p className="font-semibold text-white">{achievement.name}</p>
                <p className="text-sm text-slate-400">{achievement.xp_reward} XP</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-300">{achievement.description}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
