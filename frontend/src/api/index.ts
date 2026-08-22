import { api } from "./client";
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
} from "../types";

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function register(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return data;
}

export async function getDashboard(month?: string) {
  const { data } = await api.get<DashboardData>("/dashboard", { params: month ? { month } : undefined });
  return data;
}

export async function resetTodayStatus() {
  const { data } = await api.post<{ ok: boolean }>("/dashboard/reset-today");
  return data;
}

export async function getExercises() {
  const { data } = await api.get<Exercise[]>("/exercises");
  return data;
}

export async function createExercise(payload: Partial<Exercise>) {
  const { data } = await api.post<Exercise>("/exercises", payload);
  return data;
}

export async function getRoutines() {
  const { data } = await api.get<Routine[]>("/routines");
  return data;
}

export async function saveRoutine(payload: Partial<Routine>, id?: number) {
  const { data } = id ? await api.put<Routine>(`/routines/${id}`, payload) : await api.post<Routine>("/routines", payload);
  return data;
}

export async function deleteRoutine(id: number) {
  await api.delete(`/routines/${id}`);
}

export async function getTodayWorkout(date?: string) {
  const { data } = await api.get<TodayWorkoutResponse>("/sessions/today", { params: date ? { workout_date: date } : undefined });
  return data;
}

export async function createSession(workout_date: string, routine_id?: number) {
  const { data } = await api.post<WorkoutSession>("/sessions", { workout_date, routine_id });
  return data;
}

export async function updateSession(sessionId: number, payload: any) {
  const { data } = await api.put(`/sessions/${sessionId}`, payload);
  return data;
}

export async function getSessions() {
  const { data } = await api.get<WorkoutSession[]>("/sessions");
  return data;
}

export function getSessionExportUrl(sessionId: number) {
  return `${api.defaults.baseURL}/sessions/${sessionId}/export`;
}

export async function getCalendar(month: string) {
  const { data } = await api.get<CalendarDay[]>("/calendar", { params: { month } });
  return data;
}

export async function updateCalendarDay(date: string, day_type: string) {
  const { data } = await api.put<CalendarDay>("/calendar/day", { date, day_type });
  return data;
}

export async function getHabits(month?: string) {
  const { data } = await api.get<Habit[]>("/habits", { params: month ? { month } : undefined });
  return data;
}

export async function upsertHabit(payload: { date: string; junk_food: boolean; notes?: string }) {
  const { data } = await api.put<Habit>("/habits", payload);
  return data;
}

export async function getAchievements() {
  const { data } = await api.get<Achievement[]>("/achievements");
  return data;
}

export async function getRecords() {
  const { data } = await api.get("/records");
  return data;
}

export async function getProgress() {
  const { data } = await api.get<ProgressData>("/progress");
  return data;
}

export async function getSettings() {
  const { data } = await api.get("/settings");
  return data;
}
