// src/lib/mailer.ts
// ─────────────────────────────────────────────────────────────────────────────
// Nodemailer transport singleton + email template builder.
//
// Required environment variables (.env):
//   SMTP_HOST     e.g. smtp.gmail.com
//   SMTP_PORT     e.g. 587 (STARTTLS) or 465 (TLS)
//   SMTP_USER     sender / auth username
//   SMTP_PASS     app password or OAuth2 secret
//   CONTACT_TO    recipient address (the artist's inbox)
//   CONTACT_FROM  "From" header, e.g. "Website <noreply@example.de>"
// ─────────────────────────────────────────────────────────────────────────────

import nodemailer from "nodemailer";
import type { ContactPayload } from "../types/contact";
import { escapeHtml, safeMultiline } from "./sanitize";

// ── Transport singleton ───────────────────────────────────────────────────────

let _transport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransport() {
  if (_transport) return _transport;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = import.meta.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Mailer: SMTP_HOST, SMTP_USER and SMTP_PASS must be set in environment variables.",
    );
  }

  const port = Number(SMTP_PORT ?? 587);
  const secure = port === 465; // true = TLS wrapper; false = STARTTLS

  _transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  return _transport;
}

// ── HTML template ─────────────────────────────────────────────────────────────

function buildHtml(p: ContactPayload): string {
  const name = escapeHtml(p.name);
  const email = escapeHtml(p.email);
  const subject = p.subject ? escapeHtml(p.subject) : "";
  const message = safeMultiline(p.message);

  return /* html */ `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    body  { margin:0; padding:0; background:#0a0a09; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#b0aca4; }
    .wrap { max-width:560px; margin:2rem auto; background:#111110; border:1px solid rgba(255,255,255,0.07); border-radius:6px; overflow:hidden; }
    .hdr  { padding:1.75rem 2rem 1.5rem; border-bottom:1px solid rgba(255,255,255,0.06); }
    .eye  { font-size:10px; letter-spacing:3px; text-transform:uppercase; color:#c9a96e; margin:0 0 .4rem; }
    .ttl  { font-size:20px; font-weight:300; color:#e8e4dc; margin:0; }
    .bdy  { padding:1.75rem 2rem; }
    .row  { margin-bottom:1.25rem; }
    .lbl  { font-size:10px; letter-spacing:2px; text-transform:uppercase; color:#7a7670; margin:0 0 .3rem; }
    .val  { font-size:14px; color:#b0aca4; margin:0; line-height:1.65; }
    .msg  { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:4px; padding:.9rem 1rem; }
    .ftr  { padding:1rem 2rem; border-top:1px solid rgba(255,255,255,0.06); font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(122,118,112,.4); text-align:center; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr">
      <p class="eye">Neue Kontaktanfrage</p>
      <h1 class="ttl">hannahmilenapilack.de</h1>
    </div>
    <div class="bdy">
      <div class="row">
        <p class="lbl">Name</p>
        <p class="val">${name}</p>
      </div>
      <div class="row">
        <p class="lbl">E-Mail</p>
        <p class="val"><a href="mailto:${email}" style="color:#c9a96e;">${email}</a></p>
      </div>
      ${subject ? `<div class="row"><p class="lbl">Betreff</p><p class="val">${subject}</p></div>` : ""}
      <div class="row">
        <p class="lbl">Nachricht</p>
        <p class="val msg">${message}</p>
      </div>
    </div>
    <div class="ftr">Automatisch generiert &middot; hannahmilenapilack.de</div>
  </div>
</body>
</html>`;
}

// ── Plain-text fallback ───────────────────────────────────────────────────────

function buildText(p: ContactPayload): string {
  return [
    "NEUE KONTAKTANFRAGE — hannahmilenapilack.de",
    "─".repeat(48),
    `Name:    ${p.name}`,
    `E-Mail:  ${p.email}`,
    p.subject ? `Betreff: ${p.subject}` : "",
    "",
    "Nachricht:",
    p.message,
    "",
    "─".repeat(48),
    "Automatisch generiert · hannahmilenapilack.de",
  ]
    .filter((l) => l !== null)
    .join("\n");
}

// ── Public send function ──────────────────────────────────────────────────────

export async function sendContactMail(p: ContactPayload): Promise<void> {
  const transport = getTransport();

  const subjectLine = p.subject
    ? `[Kontakt] ${p.subject} – ${p.name}`
    : `[Kontakt] Neue Nachricht von ${p.name}`;

  const info = await transport.sendMail({
    from: import.meta.env.CONTACT_FROM ?? import.meta.env.SMTP_USER,
    to: import.meta.env.CONTACT_TO ?? import.meta.env.SMTP_USER,
    replyTo: `"${p.name}" <${p.email}>`,
    subject: subjectLine,
    text: buildText(p),
    html: buildHtml(p),
  });

  console.log("[mailer] sendMail result:", info);
}
