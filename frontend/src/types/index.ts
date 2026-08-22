export type User = {
  id: number;
  name: string;
  email: string;
};

export type UserStats = {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  healthy_streak: number;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  user: User;
  stats: UserStats;
};

export type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  description?: string | null;
};

export type RoutineExercise = {
  id?: number;
  exercise_id?: number;
  sets: number;
  target_reps: number;
  target_weight?: number | null;
  notes?: string | null;
  order_index: number;
  exercise?: Exercise;
};

export type Routine = {
  id: number;
  name: string;
  day_of_week: number;
  notes?: string | null;
  exercises: RoutineExercise[];
};

export type WorkoutSet = {
  id?: number;
  exercise_id: number;
  set_number: number;
  target_reps: number;
  actual_reps?: number | null;
  weight?: number | null;
  completed: boolean;
  notes?: string | null;
};

export type WorkoutGroup = {
  exercise_id: number;
  exercise_name: string;
  target_weight?: number | null;
  sets: WorkoutSet[];
};

export type WorkoutSession = {
  id: number;
  routine_id?: number | null;
  workout_date: string;
  status: string;
  total_xp: number;
  notes?: string | null;
  completion_percent: number;
  workout_sets: WorkoutSet[];
};

export type TodayWorkoutResponse = {
  date: string;
  routine?: { id: number; name: string; day_of_week: number } | null;
  session?: WorkoutSession | null;
  grouped_sets: WorkoutGroup[];
};

export type CalendarDay = {
  id: number;
  date: string;
  day_type: string;
  status: string;
};

export type Habit = {
  id: number;
  date: string;
  junk_food: boolean;
  notes?: string | null;
};

export type Achievement = {
  id: number;
  name: string;
  description: string;
  xp_reward: number;
  icon: string;
  unlocked: boolean;
  unlocked_at?: string | null;
};

export type DashboardData = {
  today_summary: {
    date: string;
    routine_name: string;
    status: string;
    completion_percent: number;
    session_id?: number | null;
  };
  stats: {
    current_streak: number;
    longest_streak: number;
    healthy_streak: number;
    total_xp: number;
    level: {
      level: number;
      title: string;
      current_xp: number;
      level_floor: number;
      next_level_xp: number;
      progress_percent: number;
    };
    monthly_workouts_completed: number;
    junk_food_free_days: number;
    completion_percentage: number;
  };
  monthly_score: {
    month: string;
    total_score: number;
    workout_score: number;
    consistency_score: number;
    nutrition_score: number;
    progress_score: number;
    streak_score: number;
    rating: string;
  };
  personal_records: {
    exercise_name: string;
    best_weight?: number | null;
    best_reps?: number | null;
    estimated_one_rm?: number | null;
    achieved_on?: string | null;
  }[];
  recent_sessions: {
    id: number;
    workout_date: string;
    routine_name?: string | null;
    status: string;
    total_xp: number;
    completion_percent: number;
  }[];
  calendar: { date: string; day_type: string; status: string }[];
  progress_series: {
    workouts: { date: string; status: string }[];
    nutrition: { date: string; junk_food: boolean }[];
  };
};

export type ProgressData = {
  workout_frequency: { date: string; completed: number }[];
  workout_volume: { date: string; volume: number }[];
  strength_progression: { exercise: string; best_weight: number }[];
  junk_food_frequency: { date: string; junk_food: number }[];
  monthly_scores: { month: string; score: number }[];
};
