// src/components/gallery/ArtCard.tsx
// A single artwork tile in the masonry-style grid.

import type { Artwork } from "../../data/artworks";
import { getOrientation } from "../../data/artworks";
import { formatPrice, getSpan } from "./utils";
import { ZoomIcon } from "./icons";
import ArtImage from "./ArtImage";

interface Props {
  art: Artwork;
  onClick: (a: Artwork) => void;
}

export default function ArtCard({ art, onClick }: Props) {
  const { colSpan, rowSpan } = getSpan(art);
  const orientation = getOrientation(art);

  return (
    <article
      className={`art-card art-card--${orientation}`}
      style={{ gridColumn: `span ${colSpan}`, gridRow: `span ${rowSpan}` }}
      onClick={() => onClick(art)}
      role="button"
      tabIndex={0}
      aria-label={`${art.title} vergrößern`}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(art)}
    >
      {/* Sold ribbon */}
      {art.sold && art.category !== "photography" && (
        <div className="sold-ribbon" aria-label="Verkauft">
          <span>Verkauft</span>
        </div>
      )}

      <ArtImage src={art.image} alt={art.title} orientation={orientation} />

      {/* Hover overlay with zoom icon */}
      <div className="card-overlay" aria-hidden="true">
        <div className="overlay-zoom-icon">
          <ZoomIcon />
        </div>
        <p className="overlay-hint">Details ansehen</p>
      </div>

      {/* Caption */}
      <div className="card-caption">
        <div className="caption-top">
          <h3 className="card-title">{art.title}</h3>
          {art.category !== "photography" && (
            <span className={`card-price ${art.sold ? "card-price--sold" : ""}`}>
              {formatPrice(art)}
            </span>
          )}
        </div>
        <p className="card-meta">
          {art.year}
          {art.location ? ` · ${art.location}` : ""}
          {" · "}
          {art.width} × {art.height}{" "}
          {art.category !== "photography" ? "cm" : "px"}
        </p>
      </div>
    </article>
  );
}
