import { Card } from "../components/shared/Card";

type Props = {
  settings: {
    profile: { name: string; email: string };
    xp_rules: Record<string, number>;
  } | null;
};

export function SettingsPage({ settings }: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card title="Profile">
        <p className="text-white">{settings?.profile.name}</p>
        <p className="text-slate-400">{settings?.profile.email}</p>
      </Card>
      <Card title="XP Rules">
        <div className="space-y-3">
          {settings &&
            Object.entries(settings.xp_rules).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-slate-300">{key}</span>
                <span className="font-semibold text-white">{value}</span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
