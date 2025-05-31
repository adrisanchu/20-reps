DROP TABLE IF EXISTS strava_activities;
CREATE TABLE IF NOT EXISTS strava_activities (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  distance REAL DEFAULT 0,
  moving_time INTEGER DEFAULT 0,
  elapsed_time INTEGER DEFAULT 0
  -- extra_data JSON
);

CREATE UNIQUE INDEX idx_dates_activities 
ON strava_activities (start_date);
