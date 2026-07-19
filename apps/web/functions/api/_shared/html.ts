const allowedTags = new Set([
  "p", "br", "h2", "h3", "h4", "strong", "em", "s", "blockquote", "pre", "code", "ul", "ol", "li", "a", "hr",
]);

export function sanitizeArticleHtml(value: string) {
  const withoutDangerousBlocks = value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|svg|math)[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button|svg|math)[^>]*\/?\s*>/gi, "");

  return withoutDangerousBlocks.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, rawTag: string, rawAttributes: string) => {
    const tag = rawTag.toLowerCase();
    if (!allowedTags.has(tag)) return "";
    if (match.startsWith("</")) return `</${tag}>`;
    if (tag === "br" || tag === "hr") return `<${tag}>`;
    if (tag !== "a") return `<${tag}>`;
    const href = rawAttributes.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1] || "";
    if (!isSafeLink(href)) return "<a>";
    return `<a href="${escapeAttribute(href)}" rel="noopener noreferrer">`;
  }).trim();
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}

function isSafeLink(value: string) {
  if (value.startsWith("/") || value.startsWith("#")) return true;
  try { return ["http:", "https:", "mailto:"].includes(new URL(value).protocol); } catch { return false; }
}

function escapeAttribute(value: string) {
  return value.replace(/[&"<>]/g, character => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[character]!);
}
