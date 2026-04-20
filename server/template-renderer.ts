import { createElement as h, Fragment } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { Product, PdfTemplate } from '@shared/schema';
import path from 'path';
import fs from 'fs';
import { TechnicalDatasheetPDF } from './pdf-template';

// ---------------------------------------------------------------------------
// Merge field extraction
// ---------------------------------------------------------------------------

function fmtBool(v: any): string {
  return v ? 'Sim' : 'Não';
}

function withUnit(v: any, unit: any, fallbackUnit = ''): string {
  if (v === null || v === undefined || v === '') return '';
  return `${v} ${unit || fallbackUnit}`.trim();
}

function buildMarcacoes(p: Product): string {
  const parts: string[] = [];
  if (p.datador) parts.push('Datador');
  if (p.simboloSie) parts.push('Símbolo SIE');
  if (p.simboloMp) parts.push('Símbolo MP');
  if (p.gravacaoCliente) {
    let label = 'Gravação Cliente';
    if (p.gravacaoClienteDetails) label += ` (${p.gravacaoClienteDetails})`;
    parts.push(label);
  }
  return parts.join(', ');
}

function buildOutras(p: Product): string {
  const parts: string[] = [];
  if (p.visor) parts.push('Visor');
  if (p.bica) parts.push('Bica');
  if (p.coexPoliamida) parts.push('COEX - Poliamida');
  if (p.adaptacao) parts.push('Adaptação');
  if (p.autoculanteCliente) parts.push(`Autocolante: ${p.autoculanteCliente}`);
  if (p.especificacoesEmbFlexiveis) parts.push(`Emb. Flexíveis: ${p.especificacoesEmbFlexiveis}`);
  return parts.join(', ');
}

function buildVedante(p: Product): string {
  const parts: string[] = [];
  if (p.vedantePead) parts.push('PEAD');
  if (p.vedanteEpdm) parts.push('EPDM');
  if (p.vedanteOutros) parts.push(p.vedanteOutros);
  return parts.join(', ');
}

function buildManuseamento(p: Product): string {
  const parts: string[] = [];
  if (p.pegasLaterais) parts.push('Pegas Laterais');
  if (p.pegaSuperior) parts.push('Pega Superior');
  if (p.cavidades) parts.push('Cavidades');
  if (p.manuseamentoOutros) parts.push(p.manuseamentoOutros);
  return parts.join(', ');
}

function fmtDate(d: any): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('pt-PT');
  } catch {
    return String(d);
  }
}

function totalUnitsDisplay(p: Product): string {
  if (p.totalUnitsQuantity && p.totalUnitsType) {
    return `${p.totalUnitsQuantity} / ${p.totalUnitsType}`;
  }
  return p.totalUnits || '-';
}

export function resolveMergeField(key: string, product: Product): string {
  switch (key) {
    case '_capacityWithUnit':
      return withUnit(product.nominalCapacity, product.nominalCapacityUnit, 'L');
    case '_totalCapacityWithUnit':
      return withUnit(product.totalCapacity, product.totalCapacityUnit, 'L');
    case '_weightWithUnit':
      return withUnit(product.weight, product.weightUnit, 'g');
    case '_weightAccWithUnit':
      return withUnit(product.weightWithAccessories, product.weightWithAccessoriesUnit, 'g');
    case '_marcacoesList':
      return buildMarcacoes(product);
    case '_outrasList':
      return buildOutras(product);
    case '_vedanteList':
      return buildVedante(product);
    case '_manuseamentoList':
      return buildManuseamento(product);
    case '_stackingDisplay':
      return product.stackable ? product.stackingCapacity || 'Sim' : 'Não';
    case '_foodContactDisplay':
      return product.foodContact ? 'Apto' : 'Não Apto';
    case '_totalUnitsDisplay':
      return totalUnitsDisplay(product);
    case '_adrDisplay':
      if (!product.adrCertified) return 'Não';
      return product.adrCode ? `Certificado - ${product.adrCode}` : 'Certificado';
    case 'today':
      return new Date().toLocaleDateString('pt-PT');
    case 'createdAt':
    case 'updatedAt':
    case 'approvalDate':
      return fmtDate((product as any)[key]);
    default: {
      const v = (product as any)[key];
      if (v === null || v === undefined) return '';
      if (typeof v === 'boolean') return fmtBool(v);
      return String(v);
    }
  }
}

// ---------------------------------------------------------------------------
// Image path resolution for embedded images in templates
// ---------------------------------------------------------------------------

function resolveLocalImage(webPath: string | null | undefined): string | null {
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
// ProseMirror JSON → react-pdf converter
// ---------------------------------------------------------------------------

interface PMNode {
  type: string;
  text?: string;
  attrs?: Record<string, any>;
  marks?: Array<{ type: string; attrs?: Record<string, any> }>;
  content?: PMNode[];
}

const styles = StyleSheet.create({
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

function pageSizeFor(t: PdfTemplate): [number, number] | string {
  // react-pdf accepts strings A4, A3, LETTER, LEGAL
  const map: Record<string, string> = {
    A4: 'A4',
    A3: 'A3',
    Letter: 'LETTER',
    Legal: 'LEGAL',
  };
  return map[t.pageSize] || 'A4';
}

function applyMarks(text: string, marks: PMNode['marks']): { content: any; style: any } {
  let style: any = {};
  let href: string | null = null;
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
          href = m.attrs?.href || null;
          style.color = '#0a4ea0';
          style.textDecoration = 'underline';
          break;
        case 'textStyle':
          if (m.attrs?.color) style.color = m.attrs.color;
          break;
      }
    }
  }
  return { content: text, style };
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

interface RenderCtx {
  product: Product;
  previewMode: boolean;
}

function paragraphAlign(node: PMNode): any {
  const a = node.attrs?.textAlign;
  if (a && ['left', 'right', 'center', 'justify'].includes(a)) {
    return { textAlign: a };
  }
  return {};
}

function renderBlock(node: PMNode, ctx: RenderCtx, key: string | number): any {
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
      // Unknown block – try to render its children inline
      if (node.content) {
        return h(View, { key }, ...node.content.map((c, i) => renderBlock(c, ctx, i)));
      }
      return null;
  }
}

export function renderTemplateToDocument(
  template: PdfTemplate,
  product: Product,
  options: { previewMode?: boolean } = {},
) {
  if (template.builtInRenderer === 'sie-default') {
    return h(TechnicalDatasheetPDF, { product });
  }

  let doc: PMNode | null = null;
  if (template.content) {
    try {
      doc = JSON.parse(template.content);
    } catch (e) {
      console.warn('Invalid template content JSON', e);
    }
  }

  const ctx: RenderCtx = { product, previewMode: !!options.previewMode };
  const blocks = doc?.content
    ? doc.content.map((n, i) => renderBlock(n, ctx, i)).filter(Boolean)
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
