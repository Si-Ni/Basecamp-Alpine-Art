// src/components/gallery/PhotographyNote.tsx
// Quiet, framed invitation shown in the modal for photographs.
// Self-contained: copy, markup and styles live next to each other.

const NOTE_TEXT =
  "Du hast Interesse an meinen Fotografien? Gerne kannst du mich kontaktieren. " +
  "Die Aufnahmen sind auf Anfrage in verschiedenen Formaten erhältlich und können " +
  "wahlweise gerahmt oder auf Leinwand angefertigt und direkt zu dir nach Hause " +
  "versendet werden.";

interface Props {
  /** Target of the call-to-action. */
  contactHref?: string;
}

export default function PhotographyNote({ contactHref = "/kontakt" }: Props) {
  return (
    <section className="photo-note" aria-label="Fotografien auf Anfrage">
      <p className="photo-note__text">{NOTE_TEXT}</p>
      <a href={contactHref} className="btn-inquire photo-note__cta">
        Anfragen
      </a>
    </section>
  );
}
