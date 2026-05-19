// src/types/contact.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for contact-form types and Zod schemas.
// Imported by React components (client validation) AND Astro API routes
// (server validation) so both sides are always in sync.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from "zod";

// ── Field constraints (also used for HTML maxLength / minLength attributes) ───

export const FIELD_LIMITS = {
  name: { min: 2, max: 100 },
  email: { min: 5, max: 254 }, // RFC 5321
  subject: { min: 0, max: 200 },
  message: { min: 10, max: 4000 },
} as const;

// ── Zod schema ────────────────────────────────────────────────────────────────

export const ContactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(FIELD_LIMITS.name.min, "Name muss mindestens 2 Zeichen haben.")
    .max(FIELD_LIMITS.name.max, "Name ist zu lang.")
    .refine((v) => !/<[^>]*>/g.test(v), "Ungültige Zeichen im Namen."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(FIELD_LIMITS.email.min)
    .max(FIELD_LIMITS.email.max, "E-Mail-Adresse ist zu lang.")
    .email("Bitte eine gültige E-Mail-Adresse eingeben."),

  subject: z
    .string()
    .trim()
    .max(FIELD_LIMITS.subject.max, "Betreff ist zu lang.")
    .refine((v) => !/<[^>]*>/g.test(v), "Ungültige Zeichen im Betreff.")
    .optional()
    .default(""),

  message: z
    .string()
    .trim()
    .min(FIELD_LIMITS.message.min, "Nachricht ist zu kurz (mind. 10 Zeichen).")
    .max(
      FIELD_LIMITS.message.max,
      "Nachricht ist zu lang (max. 4 000 Zeichen).",
    )
    .refine(
      (v) => !/<script[\s\S]*?>/gi.test(v),
      "Ungültiger Inhalt in der Nachricht.",
    ),

  // Honeypot — must be absent or empty; validated server-side only
  website: z.string().max(0, "").optional().default(""),
});

export type ContactPayload = z.infer<typeof ContactSchema>;

// Client-side form fields (excludes honeypot which is never in component state)
export const ContactFormSchema = ContactSchema.omit({ website: true });
export type ContactFormFields = z.infer<typeof ContactFormSchema>;

// Per-field error map surfaced to the UI
export type FieldErrors = Partial<Record<keyof ContactFormFields, string>>;

// ── API response shapes ───────────────────────────────────────────────────────

export interface ApiSuccess {
  ok: true;
  message: string;
}

export interface ApiError {
  ok: false;
  /** Safe, human-readable message for the UI — never leaks internals */
  message: string;
  /** Zod field-level errors (optional, returned on 422) */
  fields?: Partial<Record<string, string>>;
}

export type ApiResponse = ApiSuccess | ApiError;

// ── Form state machine ────────────────────────────────────────────────────────

export type FormStatus = "idle" | "loading" | "success" | "error";
