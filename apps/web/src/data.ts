export type Project = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  problem: string;
  solution: string;
  result: string;
  stack: string[];
  category: "Web development" | "AI automation" | "Software";
  image: string;
  liveUrl: string;
  featured?: boolean;
  demo?: boolean;
};

export const projects: Project[] = [
  {
    slug: "eventstreamhd",
    title: "EventStreamHD",
    eyebrow: "Streaming platform · Live",
    description: "A fast discovery and streaming platform with a purpose-built admin system for a large, changing catalogue.",
    problem: "A growing media catalogue needed a usable front door and a maintainable way to manage content without editing code.",
    solution: "I built a responsive catalogue experience, search and category flows, plus custom admin CRUD for daily publishing.",
    result: "A production platform that keeps a broad media catalogue navigable across mobile and desktop.",
    stack: ["React", "Cloudflare", "Workers", "Admin CRUD"],
    category: "Web development",
    image: "/projects/eventstreamhd.jpg",
    liveUrl: "https://eventstreamhd.cam",
    featured: true,
  },
  {
    slug: "files-combiner",
    title: "Folder-to-text merger",
    eyebrow: "Browser utility · Live",
    description: "A private, in-browser utility that merges complete folder trees into one structured text file for review, transfer or AI context.",
    problem: "Moving a multi-folder codebase or document set into a single reviewable context meant repetitive copying and easy-to-miss files.",
    solution: "I built a drag-and-drop browser tool that preserves file paths, handles text and binary content, and produces one downloadable output without uploading source files.",
    result: "A focused zero-upload utility that turns an awkward preparation task into a quick local workflow.",
    stack: ["JavaScript", "File System API", "Privacy-first UI"],
    category: "Software",
    image: "/projects/files-combiner.png",
    liveUrl: "https://filescombiner.netlify.app",
    featured: true,
  },
  {
    slug: "fraser-james",
    title: "Fraser James",
    eyebrow: "Mobile hairdresser · UK live client",
    description: "A focused local-service site that makes booking a mobile haircut feel simple, personal and immediate.",
    problem: "A mobile stylist needed a professional home beyond social profiles and a shorter route from discovery to booking.",
    solution: "I built a warm, mobile-first service site with clear pricing, service areas and prominent contact paths.",
    result: "A live UK client site designed around the way local customers actually browse and book.",
    stack: ["React", "Cloudflare Pages", "Local SEO"],
    category: "Web development",
    image: "/projects/fraser-james.jpg",
    liveUrl: "https://jamesfrazer.pages.dev",
    featured: true,
  },
  {
    slug: "koha-isbd",
    title: "Koha ISBD Assistant",
    eyebrow: "Open source · Production plugin",
    description: "A cataloguing assistant that makes library metadata work faster and more reliably inside Koha.",
    problem: "Manual ISBD cataloguing is repetitive, exacting work where small inconsistencies compound quickly.",
    solution: "I turned domain rules from my Library and Information Science research into a practical Koha workflow.",
    result: "99% data integrity in evaluated records and a production-ready open-source tool for cataloguers.",
    stack: ["Koha", "JavaScript", "Library systems", "Open source"],
    category: "Software",
    image: "/projects/koha.png",
    liveUrl: "https://github.com/build-with-duke/Koha_ISBD_Assistant_Plugin",
    featured: true,
  },
  {
    slug: "sora-studio",
    title: "Sora Streamlit Studio",
    eyebrow: "AI video pipeline",
    description: "A compact studio interface for moving from a video prompt to a reviewable generation workflow.",
    problem: "Creative AI experiments become slow when prompts, outputs and iterations live in disconnected tools.",
    solution: "I assembled a single Streamlit workflow for prompt development, generation and output review.",
    result: "A repeatable pipeline that makes AI video experimentation easier to operate and explain.",
    stack: ["Python", "Streamlit", "Generative AI"],
    category: "AI automation",
    image: "/projects/sora.png",
    liveUrl: "https://github.com/build-with-duke/Sora_Streamlit_Studio",
  },
  {
    slug: "n8n-workflows",
    title: "Useful n8n automations",
    eyebrow: "Jobs + publishing workflows",
    description: "Practical automations for job discovery and WordPress publishing, built to remove repeat admin.",
    problem: "High-value searches and publishing routines were losing hours to mechanical copy, filter and hand-off steps.",
    solution: "I designed observable n8n pipelines with human review points, failure handling and clean output formats.",
    result: "Up to 65% less manual workload while keeping a person in control of consequential decisions.",
    stack: ["n8n", "APIs", "WordPress", "AI agents"],
    category: "AI automation",
    image: "/projects/n8n.png",
    liveUrl: "https://github.com/build-with-duke/n8n-workflows",
  },
  {
    slug: "the-grills-corner",
    title: "The Grills Corner",
    eyebrow: "Hospitality · Nigeria · Mockup",
    description: "A lively digital storefront concept designed to help a food business turn interest into direct enquiries.",
    problem: "The business needed a clearer owned destination for its menu, offer and direct customer contact.",
    solution: "I shaped a mobile-first hospitality experience with direct enquiry routes and clear mockup-to-production boundaries.",
    result: "A client-approved mockup direction ready for production content and operational integration.",
    stack: ["React", "Responsive UI", "Cloudflare"],
    category: "Web development",
    image: "/projects/the-grills-corner.png",
    liveUrl: "https://thegrillscorner.gerald-george-2022.workers.dev",
    demo: true,
  },
  {
    slug: "home-away-travels",
    title: "Home Away Travels",
    eyebrow: "Travel · Nigeria · Mockup",
    description: "A travel-service concept that organises destinations and enquiry paths into a credible customer journey.",
    problem: "A growing travel service needed to turn scattered offers into a trustworthy, browsable experience.",
    solution: "I built the content and interaction structure around destination discovery, trust and quick contact.",
    result: "A labelled mockup build with a clear path to live inventory and enquiry management.",
    stack: ["React", "Content design", "Lead flow"],
    category: "Web development",
    image: "/projects/home-away-travels.png",
    liveUrl: "https://home-away-travels.pages.dev",
    demo: true,
  },
  {
    slug: "unconventional-soccer",
    title: "Unconventional Soccer Giveaway",
    eyebrow: "Interactive campaign · Live",
    description: "A responsive Sora 2 invite-code giveaway with a playable prize wheel, daily limits and a clear supporter qualification flow.",
    problem: "The campaign needed to distribute scarce invite codes fairly while keeping the rules, daily spin allowance and winner hand-off easy to understand.",
    solution: "I built a branded interactive wheel with keyboard support, per-day spin state, masked visitor IDs, qualification guidance and live campaign statistics.",
    result: "A distinctive live giveaway experience that turns a complex eligibility and fulfilment flow into a direct, playful interaction.",
    stack: ["JavaScript", "Canvas", "Cloudflare Pages", "Responsive UI"],
    category: "Web development",
    image: "/projects/unconventional-soccer.png",
    liveUrl: "https://usoccerwof.pages.dev",
  },
];

export const pricing = [
  { name: "Foundation", price: "£499", note: "A sharp, credible first home online.", features: ["Up to 5 focused pages", "Responsive build", "Contact form", "Core technical SEO"] },
  { name: "Growth", price: "£999", note: "For content that needs room to move.", features: ["Everything in Foundation", "Editable content", "Reviews integration", "Analytics setup"] },
  { name: "Professional", price: "£1,499", note: "For a site that does real operational work.", features: ["Admin dashboard", "Lead workflow", "Database-backed content", "Spam protection"], popular: true },
  { name: "Premium", price: "£1,999", note: "A distinctive product-grade digital presence.", features: ["Deep interaction design", "Automation integration", "Custom motion system", "Priority launch support"] },
  { name: "Custom", price: "Let’s scope it", note: "For platforms, portals and unusual systems.", features: ["Discovery workshop", "Technical architecture", "Phased delivery plan", "Clear custom quote"] },
];

export const faq = [
  ["How long does a build take?", "Focused sites usually take 2–4 weeks. Product builds depend on integrations and content. I set the delivery plan before development starts."],
  ["Do you work with clients across the UK?", "Yes. I work remotely, UK-wide, and keep communication written, regular and easy to follow."],
  ["Who owns the finished work?", "You do, once the agreed balance is paid. Any third-party licences are called out before they become a dependency."],
  ["How many revisions are included?", "Each package has structured review rounds. The aim is to make decisions early, then refine without endless surprise invoices."],
  ["Can you automate an existing workflow?", "Yes. I can map the current process, identify what should and should not be automated, then build a monitored n8n or API workflow."],
];
