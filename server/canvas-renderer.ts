import { createElement as h, Fragment } from 'react';
import { Document, Page, Text, View, Image, Svg, Rect, Ellipse } from '@react-pdf/renderer';
import type { Product, PdfTemplate } from '@shared/schema';
import { resolveMergeField } from '@shared/mergeFields';
import {
  getPageDimensions,
  type CanvasTemplateDoc,
  type CanvasElement,
  type CanvasTextElement,
  type CanvasImageElement,
  type CanvasShapeElement,
  type PageSize,
  type Orientation,
} from '@shared/canvasTemplate';
import { renderDocBlocks, resolveLocalImage, type RenderCtx } from './template-render-core';

// react-pdf only ships Helvetica / Times-Roman / Courier built in.
function mapFontFamily(css: string | undefined): string | undefined {
  if (!css) return undefined;
  const v = css.toLowerCase();
  if (v.includes('courier') || v.includes('mono')) return 'Courier';
  if (v.includes('times') || v.includes('georgia') || v.includes('serif')) return 'Times-Roman';
  return 'Helvetica';
}

function justifyFor(v: CanvasTextElement['verticalAlign']): any {
  switch (v) {
    case 'middle':
      return 'center';
    case 'bottom':
      return 'flex-end';
    default:
      return 'flex-start';
  }
}

// A remote/data src can be handed to react-pdf as-is. Local paths (/uploads,
// /attached_assets) must instead be resolved to a real file via
// resolveLocalImage; an unresolved local path is dropped so a missing image
// never breaks PDF generation.
function isRemoteSrc(src: string | undefined | null): src is string {
  if (!src || typeof src !== 'string') return false;
  const s = src.trim();
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:');
}

function renderText(el: CanvasTextElement, ctx: RenderCtx, top: number, key: string): any {
  const style: any = {
    position: 'absolute',
    left: el.x,
    top,
    width: el.width,
    height: el.height,
    fontSize: el.fontSize || 11,
    color: el.color || '#222222',
    lineHeight: el.lineHeight || 1.3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: justifyFor(el.verticalAlign),
    overflow: 'hidden',
  };
  if (el.fontFamily) style.fontFamily = mapFontFamily(el.fontFamily);
  if (el.align) style.textAlign = el.align;
  if (el.backgroundColor) style.backgroundColor = el.backgroundColor;
  if (typeof el.padding === 'number') style.padding = el.padding;
  if (el.borderWidth) {
    style.borderWidth = el.borderWidth;
    style.borderColor = el.borderColor || '#000000';
    style.borderStyle = 'solid';
  }
  if (typeof el.opacity === 'number') style.opacity = el.opacity;

  const blocks = renderDocBlocks(el.content || null, ctx);
  return h(View, { key, style }, h(Fragment, null, ...blocks));
}

function renderImage(el: CanvasImageElement, ctx: RenderCtx, top: number, key: string): any {
  let src: string | null = null;
  if (el.fieldKey) {
    src = resolveMergeField(el.fieldKey, ctx.product) || null;
  } else if (el.staticSrc) {
    src = el.staticSrc;
  }

  const boxStyle: any = {
    position: 'absolute',
    left: el.x,
    top,
    width: el.width,
    height: el.height,
  };
  if (typeof el.opacity === 'number') boxStyle.opacity = el.opacity;
  if (el.borderRadius) boxStyle.borderRadius = el.borderRadius;

  const local = resolveLocalImage(src);
  const finalSrc = local || (isRemoteSrc(src) ? src : null);

  if (!finalSrc) {
    // No resolvable image. Show a subtle placeholder only while previewing.
    if (!ctx.previewMode) return null;
    return h(
      View,
      {
        key,
        style: {
          ...boxStyle,
          borderWidth: 1,
          borderColor: '#c7c7c7',
          borderStyle: 'dashed',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      h(Text, { style: { fontSize: 8, color: '#9a9a9a' } }, el.fieldKey ? `{{${el.fieldKey}}}` : 'Imagem'),
    );
  }

  const imgStyle: any = { ...boxStyle, objectFit: el.objectFit || 'contain' };
  try {
    return h(Image, { key, src: finalSrc, style: imgStyle });
  } catch {
    return null;
  }
}

function renderShape(el: CanvasShapeElement, top: number, key: string): any {
  const bw = el.width;
  const bh = el.height;
  const sw = el.strokeWidth || 0;
  const inset = sw / 2; // keep the stroke inside the element box
  const fill = el.fill || 'none';
  const stroke = el.stroke || 'none';

  const style: any = { position: 'absolute', left: el.x, top, width: bw, height: bh };
  if (typeof el.opacity === 'number') style.opacity = el.opacity;

  if (el.shape === 'ellipse') {
    return h(
      Svg,
      { key, style, viewBox: `0 0 ${bw} ${bh}` },
      h(Ellipse, {
        cx: bw / 2,
        cy: bh / 2,
        rx: Math.max(0, bw / 2 - inset),
        ry: Math.max(0, bh / 2 - inset),
        fill,
        stroke,
        strokeWidth: sw,
      }),
    );
  }

  const r = Math.max(0, el.borderRadius || 0);
  return h(
    Svg,
    { key, style, viewBox: `0 0 ${bw} ${bh}` },
    h(Rect, {
      x: inset,
      y: inset,
      width: Math.max(0, bw - sw),
      height: Math.max(0, bh - sw),
      rx: r,
      ry: r,
      fill,
      stroke,
      strokeWidth: sw,
    }),
  );
}

function renderElement(
  el: CanvasElement,
  ctx: RenderCtx,
  bandOffset: number,
  key: string,
): any {
  const top = el.y + bandOffset;
  if (el.type === 'text') return renderText(el, ctx, top, key);
  if (el.type === 'image') return renderImage(el, ctx, top, key);
  if (el.type === 'shape') return renderShape(el, top, key);
  return null;
}

/**
 * Render a canvas template document to a react-pdf <Document>.
 * The page size/orientation come from the template row (authoritative), with
 * the embedded doc.page used as a fallback.
 */
export function renderCanvasToDocument(
  template: PdfTemplate,
  doc: CanvasTemplateDoc,
  product: Product,
  options: { previewMode?: boolean } = {},
) {
  const size = (template.pageSize || doc.page?.size || 'A4') as PageSize;
  const orientation = (template.orientation || doc.page?.orientation || 'portrait') as Orientation;
  const dims = getPageDimensions(size, orientation);

  const ctx: RenderCtx = { product, previewMode: !!options.previewMode };

  const headerEnabled = !!doc.header?.enabled;
  const footerEnabled = !!doc.footer?.enabled;
  const headerH = headerEnabled ? doc.header.height : 0;
  const footerH = footerEnabled ? doc.footer.height : 0;
  const footerTop = dims.height - footerH;

  const elements = Array.isArray(doc.elements) ? doc.elements : [];

  const nodes: any[] = [];

  // Body elements use page-absolute coordinates.
  elements
    .filter((e) => (e.region || 'body') === 'body')
    .forEach((e, i) => {
      const n = renderElement(e, ctx, 0, `body-${e.id || i}`);
      if (n) nodes.push(n);
    });

  // Header band (top of page).
  if (headerEnabled) {
    const headerNodes = elements
      .filter((e) => e.region === 'header')
      .map((e, i) => renderElement(e, ctx, 0, `header-${e.id || i}`))
      .filter(Boolean);
    nodes.push(
      h(
        View,
        {
          key: 'header-band',
          fixed: true,
          style: { position: 'absolute', top: 0, left: 0, width: dims.width, height: headerH },
        },
        ...headerNodes,
      ),
    );
  }

  // Footer band (bottom of page). Element y is relative to the band top.
  if (footerEnabled) {
    const footerNodes = elements
      .filter((e) => e.region === 'footer')
      .map((e, i) => renderElement(e, ctx, 0, `footer-${e.id || i}`))
      .filter(Boolean);
    nodes.push(
      h(
        View,
        {
          key: 'footer-band',
          fixed: true,
          style: { position: 'absolute', top: footerTop, left: 0, width: dims.width, height: footerH },
        },
        ...footerNodes,
      ),
    );
  }

  const pageStyle: any = {
    position: 'relative',
    width: dims.width,
    height: dims.height,
    fontFamily: 'Helvetica',
  };
  if (doc.background) pageStyle.backgroundColor = doc.background;

  return h(
    Document,
    null,
    h(Page, { size: [dims.width, dims.height] as any, style: pageStyle }, ...nodes),
  );
}
