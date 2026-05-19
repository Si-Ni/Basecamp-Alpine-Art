// src/lib/mailer.ts
import { Resend } from "resend";
import type { ContactPayload } from "../types/contact";
import { escapeHtml, safeMultiline } from "./sanitize";

// ── HTML template (unchanged) ─────────────────────────────────────────────────

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

// ── Send ──────────────────────────────────────────────────────────────────────

export async function sendContactMail(
  p: ContactPayload,
  env: Record<string, string | undefined>,
): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Mailer: RESEND_API_KEY must be set.");

  const resend = new Resend(apiKey);

  const subjectLine = p.subject
    ? `[Kontakt] ${p.subject} – ${p.name}`
    : `[Kontakt] Neue Nachricht von ${p.name}`;

  const { error } = await resend.emails.send({
    from: env.CONTACT_FROM ?? "noreply@hannahmilenapilack.de",
    to: env.CONTACT_TO ?? "hannah@hannahmilenapilack.de",
    replyTo: `"${p.name}" <${p.email}>`,
    subject: subjectLine,
    text: buildText(p),
    html: buildHtml(p),
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}
