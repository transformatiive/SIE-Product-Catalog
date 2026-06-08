// ============================================================================
// CANVAS TEMPLATE MODEL (card 443 — Figma-like A4 free-canvas designer)
// ----------------------------------------------------------------------------
// A canvas template describes absolutely-positioned elements on a fixed-size
// page (A4 by default) plus optional header/footer bands. All coordinates and
// sizes are expressed in PDF points (pt, 72 per inch) so they map 1:1 to the
// react-pdf renderer. The document is serialized as JSON into the existing
// `pdfTemplates.content` text column; the `kind: "canvas"` discriminator tells
// the renderer to use the canvas path instead of the legacy rich-text path.
// ============================================================================

import { z } from "zod";

export type PageSize = "A4" | "A3" | "Letter" | "Legal";
export type Orientation = "portrait" | "landscape";
export type CanvasRegion = "body" | "header" | "footer";

// Portrait dimensions in points (72 dpi).
export const PAGE_DIMENSIONS_PT: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 595.28, height: 841.89 },
  A3: { width: 841.89, height: 1190.55 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

export function getPageDimensions(
  size: PageSize,
  orientation: Orientation,
): { width: number; height: number } {
  const base = PAGE_DIMENSIONS_PT[size] || PAGE_DIMENSIONS_PT.A4;
  return orientation === "landscape"
    ? { width: base.height, height: base.width }
    : { width: base.width, height: base.height };
}

export interface CanvasElementBase {
  id: string;
  type: "text" | "image";
  region: CanvasRegion;
  // Position/size in points. For body elements the coordinates are
  // page-absolute; for header/footer they are relative to the band's top-left.
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
}

export interface CanvasTextElement extends CanvasElementBase {
  type: "text";
  // TipTap/ProseMirror JSON document. May contain inline `mergeField` nodes.
  content: any;
  fontSize: number;
  fontFamily?: string;
  color?: string;
  align?: "left" | "center" | "right" | "justify";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight?: number;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  padding?: number;
}

export interface CanvasImageElement extends CanvasElementBase {
  type: "image";
  // An image element is a placeholder for a dynamic field that holds the image
  // URL. When `fieldKey` is set the URL comes from the product at render time;
  // `staticSrc` is an optional fixed image (e.g. a logo) used otherwise.
  fieldKey?: string;
  staticSrc?: string;
  objectFit?: "contain" | "cover" | "fill";
  borderRadius?: number;
}

export type CanvasElement = CanvasTextElement | CanvasImageElement;

export interface CanvasBandConfig {
  enabled: boolean;
  height: number; // points
}

export interface CanvasTemplateDoc {
  kind: "canvas";
  version: 1;
  page: { size: PageSize; orientation: Orientation };
  header: CanvasBandConfig;
  footer: CanvasBandConfig;
  background?: string;
  elements: CanvasElement[];
}

// ---------------------------------------------------------------------------
// Zod validation (kept permissive so future fields don't break old documents)
// ---------------------------------------------------------------------------

const elementBaseShape = {
  id: z.string(),
  region: z.enum(["body", "header", "footer"]).default("body"),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().optional(),
  opacity: z.number().optional(),
};

export const canvasTextElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal("text"),
  content: z.any(),
  fontSize: z.number().default(11),
  fontFamily: z.string().optional(),
  color: z.string().optional(),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
  verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
  lineHeight: z.number().optional(),
  backgroundColor: z.string().optional(),
  borderWidth: z.number().optional(),
  borderColor: z.string().optional(),
  padding: z.number().optional(),
});

export const canvasImageElementSchema = z.object({
  ...elementBaseShape,
  type: z.literal("image"),
  fieldKey: z.string().optional(),
  staticSrc: z.string().optional(),
  objectFit: z.enum(["contain", "cover", "fill"]).optional(),
  borderRadius: z.number().optional(),
});

export const canvasElementSchema = z.discriminatedUnion("type", [
  canvasTextElementSchema,
  canvasImageElementSchema,
]);

export const canvasBandSchema = z.object({
  enabled: z.boolean().default(false),
  height: z.number().default(70),
});

export const canvasTemplateSchema = z.object({
  kind: z.literal("canvas"),
  version: z.literal(1),
  page: z.object({
    size: z.enum(["A4", "A3", "Letter", "Legal"]).default("A4"),
    orientation: z.enum(["portrait", "landscape"]).default("portrait"),
  }),
  header: canvasBandSchema,
  footer: canvasBandSchema,
  background: z.string().optional(),
  elements: z.array(canvasElementSchema).default([]),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Type guard: does this parsed content represent a canvas template? */
export function isCanvasTemplate(content: unknown): content is CanvasTemplateDoc {
  return (
    !!content &&
    typeof content === "object" &&
    (content as any).kind === "canvas" &&
    Array.isArray((content as any).elements)
  );
}

/** Parse a stored template content string into a canvas doc, or null. */
export function parseCanvasTemplate(raw: string | null | undefined): CanvasTemplateDoc | null {
  if (!raw) return null;
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return isCanvasTemplate(parsed) ? (parsed as CanvasTemplateDoc) : null;
  } catch {
    return null;
  }
}

export function createEmptyCanvasTemplate(
  size: PageSize = "A4",
  orientation: Orientation = "portrait",
): CanvasTemplateDoc {
  return {
    kind: "canvas",
    version: 1,
    page: { size, orientation },
    header: { enabled: false, height: 70 },
    footer: { enabled: false, height: 50 },
    background: "#ffffff",
    elements: [],
  };
}

export function emptyRichText(text = ""): any {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
}
