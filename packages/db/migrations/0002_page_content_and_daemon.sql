CREATE TABLE IF NOT EXISTS page_content (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  seo_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO page_content (id, slug, name, seo_title, meta_description, sort_order) VALUES
  ('page-home', 'home', 'Home', 'buildwithduke — Full-stack developer & AI automation specialist', 'I build fast web products and useful AI automations for UK founders and small businesses.', 10),
  ('page-projects', 'projects', 'Projects', 'Projects — buildwithduke', 'Live web products, software and automation projects built by Duke.', 20),
  ('page-services', 'services', 'Services', 'Services — buildwithduke', 'Full-stack web development, AI automation and n8n workflows for UK businesses.', 30),
  ('page-pricing', 'pricing', 'Pricing', 'Pricing — buildwithduke', 'Clear GBP packages for websites, web applications and automation.', 40),
  ('page-about', 'about', 'About', 'About Duke — buildwithduke', 'Full-stack developer, AI automation specialist and systems thinker.', 50),
  ('page-contact', 'contact', 'Contact', 'Start a project — buildwithduke', 'Tell Duke what you need to build, fix or automate.', 60),
  ('page-cv', 'cv', 'CV', 'Duke’s CV — buildwithduke', 'Duke Chijimaka Jonathan’s experience, technical stack, education and selected outcomes.', 70),
  ('page-blog', 'blog', 'Articles', 'Build log — buildwithduke', 'Practical notes on web systems, AI-assisted development and automation.', 80),
  ('page-privacy', 'privacy', 'Privacy policy', 'Privacy policy — buildwithduke', 'How buildwithduke handles enquiry and website data.', 90),
  ('page-cookies', 'cookies', 'Cookie policy', 'Cookie policy — buildwithduke', 'Necessary storage and optional consent choices on buildwithduke.', 100),
  ('page-terms', 'terms', 'Website terms', 'Website terms — buildwithduke', 'Terms for using the buildwithduke portfolio website.', 110),
  ('page-common', 'common', 'Shared site copy', 'buildwithduke', 'Shared calls to action and footer copy.', 120);

INSERT OR IGNORE INTO daemon_commands (id, command, response_text, action_type, action_target) VALUES
  ('daemon-cv', 'cv', 'Opening Duke’s full CV, experience and credentials.', 'navigate', '/cv'),
  ('daemon-blog', 'articles', 'Opening the published build log.', 'navigate', '/blog'),
  ('daemon-github', 'github', 'Opening Duke’s public GitHub profile.', 'link', 'https://github.com/build-with-duke'),
  ('daemon-whatsapp', 'whatsapp', 'Opening a private WhatsApp conversation.', 'link', 'https://wa.me/2349152151634'),
  ('daemon-privacy', 'privacy', 'Opening the privacy policy.', 'navigate', '/privacy'),
  ('daemon-cookies', 'cookies', 'Opening the cookie policy.', 'navigate', '/cookies');
