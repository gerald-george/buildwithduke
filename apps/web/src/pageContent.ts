export type PageContentValue = string | string[];
export type PageContent = Record<string, PageContentValue>;

export type PageDefinition = {
  slug: string;
  name: string;
  path: string;
  seoTitle: string;
  metaDescription: string;
  content: PageContent;
};

const legalDefaults: Record<"privacy" | "cookies" | "terms", PageContent> = {
  privacy: {
    hero_title: "Privacy policy", updated_date: "19 July 2026", hero_intro: "This policy explains what information I collect through buildwithduke, why I collect it, and the choices you have.",
    section_titles: ["Who controls your data", "What I collect", "Why and how long", "Your rights", "Service providers"],
    section_copies: ["Duke Chijimaka Jonathan, trading as buildwithduke, is the data controller. Contact buildwithduke@outlook.com for any privacy request.", "When you send an enquiry, I collect your name, email, optional company, project details, consent record and the business correspondence needed to manage that enquiry. Basic security records may also include an IP address for a short time.", "I use enquiry data only to respond, prepare a proposal and keep necessary business records. Unconverted enquiries are reviewed and deleted after 12 months.", "Under UK data protection law you may ask to access, correct, erase, restrict or export your personal information, and you may object to processing.", "Trusted service providers help deliver and protect this site, store enquiries, send private notifications and research public topics for articles. They do not receive lead details unless needed to handle your enquiry. Data is not sold or used for unrelated marketing."],
  },
  cookies: {
    hero_title: "Cookie policy", updated_date: "17 July 2026", hero_intro: "This site starts with necessary storage only. Optional analytics and marketing stay off until you choose them.",
    section_titles: ["Necessary storage", "Analytics", "Marketing", "Changing your choice", "Third-party links"],
    section_copies: ["The site stores your colour theme and cookie choice locally in your browser. These are required to remember the settings you selected.", "Anonymous analytics can be used only after consent. It helps me understand broad site usage without building an advertising profile.", "No advertising trackers are currently used. The separate marketing choice prevents future marketing tools from running without your explicit permission.", "Use the Cookie preferences button in the footer at any time to review or change optional consent. Your new choice takes effect immediately.", "Links to GitHub, Instagram, WhatsApp and live projects follow those services' own privacy and cookie policies once opened."],
  },
  terms: {
    hero_title: "Website terms", updated_date: "17 July 2026", hero_intro: "These terms cover use of this portfolio. Project work is governed by a separate written proposal and contract.",
    section_titles: ["Information", "Intellectual property", "External links", "Project pricing", "Liability"],
    section_copies: ["I aim to keep project, service and pricing information accurate, but website content is general information rather than a binding offer.", "Unless stated otherwise, the writing, design and original code on this site belong to Duke Chijimaka Jonathan. Client project names and brands belong to their respective owners.", "Live project and social links are provided for convenience. I do not control third-party availability, content or security.", "Displayed package prices are starting points. Scope, delivery, payment milestones, ownership and support are confirmed in a written agreement before work begins.", "Nothing here limits liability where it cannot legally be limited. Otherwise, use of this informational website is at your own risk."],
  },
};

export const pageDefinitions: PageDefinition[] = [
  {
    slug: "home", name: "Home", path: "/",
    seoTitle: "buildwithduke — Full-stack developer & AI automation specialist",
    metaDescription: "I build fast web products and useful AI automations for UK founders and small businesses.",
    content: {
      hero_availability: "Available for select projects · Q3 2026",
      hero_rotating_lines: ["things that work.", "web apps that converts.", "automations that return time.", "systems that make sense."],
      hero_intro: "Full-stack developer and AI automation specialist. I turn messy workflows and static ideas into fast, converting web apps.",
      work_heading: "Some things I’ve shipped.",
      work_intro: "Real builds, real links. Open them and have a look around.",
      proof_quote: "A systems thinker who enjoys the moment a messy thing finally makes sense.",
      process_heading: "Clear steps. No mystery fog.",
      process_intro: "You always know what is being decided, built and tested.",
      pricing_heading: "A useful starting point.",
      pricing_intro: "Clear scopes for common builds. Anything unusual gets a clear custom proposal.",
      testimonials_heading: "Kind words, kept specific.",
      faq_heading: "Straight answers.",
      articles_heading: "Fresh thinking from recent work.",
      articles_intro: "Practical notes on building useful products and smoother ways of working.",
    },
  },
  {
    slug: "projects", name: "Projects", path: "/projects",
    seoTitle: "Projects — buildwithduke",
    metaDescription: "Live web products, software and automation projects built by Duke.",
    content: {
      hero_title: "Built, shipped, and doing the work.",
      hero_intro: "Web products, automation and software. The mockup builds are labelled plainly; the live links are here for inspection.",
      case_problem_heading: "What needed to change.",
      case_build_heading: "The useful part.",
      case_result_heading: "What shipped.",
    },
  },
  {
    slug: "services", name: "Services", path: "/services",
    seoTitle: "Services — buildwithduke",
    metaDescription: "Full-stack web development, AI automation and n8n workflows for UK businesses.",
    content: {
      hero_title: "Useful systems, not technology theatre.",
      hero_intro: "I design and build the shortest sensible route from a messy process to a system your team can actually operate.",
      service_1_title: "Websites & web apps",
      service_1_copy: "Responsive, fast experiences with straightforward content controls that keep them useful after launch.",
      service_1_items: ["Fast, responsive builds", "Reliable hosting and launch", "Easy content management", "Search visibility and analytics"],
      service_2_title: "AI automation",
      service_2_copy: "Agentic workflows that remove repetitive effort while keeping human judgement exactly where it matters.",
      service_2_items: ["Workflow discovery", "Connected tools and AI", "Human review steps", "Monitoring and handover"],
      service_3_title: "n8n workflows",
      service_3_copy: "Observable automations for leads, content, CRM hygiene and the operational gaps between your tools.",
      service_3_items: ["Lead routing", "WordPress publishing", "CRM synchronisation", "Failure alerts"],
      service_4_title: "Systems improvement",
      service_4_copy: "A practical review of a workflow or product that has grown harder to operate than it should be.",
      service_4_items: ["Product and workflow review", "Speed improvements", "Data cleanup", "Careful phased improvements"],
      callout_heading: "Not sure what the system should be yet?",
      callout_copy: "That is normal. Start with the bottleneck, not a shopping list of technology. I’ll help map the right scope before proposing a build.",
    },
  },
  {
    slug: "pricing", name: "Pricing", path: "/pricing",
    seoTitle: "Pricing — buildwithduke",
    metaDescription: "Clear GBP packages for websites, web applications and automation.",
    content: {
      hero_title: "Straightforward pricing, no surprises.",
      payment_heading: "Clear commercial basics.",
      payment_copy: "Bank transfer is the only payment method currently available. No VAT is currently charged. You retain ownership after final payment.",
      faq_heading: "The practical bits.",
      faq_questions: ["How long does a build take?", "Do you work with clients across the UK?", "Who owns the finished work?", "How many revisions are included?", "Can you automate an existing workflow?"],
      faq_answers: ["Focused sites usually take 2–4 weeks. Product builds depend on integrations and content. I set the delivery plan before development starts.", "Yes. I work remotely, UK-wide, and keep communication written, regular and easy to follow.", "You do, once the agreed balance is paid. Any third-party licences are called out before they become a dependency.", "Each package has structured review rounds. The aim is to make decisions early, then refine without endless surprise invoices.", "Yes. I can map the current process, identify what should and should not be automated, then build a monitored n8n or API workflow."],
    },
  },
  {
    slug: "about", name: "About", path: "/about",
    seoTitle: "About Duke — buildwithduke",
    metaDescription: "Full-stack developer, AI automation specialist and systems thinker.",
    content: {
      hero_title: "Hi, I’m Duke.",
      hero_intro: "I like systems, clean hand-offs, and the exact moment a complicated thing becomes understandable.",
      headshot_image: "/headshot.png",
      profile_heading: "Library-science rigour. Product-builder energy.",
      profile_paragraph_1: "I’m a full-stack developer and AI automation specialist with a First-Class B.LIS (4.6/5.0) from the University of Port Harcourt. That information-science background still shapes the work: understand the information, understand the people, then make the system make sense.",
      profile_paragraph_2: "I build with React, Cloudflare, Python and n8n, using agentic AI-assisted workflows to move quickly without outsourcing judgement. The output still has to be testable, maintainable and useful when the novelty wears off.",
      profile_paragraph_3: "Away from a screen, I tend to drift toward origami, astronomy and theology: three different ways of asking what structure is hiding underneath the surface.",
      credentials_heading: "A few useful coordinates.",
      credential_titles: ["First-Class Honours", "Best Graduating Student", "SUSI Exchange Alumnus", "Original research"],
      credential_details: ["B.LIS · CGPA 4.6/5.0", "Library & Information Science · 2025", "University of Nevada, Reno · 2025", "AI’s impact on academic-library cataloguing"],
    },
  },
  {
    slug: "contact", name: "Contact", path: "/contact",
    seoTitle: "Start a project — buildwithduke",
    metaDescription: "Tell Duke what you need to build, fix or automate.",
    content: {
      hero_title: "Let’s talk.",
      hero_intro: "Tell me what is stuck, missing or ready to become real. I usually reply {response_time}.",
      fast_lane_heading: "Prefer the fast lane?",
      fast_lane_copy: "WhatsApp is often the quickest route for a first conversation.",
      form_heading: "What are we building?",
      message_placeholder: "What needs to change, who is it for, and what would a good result look like?",
      success_message: "Received. I’ll reply within 24 hours, UK time.",
      error_message: "The form could not send just now. Email or WhatsApp still works.",
    },
  },
  {
    slug: "cv", name: "CV", path: "/cv",
    seoTitle: "Duke’s CV — buildwithduke",
    metaDescription: "Duke Chijimaka Jonathan’s experience, technical stack, education and selected outcomes.",
    content: {
      hero_title: "The formal version.",
      hero_intro: "Experience, credentials and the work behind the quieter confidence.",
      portrait_image: "/headshot.png",
      cv_file: "/duke-chijimaka-jonathan-cv.pdf",
      sidebar_roles: ["Full-stack developer", "AI & automation specialist", "Information systems"],
      sidebar_location: "Port Harcourt, Nigeria · Remote",
      profile_copy: "Product-minded full-stack developer and automation specialist combining web engineering, agentic workflows and information-systems discipline. Experienced in shipping Cloudflare-hosted products, custom admin systems, AI pipelines and open-source library software.",
      outcome_items: ["Reduced manual workload by 65% by redesigning CRM and Excel record workflows.", "Supported 73% growth in warm lead generation and a campaign exceeding 1M views in seven days.", "Maintained 99% data integrity across more than 500 operational records.", "Built deterministic MARC21 and ISBD quality guardrails into a production Koha plugin."],
      experience_titles: ["Digital Marketer & Web Manager", "Administrative Assistant", "Computer Operator"],
      experience_details: ["Managed WordPress, structured HubSpot and Excel systems, performance analytics, and AI-assisted content operations. Improved record workflows and supported email, SMS and campaign execution.", "Maintained 500+ records at 99% data integrity, improved inventory workflows and supported technical, administrative and social operations.", "Managed clerical and technical operations for 300+ client records and improved installation and support processes."],
      experience_meta: ["Bedum Estate Management & Development LTD · Nov 2025 – Apr 2026", "FOBSI International · Sep 2021 – Sep 2022", "Twistreal Global Services · Sep 2020 – Sep 2021"],
      technical_titles: ["Koha ISBD Cataloguing Assistant", "LinkedIn Job Hunt Pipeline", "Sora Streamlit Studio"],
      technical_details: ["JavaScript and Perl plugin with deterministic ISBD checks, MARC21 guardrails, save blocking, tests and optional constrained AI guidance.", "Scheduled n8n workflow using Apify and a two-stage OpenRouter evaluation before routing matches to Sheets, Telegram and document templates.", "Python video pipeline with reference montages, concurrent generation, rate limiting, budget guardrails, remix flows and ZIP export."],
      technical_meta: ["Koha · MARC21 · Open source", "n8n · OpenRouter · APIs", "Python · Streamlit · Sora"],
      capabilities: ["React", "TypeScript", "Next.js", "Cloudflare", "n8n", "Python", "Streamlit", "REST APIs", "OpenAI", "OpenRouter", "Koha", "MARC21"],
      education_titles: ["First-Class Honours, B.LIS · CGPA 4.6/5.0", "Best Graduating Student, Library & Information Science", "SUSI Exchange Alumnus", "Thesis: The Impact of Artificial Intelligence on Cataloguing"],
      education_meta: ["University of Port Harcourt · 2025", "University of Port Harcourt · 2025", "U.S. Department of State · University of Nevada, Reno · 2025", "Academic libraries in Rivers State"],
      certification_titles: ["Diploma in Applied Generative AI", "Cybersecurity Awareness: Terminology & Threat Landscape", "Certified Digital Marketer", "Certified Administrative Professional"],
      certification_meta: ["Alison · In progress", "LinkedIn Learning · 2024", "Udemy · 2022", "CyberTech Enterprises · 2020"],
    },
  },
  {
    slug: "blog", name: "Articles", path: "/blog",
    seoTitle: "Articles — buildwithduke",
    metaDescription: "Practical notes on web systems, AI-assisted development and automation.",
    content: {
      hero_title: "Notes from the workbench.",
      hero_intro: "Clear writing on automation, web systems and the practical side of building with AI.",
      empty_heading: "More notes are on the way.",
      empty_copy: "In the meantime, explore the projects or get in touch to discuss what you are working on.",
    },
  },
  ...(["privacy", "cookies", "terms"] as const).map(slug => ({
    slug,
    name: slug === "privacy" ? "Privacy policy" : slug === "cookies" ? "Cookie policy" : "Website terms",
    path: `/${slug}`,
    seoTitle: `${slug === "privacy" ? "Privacy policy" : slug === "cookies" ? "Cookie policy" : "Website terms"} — buildwithduke`,
    metaDescription: slug === "privacy" ? "How buildwithduke handles enquiry and website data." : slug === "cookies" ? "Necessary storage and optional consent choices on buildwithduke." : "Terms for using the buildwithduke portfolio website.",
    content: legalDefaults[slug],
  })),
  {
    slug: "common", name: "Shared site copy", path: "All routes",
    seoTitle: "buildwithduke",
    metaDescription: "Shared calls to action and footer copy.",
    content: {
      cta_heading: "Got something messy that needs to make sense?",
      cta_copy: "Good. That’s usually where the useful work starts.",
      footer_intro: "Full-stack products and useful automation.",
      footer_service_area: "Remote · UK-wide.",
      not_found_heading: "That page wandered off.",
      not_found_copy: "The page may have moved, or the address might need another look.",
    },
  },
];

export const pageDefinitionBySlug = Object.fromEntries(pageDefinitions.map(page => [page.slug, page])) as Record<string, PageDefinition>;

export function parsePageContent(value: unknown): PageContent {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as PageContent;
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as PageContent : {};
  } catch { return {}; }
}

export function pageFieldLabel(key: string) {
  if (key === "cv_file") return "Downloadable CV (PDF)";
  return key.replace(/^service_(\d+)_/, "Service $1 ").replaceAll("_", " ").replace(/^./, character => character.toUpperCase());
}

export function pageFieldGroup(key: string) {
  if (key.startsWith("hero_") || key === "updated_date") return "Page introduction";
  if (key.startsWith("service_")) return `Service ${key.split("_")[1]}`;
  if (key.startsWith("profile_") || key === "headshot_image") return "Profile";
  if (key.startsWith("credential")) return "Credentials";
  if (key.startsWith("experience_")) return "Experience";
  if (key.startsWith("technical_")) return "Selected technical work";
  if (key.startsWith("education_")) return "Education";
  if (key.startsWith("certification_")) return "Certifications";
  if (key.startsWith("faq_")) return "Frequently asked questions";
  if (key.startsWith("case_")) return "Case study";
  if (key.startsWith("fast_lane_")) return "Quick contact";
  if (key.startsWith("form_") || key === "message_placeholder" || key.endsWith("_message")) return "Enquiry form";
  if (key.startsWith("empty_")) return "Empty articles state";
  if (key.startsWith("cta_") || key.startsWith("footer_") || key.startsWith("not_found_")) return "Shared content";
  return key.split("_")[0].replace(/^./, character => character.toUpperCase());
}
