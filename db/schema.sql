DROP TABLE IF EXISTS strava_activities;
CREATE TABLE IF NOT EXISTS strava_activities (
  id INTEGER PRIMARY KEY,
  name TEXT,
  start_date TEXT,
  sport_type TEXT,
  distance REAL,
  moving_time REAL,
  elapsed_time REAL,
  extra_data JSON
);