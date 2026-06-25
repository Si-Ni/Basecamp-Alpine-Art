// src/components/gallery/utils.ts
// Pure presentation helpers shared across gallery components.

import type { Artwork, Category } from "../../data/artworks";
import { getOrientation } from "../../data/artworks";

export function formatPrice(art: Artwork): string {
  if (art.category === "photography") return "";

  if (art.sold) return "Verkauft";
  if (art.price) return `€ ${art.price.toLocaleString("de-DE")}`;
  return "";
}

export function categoryLabel(cat: Category): string {
  return cat === "oil"
    ? "Ölgemälde"
    : cat === "watercolor"
      ? "Aquarelle"
      : "Fotografie";
}

// Grid span: vertical = tall, horizontal = wide, square = normal.
// We use CSS grid with dense auto-placement; each cell is one unit.
// Wide images span 2 columns, tall images span 2 rows.
export function getSpan(art: Artwork): { colSpan: number; rowSpan: number } {
  const o = getOrientation(art);
  if (o === "horizontal") return { colSpan: 2, rowSpan: 1 };
  if (o === "vertical") return { colSpan: 1, rowSpan: 2 };
  return { colSpan: 1, rowSpan: 1 };
}
