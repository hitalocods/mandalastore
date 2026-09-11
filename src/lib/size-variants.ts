import type { SizeVariant } from "@/types/product";

/**
 * Parse the `sizes` field from the database into an array of SizeVariant.
 *
 * Supports two formats (retrocompatible):
 *  - JSON: '[{"label":"P","price":29.90},{"label":"M","price":34.90}]'
 *  - Legacy CSV: 'P, M, G, GG'  → price defaults to 0 for each label
 */
export function parseSizeVariants(sizes: string | null | undefined): SizeVariant[] {
  if (!sizes) return [];

  const trimmed = sizes.trim();
  if (!trimmed) return [];

  // Try JSON first
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown[];
      if (Array.isArray(parsed)) {
        return parsed
          .filter(
            (item): item is { label: string; price: number } =>
              typeof item === "object" &&
              item !== null &&
              "label" in item &&
              typeof (item as { label: unknown }).label === "string",
          )
          .map((item) => ({
            label: item.label.trim(),
            price: typeof item.price === "number" ? item.price : 0,
          }))
          .filter((v) => v.label.length > 0);
      }
    } catch {
      // Fall through to CSV parse
    }
  }

  // Legacy CSV format: "P, M, G, GG"
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({ label, price: 0 }));
}

/**
 * Serialize an array of SizeVariant back to the JSON string stored in the DB.
 * Returns null if the array is empty.
 */
export function serializeSizeVariants(variants: SizeVariant[]): string | null {
  const valid = variants.filter((v) => v.label.trim().length > 0);
  if (valid.length === 0) return null;
  return JSON.stringify(valid);
}

/**
 * Returns true if the sizes string contains per-size pricing data (JSON format).
 */
export function hasPricedVariants(sizes: string | null | undefined): boolean {
  if (!sizes) return false;
  return sizes.trim().startsWith("[");
}
