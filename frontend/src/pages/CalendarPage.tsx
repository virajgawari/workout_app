import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getCalendar, updateCalendarDay } from "../api";
import { Card } from "../components/shared/Card";
import type { CalendarDay } from "../types";
import { currentMonthKey, formatMonth, shiftMonth } from "../utils/format";

type Props = {
  refresh: () => Promise<void>;
};

const dayTypes = ["WORKOUT", "REST", "HOLIDAY", "VACATION"];

export function CalendarPage({ refresh }: Props) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMonth(month: string) {
    setLoading(true);
    try {
      setDays(await getCalendar(month));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMonth(selectedMonth);
  }, [selectedMonth]);

  const grouped = useMemo(() => {
    const weeks: CalendarDay[][] = [];
    for (let index = 0; index < days.length; index += 7) {
      weeks.push(days.slice(index, index + 7));
    }
    return weeks;
  }, [days]);

  return (
    <Card title="Workout Calendar" subtitle="Browse any month and update day types">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedMonth((month) => shiftMonth(month, -1))}
            className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/5"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="min-w-[10rem] text-center text-lg font-semibold text-white">{formatMonth(selectedMonth)}</p>
          <button
            onClick={() => setSelectedMonth((month) => shiftMonth(month, 1))}
            className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/5"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        {selectedMonth !== currentMonthKey() ? (
          <button
            onClick={() => setSelectedMonth(currentMonthKey())}
            className="rounded-full border border-glow/30 px-4 py-2 text-sm font-semibold text-glow hover:bg-glow/10"
          >
            Back to this month
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="py-12 text-center text-slate-400">Loading calendar…</p>
      ) : (
        <div className="space-y-3">
          {grouped.map((week, index) => (
            <div key={index} className="grid grid-cols-7 gap-3">
              {week.map((day) => (
                <button
                  key={day.date}
                  onClick={async () => {
                    const currentIndex = dayTypes.indexOf(day.day_type);
                    const nextType = dayTypes[(currentIndex + 1) % dayTypes.length];
                    await updateCalendarDay(day.date, nextType);
                    await loadMonth(selectedMonth);
                    await refresh();
                  }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
                >
                  <p className="text-lg font-semibold text-white">{new Date(day.date).getDate()}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-400">{day.day_type}</p>
                  <p className="mt-1 text-sm text-slate-300">{day.status}</p>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-sm text-slate-400">
        Use the arrows to view previous or future months. Click a day to cycle between workout, rest, holiday, and vacation. Rest, holiday, and vacation stay neutral and do not hurt streaks.
      </p>
    </Card>
  );
}
