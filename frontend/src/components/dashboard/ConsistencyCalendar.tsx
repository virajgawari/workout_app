import { Card } from "../shared/Card";

type Props = {
  days: { date: string; day_type: string; status: string }[];
};

export function ConsistencyCalendar({ days }: Props) {
  const colorForDay = (day: { day_type: string; status: string }) => {
    if (day.day_type !== "WORKOUT") {
      return "bg-slate-700/50";
    }
    if (day.status === "COMPLETED") {
      return "bg-glow";
    }
    if (day.status === "PARTIAL") {
      return "bg-gold";
    }
    if (day.status === "MISSED") {
      return "bg-ember";
    }
    return "bg-slate-700";
  };

  return (
    <Card title="Consistency Calendar" subtitle="Green wins. Red means a missed scheduled day.">
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day.date} className="rounded-2xl border border-white/5 bg-white/5 p-2 text-center">
            <div className={`mx-auto mb-2 h-8 w-8 rounded-xl ${colorForDay(day)}`} />
            <p className="text-sm font-semibold text-white">{new Date(day.date).getDate()}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{day.day_type}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
