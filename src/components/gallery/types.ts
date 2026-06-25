// src/components/gallery/types.ts
// Shared types and constants for the artwork gallery.

import type { Category } from "../../data/artworks";

export type SortKey = "" | "price-asc" | "price-desc" | "year-asc" | "year-desc";
export type FormatFilter = "" | "vertical" | "horizontal" | "square";

export interface Filters {
  category: Category | "all";
  format: FormatFilter;
  search: string;
  onlyAvailable: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  category: "all",
  format: "",
  search: "",
  onlyAvailable: false,
  sort: "",
};
