import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { ProgressData } from "../../types";
import { Card } from "../shared/Card";

type Props = {
  data: ProgressData;
};

export function WorkoutCharts({ data }: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Workout Frequency">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.workout_frequency}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="completed" fill="#5ef2b6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Workout Volume">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.workout_volume}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line dataKey="volume" stroke="#66d0ff" strokeWidth={3} dot={{ fill: "#66d0ff" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Strength Progression">
        <div className="space-y-3">
          {data.strength_progression.map((item) => (
            <div key={item.exercise}>
              <div className="mb-1 flex justify-between text-sm text-slate-300">
                <span>{item.exercise}</span>
                <span>{item.best_weight} kg</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-pulse to-glow" style={{ width: `${Math.min(item.best_weight, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Monthly Scores">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthly_scores}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line dataKey="score" stroke="#f6cf56" strokeWidth={3} dot={{ fill: "#f6cf56" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
