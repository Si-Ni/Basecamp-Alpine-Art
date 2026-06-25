// src/components/gallery/ArtImage.tsx
// Lazy <img> with shimmer-while-loading and a graceful error fallback.

import { useState, useRef, useEffect } from "react";
import type { Orientation } from "../../data/artworks";

interface Props {
  src: string;
  alt: string;
  orientation: Orientation;
}

export default function ArtImage({ src, alt, orientation }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle already-cached images (naturalWidth > 0 before onLoad fires)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="card-image-wrap" data-orientation={orientation}>
      {!loaded && !error && <div className="img-shimmer" aria-hidden="true" />}
      {error && (
        <div className="img-error" aria-label="Bild nicht verfügbar">
          <span className="img-error-icon">◻</span>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`card-img ${loaded ? "card-img--loaded" : ""}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
      />
    </div>
  );
}
