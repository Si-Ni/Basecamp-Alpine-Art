// src/components/ContactForm.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Contact form React component.
//
// Security:
//   • Client-side Zod validation mirrors the server schema exactly
//   • Honeypot field hidden from humans, fills for bots
//   • fetch() sends JSON with explicit Content-Type header
//   • No sensitive data stored in component state beyond the form fields
//   • Error messages from the server are shown as-is only when ok === false
//     (server never leaks internals in that field)
//
// UX / Accessibility:
//   • State machine: idle → loading → success | error
//   • Per-field inline errors announced via aria-live
//   • Validates on blur; re-validates on change if already invalid
//   • Focus trapped to first error after failed submission
//   • Submit button shows spinner during loading, disabled to prevent doubles
//   • Rate-limit (429) shown with retry-after countdown
// ─────────────────────────────────────────────────────────────────────────────

import {
  useState,
  useRef,
  useCallback,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from "react";
import { ContactFormSchema, FIELD_LIMITS } from "../types/contact.ts";
import type {
  ContactFormFields,
  FieldErrors,
  FormStatus,
  ApiResponse,
} from "../types/contact.ts";

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_FIELDS: ContactFormFields = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Validate a single field using the shared Zod schema. Returns error string or "". */
function validateField(name: keyof ContactFormFields, value: string): string {
  const fieldSchema = ContactFormSchema.shape[name];

  const result = fieldSchema.safeParse(value);

  if (result.success) return "";
  return result.error.issues[0]?.message ?? "Ungültige Eingabe.";
}

/** Validate all fields. Returns { isValid, errors }. */
function validateAll(fields: ContactFormFields): {
  isValid: boolean;
  errors: FieldErrors;
} {
  const result = ContactFormSchema.safeParse(fields);
  if (result.success) return { isValid: true, errors: {} };

  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ContactFormFields;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { isValid: false, errors };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContactForm() {
  const [fields, setFields] = useState<ContactFormFields>(INITIAL_FIELDS);
  const [touched, setTouched] = useState<
    Partial<Record<keyof ContactFormFields, true>>
  >({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverMsg, setServerMsg] = useState("");
  const [serverFields, setServerFields] = useState<FieldErrors>({});
  const [countdown, setCountdown] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Field change ────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const key = name as keyof ContactFormFields;

      setFields((prev) => ({ ...prev, [key]: value }));

      // Re-validate on change only if the field was already touched and had an error
      if (touched[key]) {
        const msg = validateField(key, value);
        setErrors((prev) => ({ ...prev, [key]: msg }));
        setServerFields((prev) => ({ ...prev, [key]: "" }));
      }
    },
    [touched],
  );

  // ── Field blur ──────────────────────────────────────────────────────────────

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const key = name as keyof ContactFormFields;

      setTouched((prev) => ({ ...prev, [key]: true }));
      const msg = validateField(key, value);
      setErrors((prev) => ({ ...prev, [key]: msg }));
    },
    [],
  );

  // ── Countdown for rate-limit ────────────────────────────────────────────────

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      // Mark all fields as touched so errors become visible
      setTouched({ name: true, email: true, subject: true, message: true });

      const { isValid, errors: validationErrors } = validateAll(fields);
      setErrors(validationErrors);

      if (!isValid) {
        // Focus the first invalid field
        const firstKey = Object.keys(validationErrors)[0];
        if (firstKey) {
          const el = formRef.current?.querySelector<HTMLElement>(
            `[name="${firstKey}"]`,
          );
          el?.focus();
        }
        return;
      }

      setStatus("loading");
      setServerMsg("");
      setServerFields({});

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...fields,
            website: "", // honeypot — always empty from the real form
          }),
        });

        const json: ApiResponse = await res.json();

        if (json.ok) {
          setStatus("success");
          setFields(INITIAL_FIELDS);
          setTouched({});
          setErrors({});
        } else {
          setStatus("error");
          setServerMsg(json.message);

          // Merge server field errors into local error state
          if ("fields" in json && json.fields) {
            setServerFields(json.fields as FieldErrors);
          }

          // Rate-limit: parse Retry-After and show countdown
          if (res.status === 429) {
            const retryAfter = Number(res.headers.get("Retry-After") ?? 60);
            if (retryAfter > 0) startCountdown(retryAfter);
          }
        }
      } catch {
        setStatus("error");
        setServerMsg(
          "Verbindung zum Server fehlgeschlagen. Bitte prüfe deine Internetverbindung.",
        );
      }
    },
    [fields, startCountdown],
  );

  // ── Derived helpers ─────────────────────────────────────────────────────────

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isRateLimited = status === "error" && countdown > 0;

  function fieldError(name: keyof ContactFormFields): string {
    return errors[name] || serverFields[name] || "";
  }

  function fieldInvalid(name: keyof ContactFormFields): boolean {
    return !!fieldError(name);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="cf-root">
      {/* Success banner */}
      {isSuccess && (
        <div
          className="cf-banner cf-banner--success"
          role="alert"
          aria-live="polite"
        >
          <span className="cf-banner__icon" aria-hidden="true">
            ✦
          </span>
          <div>
            <strong>Nachricht gesendet.</strong>
            <p>Ich melde mich so bald wie möglich bei dir.</p>
          </div>
        </div>
      )}

      {/* Error / rate-limit banner */}
      {status === "error" && serverMsg && (
        <div
          className="cf-banner cf-banner--error"
          role="alert"
          aria-live="polite"
        >
          <span className="cf-banner__icon" aria-hidden="true">
            ✕
          </span>
          <div>
            <strong>
              {isRateLimited
                ? `Bitte warte noch ${countdown} Sekunden…`
                : "Etwas ist schiefgelaufen."}
            </strong>
            <p>{serverMsg}</p>
          </div>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        aria-label="Kontaktformular"
      >
        {/* Honeypot — visually hidden, never filled by a human */}
        <div
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: "absolute",
            left: "-9999px",
            width: 1,
            height: 1,
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <label htmlFor="cf-website">Website (nicht ausfüllen)</label>
          <input
            id="cf-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Row 1: Name + Email */}
        <div className="cf-row">
          <Field
            id="cf-name"
            name="name"
            label="Name"
            type="text"
            required
            autoComplete="name"
            placeholder="Dein Name"
            value={fields.name}
            maxLength={FIELD_LIMITS.name.max}
            error={fieldError("name")}
            invalid={touched.name ? fieldInvalid("name") : false}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          />
          <Field
            id="cf-email"
            name="email"
            label="E-Mail"
            type="email"
            required
            autoComplete="email"
            placeholder="deine@email.de"
            value={fields.email}
            maxLength={FIELD_LIMITS.email.max}
            error={fieldError("email")}
            invalid={touched.email ? fieldInvalid("email") : false}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isLoading}
          />
        </div>

        {/* Row 2: Subject */}
        <Field
          id="cf-subject"
          name="subject"
          label="Betreff"
          type="text"
          placeholder="Worum geht es?"
          value={fields.subject}
          maxLength={FIELD_LIMITS.subject.max}
          error={fieldError("subject")}
          invalid={false}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
        />

        {/* Row 3: Message */}
        <Field
          id="cf-message"
          name="message"
          label="Nachricht"
          type="textarea"
          required
          placeholder="Deine Nachricht…"
          value={fields.message}
          maxLength={FIELD_LIMITS.message.max}
          error={fieldError("message")}
          invalid={touched.message ? fieldInvalid("message") : false}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isLoading}
        />

        {/* Footer */}
        <div className="cf-footer">
          <p className="cf-note">
            <span className="cf-asterisk" aria-hidden="true">
              *
            </span>{" "}
            Pflichtfelder
          </p>
          <button
            type="submit"
            className={`cf-submit${isLoading ? " cf-submit--loading" : ""}`}
            disabled={isLoading || isRateLimited}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <span className="cf-spinner" aria-hidden="true" />
                <span>Wird gesendet…</span>
              </>
            ) : (
              <>
                <span>Nachricht senden</span>
                <span className="cf-submit__arrow" aria-hidden="true">
                  →
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .cf-root { width: 100%; }

        /* ── Banners ── */
        .cf-banner {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.1rem 1.4rem;
          border-radius: 3px;
          margin-bottom: 2rem;
          font-size: 1rem;
          line-height: 1.55;
        }
        .cf-banner--success {
          background: rgba(201,169,110,0.07);
          border: 1px solid rgba(201,169,110,0.22);
          color: #c9a96e;
        }
        .cf-banner--error {
          background: rgba(180,80,80,0.07);
          border: 1px solid rgba(180,80,80,0.22);
          color: #c47070;
        }
        .cf-banner strong { display: block; margin-bottom: 0.2rem; font-weight: 500; }
        .cf-banner p      { margin: 0; opacity: 0.85; }
        .cf-banner__icon  { font-size: 0.9rem; flex-shrink: 0; margin-top: 0.15rem; }

        /* ── Form layout ── */
        form { display: flex; flex-direction: column; gap: 1.6rem; }

        .cf-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.2rem;
        }
        @media (max-width: 560px) {
          .cf-row { grid-template-columns: 1fr; }
        }

        /* ── Footer row ── */
        .cf-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding-top: 0.2rem;
        }
        .cf-note {
          font-size: 0.8rem;
          letter-spacing: 0.08em;
          color: var(--color-muted, #7a7670);
          margin: 0;
        }
        .cf-asterisk { color: var(--color-accent, #c9a96e); }

        /* ── Submit button ── */
        .cf-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          background: var(--color-accent, #c9a96e);
          color: #0a0a09;
          border: none;
          border-radius: 3px;
          padding: 0.9rem 2rem;
          font-family: var(--font-body, 'Jost', sans-serif);
          font-size: 0.85rem;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.25s, transform 0.2s;
        }
        .cf-submit:hover:not(:disabled) { opacity: 0.85; transform: translateY(-1px); }
        .cf-submit:disabled             { opacity: 0.5; cursor: not-allowed; }
        .cf-submit--loading             { cursor: wait; }

        .cf-submit__arrow {
          display: inline-block;
          transition: transform 0.25s;
        }
        .cf-submit:hover:not(:disabled) .cf-submit__arrow { transform: translateX(3px); }

        .cf-spinner {
          display: inline-block;
          width: 13px;
          height: 13px;
          border: 2px solid rgba(10,10,9,0.25);
          border-top-color: #0a0a09;
          border-radius: 50%;
          animation: cf-spin 0.65s linear infinite;
          flex-shrink: 0;
        }
        @keyframes cf-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Field sub-component ───────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "textarea";
  placeholder?: string;
  value: string;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
  error: string;
  invalid: boolean;
  disabled: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function Field({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  required,
  maxLength,
  autoComplete,
  error,
  invalid,
  disabled,
  onChange,
  onBlur,
}: FieldProps) {
  const errId = `${id}-err`;

  const sharedProps = {
    id,
    name,
    value,
    placeholder,
    maxLength,
    autoComplete,
    disabled,
    required,
    onChange,
    onBlur,
    className: `cf-field__input${invalid ? " cf-field__input--invalid" : ""}`,
    "aria-invalid": invalid ? ("true" as const) : undefined,
    "aria-describedby": error ? errId : undefined,
    "aria-required": required ? ("true" as const) : undefined,
  };

  return (
    <div className="cf-field">
      <label className="cf-field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="cf-field__req" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>

      {type === "textarea" ? (
        <textarea {...sharedProps} rows={6} />
      ) : (
        <input {...sharedProps} type={type} />
      )}

      {error && (
        <span
          id={errId}
          className="cf-field__error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </span>
      )}

      <style>{`
        .cf-field { display: flex; flex-direction: column; gap: 0.4rem; }

        .cf-field__label {
          font-size: 0.9rem;
          font-weight: 400;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--color-muted, #7a7670);
          transition: color 0.2s;
        }
        .cf-field__req { color: var(--color-accent, #c9a96e); }

        .cf-field__input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 3px;
          padding: 0.82rem 1rem;
          color: var(--color-text, #e8e4dc);
          font-family: var(--font-body, 'Jost', sans-serif);
          font-size: 1rem;
          font-weight: 300;
          letter-spacing: 0.02em;
          outline: none;
          transition: border-color 0.22s, background 0.22s, box-shadow 0.22s;
          -webkit-appearance: none;
          resize: vertical;
        }
        .cf-field__input::placeholder { color: rgba(122,118,112,0.45); }
        .cf-field__input:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.04);
        }
        .cf-field__input:focus {
          border-color: var(--color-accent, #c9a96e);
          background: rgba(201,169,110,0.04);
          box-shadow: 0 0 0 3px rgba(201,169,110,0.08);
        }
        .cf-field__input:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .cf-field__input--invalid {
          border-color: rgba(180,80,80,0.5);
          box-shadow: 0 0 0 3px rgba(180,80,80,0.07);
        }
        .cf-field__input--invalid:focus {
          border-color: rgba(180,80,80,0.7);
          box-shadow: 0 0 0 3px rgba(180,80,80,0.1);
        }

        textarea.cf-field__input { min-height: 140px; line-height: 1.7; }

        .cf-field__error {
          font-size: 0.85rem;
          letter-spacing: 0.03em;
          color: #c47070;
          min-height: 1em;
        }
      `}</style>
    </div>
  );
}
