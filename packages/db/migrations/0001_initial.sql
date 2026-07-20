PRAGMA foreign_keys = ON;

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  eyebrow TEXT,
  description TEXT NOT NULL,
  problem TEXT,
  solution TEXT,
  result TEXT,
  stack TEXT NOT NULL DEFAULT '[]',
  result_metrics TEXT NOT NULL DEFAULT '{}',
  screenshot_r2_keys TEXT NOT NULL DEFAULT '[]',
  image TEXT,
  live_url TEXT,
  demo_flag INTEGER NOT NULL DEFAULT 0,
  demo_note TEXT,
  category TEXT NOT NULL,
  featured INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE testimonials (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_role TEXT,
  company TEXT,
  quote TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE pricing_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_gbp INTEGER,
  description TEXT NOT NULL,
  features TEXT NOT NULL DEFAULT '[]',
  is_popular INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  project_type TEXT,
  budget_range TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','quoted','won','lost')),
  consent_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  seo_title TEXT,
  meta_description TEXT,
  focus_keyword TEXT,
  source_urls TEXT NOT NULL DEFAULT '[]',
  ai_generated INTEGER NOT NULL DEFAULT 0,
  ai_model TEXT,
  content_fingerprint TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  last_login TEXT
);

CREATE TABLE daemon_commands (
  id TEXT PRIMARY KEY,
  command TEXT UNIQUE NOT NULL,
  response_text TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'text',
  action_target TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE daemon_events (
  id TEXT PRIMARY KEY,
  event TEXT NOT NULL,
  path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE cookie_consents (
  id TEXT PRIMARY KEY,
  necessary INTEGER NOT NULL DEFAULT 1,
  analytics INTEGER NOT NULL DEFAULT 0,
  marketing INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE business_settings (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE autoblog_settings (
  id TEXT PRIMARY KEY CHECK(id = 'primary'),
  enabled INTEGER NOT NULL DEFAULT 0,
  interval_hours INTEGER NOT NULL DEFAULT 168,
  topics TEXT NOT NULL DEFAULT '["AI automation for UK small businesses","full-stack web development","n8n workflows","Cloudflare and React"]',
  model TEXT NOT NULL DEFAULT 'openrouter/free',
  search_country TEXT NOT NULL DEFAULT 'uk',
  search_language TEXT NOT NULL DEFAULT 'en',
  publish_mode TEXT NOT NULL DEFAULT 'draft' CHECK(publish_mode IN ('draft','published')),
  min_words INTEGER NOT NULL DEFAULT 900,
  max_posts_per_month INTEGER NOT NULL DEFAULT 4,
  similarity_threshold REAL NOT NULL DEFAULT 0.58,
  last_run_at TEXT,
  next_run_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE autoblog_runs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('running','created','skipped','failed')),
  trigger_type TEXT NOT NULL CHECK(trigger_type IN ('schedule','manual')),
  query TEXT,
  article_id TEXT REFERENCES blog_posts(id) ON DELETE SET NULL,
  model TEXT,
  similarity_score REAL,
  message TEXT,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

INSERT INTO autoblog_settings (id) VALUES ('primary');

CREATE INDEX leads_status_created_idx ON leads(status, created_at);
CREATE INDEX blog_posts_fingerprint_idx ON blog_posts(content_fingerprint);
CREATE INDEX blog_posts_status_published_idx ON blog_posts(status, published_at);
CREATE INDEX autoblog_runs_started_idx ON autoblog_runs(started_at);
