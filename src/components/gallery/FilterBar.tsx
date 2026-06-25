// src/components/gallery/FilterBar.tsx
// Category tabs + search / format / sort / availability controls.
// Purely presentational: it reads and writes the `Filters` object and never
// touches the DOM itself.

import type { Category } from "../../data/artworks";
import type { Filters, FormatFilter, SortKey } from "./types";
import { DEFAULT_FILTERS } from "./types";
import { categoryLabel } from "./utils";
import { SearchIcon } from "./icons";

interface Props {
  filters: Filters;
  setFilters: (f: Filters) => void;
  total: number;
  shown: number;
}

const CATEGORY_TABS = ["all", "oil", "watercolor", "photography"] as const;

export default function FilterBar({ filters, setFilters, total, shown }: Props) {
  const set = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters({ ...filters, [key]: val });

  const reset = () => setFilters({ ...DEFAULT_FILTERS });

  const isDirty =
    filters.category !== "all" ||
    filters.format !== "" ||
    filters.search !== "" ||
    filters.onlyAvailable ||
    filters.sort !== "";

  return (
    <div className="filter-bar">
      {/* Category radio tabs */}
      <div className="filter-tabs" role="tablist" aria-label="Kategorie">
        {CATEGORY_TABS.map((cat) => (
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
            <SearchIcon />
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
