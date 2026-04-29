import type { Product, Family } from "@shared/schema";

/**
 * Build the merge data payload sent to Zoho Writer.
 *
 * Convention: every product column is exposed under its snake_case name (matching the database column),
 * plus a `family_*` block with the assigned family's metadata. Customers reference these names as merge
 * fields in their Zoho Writer templates (see docs/zoho-writer-merge-fields.md).
 *
 * Boolean values are converted to "Sim"/"Não" so they render naturally inside the document.
 * Null/undefined become empty strings to avoid printing the literal "null" in templates.
 */

const BOOL_TRUE = "Sim";
const BOOL_FALSE = "Não";

function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function normalizeValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? BOOL_TRUE : BOOL_FALSE;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function buildMergeData(
  product: Product,
  family: Family | null
): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [key, value] of Object.entries(product)) {
    out[camelToSnake(key)] = normalizeValue(value);
  }

  if (family) {
    out.family_id = normalizeValue(family.id);
    out.family_code = normalizeValue(family.code);
    out.family_description = normalizeValue(family.description);
  } else {
    out.family_id = "";
    out.family_code = "";
    out.family_description = normalizeValue(product.family);
  }

  return out;
}
