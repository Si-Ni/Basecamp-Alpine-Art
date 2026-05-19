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
//   9. Resend send (TLS enforced by Resend internally)
//
// Returns JSON { ok, message } in all cases.
// Error responses never leak internal details.
// ─────────────────────────────────────────────────────────────────────────────

import type { APIContext } from "astro";
export const prerender = false;
import { ContactSchema } from "../../types/contact";
import type { ApiResponse } from "../../types/contact";
import { checkContactLimits } from "../../lib/rateLimiter";
import { sanitizeText } from "../../lib/sanitize";
import { sendContactMail } from "../../lib/mailer";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_BODY_BYTES = 8_192;

// ── Security headers ──────────────────────────────────────────────────────────

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
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(context: APIContext): Promise<Response> {
  const { request } = context;

  // Cloudflare exposes env bindings here at request time (not module init time)
  const cfEnv: Record<string, string | undefined> =
    (context.locals as any)?.runtime?.env ?? {};

  // 1. Content-Type guard
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    return err("Ungültiger Content-Type.", 415);
  }

  // 2. Body size guard
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return err("Anfrage ist zu groß.", 413);
  }

  // 3. Parse JSON body
  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return err("Anfrage ist zu groß.", 413);
    raw = JSON.parse(text);
  } catch {
    return err("Ungültiges JSON.", 400);
  }

  // 4. Zod validation
  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fields[key]) fields[key] = issue.message;
    }
    return err("Bitte überprüfe deine Eingaben.", 422, fields);
  }

  const data = parsed.data;

  // 5. Honeypot check
  if (data.website && data.website.trim().length > 0) {
    return ok("Nachricht gesendet.");
  }

  // 6. Rate limiting
  const ip = getClientIp(request);
  const kv = cfEnv.RATE_LIMIT as any; // KV namespace injected by Cloudflare runtime

  if (!kv) {
    // KV not bound — fail open in dev, log loudly
    console.warn(
      "[contact API] RATE_LIMIT KV namespace not bound — skipping rate limit",
    );
  }

  if (kv) {
    const rlResult = await checkContactLimits(kv, ip, data.email);
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
  }

  // 7. Sanitisation
  const sanitized = {
    name: sanitizeText(data.name, 100),
    email: data.email,
    subject: sanitizeText(data.subject ?? "", 200),
    message: sanitizeText(data.message, 4000),
    website: "",
  };

  // 8. Send email via Resend
  try {
    await sendContactMail(sanitized, cfEnv);
    return ok("Nachricht gesendet.");
  } catch (error) {
    console.error("[contact API] sendMail failed:", error);
    return err(
      "E-Mail konnte nicht gesendet werden. Bitte versuche es später erneut.",
      502,
    );
  }
}

// ── All other methods → 405 ───────────────────────────────────────────────────

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
