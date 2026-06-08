import React from "react";
import type { Product } from "@shared/schema";
import { resolveMergeField, getMergeFieldLabel } from "@shared/mergeFields";

// ---------------------------------------------------------------------------
// Renders a TipTap/ProseMirror JSON document to React for on-canvas display.
// When `fill` (a product) is provided, inline mergeField nodes are replaced by
// their resolved value so the canvas shows a live, filled preview; otherwise
// they render as labelled chips. This mirrors the server PDF renderer.
// ---------------------------------------------------------------------------

interface RenderOpts {
  fill?: Product | null;
}

function markStyle(marks: any[] | undefined): React.CSSProperties {
  const style: React.CSSProperties = {};
  if (!marks) return style;
  for (const m of marks) {
    switch (m.type) {
      case "bold":
      case "strong":
        style.fontWeight = 700;
        break;
      case "italic":
      case "em":
        style.fontStyle = "italic";
        break;
      case "underline":
        style.textDecoration = appendDecoration(style.textDecoration as string | undefined, "underline");
        break;
      case "strike":
        style.textDecoration = appendDecoration(style.textDecoration as string | undefined, "line-through");
        break;
      case "textStyle":
        if (m.attrs?.color) style.color = m.attrs.color;
        if (m.attrs?.fontFamily) style.fontFamily = m.attrs.fontFamily;
        break;
      case "highlight":
        style.backgroundColor = m.attrs?.color || "#fef9c3";
        break;
      case "code":
        style.fontFamily = "monospace";
        style.background = "#f0f0f0";
        break;
    }
  }
  return style;
}

function appendDecoration(current: string | undefined, value: string): string {
  return current ? `${current} ${value}` : value;
}

function renderInline(node: any, key: React.Key, opts: RenderOpts): React.ReactNode {
  if (node.type === "text") {
    return (
      <span key={key} style={markStyle(node.marks)}>
        {node.text}
      </span>
    );
  }
  if (node.type === "hardBreak") {
    return <br key={key} />;
  }
  if (node.type === "mergeField") {
    const fieldKey = node.attrs?.key as string;
    if (opts.fill) {
      return <span key={key}>{resolveMergeField(fieldKey, opts.fill)}</span>;
    }
    const label = node.attrs?.label || getMergeFieldLabel(fieldKey);
    return (
      <span
        key={key}
        style={{
          background: "#dbeafe",
          color: "#1e40af",
          border: "1px solid #bfdbfe",
          borderRadius: 3,
          padding: "0 3px",
          fontSize: "0.92em",
          whiteSpace: "nowrap",
        }}
      >{`{{${label}}}`}</span>
    );
  }
  return null;
}

function renderInlineChildren(nodes: any[] | undefined, opts: RenderOpts): React.ReactNode[] {
  if (!nodes) return [];
  return nodes.map((n, i) => renderInline(n, i, opts));
}

function alignStyle(node: any): React.CSSProperties {
  const a = node.attrs?.textAlign;
  return a ? { textAlign: a } : {};
}

function renderBlock(node: any, key: React.Key, opts: RenderOpts): React.ReactNode {
  switch (node.type) {
    case "paragraph":
      return (
        <p key={key} style={{ margin: 0, ...alignStyle(node) }}>
          {node.content?.length ? renderInlineChildren(node.content, opts) : <br />}
        </p>
      );
    case "heading": {
      const level = Math.max(1, Math.min(3, node.attrs?.level || 1));
      const size = level === 1 ? "1.6em" : level === 2 ? "1.3em" : "1.1em";
      return (
        <p key={key} style={{ margin: 0, fontWeight: 700, fontSize: size, ...alignStyle(node) }}>
          {renderInlineChildren(node.content, opts)}
        </p>
      );
    }
    case "bulletList":
    case "orderedList": {
      const ordered = node.type === "orderedList";
      const items = node.content || [];
      return ordered ? (
        <ol key={key} style={{ margin: 0, paddingLeft: "1.2em" }}>
          {items.map((it: any, i: number) => (
            <li key={i}>{(it.content || []).map((c: any, ci: number) => renderBlock(c, ci, opts))}</li>
          ))}
        </ol>
      ) : (
        <ul key={key} style={{ margin: 0, paddingLeft: "1.2em" }}>
          {items.map((it: any, i: number) => (
            <li key={i}>{(it.content || []).map((c: any, ci: number) => renderBlock(c, ci, opts))}</li>
          ))}
        </ul>
      );
    }
    case "horizontalRule":
      return <hr key={key} style={{ border: "none", borderTop: "1px solid #ddd", margin: "4px 0" }} />;
    default:
      if (node.content) {
        return <div key={key}>{node.content.map((c: any, i: number) => renderBlock(c, i, opts))}</div>;
      }
      return null;
  }
}

export function RichTextDisplay({ doc, fill }: { doc: any; fill?: Product | null }) {
  if (!doc?.content) return null;
  return <>{doc.content.map((n: any, i: number) => renderBlock(n, i, { fill }))}</>;
}

/** Flatten a doc to plain text (used for empty-state detection / summaries). */
export function richTextToPlainText(doc: any): string {
  if (!doc?.content) return "";
  const out: string[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "text") out.push(node.text || "");
    if (node.type === "mergeField") out.push(`{{${node.attrs?.label || node.attrs?.key || ""}}}`);
    if (node.content) node.content.forEach(walk);
  };
  walk(doc);
  return out.join("").trim();
}
