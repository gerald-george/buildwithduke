PRAGMA foreign_keys = ON;

CREATE TABLE projects (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, problem TEXT, solution TEXT, stack TEXT NOT NULL DEFAULT '[]', result_metrics TEXT NOT NULL DEFAULT '{}', screenshot_r2_keys TEXT NOT NULL DEFAULT '[]', live_url TEXT, demo_flag INTEGER NOT NULL DEFAULT 0, demo_note TEXT, category TEXT NOT NULL, featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE testimonials (id TEXT PRIMARY KEY, author_name TEXT NOT NULL, author_role TEXT, company TEXT, quote TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE pricing_tiers (id TEXT PRIMARY KEY, name TEXT NOT NULL, price_gbp INTEGER, description TEXT NOT NULL, features TEXT NOT NULL DEFAULT '[]', is_popular INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0);
CREATE TABLE leads (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, company TEXT, project_type TEXT, budget_range TEXT, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','quoted','won','lost')), consent_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE blog_posts (id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, excerpt TEXT, body TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', published_at TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE admin_users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, last_login TEXT);
CREATE TABLE daemon_commands (id TEXT PRIMARY KEY, command TEXT UNIQUE NOT NULL, response_text TEXT NOT NULL, action_type TEXT NOT NULL DEFAULT 'text', action_target TEXT, is_active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE daemon_events (id TEXT PRIMARY KEY, event TEXT NOT NULL, path TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE cookie_consents (id TEXT PRIMARY KEY, necessary INTEGER NOT NULL DEFAULT 1, analytics INTEGER NOT NULL DEFAULT 0, marketing INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX leads_status_created_idx ON leads(status, created_at);
