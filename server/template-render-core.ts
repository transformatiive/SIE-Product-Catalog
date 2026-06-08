import { createElement as h } from 'react';
import { Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Product } from '@shared/schema';
import { resolveMergeField } from '@shared/mergeFields';
import path from 'path';
import fs from 'fs';

// Re-export so existing server importers keep working.
export { resolveMergeField };

// ---------------------------------------------------------------------------
// Image path resolution for embedded images in templates
// ---------------------------------------------------------------------------

export function resolveLocalImage(webPath: string | null | undefined): string | null {
  if (!webPath || typeof webPath !== 'string' || webPath.trim() === '') return null;
  try {
    const cleanPath = webPath.startsWith('/') ? webPath.slice(1) : webPath;
    if (!cleanPath.startsWith('uploads/') && !cleanPath.startsWith('attached_assets/')) {
      return null;
    }
    const baseDir = cleanPath.startsWith('uploads/')
      ? path.join(process.cwd(), 'public')
      : process.cwd();
    const fullPath = path.join(baseDir, cleanPath);
    const allowedRoot = cleanPath.startsWith('uploads/')
      ? path.join(process.cwd(), 'public', 'uploads')
      : path.join(process.cwd(), 'attached_assets');
    if (!fullPath.startsWith(allowedRoot)) return null;
    return fs.existsSync(fullPath) ? fullPath : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// ProseMirror/TipTap JSON → react-pdf converter (shared by legacy + canvas)
// ---------------------------------------------------------------------------

export interface PMNode {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
  content?: PMNode[];
}

export interface RenderCtx {
  product: Product;
  previewMode: boolean;
}

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#222222',
    lineHeight: 1.4,
  },
  paragraph: { marginBottom: 6 },
  heading1: { fontSize: 22, fontWeight: 'bold', marginTop: 8, marginBottom: 8, color: '#111111' },
  heading2: { fontSize: 18, fontWeight: 'bold', marginTop: 8, marginBottom: 6, color: '#111111' },
  heading3: { fontSize: 14, fontWeight: 'bold', marginTop: 6, marginBottom: 4, color: '#111111' },
  listItemRow: { flexDirection: 'row', marginBottom: 3 },
  listMarker: { width: 16, fontSize: 11 },
  listContent: { flex: 1 },
  table: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#cccccc',
    marginVertical: 8,
  },
  tableRow: { flexDirection: 'row' },
  tableCell: {
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#cccccc',
    padding: 6,
    flex: 1,
  },
  tableHeaderCell: {
    backgroundColor: '#f3f3f3',
    fontWeight: 'bold',
  },
  hr: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginVertical: 8,
  },
  mergeChip: {
    color: '#0a4ea0',
  },
  image: {
    objectFit: 'contain',
    marginVertical: 6,
  },
});

function applyMarks(text: string, marks: PMNode['marks']): { content: any; style: any } {
  let style: any = {};
  if (marks) {
    for (const m of marks) {
      switch (m.type) {
        case 'bold':
        case 'strong':
          style.fontWeight = 'bold';
          break;
        case 'italic':
        case 'em':
          style.fontStyle = 'italic';
          break;
        case 'underline':
          style.textDecoration = 'underline';
          break;
        case 'strike':
          style.textDecoration = 'line-through';
          break;
        case 'code':
          style.fontFamily = 'Courier';
          style.backgroundColor = '#f0f0f0';
          break;
        case 'link':
          style.color = '#0a4ea0';
          style.textDecoration = 'underline';
          break;
        case 'textStyle':
          if (m.attrs?.color) style.color = m.attrs.color;
          if (m.attrs?.fontFamily) style.fontFamily = mapFontFamily(m.attrs.fontFamily);
          break;
        case 'highlight':
          if (m.attrs?.color) style.backgroundColor = m.attrs.color;
          break;
      }
    }
  }
  return { content: text, style };
}

// react-pdf only ships Helvetica/Times/Courier. Map CSS font stacks to one.
function mapFontFamily(css: string | undefined): string | undefined {
  if (!css) return undefined;
  const v = css.toLowerCase();
  if (v.includes('courier') || v.includes('mono')) return 'Courier';
  if (v.includes('times') || v.includes('georgia') || v.includes('serif')) return 'Times-Roman';
  return 'Helvetica';
}

function renderInline(node: PMNode, ctx: RenderCtx, key: string | number): any {
  if (node.type === 'text') {
    const { content, style } = applyMarks(node.text || '', node.marks);
    return h(Text, { key, style }, content);
  }
  if (node.type === 'hardBreak') {
    return h(Text, { key }, '\n');
  }
  if (node.type === 'mergeField') {
    const k = node.attrs?.key as string;
    const value = k ? resolveMergeField(k, ctx.product) : '';
    return h(Text, { key, style: ctx.previewMode ? styles.mergeChip : undefined }, value);
  }
  return null;
}

function renderInlineChildren(nodes: PMNode[] | undefined, ctx: RenderCtx): any[] {
  if (!nodes) return [];
  return nodes.map((n, i) => renderInline(n, ctx, i)).filter(Boolean);
}

function paragraphAlign(node: PMNode): any {
  const a = node.attrs?.textAlign;
  if (a && ['left', 'right', 'center', 'justify'].includes(a)) {
    return { textAlign: a };
  }
  return {};
}

export function renderBlock(node: PMNode, ctx: RenderCtx, key: string | number): any {
  switch (node.type) {
    case 'paragraph':
      return h(
        Text,
        { key, style: { ...styles.paragraph, ...paragraphAlign(node) } },
        ...renderInlineChildren(node.content, ctx),
      );
    case 'heading': {
      const lvl = Math.max(1, Math.min(3, node.attrs?.level || 1));
      const s = lvl === 1 ? styles.heading1 : lvl === 2 ? styles.heading2 : styles.heading3;
      return h(
        Text,
        { key, style: { ...s, ...paragraphAlign(node) } },
        ...renderInlineChildren(node.content, ctx),
      );
    }
    case 'bulletList':
    case 'orderedList': {
      const ordered = node.type === 'orderedList';
      const items = node.content || [];
      return h(
        View,
        { key },
        ...items.map((item, idx) =>
          h(
            View,
            { key: idx, style: styles.listItemRow },
            h(Text, { style: styles.listMarker }, ordered ? `${idx + 1}.` : '•'),
            h(
              View,
              { style: styles.listContent },
              ...(item.content || []).map((c, ci) => renderBlock(c, ctx, ci)),
            ),
          ),
        ),
      );
    }
    case 'horizontalRule':
      return h(View, { key, style: styles.hr });
    case 'image': {
      const src = node.attrs?.src as string | undefined;
      const local = resolveLocalImage(src);
      const finalSrc = local || src;
      if (!finalSrc) return null;
      const width = node.attrs?.width;
      const imgStyle: any = { ...styles.image };
      if (typeof width === 'number') imgStyle.width = width;
      else imgStyle.maxWidth = '100%';
      try {
        return h(Image, { key, src: finalSrc, style: imgStyle });
      } catch {
        return null;
      }
    }
    case 'table': {
      const rows = node.content || [];
      return h(
        View,
        { key, style: styles.table },
        ...rows.map((row, ri) =>
          h(
            View,
            { key: ri, style: styles.tableRow },
            ...(row.content || []).map((cell, ci) => {
              const isHeader = cell.type === 'tableHeader';
              const cellStyle = isHeader
                ? { ...styles.tableCell, ...styles.tableHeaderCell }
                : styles.tableCell;
              return h(
                View,
                { key: ci, style: cellStyle },
                ...(cell.content || []).map((c, k) => renderBlock(c, ctx, k)),
              );
            }),
          ),
        ),
      );
    }
    default:
      if (node.content) {
        return h(View, { key }, ...node.content.map((c, i) => renderBlock(c, ctx, i)));
      }
      return null;
  }
}

/** Render a full TipTap doc's top-level blocks. */
export function renderDocBlocks(doc: PMNode | null, ctx: RenderCtx): any[] {
  if (!doc?.content) return [];
  return doc.content.map((n, i) => renderBlock(n, ctx, i)).filter(Boolean);
}
