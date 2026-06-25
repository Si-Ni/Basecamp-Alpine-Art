// src/components/gallery/ArtworkGallery.tsx
// Interactive gallery: owns filter state, derives the visible list, opens the
// lightbox and keeps the page banner (rendered by WerkeHero.astro) in sync with
// the active category.

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Artwork } from "../../data/artworks";
import { getOrientation } from "../../data/artworks";
import type { Filters } from "./types";
import { DEFAULT_FILTERS } from "./types";
import FilterBar from "./FilterBar";
import ArtCard from "./ArtCard";
import ArtworkModal from "./ArtworkModal";
import "./gallery.css";

interface Props {
  artworks: Artwork[];
}

export default function ArtworkGallery({ artworks }: Props) {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });

  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const openModal = useCallback((a: Artwork) => setSelectedArt(a), []);
  const closeModal = useCallback(() => setSelectedArt(null), []);

  // Keep the server-rendered hero banner in sync with the active category.
  // WerkeHero.astro renders one [data-werke-banner] layer per category; we just
  // toggle the `visible` class on the matching one.
  useEffect(() => {
    const banners = document.querySelectorAll<HTMLElement>(
      "[data-werke-banner]",
    );
    banners.forEach((el) => {
      el.classList.toggle(
        "visible",
        el.dataset.werkeBanner === filters.category,
      );
    });
  }, [filters.category]);

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

      {selectedArt && <ArtworkModal art={selectedArt} onClose={closeModal} />}
    </>
  );
}
