import { useEffect, useMemo, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Type,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Trash2,
  Copy,
  BringToFront,
  SendToBack,
  ZoomIn,
  ZoomOut,
  Search,
  Plus,
  FileDown,
  Eye,
  Loader2,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import type { MergeFieldDef } from "@shared/mergeFields";
import { IMAGE_MERGE_FIELD_KEYS } from "@shared/mergeFields";
import {
  getPageDimensions,
  emptyRichText,
  type CanvasTemplateDoc,
  type CanvasElement,
  type CanvasTextElement,
  type CanvasImageElement,
  type CanvasRegion,
  type PageSize,
  type Orientation,
} from "@shared/canvasTemplate";
import { RichTextDisplay } from "@/lib/canvasRichText";

const PAGE_SIZES: PageSize[] = ["A4", "A3", "Letter", "Legal"];
const ZOOM_STEPS = [0.5, 0.65, 0.8, 1, 1.25, 1.5];

const FONT_FAMILIES = [
  { label: "Sans-serif (padrão)", value: "sans-serif" },
  { label: "Serif (Times)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Monoespaçada", value: "'Courier New', Courier, monospace" },
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const round = (v: number) => Math.round(v * 10) / 10;

// ---------------------------------------------------------------------------
// MergeField TipTap node (shared shape with the legacy editor / server)
// ---------------------------------------------------------------------------
const MergeFieldNode = Node.create({
  name: "mergeField",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,
  addAttributes() {
    return { key: { default: "" }, label: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "span[data-merge-field]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-merge-field": HTMLAttributes.key }),
      `{{${HTMLAttributes.label || HTMLAttributes.key}}}`,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MergeFieldChip);
  },
});

function MergeFieldChip({ node }: any) {
  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        contentEditable={false}
        className="inline-block px-1 py-0 mx-0.5 rounded-sm bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200 align-baseline"
      >
        {`{{${node.attrs.label || node.attrs.key}}}`}
      </span>
    </NodeViewWrapper>
  );
}

// ---------------------------------------------------------------------------
// Side-panel rich text editor for the selected text element
// ---------------------------------------------------------------------------
function RichTextField({
  value,
  onChange,
  mergeFields,
}: {
  value: any;
  onChange: (json: any) => void;
  mergeFields: MergeFieldDef[];
}) {
  const [search, setSearch] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
      FontFamily.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      MergeFieldNode,
    ],
    content: value || emptyRichText(),
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[120px] p-2 bg-white text-black border rounded-md",
      },
    },
  });

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out: Record<string, MergeFieldDef[]> = {};
    for (const f of mergeFields) {
      if (q && !f.label.toLowerCase().includes(q) && !f.key.toLowerCase().includes(q)) continue;
      (out[f.section] ||= []).push(f);
    }
    return out;
  }, [mergeFields, search]);

  if (!editor) return null;

  const tool = (active: boolean, onClick: () => void, title: string, icon: React.ReactNode) => (
    <Button
      type="button"
      size="icon"
      variant={active ? "default" : "ghost"}
      className="h-7 w-7"
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {icon}
    </Button>
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-0.5 p-1 border rounded-md bg-muted/30">
        {tool(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), "Negrito", <Bold className="w-3.5 h-3.5" />)}
        {tool(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), "Itálico", <Italic className="w-3.5 h-3.5" />)}
        {tool(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), "Sublinhado", <UnderlineIcon className="w-3.5 h-3.5" />)}
        {tool(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), "Rasurado", <Strikethrough className="w-3.5 h-3.5" />)}
        <Separator orientation="vertical" className="h-6 mx-0.5" />
        {tool(editor.isActive("heading", { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), "Título 1", <Heading1 className="w-3.5 h-3.5" />)}
        {tool(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), "Título 2", <Heading2 className="w-3.5 h-3.5" />)}
        {tool(editor.isActive("heading", { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), "Título 3", <Heading3 className="w-3.5 h-3.5" />)}
        <Separator orientation="vertical" className="h-6 mx-0.5" />
        {tool(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), "Lista", <List className="w-3.5 h-3.5" />)}
        {tool(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), "Lista numerada", <ListOrdered className="w-3.5 h-3.5" />)}
        <Separator orientation="vertical" className="h-6 mx-0.5" />
        {tool(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), "Esquerda", <AlignLeft className="w-3.5 h-3.5" />)}
        {tool(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), "Centrar", <AlignCenter className="w-3.5 h-3.5" />)}
        {tool(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), "Direita", <AlignRight className="w-3.5 h-3.5" />)}
        <Separator orientation="vertical" className="h-6 mx-0.5" />
        <label className="inline-flex items-center" title="Cor do texto">
          <input
            type="color"
            className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
            value={editor.getAttributes("textStyle").color || "#000000"}
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>
      </div>

      <EditorContent editor={editor} />

      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" className="w-full gap-2">
            <Plus className="w-3.5 h-3.5" /> Inserir campo dinâmico
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Procurar campo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>
          <ScrollArea className="h-64">
            <div className="p-2 space-y-2">
              {Object.entries(grouped).map(([section, fields]) => (
                <div key={section}>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    {section}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {fields.map((f) => (
                      <Badge
                        key={f.key}
                        variant="secondary"
                        className="cursor-pointer hover-elevate active-elevate-2"
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .insertContent({ type: "mergeField", attrs: { key: f.key, label: f.label } })
                            .run()
                        }
                      >
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main canvas editor
// ---------------------------------------------------------------------------
interface DragState {
  id: string;
  mode: "move" | "resize";
  startClientX: number;
  startClientY: number;
  startX: number;
  startTopAbs: number;
  startW: number;
  startH: number;
  moved: boolean;
}

interface Props {
  doc: CanvasTemplateDoc;
  onChange: (doc: CanvasTemplateDoc) => void;
  mergeFields: MergeFieldDef[];
  products: Product[];
  templateName?: string;
}

export function CanvasTemplateEditor({ doc, onChange, mergeFields, products, templateName }: Props) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);
  const [fillProductId, setFillProductId] = useState<string>("");
  const [exporting, setExporting] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const size = doc.page.size;
  const orientation = doc.page.orientation;
  const dims = getPageDimensions(size, orientation);
  const headerH = doc.header.enabled ? doc.header.height : 0;
  const footerH = doc.footer.enabled ? doc.footer.height : 0;

  const fillProduct = useMemo(
    () => products.find((p) => p.id === fillProductId) || null,
    [products, fillProductId],
  );

  // Keep a ref of mutable state for the global drag listeners.
  const stateRef = useRef({ doc, zoom, dims, headerH, footerH, onChange });
  stateRef.current = { doc, zoom, dims, headerH, footerH, onChange };

  const selected = doc.elements.find((e) => e.id === selectedId) || null;

  const pageAbsTop = (el: CanvasElement, st = stateRef.current) =>
    el.region === "footer" ? st.dims.height - st.footerH + el.y : el.y;

  function assignRegion(topAbs: number, st = stateRef.current): { region: CanvasRegion; y: number } {
    const hOn = st.doc.header.enabled;
    const fOn = st.doc.footer.enabled;
    if (hOn && topAbs < st.headerH) return { region: "header", y: topAbs };
    if (fOn && topAbs >= st.dims.height - st.footerH)
      return { region: "footer", y: topAbs - (st.dims.height - st.footerH) };
    return { region: "body", y: topAbs };
  }

  function patchEl(id: string, patch: Partial<CanvasElement>) {
    const d = stateRef.current.doc;
    stateRef.current.onChange({
      ...d,
      elements: d.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as CanvasElement) : e)),
    });
  }

  // Global pointer listeners for dragging / resizing.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const dr = dragRef.current;
      if (!dr) return;
      const st = stateRef.current;
      const dxPt = (e.clientX - dr.startClientX) / st.zoom;
      const dyPt = (e.clientY - dr.startClientY) / st.zoom;
      if (Math.abs(e.clientX - dr.startClientX) > 2 || Math.abs(e.clientY - dr.startClientY) > 2) {
        dr.moved = true;
      }
      if (dr.mode === "move") {
        const topAbs = clamp(dr.startTopAbs + dyPt, 0, st.dims.height - dr.startH);
        const x = clamp(dr.startX + dxPt, 0, st.dims.width - dr.startW);
        const { region, y } = assignRegion(topAbs, st);
        patchEl(dr.id, { x, y, region } as Partial<CanvasElement>);
      } else {
        const width = clamp(dr.startW + dxPt, 20, st.dims.width - dr.startX);
        const height = clamp(dr.startH + dyPt, 12, st.dims.height - dr.startTopAbs);
        patchEl(dr.id, { width, height } as Partial<CanvasElement>);
      }
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startDrag(e: React.PointerEvent, el: CanvasElement, mode: "move" | "resize") {
    e.stopPropagation();
    setSelectedId(el.id);
    dragRef.current = {
      id: el.id,
      mode,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: el.x,
      startTopAbs: pageAbsTop(el),
      startW: el.width,
      startH: el.height,
      moved: false,
    };
  }

  // ---- element creation -------------------------------------------------
  function makeText(x: number, y: number): CanvasTextElement {
    return {
      id: nanoid(8),
      type: "text",
      region: "body",
      x,
      y,
      width: 240,
      height: 40,
      content: emptyRichText("Novo texto"),
      fontSize: 12,
      color: "#111111",
      align: "left",
      verticalAlign: "top",
      lineHeight: 1.3,
      padding: 2,
    };
  }

  function makeImage(x: number, y: number): CanvasImageElement {
    return {
      id: nanoid(8),
      type: "image",
      region: "body",
      x,
      y,
      width: 140,
      height: 140,
      fieldKey: "productImage",
      objectFit: "contain",
    };
  }

  function addElement(kind: "text" | "image", topAbs: number, left: number) {
    const w = kind === "text" ? 240 : 140;
    const h = kind === "text" ? 40 : 140;
    const x = clamp(left, 0, dims.width - w);
    const top = clamp(topAbs, 0, dims.height - h);
    const { region, y } = assignRegion(top);
    const base = kind === "text" ? makeText(x, y) : makeImage(x, y);
    const el = { ...base, region } as CanvasElement;
    onChange({ ...doc, elements: [...doc.elements, el] });
    setSelectedId(el.id);
  }

  function onCanvasDrop(e: React.DragEvent) {
    e.preventDefault();
    const kind = e.dataTransfer.getData("application/x-canvas-add") as "text" | "image";
    if (kind !== "text" && kind !== "image") return;
    const rect = pageRef.current!.getBoundingClientRect();
    const topAbs = (e.clientY - rect.top) / zoom;
    const left = (e.clientX - rect.left) / zoom;
    addElement(kind, topAbs - (kind === "text" ? 20 : 70), left - (kind === "text" ? 120 : 70));
  }

  function deleteEl(id: string) {
    onChange({ ...doc, elements: doc.elements.filter((e) => e.id !== id) });
    setSelectedId(null);
  }

  function duplicateEl(el: CanvasElement) {
    const copy = { ...el, id: nanoid(8), x: el.x + 12, y: el.y + 12 } as CanvasElement;
    onChange({ ...doc, elements: [...doc.elements, copy] });
    setSelectedId(copy.id);
  }

  function reorder(el: CanvasElement, dir: "front" | "back") {
    const rest = doc.elements.filter((e) => e.id !== el.id);
    onChange({ ...doc, elements: dir === "front" ? [...rest, el] : [el, ...rest] });
  }

  // ---- page / band config ----------------------------------------------
  function setPage(patch: Partial<{ size: PageSize; orientation: Orientation }>) {
    onChange({ ...doc, page: { ...doc.page, ...patch } });
  }

  function toggleBand(band: "header" | "footer", enabled: boolean) {
    if (!enabled) {
      // Re-home that band's elements into the body at their absolute position.
      const bandTop = band === "footer" ? dims.height - doc.footer.height : 0;
      const elements = doc.elements.map((e) =>
        e.region === band ? ({ ...e, region: "body", y: bandTop + e.y } as CanvasElement) : e,
      );
      onChange({ ...doc, elements, [band]: { ...doc[band], enabled } });
    } else {
      onChange({ ...doc, [band]: { ...doc[band], enabled } });
    }
  }

  function setBandHeight(band: "header" | "footer", height: number) {
    onChange({ ...doc, [band]: { ...doc[band], height: clamp(height, 20, dims.height / 2) } });
  }

  // ---- export -----------------------------------------------------------
  async function exportPdf(openInTab: boolean) {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/pdf-templates/preview-draft", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: {
            content: JSON.stringify(doc),
            pageSize: size,
            orientation,
          },
          productId: fillProductId || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Falha ao gerar PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (openInTab) {
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(templateName || "template").replace(/[^\w.-]+/g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  }

  // ---- rendering helpers ------------------------------------------------
  function imageSrcFor(el: CanvasImageElement): string | null {
    if (el.fieldKey) {
      if (!fillProduct) return null;
      const v = (fillProduct as any)[el.fieldKey];
      return typeof v === "string" && v.trim() ? v : null;
    }
    return el.staticSrc || null;
  }

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Top toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 border rounded-md bg-card">
        <div className="flex items-center gap-1">
          <Label className="text-xs text-muted-foreground">Página</Label>
          <Select value={size} onValueChange={(v) => setPage({ size: v as PageSize })}>
            <SelectTrigger className="h-8 w-[90px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={orientation} onValueChange={(v) => setPage({ orientation: v as Orientation })}>
            <SelectTrigger className="h-8 w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="portrait">Vertical</SelectItem>
              <SelectItem value="landscape">Horizontal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-7" />

        <div className="flex items-center gap-1.5">
          <Switch checked={doc.header.enabled} onCheckedChange={(v) => toggleBand("header", v)} />
          <Label className="text-xs">Cabeçalho</Label>
          {doc.header.enabled && (
            <Input
              type="number"
              className="h-8 w-16"
              value={Math.round(doc.header.height)}
              onChange={(e) => setBandHeight("header", Number(e.target.value))}
              title="Altura do cabeçalho (pt)"
            />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Switch checked={doc.footer.enabled} onCheckedChange={(v) => toggleBand("footer", v)} />
          <Label className="text-xs">Rodapé</Label>
          {doc.footer.enabled && (
            <Input
              type="number"
              className="h-8 w-16"
              value={Math.round(doc.footer.height)}
              onChange={(e) => setBandHeight("footer", Number(e.target.value))}
              title="Altura do rodapé (pt)"
            />
          )}
        </div>

        <Separator orientation="vertical" className="h-7" />

        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-8 w-8" title="Reduzir"
            onClick={() => setZoom((z) => clamp(round(z - 0.1), 0.3, 2))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="icon" variant="ghost" className="h-8 w-8" title="Ampliar"
            onClick={() => setZoom((z) => clamp(round(z + 0.1), 0.3, 2))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <Select value={fillProductId || "__none__"} onValueChange={(v) => setFillProductId(v === "__none__" ? "" : v)}>
            <SelectTrigger className="h-8 w-[200px]">
              <SelectValue placeholder="Pré-visualizar com dados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sem dados (mostrar campos)</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.productCode || p.id} — {p.product || ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={exporting} onClick={() => exportPdf(true)}>
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
          Pré-visualizar PDF
        </Button>
        <Button size="sm" className="gap-1.5" disabled={exporting} onClick={() => exportPdf(false)}>
          <FileDown className="w-3.5 h-3.5" /> Exportar PDF
        </Button>
      </div>

      {/* Body: palette | canvas | properties */}
      <div className="grid grid-cols-[150px_1fr_300px] gap-2 flex-1 min-h-0">
        {/* Palette */}
        <div className="border rounded-md bg-card p-2 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Componentes</p>
          <p className="text-[11px] text-muted-foreground">Arraste para a página ou clique para adicionar.</p>
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("application/x-canvas-add", "text")}
            onClick={() => addElement("text", 60, 60)}
            className="flex items-center gap-2 p-2 border rounded-md cursor-grab hover-elevate active-elevate-2 bg-background"
          >
            <Type className="w-4 h-4" />
            <span className="text-sm">Texto</span>
          </div>
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("application/x-canvas-add", "image")}
            onClick={() => addElement("image", 60, 60)}
            className="flex items-center gap-2 p-2 border rounded-md cursor-grab hover-elevate active-elevate-2 bg-background"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">Imagem</span>
          </div>
          <Separator />
          <p className="text-[11px] text-muted-foreground">
            As imagens são marcadores de campos dinâmicos que contêm o URL da imagem.
          </p>
        </div>

        {/* Canvas */}
        <div className="border rounded-md bg-muted/30 overflow-auto p-6 flex justify-center">
          <div
            ref={pageRef}
            onPointerDown={() => setSelectedId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onCanvasDrop}
            className="relative shadow-lg shrink-0"
            style={{
              width: dims.width * zoom,
              height: dims.height * zoom,
              background: doc.background || "#ffffff",
            }}
          >
            {/* Header zone guide */}
            {doc.header.enabled && (
              <div
                className="absolute left-0 top-0 w-full border-b border-dashed border-blue-300 bg-blue-50/40 pointer-events-none"
                style={{ height: headerH * zoom }}
              >
                <span className="absolute top-0.5 left-1 text-[9px] text-blue-400 uppercase tracking-wide">Cabeçalho</span>
              </div>
            )}
            {/* Footer zone guide */}
            {doc.footer.enabled && (
              <div
                className="absolute left-0 w-full border-t border-dashed border-blue-300 bg-blue-50/40 pointer-events-none"
                style={{ top: (dims.height - footerH) * zoom, height: footerH * zoom }}
              >
                <span className="absolute top-0.5 left-1 text-[9px] text-blue-400 uppercase tracking-wide">Rodapé</span>
              </div>
            )}

            {/* Elements */}
            {doc.elements.map((el) => {
              const top = pageAbsTop(el) * zoom;
              const isSel = el.id === selectedId;
              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => startDrag(e, el, "move")}
                  className="absolute group"
                  style={{
                    left: el.x * zoom,
                    top,
                    width: el.width * zoom,
                    height: el.height * zoom,
                    outline: isSel ? "2px solid hsl(var(--primary))" : "1px dashed rgba(120,120,120,0.5)",
                    outlineOffset: 0,
                    cursor: "move",
                    opacity: el.opacity ?? 1,
                    overflow: "hidden",
                  }}
                >
                  {el.type === "text" ? (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent:
                          el.verticalAlign === "middle"
                            ? "center"
                            : el.verticalAlign === "bottom"
                            ? "flex-end"
                            : "flex-start",
                        fontSize: (el.fontSize || 11) * zoom,
                        lineHeight: el.lineHeight || 1.3,
                        color: el.color || "#111111",
                        fontFamily: el.fontFamily || undefined,
                        textAlign: (el.align as any) || "left",
                        padding: (el.padding || 0) * zoom,
                        background: el.backgroundColor || "transparent",
                        border: el.borderWidth
                          ? `${el.borderWidth * zoom}px solid ${el.borderColor || "#000"}`
                          : undefined,
                        boxSizing: "border-box",
                        overflow: "hidden",
                      }}
                    >
                      <RichTextDisplay doc={el.content} fill={fillProduct} />
                    </div>
                  ) : (
                    <ImageElementView el={el as CanvasImageElement} src={imageSrcFor(el as CanvasImageElement)} />
                  )}

                  {isSel && (
                    <div
                      onPointerDown={(e) => startDrag(e, el, "resize")}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-primary cursor-nwse-resize"
                      style={{ transform: "translate(1px,1px)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Properties */}
        <div className="border rounded-md bg-card min-h-0 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-3">
              {!selected ? (
                <p className="text-sm text-muted-foreground">
                  Selecione um componente para editar as suas propriedades, ou adicione um a partir da paleta.
                </p>
              ) : (
                <PropertiesPanel
                  el={selected}
                  dims={dims}
                  headerEnabled={doc.header.enabled}
                  footerEnabled={doc.footer.enabled}
                  mergeFields={mergeFields}
                  onPatch={(patch) => patchEl(selected.id, patch)}
                  onDelete={() => deleteEl(selected.id)}
                  onDuplicate={() => duplicateEl(selected)}
                  onReorder={(dir) => reorder(selected, dir)}
                  onChangeRegion={(region) => {
                    const topAbs = pageAbsTop(selected);
                    const bandTop = region === "footer" ? dims.height - footerH : 0;
                    patchEl(selected.id, { region, y: clamp(topAbs - bandTop, 0, dims.height) });
                  }}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

function ImageElementView({ el, src }: { el: CanvasImageElement; src: string | null }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: el.objectFit || "contain", pointerEvents: "none" }}
      />
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/40 text-muted-foreground gap-1 pointer-events-none">
      <ImageIcon className="w-5 h-5 opacity-60" />
      <span className="text-[9px] text-center px-1 leading-tight">
        {el.fieldKey ? `{{${el.fieldKey}}}` : "Imagem fixa"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Properties panel
// ---------------------------------------------------------------------------
function PropertiesPanel({
  el,
  dims,
  headerEnabled,
  footerEnabled,
  mergeFields,
  onPatch,
  onDelete,
  onDuplicate,
  onReorder,
  onChangeRegion,
}: {
  el: CanvasElement;
  dims: { width: number; height: number };
  headerEnabled: boolean;
  footerEnabled: boolean;
  mergeFields: MergeFieldDef[];
  onPatch: (patch: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (dir: "front" | "back") => void;
  onChangeRegion: (region: CanvasRegion) => void;
}) {
  const num = (label: string, value: number, onValue: (n: number) => void, title?: string) => (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        className="h-8"
        value={Math.round(value)}
        title={title}
        onChange={(e) => onValue(Number(e.target.value))}
      />
    </div>
  );

  const imageFields = mergeFields.filter((f) => (IMAGE_MERGE_FIELD_KEYS as readonly string[]).includes(f.key));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold flex items-center gap-1.5">
          {el.type === "text" ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          {el.type === "text" ? "Texto" : "Imagem"}
        </p>
        <div className="flex gap-0.5">
          <Button size="icon" variant="ghost" className="h-7 w-7" title="Trazer para a frente" onClick={() => onReorder("front")}>
            <BringToFront className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" title="Enviar para trás" onClick={() => onReorder("back")}>
            <SendToBack className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" title="Duplicar" onClick={onDuplicate}>
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Eliminar" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Zona</Label>
        <Select value={el.region} onValueChange={(v) => onChangeRegion(v as CanvasRegion)}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="body">Corpo</SelectItem>
            <SelectItem value="header" disabled={!headerEnabled}>Cabeçalho</SelectItem>
            <SelectItem value="footer" disabled={!footerEnabled}>Rodapé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {num("X (pt)", el.x, (n) => onPatch({ x: clamp(n, 0, dims.width) }))}
        {num("Y (pt)", el.y, (n) => onPatch({ y: clamp(n, 0, dims.height) }))}
        {num("Largura", el.width, (n) => onPatch({ width: clamp(n, 10, dims.width) }))}
        {num("Altura", el.height, (n) => onPatch({ height: clamp(n, 8, dims.height) }))}
      </div>

      <Separator />

      {el.type === "text" ? (
        <TextProps el={el as CanvasTextElement} mergeFields={mergeFields} onPatch={onPatch} />
      ) : (
        <ImageProps el={el as CanvasImageElement} imageFields={imageFields} onPatch={onPatch} />
      )}
    </div>
  );
}

function TextProps({
  el,
  mergeFields,
  onPatch,
}: {
  el: CanvasTextElement;
  mergeFields: MergeFieldDef[];
  onPatch: (patch: Partial<CanvasElement>) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-[11px] text-muted-foreground mb-1 block">Conteúdo</Label>
        <RichTextField
          value={el.content}
          onChange={(content) => onPatch({ content } as Partial<CanvasElement>)}
          mergeFields={mergeFields}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Tamanho (pt)</Label>
          <Input
            type="number"
            className="h-8"
            value={el.fontSize}
            onChange={(e) => onPatch({ fontSize: clamp(Number(e.target.value), 4, 200) } as Partial<CanvasElement>)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Tipo de letra</Label>
          <Select value={el.fontFamily || "sans-serif"} onValueChange={(v) => onPatch({ fontFamily: v === "sans-serif" ? undefined : v } as Partial<CanvasElement>)}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f.label} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Alinhamento</Label>
          <div className="flex gap-0.5">
            {(["left", "center", "right", "justify"] as const).map((a) => {
              const Icon = a === "left" ? AlignLeft : a === "center" ? AlignCenter : a === "right" ? AlignRight : AlignJustify;
              return (
                <Button
                  key={a}
                  size="icon"
                  variant={el.align === a ? "default" : "ghost"}
                  className="h-7 w-7"
                  onClick={() => onPatch({ align: a } as Partial<CanvasElement>)}
                >
                  <Icon className="w-3.5 h-3.5" />
                </Button>
              );
            })}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Vertical</Label>
          <Select
            value={el.verticalAlign || "top"}
            onValueChange={(v) => onPatch({ verticalAlign: v as any } as Partial<CanvasElement>)}
          >
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Topo</SelectItem>
              <SelectItem value="middle">Centro</SelectItem>
              <SelectItem value="bottom">Base</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Cor do texto</Label>
          <input
            type="color"
            className="h-8 w-full cursor-pointer rounded border border-border bg-transparent"
            value={el.color || "#111111"}
            onChange={(e) => onPatch({ color: e.target.value } as Partial<CanvasElement>)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Fundo</Label>
          <div className="flex gap-1">
            <input
              type="color"
              className="h-8 w-full cursor-pointer rounded border border-border bg-transparent"
              value={el.backgroundColor || "#ffffff"}
              onChange={(e) => onPatch({ backgroundColor: e.target.value } as Partial<CanvasElement>)}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              title="Remover fundo"
              onClick={() => onPatch({ backgroundColor: undefined } as Partial<CanvasElement>)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageProps({
  el,
  imageFields,
  onPatch,
}: {
  el: CanvasImageElement;
  imageFields: MergeFieldDef[];
  onPatch: (patch: Partial<CanvasElement>) => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const mode: "field" | "static" = el.fieldKey ? "field" : "static";

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd, credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Falha no upload");
      const j = await res.json();
      onPatch({ staticSrc: j.filePath, fieldKey: undefined } as Partial<CanvasElement>);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Origem</Label>
        <Select
          value={mode}
          onValueChange={(v) =>
            v === "field"
              ? onPatch({ fieldKey: imageFields[0]?.key || "productImage", staticSrc: undefined } as Partial<CanvasElement>)
              : onPatch({ fieldKey: undefined } as Partial<CanvasElement>)
          }
        >
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="field">Campo dinâmico (URL da imagem)</SelectItem>
            <SelectItem value="static">Imagem fixa (ex.: logótipo)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "field" ? (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Campo</Label>
          <Select value={el.fieldKey} onValueChange={(v) => onPatch({ fieldKey: v } as Partial<CanvasElement>)}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {imageFields.map((f) => (
                <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Imagem</Label>
          <Input
            className="h-8"
            placeholder="URL ou /uploads/..."
            value={el.staticSrc || ""}
            onChange={(e) => onPatch({ staticSrc: e.target.value } as Partial<CanvasElement>)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <Button size="sm" variant="outline" className="w-full gap-1.5" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Carregar imagem
          </Button>
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-[11px] text-muted-foreground">Ajuste</Label>
        <Select value={el.objectFit || "contain"} onValueChange={(v) => onPatch({ objectFit: v as any } as Partial<CanvasElement>)}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="contain">Conter (manter proporção)</SelectItem>
            <SelectItem value="cover">Preencher (cortar)</SelectItem>
            <SelectItem value="fill">Esticar</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
