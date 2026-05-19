// src/components/ArtworkGallery.tsx
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Artwork, Category, Orientation } from "../data/artworks";
import { getOrientation } from "../data/artworks";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "" | "price-asc" | "price-desc" | "year-asc" | "year-desc";
type FormatFilter = "" | "vertical" | "horizontal" | "square";

interface Filters {
  category: Category | "all";
  format: FormatFilter;
  search: string;
  onlyAvailable: boolean;
  sort: SortKey;
}

interface Props {
  artworks: Artwork[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(art: Artwork): string {
  if (art.category === "photography") return "";

  if (art.sold) return "Verkauft";
  if (art.price) return `€\u202F${art.price.toLocaleString("de-DE")}`;
  return "";
}

function categoryLabel(cat: Category): string {
  return cat === "oil"
    ? "Ölgemälde"
    : cat === "watercolor"
      ? "Aquarelle"
      : "Fotografie";
}

// Grid span: vertical = tall, horizontal = wide, square = normal
// We use CSS grid with dense auto-placement; each cell is one unit.
// Wide images span 2 columns, tall images span 2 rows.
function getSpan(art: Artwork): { colSpan: number; rowSpan: number } {
  const o = getOrientation(art);
  if (o === "horizontal") return { colSpan: 2, rowSpan: 1 };
  if (o === "vertical") return { colSpan: 1, rowSpan: 2 };
  return { colSpan: 1, rowSpan: 1 };
}

// ─── Image with loading state ─────────────────────────────────────────────────

function ArtImage({
  src,
  alt,
  orientation,
}: {
  src: string;
  alt: string;
  orientation: Orientation;
}) {
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

// ─── Single Art Card ──────────────────────────────────────────────────────────

function ArtCard({
  art,
  onClick,
}: {
  art: Artwork;
  onClick: (a: Artwork) => void;
}) {
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
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <p className="overlay-hint">Details ansehen</p>
      </div>

      {/* Caption */}
      <div className="card-caption">
        <div className="caption-top">
          <h3 className="card-title">{art.title}</h3>
          {art.category !== "photography" && (
            <span
              className={`card-price ${art.sold ? "card-price--sold" : ""}`}
            >
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

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ art, onClose }: { art: Artwork; onClose: () => void }) {
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
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="2" y1="2" x2="14" y2="14" />
            <line x1="14" y1="2" x2="2" y2="14" />
          </svg>
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

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({
  filters,
  setFilters,
  total,
  shown,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  total: number;
  shown: number;
}) {
  const set = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters({ ...filters, [key]: val });

  const reset = () =>
    setFilters({
      category: "all",
      format: "",
      search: "",
      onlyAvailable: false,
      sort: "",
    });

  const isDirty =
    filters.category !== "all" ||
    filters.format !== "" ||
    filters.search !== "" ||
    filters.onlyAvailable ||
    filters.sort !== "";

  useEffect(() => {
    const heroPhoto = document.getElementById("werkeHeroPhoto");

    if (!heroPhoto) return;

    if (filters.category === "photography") {
      heroPhoto.classList.add("visible");
    } else {
      heroPhoto.classList.remove("visible");
    }
  }, [filters.category]);

  return (
    <div className="filter-bar">
      {/* Category radio tabs */}
      <div className="filter-tabs" role="tablist" aria-label="Kategorie">
        {(["all", "oil", "watercolor", "photography"] as const).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={filters.category === cat}
            className={`filter-tab ${filters.category === cat ? "filter-tab--active" : ""}`}
            onClick={() => set("category", cat)}
          >
            {cat === "all" ? "Alle Werke" : categoryLabel(cat as Category)}
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="filter-row">
        {/* Search */}
        <label className="filter-field filter-field--search">
          <span className="filter-label">Suche</span>
          <div className="search-wrap">
            <svg
              className="search-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Titel, Tags, Größe …"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              className="filter-input"
            />
          </div>
        </label>

        {/* Format */}
        <label className="filter-field">
          <span className="filter-label">Format</span>
          <select
            className="filter-select"
            value={filters.format}
            onChange={(e) => set("format", e.target.value as FormatFilter)}
          >
            <option value="">Alle Formate</option>
            <option value="vertical">Vertikal</option>
            <option value="horizontal">Horizontal</option>
            <option value="square">Quadratisch</option>
          </select>
        </label>

        {/* Sort */}
        <label className="filter-field">
          <span className="filter-label">Sortierung</span>
          <select
            className="filter-select"
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value as SortKey)}
          >
            <option value="">Keine Sortierung</option>
            <option value="price-asc">Preis ↑</option>
            <option value="price-desc">Preis ↓</option>
            <option value="year-asc">Jahr (alt → neu)</option>
            <option value="year-desc">Jahr (neu → alt)</option>
          </select>
        </label>

        {/* Only available */}
        <label className="filter-field filter-field--check">
          <input
            type="checkbox"
            checked={filters.onlyAvailable}
            onChange={(e) => set("onlyAvailable", e.target.checked)}
            className="filter-checkbox"
          />
          <span className="filter-label filter-label--inline">
            Nur verfügbar
          </span>
        </label>

        {/* Reset */}
        {isDirty && (
          <button
            className="filter-reset"
            onClick={reset}
            aria-label="Filter zurücksetzen"
          >
            ✕ Zurücksetzen
          </button>
        )}
      </div>

      {/* Count */}
      <p className="filter-count" aria-live="polite">
        {shown === total
          ? `${total} Werk${total !== 1 ? "e" : ""}`
          : `${shown} von ${total} Werk${total !== 1 ? "en" : ""}`}
      </p>
    </div>
  );
}

// ─── Main Gallery Component ───────────────────────────────────────────────────

export default function ArtworkGallery({ artworks }: Props) {
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    format: "",
    search: "",
    onlyAvailable: false,
    sort: "",
  });

  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const openModal = useCallback((a: Artwork) => setSelectedArt(a), []);
  const closeModal = useCallback(() => setSelectedArt(null), []);

  const filtered = useMemo(() => {
    let list = artworks;

    if (filters.category !== "all") {
      list = list.filter((a) => a.category === filters.category);
    }
    if (filters.format) {
      list = list.filter((a) => getOrientation(a) === filters.format);
    }
    if (filters.onlyAvailable) {
      list = list.filter((a) => !a.sold);
    }
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q)) ||
          `${a.width}x${a.height}`.includes(q) ||
          String(a.year).includes(q) ||
          (a.location?.toLowerCase().includes(q) ?? false),
      );
    }
    if (filters.sort) {
      list = [...list].sort((a, b) => {
        if (filters.sort === "price-asc")
          return (a.price ?? 0) - (b.price ?? 0);
        if (filters.sort === "price-desc")
          return (b.price ?? 0) - (a.price ?? 0);
        if (filters.sort === "year-asc") return a.year - b.year;
        if (filters.sort === "year-desc") return b.year - a.year;
        return 0;
      });
    }

    return list;
  }, [artworks, filters]);

  return (
    <>
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        total={artworks.length}
        shown={filtered.length}
      />

      {filtered.length === 0 ? (
        <div className="gallery-empty">
          <p className="gallery-empty-title">Keine Werke gefunden</p>
          <p className="gallery-empty-sub">
            Passe die Filter an, um Werke zu sehen.
          </p>
        </div>
      ) : (
        <div className="art-grid" role="list">
          {filtered.map((art) => (
            <ArtCard key={art.id} art={art} onClick={openModal} />
          ))}
        </div>
      )}

      {selectedArt && <Modal art={selectedArt} onClose={closeModal} />}

      <style>{STYLES}</style>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const STYLES = `
/* ── Filter bar ─────────────────────────────────────────────────────────── */
.filter-bar {
  max-width: 1300px;
  margin: 0 auto 3.5rem;
  padding: 0 2rem;
}

.filter-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 2rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-tabs::-webkit-scrollbar { display: none; }

.filter-tab {
  font-family: 'Jost', sans-serif;
  font-size: 0.78rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7a7670;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.85rem 1.6rem;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.3s, border-color 0.3s;
  margin-bottom: -1px;
}
.filter-tab:hover { color: #e8e4dc; }
.filter-tab--active {
  color: #c9a96e;
  border-bottom-color: #c9a96e;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-field--search { flex: 1; min-width: 180px; }

.filter-field--check {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.1rem;
  cursor: pointer;
  margin-left: 0.25rem;
}

.filter-label {
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #7a7670;
}
.filter-label--inline { margin: 0; }

.search-wrap {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7a7670;
  pointer-events: none;
}

.filter-input,
.filter-select {
  background-color: rgb(20, 20, 20);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #e8e4dc;
  font-family: 'Jost', sans-serif;
  font-size: 0.82rem;
  font-weight: 300;
  padding: 0.55rem 0.8rem;
  outline: none;
  min-width: 140px;
}
 
.filter-input {
  padding-left: 2.2rem;
  width: 100%;
}
 
.filter-input:focus,
.filter-select:focus {
  border-color: rgba(201,169,110,0.5);
  background: rgba(30,30,30);
}
 
.filter-select {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237a7670'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2rem;
  cursor: pointer;
}


.filter-reset {
  font-family: 'Jost', sans-serif;
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7a7670;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 0.55rem 0.9rem;
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s;
  white-space: nowrap;
  align-self: flex-end;
}
.filter-reset:hover { color: #e8e4dc; border-color: rgba(255,255,255,0.25); }

.filter-count {
  font-size: 0.72rem;
  color: #7a7670;
  letter-spacing: 0.05em;
  margin-top: 1.25rem;
  text-align: right;
}

/* ── Grid ───────────────────────────────────────────────────────────────── */
.art-grid {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 2rem 5rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 280px;
  gap: 10px;
  grid-auto-flow: dense;
}

@media (max-width: 1100px) {
  .art-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 740px) {
  .art-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 220px;
  }
}
@media (max-width: 480px) {
  .art-grid {
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 180px;
    gap: 6px;
    padding: 0 1rem 3rem;
  }
}

/* ── Art card ───────────────────────────────────────────────────────────── */
.art-card {
  position: relative;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  background: #111110;
  outline: none;
}

/* Keyboard focus ring */
.art-card:focus-visible {
  box-shadow: 0 0 0 2px #c9a96e;
}

/* ── Image wrap ── */
.card-image-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.04);
  transition:
    opacity 0.5s ease,
    transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.card-img--loaded {
  opacity: 1;
  transform: scale(1);
}

/* Hover: zoom + warm glow */
.art-card:hover .card-img,
.art-card:focus-visible .card-img {
  transform: scale(1.07);
}

/* ── Shimmer loading ── */
.img-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.03) 0%,
    rgba(255,255,255,0.07) 50%,
    rgba(255,255,255,0.03) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Image error ── */
.img-error {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.15);
  font-size: 2.5rem;
}

/* ── Hover overlay ── */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(5,5,4,0.75) 0%,
    rgba(5,5,4,0.1) 60%,
    rgba(201,169,110,0.08) 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.35s ease;
  z-index: 2;
}

.art-card:hover .card-overlay,
.art-card:focus-visible .card-overlay {
  opacity: 1;
}

.overlay-zoom-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 1px solid rgba(201,169,110,0.5);
  background: rgba(10,10,9,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c9a96e;
  transform: scale(0.8);
  transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
.art-card:hover .overlay-zoom-icon { transform: scale(1); }

.overlay-hint {
  font-size: 0.65rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(232,228,220,0.7);
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.3s 0.05s, transform 0.3s 0.05s;
}
.art-card:hover .overlay-hint { opacity: 1; transform: translateY(0); }

/* ── Caption ── */
.card-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  padding: 1rem 0.9rem 0.75rem;
  background: linear-gradient(to top, rgba(5,5,4,0.95) 0%, transparent 100%);
  transform: translateY(0);
  transition: transform 0.35s ease;
}

.caption-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.4rem;
}

.card-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 400;
  color: #e8e4dc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  line-height: 1.2;
}

.card-price {
  font-size: 0.75rem;
  font-weight: 400;
  color: #c9a96e;
  white-space: nowrap;
  flex-shrink: 0;
}

.card-price--sold {
  color: #7a7670;
  text-decoration: line-through;
  text-decoration-color: rgba(122,118,112,0.5);
}

.card-meta {
  font-size: 0.65rem;
  color: rgba(122,118,112,0.9);
  letter-spacing: 0.03em;
  margin-top: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Sold ribbon ── */
.sold-ribbon {
  position: absolute;
  top: 0.75rem;
  right: 0;
  z-index: 5;
  background: rgba(10,10,9,0.82);
  border: 1px solid rgba(255,255,255,0.1);
  border-right: none;
  border-radius: 4px 0 0 4px;
  padding: 0.2rem 0.65rem 0.2rem 0.5rem;
}
.sold-ribbon span {
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7a7670;
}

/* ── Skeleton ── */
.skeleton-card {
  background: #0f0f0e;
  animation: skeletonPulse 2s ease-in-out infinite;
}
.skeleton-image {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.04);
}
.skeleton-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.skeleton-line {
  border-radius: 2px;
  background: rgba(255,255,255,0.06);
  height: 10px;
}
.skeleton-line--title { width: 65%; }
.skeleton-line--sub   { width: 50%; }
.skeleton-line--price { width: 30%; }

@keyframes skeletonPulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}

/* ── Empty state ── */
.gallery-empty {
  max-width: 400px;
  margin: 6rem auto;
  text-align: center;
}
.gallery-empty-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.8rem;
  color: #e8e4dc;
  margin-bottom: 0.75rem;
}
.gallery-empty-sub {
  font-size: 0.85rem;
  color: #7a7670;
}

/* ── Modal ──────────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(5,5,4,0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: backdropIn 0.3s ease both;
}

@keyframes backdropIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal-panel {
  position: relative;
  background: #111110;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px;
  width: 100%;
  max-height: 92dvh;
  display: grid;
  overflow: scroll;
  animation: panelIn 0.4s cubic-bezier(0.4,0,0.2,1) both;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.5),
    0 40px 80px rgba(0,0,0,0.6);
}

@keyframes panelIn {
  from { opacity: 0; transform: scale(0.97) translateY(10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Landscape image → side-by-side */
.modal-panel--vertical, .modal-panel--square {
  max-width: 1250px;
  grid-template-columns: 1fr 320px;
  grid-template-rows: 1fr;
}

/* Portrait image → stacked */
.modal-panel--horizontal {
  max-width: 900px;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  max-height: 96dvh;
}

.modal-panel--horizontal .modal-image-side {
  max-height: 55dvh;
}

.modal-image-side {
  position: relative;
  overflow: hidden;
  background: #0c0c0b;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  max-height: 92dvh;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.modal-img--loaded { opacity: 1; }

.modal-info-side {
  padding: 2rem 1.75rem;
  overflow-y: auto;
  border-left: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 0;
}

.modal-panel--horizontal .modal-info-side {
  border-left: none;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 1.5rem;
}

.modal-close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(10,10,9,0.75);
  border: 1px solid rgba(255,255,255,0.1);
  color: #e8e4dc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
}
.modal-close:hover { background: rgba(201,169,110,0.2); transform: scale(1.05); }

.modal-eyebrow {
  padding-top: 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.modal-category-badge {
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c9a96e;
}

.modal-year-badge {
  font-size: 0.8rem;
  color: #7a7670;
  letter-spacing: 0.05em;
}

.modal-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.3rem;
  font-weight: 400;
  line-height: 1.15;
  color: #e8e4dc;
  margin-bottom: 1.1rem;
}

.modal-details {
  margin-bottom: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-row {
  display: flex;
  gap: 0.75rem;
  font-size: 1rem;
}
.detail-row dt {
  color: #7a7670;
  min-width: 50px;
  flex-shrink: 0;
}
.detail-row dd { color: #b0aca4; }

.modal-description {
  font-size: 1rem;
  color: #9a968e;
  line-height: 1.75;
  padding-top: 1.1rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: 0.25rem;
  flex: 1;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  margin-top: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.modal-price {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.7rem;
  font-weight: 400;
  color: #e8e4dc;
}
.modal-price--sold {
  font-family: 'Jost', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a7670;
}

.btn-inquire {
  font-family: 'Jost', sans-serif;
  font-size: 0.7rem;
  font-weight: 400;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #0a0a09;
  background: #c9a96e;
  padding: 0.65rem 1.1rem;
  border-radius: 4px;
  transition: opacity 0.25s, transform 0.2s;
  white-space: nowrap;
}
.btn-inquire:hover { opacity: 0.85; transform: translateY(-1px); }

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 1.1rem;
}
.modal-tag {
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #7a7670;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 50px;
  padding: 0.18rem 0.55rem;
}

/* ── Responsive modal ── */
@media (max-width: 720px) {
  .modal-panel--vertical, .modal-panel--square {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    max-width: 98vw;
  }
  .modal-info-side {
    border-left: none;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding: 1.25rem;
    max-height: 55dvh;
    overflow-y: auto;
  }
  .modal-image-side { min-height: 200px; max-height: 45dvh; }
  .modal-title { font-size: 1.5rem; }
}

@media (max-width: 600px) {
  .filter-bar { padding: 0 1rem; }
  .filter-tab { padding: 0.7rem 1rem; font-size: 0.72rem; }
}
`;
