// src/pages/api/contact.ts
// ─────────────────────────────────────────────────────────────────────────────
// POST /api/contact
//
// Security layers (in order):
//   1. Security response headers
//   2. Method guard (POST only)
//   3. Content-Type guard (JSON only from XHR/fetch)
//   4. Body size guard (prevents payload flooding)
//   5. Dual rate limiting: per-IP + per-email (sliding window)
//   6. Zod schema validation (types, lengths, patterns)
//   7. Honeypot check (bot trap)
//   8. Defence-in-depth sanitisation (strip tags, escape HTML)
//   9. Nodemailer send (TLS enforced)
//
// Returns JSON { ok, message } in all cases.
// Error responses never leak internal details (stack traces, SMTP config, etc.)
// ─────────────────────────────────────────────────────────────────────────────

import type { APIContext } from "astro";
export const prerender = false;
import { ContactSchema } from "../../types/contact";
import type { ApiResponse } from "../../types/contact";
import { checkContactLimits } from "../../lib/rateLimiter";
import { sanitizeText } from "../../lib/sanitize";
import { sendContactMail } from "../../lib/mailer";

// ── Constants ─────────────────────────────────────────────────────────────────

/** Hard cap on request body size (bytes) — blocks payload flooding */
const MAX_BODY_BYTES = 8_192; // 8 KB is plenty for a contact form

// ── Security headers applied to every response ────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store",
};

// ── Response helpers ──────────────────────────────────────────────────────────

function json(
  body: ApiResponse,
  status: number,
  extra?: Record<string, string>,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...SECURITY_HEADERS, ...extra },
  });
}

function ok(message: string) {
  return json({ ok: true, message }, 200);
}

function err(message: string, status: number, fields?: Record<string, string>) {
  return json({ ok: false, message, ...(fields ? { fields } : {}) }, status);
}

// ── IP extraction ─────────────────────────────────────────────────────────────

function getClientIp(request: Request): string {
  // Trust Cloudflare / common reverse-proxy headers first
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST({ request }: APIContext): Promise<Response> {
  // 1. Content-Type guard — only accept JSON (sent by our fetch call)
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return err("Ungültiger Content-Type.", 415);
  }

  // 2. Body size guard
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return err("Anfrage ist zu groß.", 413);
  }

  // 3. Parse JSON body — catch malformed JSON
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return err("Anfrage ist zu groß.", 413);
    raw = JSON.parse(text);
  } catch {
    return err("Ungültiges JSON.", 400);
  }

  // 4. Zod validation — parse and type-check every field
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    // Map Zod issues to a flat { fieldName: firstError } object
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fields[key]) fields[key] = issue.message;
    }
    return err("Bitte überprüfe deine Eingaben.", 422, fields);
  }

  const data = parsed.data;

  // 5. Honeypot check — bots fill hidden fields; humans never do
  if (data.website && data.website.trim().length > 0) {
    // Silent accept: don't tell bots they were detected
    return ok("Nachricht gesendet.");
  }

  // 6. Rate limiting (after parsing so we have the real email address)
  const ip = getClientIp(request);
  const rlResult = checkContactLimits(ip, data.email);

  if (!rlResult.allowed) {
    return json(
      {
        ok: false,
        message: `Zu viele Anfragen. Bitte warte ${rlResult.retryAfterSeconds} Sekunden.`,
      },
      429,
      { "Retry-After": String(rlResult.retryAfterSeconds) },
    );
  }

  // 7. Defence-in-depth sanitisation (after Zod — belt AND suspenders)
  const sanitized = {
    name: sanitizeText(data.name, 100),
    email: data.email, // already validated and lowercased by Zod
    subject: sanitizeText(data.subject ?? "", 200),
    message: sanitizeText(data.message, 4000),
    website: "",
  };

  // 8. Send email
  try {
    await sendContactMail(sanitized);
    return ok("Nachricht gesendet.");
  } catch (error) {
    // Log server-side but never expose SMTP internals to the client
    console.error("[contact API] sendMail failed:", error);
    return err(
      "E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.",
      502,
    );
  }
}

// All other HTTP methods → 405 Method Not Allowed
export function GET() {
  return new Response(null, { status: 405, headers: SECURITY_HEADERS });
}
export function PUT() {
  return new Response(null, { status: 405, headers: SECURITY_HEADERS });
}
export function DELETE() {
  return new Response(null, { status: 405, headers: SECURITY_HEADERS });
}
export function PATCH() {
  return new Response(null, { status: 405, headers: SECURITY_HEADERS });
}
