PRAGMA foreign_keys = ON;

ALTER TABLE leads ADD COLUMN last_contacted_at TEXT;
ALTER TABLE leads ADD COLUMN microsoft_conversation_id TEXT;

ALTER TABLE blog_posts ADD COLUMN seo_title TEXT;
ALTER TABLE blog_posts ADD COLUMN meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN focus_keyword TEXT;
ALTER TABLE blog_posts ADD COLUMN source_urls TEXT NOT NULL DEFAULT '[]';
ALTER TABLE blog_posts ADD COLUMN ai_generated INTEGER NOT NULL DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN ai_model TEXT;
ALTER TABLE blog_posts ADD COLUMN content_fingerprint TEXT;

CREATE TABLE microsoft_connections (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  account_email TEXT NOT NULL,
  account_name TEXT,
  tenant_id TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  scopes TEXT NOT NULL,
  connected_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE microsoft_oauth_states (
  state TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE lead_messages (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK(direction IN ('inbound','outbound')),
  provider TEXT NOT NULL DEFAULT 'microsoft',
  provider_message_id TEXT UNIQUE,
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
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

INSERT INTO autoblog_settings (id) VALUES ('primary');

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

CREATE INDEX lead_messages_lead_sent_idx ON lead_messages(lead_id, sent_at);
CREATE INDEX blog_posts_fingerprint_idx ON blog_posts(content_fingerprint);
CREATE INDEX blog_posts_status_published_idx ON blog_posts(status, published_at);
CREATE INDEX autoblog_runs_started_idx ON autoblog_runs(started_at);
