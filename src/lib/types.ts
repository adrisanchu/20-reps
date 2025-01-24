import type { StravaType, StravaSportType } from './stravaTypes';

/**
 * Expose Strava specific types from types.ts
 */
export type {
  StravaAthlete,
  StravaMap,
  StravaType,
  StravaSportType,
  StravaActivity,
} from './stravaTypes';

export interface StravaTokenResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

export interface Activity {
  id: number;
  name: string;
  type: StravaType;
  sport_type: StravaSportType;
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
