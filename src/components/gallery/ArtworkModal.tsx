// src/components/gallery/ArtworkModal.tsx
// Full-screen lightbox for a single artwork, with focus management,
// Escape-to-close and body-scroll locking.

import { useState, useRef, useEffect } from "react";
import type { Artwork } from "../../data/artworks";
import { getOrientation } from "../../data/artworks";
import { categoryLabel } from "./utils";
import { CloseIcon } from "./icons";

interface Props {
  art: Artwork;
  onClose: () => void;
}

export default function ArtworkModal({ art, onClose }: Props) {
  const orientation = getOrientation(art);
  const [imgLoaded, setImgLoaded] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.currentTarget === e.target && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={art.title}
    >
      <div className={`modal-panel modal-panel--${orientation}`}>
        {/* Close */}
        <button
          ref={closeBtnRef}
          className="modal-close"
          onClick={onClose}
          aria-label="Schließen"
        >
          <CloseIcon />
        </button>

        {/* Image area */}
        <div className="modal-image-side">
          {!imgLoaded && (
            <div
              className="img-shimmer"
              style={{ position: "absolute", inset: 0 }}
            />
          )}
          <img
            src={art.image}
            alt={art.title}
            className={`modal-img ${imgLoaded ? "modal-img--loaded" : ""}`}
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        {/* Info panel */}
        <aside className="modal-info-side">
          <div className="modal-eyebrow">
            <span className="modal-category-badge">
              {categoryLabel(art.category)}
            </span>
            <span className="modal-year-badge">{art.year}</span>
          </div>

          <h2 className="modal-title">{art.title}</h2>

          <dl className="modal-details">
            <div className="detail-row">
              <dt>Format</dt>
              <dd>
                {art.width} × {art.height}{" "}
                {art.category !== "photography" ? "cm" : "px"}
              </dd>
            </div>
            {art.location && (
              <div className="detail-row">
                <dt>Ort</dt>
                <dd>{art.location}</dd>
              </div>
            )}
          </dl>

          {art.description && (
            <p className="modal-description">{art.description}</p>
          )}

          <div className="modal-footer">
            {art.category === "photography" ? null : art.sold ? (
              <span className="modal-price modal-price--sold">Verkauft</span>
            ) : (
              <>
                <span className="modal-price">
                  €{art.price?.toLocaleString("de-DE")}
                </span>
                <a href="/kontakt" className="btn-inquire">
                  Anfragen
                </a>
              </>
            )}
          </div>

          {art.tags && art.tags.length > 0 && (
            <div className="modal-tags" aria-label="Tags">
              {art.tags.map((t) => (
                <span key={t} className="modal-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
