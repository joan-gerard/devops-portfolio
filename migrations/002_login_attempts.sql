CREATE TABLE login_attempts (
  ip           text PRIMARY KEY,
  attempts     int NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);