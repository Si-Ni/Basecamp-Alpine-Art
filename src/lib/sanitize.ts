// src/lib/sanitize.ts
// ─────────────────────────────────────────────────────────────────────────────
// Defence-in-depth sanitisation helpers.
// These run AFTER Zod validation on the server — Zod is the primary gate,
// these are the last-resort shield before content reaches the mailer.
// ─────────────────────────────────────────────────────────────────────────────

/** Escape characters that have special meaning in HTML. */
export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Strip every HTML tag. */
export function stripTags(raw: string): string {
  return raw.replace(/<[^>]*>/g, "");
}

/** Collapse whitespace runs and trim. */
export function normalizeWhitespace(raw: string): string {
  return raw.replace(/[\t ]+/g, " ").trim();
}

/**
 * Full pipeline for a free-text field:
 * strip tags → normalise whitespace → hard-cap length.
 */
export function sanitizeText(raw: string, maxLen = 4000): string {
  return normalizeWhitespace(stripTags(raw)).slice(0, maxLen);
}

/**
 * Render a multiline user string safely inside HTML:
 * escape → split on newlines → rejoin with <br>.
 */
export function safeMultiline(raw: string): string {
  return raw.split(/\r?\n/).map(escapeHtml).join("<br>\n");
}
