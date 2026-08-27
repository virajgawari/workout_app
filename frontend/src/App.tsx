import { FormEvent, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import axios from "axios";

import {
  getAchievements,
  getCalendar,
  getDashboard,
  getExercises,
  getHabits,
  getProgress,
  getRecords,
  getRoutines,
  getSessions,
  getSettings,
  getTodayWorkout,
  login,
  register
} from "./api";
import { setAuthToken } from "./api/client";
import { BottomNav } from "./components/layout/BottomNav";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { AchievementsPage } from "./pages/AchievementsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProgressPage } from "./pages/ProgressPage";
import { RecordsPage } from "./pages/RecordsPage";
import { RoutinesPage } from "./pages/RoutinesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WorkoutPage } from "./pages/WorkoutPage";
import type {
  Achievement,
  AuthResponse,
  CalendarDay,
  DashboardData,
  Exercise,
  Habit,
  ProgressData,
  Routine,
  TodayWorkoutResponse,
  WorkoutSession
} from "./types";

const todayMonth = new Date().toISOString().slice(0, 7);

function AuthScreen({ onAuth }: { onAuth: (data: AuthResponse) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = mode === "login" ? await login(email, password) : await register(name, email, password);
      onAuth(data);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Could not authenticate. Make sure the backend server is running.";
      setError(typeof msg === "string" ? msg : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh p-6">
      <div className="card w-full max-w-5xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-gradient-to-br from-ember/30 via-transparent to-pulse/30 p-10">
            <p className="font-display text-7xl uppercase tracking-[0.2em] text-white">Workout Quest</p>
            <p className="mt-6 max-w-xl text-lg text-slate-200">
              A workout tracker, habit tracker, and RPG progression dashboard that turns consistency into XP, levels, streaks, monthly scores, and achievements.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Auto-loaded routines", "Calendar streak logic", "Junk food habit XP", "TXT workout exports"].map((item) => (
                <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{mode === "login" ? "Welcome back" : "Create account"}</p>
              <h1 className="mt-2 text-3xl font-bold text-white">{mode === "login" ? "Continue your streak" : "Start your quest"}</h1>
            </div>
            {mode === "register" ? (
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-panel p-3 text-white"
                placeholder="Name"
                required
              />
            ) : null}
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-panel p-3 text-white"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-panel p-3 text-white"
              placeholder="Password"
              required
            />
            {error ? <p className="text-sm text-ember">{error}</p> : null}
            <button
              disabled={submitting}
              className="w-full rounded-2xl bg-glow px-4 py-3 font-semibold text-ink hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? "Processing..." : mode === "login" ? "Log in" : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="text-sm text-slate-400 hover:text-white"
            >
              {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<TodayWorkoutResponse | null>(null);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [settings, setSettingsData] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("workout-quest-auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthResponse;
        if (parsed?.access_token) {
          setAuth(parsed);
          setAuthToken(parsed.access_token);
        } else {
          localStorage.removeItem("workout-quest-auth");
        }
      } catch {
        localStorage.removeItem("workout-quest-auth");
      }
    }

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener("workout-quest-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("workout-quest-unauthorized", handleUnauthorized);
    };
  }, []);

  async function refreshAll() {
    setLoadingError(null);
    try {
      const [
        dashboardData,
        exercisesData,
        routinesData,
        todayData,
        calendarData,
        habitsData,
        achievementsData,
        recordsData,
        progressData,
        sessionsData,
        settingsData
      ] = await Promise.all([
        getDashboard(todayMonth),
        getExercises(),
        getRoutines(),
        getTodayWorkout(),
        getCalendar(todayMonth),
        getHabits(todayMonth),
        getAchievements(),
        getRecords(),
        getProgress(),
        getSessions(),
        getSettings()
      ]);

      setDashboard(dashboardData);
      setExercises(exercisesData);
      setRoutines(routinesData);
      setTodayWorkout(todayData);
      setCalendar(calendarData);
      setHabits(habitsData);
      setAchievements(achievementsData);
      setRecords(recordsData);
      setProgress(progressData);
      setSessions(sessionsData);
      setSettingsData(settingsData);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        return;
      }
      setLoadingError("Could not connect to backend server. Make sure the backend is active at http://127.0.0.1:8000.");
    }
  }

  useEffect(() => {
    if (!auth) {
      return;
    }
    void refreshAll();
  }, [auth]);

  function handleAuth(data: AuthResponse) {
    setAuth(data);
    setAuthToken(data.access_token);
    localStorage.setItem("workout-quest-auth", JSON.stringify(data));
  }

  function logout() {
    setAuth(null);
    setDashboard(null);
    setProgress(null);
    setAuthToken(null);
    setLoadingError(null);
    localStorage.removeItem("workout-quest-auth");
  }

  if (!auth) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  if (!dashboard || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh p-6">
        <div className="card max-w-md p-8 text-center">
          <p className="font-display text-4xl uppercase tracking-[0.22em] text-white">
            {loadingError ? "Connection Error" : "Loading Quest Data"}
          </p>
          <p className="mt-3 text-slate-300">
            {loadingError || "Pulling your workouts, habits, streaks, and monthly score..."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => void refreshAll()}
              className="rounded-full bg-glow px-5 py-2.5 text-sm font-semibold text-ink hover:brightness-110"
            >
              Retry
            </button>
            <button
              onClick={logout}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 hover:bg-white/10"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh p-3 sm:p-4 text-white lg:p-6 pb-safe">
      <div className="mx-auto flex max-w-[1600px] gap-6">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Topbar name={auth.user.name} stats={dashboard.stats} onLogout={logout} refresh={refreshAll} />
          <Routes>
            <Route path="/" element={<DashboardPage data={dashboard} refresh={refreshAll} />} />
            <Route path="/workout" element={<WorkoutPage todayWorkout={todayWorkout} refresh={refreshAll} />} />
            <Route path="/routines" element={<RoutinesPage exercises={exercises} routines={routines} refresh={refreshAll} />} />
            <Route path="/calendar" element={<CalendarPage refresh={refreshAll} />} />
            <Route path="/progress" element={<ProgressPage data={progress} />} />
            <Route path="/achievements" element={<AchievementsPage achievements={achievements} />} />
            <Route path="/records" element={<RecordsPage records={records} />} />
            <Route path="/history" element={<HistoryPage sessions={sessions} />} />
            <Route path="/settings" element={<SettingsPage settings={settings} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
