export interface StravaTokenResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  moving_time: number;
  distance: number;
  total_elevation_gain: number;
}

export interface Workout {
  date: string;
  type: string;
  duration: number;
  name: string;
  distance: number;
  elevation: number;
}

export interface Stats {
  currentStreak: number;
  totalWorkouts: number;
  remainingDays: number;
  yearProgress: number;
  workoutCompletionRate: number;
  daysSinceStart: number;
}
