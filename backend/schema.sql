-- Personal Wellness Activity Tracker
-- MariaDB schema (reference / interview demo)
-- Tables are also created automatically by SQLAlchemy on API startup.

CREATE DATABASE IF NOT EXISTS wellness_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE wellness_tracker;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  hashed_password VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  age INT NULL,
  height_cm DECIMAL(5,2) NULL,
  weight_kg DECIMAL(5,2) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  steps_goal INT NOT NULL DEFAULT 8000,
  exercise_minutes_goal INT NOT NULL DEFAULT 30,
  water_litres_goal DECIMAL(4,2) NOT NULL DEFAULT 2.00,
  sleep_hours_goal DECIMAL(4,2) NOT NULL DEFAULT 8.00,
  screen_time_hours_goal DECIMAL(4,2) NOT NULL DEFAULT 6.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_goals_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_goals_user (user_id)
);

CREATE TABLE IF NOT EXISTS daily_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_date DATE NOT NULL,
  steps INT NOT NULL DEFAULT 0,
  exercise_minutes INT NOT NULL DEFAULT 0,
  water_litres DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  sleep_hours DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  screen_time_hours DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  mood VARCHAR(20) NOT NULL DEFAULT 'neutral',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_user_activity_date UNIQUE (user_id, activity_date),
  INDEX idx_activities_user (user_id),
  INDEX idx_activities_date (activity_date)
);

-- Example interview queries
-- SELECT * FROM daily_activities WHERE user_id = 1 ORDER BY activity_date DESC;
-- SELECT AVG(steps), AVG(sleep_hours) FROM daily_activities WHERE user_id = 1
--   AND activity_date >= CURDATE() - INTERVAL 7 DAY;
-- SELECT u.email, p.name, g.steps_goal
--   FROM users u
--   JOIN profiles p ON p.user_id = u.id
--   JOIN goals g ON g.user_id = u.id AND g.is_active = TRUE;
