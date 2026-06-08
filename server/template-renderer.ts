import { createElement as h, Fragment } from 'react';
import { Document, Page, Text } from '@react-pdf/renderer';
import type { Product, PdfTemplate } from '@shared/schema';
import { isCanvasTemplate } from '@shared/canvasTemplate';
import { TechnicalDatasheetPDF } from './pdf-template';
import {
  renderDocBlocks,
  resolveMergeField,
  styles,
  type PMNode,
  type RenderCtx,
} from './template-render-core';
import { renderCanvasToDocument } from './canvas-renderer';

// Re-exported for backwards compatibility with existing importers.
export { resolveMergeField };

function pageSizeFor(t: PdfTemplate): string {
  const map: Record<string, string> = {
    A4: 'A4',
    A3: 'A3',
    Letter: 'LETTER',
    Legal: 'LEGAL',
  };
  return map[t.pageSize] || 'A4';
}

/**
 * Render any template to a react-pdf <Document>.
 *  - `builtInRenderer === 'sie-default'` → the hand-built SIE datasheet.
 *  - canvas templates (`kind: "canvas"`) → the free-canvas renderer.
 *  - everything else → the legacy flowing rich-text renderer.
 */
export function renderTemplateToDocument(
  template: PdfTemplate,
  product: Product,
  options: { previewMode?: boolean } = {},
) {
  if (template.builtInRenderer === 'sie-default') {
    return h(TechnicalDatasheetPDF, { product });
  }

  let parsed: any = null;
  if (template.content) {
    try {
      parsed = JSON.parse(template.content);
    } catch (e) {
      console.warn('Invalid template content JSON', e);
    }
  }

  // New canvas templates.
  if (isCanvasTemplate(parsed)) {
    return renderCanvasToDocument(template, parsed, product, options);
  }

  // Legacy flowing rich-text templates.
  const ctx: RenderCtx = { product, previewMode: !!options.previewMode };
  const doc = parsed as PMNode | null;
  const blocks = doc?.content
    ? renderDocBlocks(doc, ctx)
    : [h(Text, { key: 'empty' }, 'Template vazio.')];

  const orientation = template.orientation === 'landscape' ? 'landscape' : 'portrait';

  return h(
    Document,
    null,
    h(
      Page,
      { size: pageSizeFor(template) as any, orientation, style: styles.page },
      h(Fragment, null, ...blocks),
    ),
  );
}
