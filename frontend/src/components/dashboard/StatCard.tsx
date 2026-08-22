type Props = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "glow" | "pulse" | "ember" | "gold";
};

export function StatCard({ label, value, hint, accent = "glow" }: Props) {
  const accentMap = {
    glow: "from-glow/30 to-glow/5 text-glow",
    pulse: "from-pulse/30 to-pulse/5 text-pulse",
    ember: "from-ember/30 to-ember/5 text-ember",
    gold: "from-gold/30 to-gold/5 text-gold"
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${accentMap[accent]} p-4`}>
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-2 text-sm text-slate-300">{hint}</p> : null}
    </div>
  );
}
