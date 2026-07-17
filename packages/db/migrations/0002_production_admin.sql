ALTER TABLE projects ADD COLUMN eyebrow TEXT;
ALTER TABLE projects ADD COLUMN result TEXT;
ALTER TABLE projects ADD COLUMN image TEXT;

CREATE TABLE business_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);
