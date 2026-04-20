import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { Highlight } from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Search,
  Pilcrow,
  Columns2,
  Palette,
  Highlighter,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---- MergeField TipTap node ----
const MergeFieldNode = Node.create({
  name: "mergeField",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      key: { default: "" },
      label: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-merge-field]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-merge-field": HTMLAttributes.key,
        class:
          "inline-block px-1.5 py-0 mx-0.5 rounded-sm bg-blue-100 text-blue-800 text-sm border border-blue-200 align-baseline",
      }),
      `{{${HTMLAttributes.label || HTMLAttributes.key}}}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MergeFieldView);
  },
});

function MergeFieldView({ node }: any) {
  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        contentEditable={false}
        className="inline-block px-1.5 py-0 mx-0.5 rounded-sm bg-blue-100 text-blue-800 text-xs font-medium border border-blue-200 align-baseline"
      >
        {`{{${node.attrs.label || node.attrs.key}}}`}
      </span>
    </NodeViewWrapper>
  );
}

// ---- Editor component ----
export interface MergeFieldDef {
  key: string;
  label: string;
  section: string;
}

interface Props {
  initialContent: any;
  onChange: (json: any) => void;
  mergeFields: MergeFieldDef[];
}

export function PdfTemplateEditor({ initialContent, onChange, mergeFields }: Props) {
  const [search, setSearch] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
      TextStyle,
      Color,
      FontFamily.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      MergeFieldNode,
    ],
    content: initialContent || { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[60vh] p-6 bg-white text-black border rounded-md",
      },
    },
  });

  // Group merge fields by section + filter
  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out: Record<string, MergeFieldDef[]> = {};
    for (const f of mergeFields) {
      if (q && !f.label.toLowerCase().includes(q) && !f.key.toLowerCase().includes(q)) continue;
      (out[f.section] ||= []).push(f);
    }
    return out;
  }, [mergeFields, search]);

  if (!editor) return <div className="p-4 text-muted-foreground">A carregar editor...</div>;

  const insertField = (f: MergeFieldDef) => {
    editor
      .chain()
      .focus()
      .insertContent({ type: "mergeField", attrs: { key: f.key, label: f.label } })
      .run();
  };

  const insertImageByUrl = () => {
    setImageUrl("");
    setImageDialogOpen(true);
  };

  const confirmInsertImage = () => {
    const url = imageUrl.trim();
    if (url) editor.chain().focus().setImage({ src: url }).run();
    setImageDialogOpen(false);
    setImageUrl("");
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const insertColumns = (cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 1, cols, withHeaderRow: false })
      .run();
  };

  return (
    <div className="grid grid-cols-[1fr_280px] gap-4 h-full">
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/30">
          <ToolbarBtn
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            label="Negrito"
          >
            <Bold className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            label="Itálico"
          >
            <Italic className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            label="Sublinhado"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            label="Rasurado"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarBtn>
          <Sep />
          <FontFamilyPicker editor={editor} />
          <Sep />
          <ToolbarBtn
            active={editor.isActive("paragraph")}
            onClick={() => editor.chain().focus().setParagraph().run()}
            label="Parágrafo"
          >
            <Pilcrow className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            label="Título 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            label="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            label="Título 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            label="Lista"
          >
            <List className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            label="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarBtn>
          <Sep />
          <ToolbarBtn
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            label="Alinhar à esquerda"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            label="Centrar"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            label="Alinhar à direita"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarBtn>
          <Sep />
          <ColorPicker
            icon={<Palette className="w-4 h-4" />}
            title="Cor do texto"
            currentColor={editor.getAttributes("textStyle").color || ""}
            onPick={(c) =>
              c
                ? editor.chain().focus().setColor(c).run()
                : editor.chain().focus().unsetColor().run()
            }
          />
          <ColorPicker
            icon={<Highlighter className="w-4 h-4" />}
            title="Cor de fundo"
            currentColor={editor.getAttributes("highlight").color || ""}
            onPick={(c) =>
              c
                ? editor.chain().focus().toggleHighlight({ color: c }).run()
                : editor.chain().focus().unsetHighlight().run()
            }
          />
          <Sep />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                title="Inserir colunas"
                aria-label="Inserir colunas"
              >
                <Columns2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => insertColumns(2)}>
                2 colunas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertColumns(3)}>
                3 colunas
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertColumns(4)}>
                4 colunas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ToolbarBtn onClick={insertTable} label="Inserir tabela">
            <TableIcon className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn onClick={insertImageByUrl} label="Inserir imagem">
            <ImageIcon className="w-4 h-4" />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            label="Linha horizontal"
          >
            <Minus className="w-4 h-4" />
          </ToolbarBtn>
        </div>

        <div className="flex-1 overflow-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      <aside className="border rounded-md bg-card flex flex-col min-h-0">
        <div className="p-3 border-b">
          <p className="text-sm font-semibold mb-2">Campos disponíveis</p>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Procurar campo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Clique para inserir no documento.</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-3">
            {Object.keys(grouped).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Sem resultados.</p>
            ) : (
              Object.entries(grouped).map(([section, fields]) => (
                <div key={section}>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">
                    {section}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {fields.map((f) => (
                      <Badge
                        key={f.key}
                        variant="secondary"
                        className="cursor-pointer hover-elevate active-elevate-2"
                        onClick={() => insertField(f)}
                      >
                        {f.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inserir imagem</DialogTitle>
            <DialogDescription>
              Indique o URL ou caminho da imagem (ex.: /uploads/imagem.png ou
              /attached_assets/foto.jpg).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>URL da imagem</Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... ou /uploads/imagem.png"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  confirmInsertImage();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmInsertImage} disabled={!imageUrl.trim()}>
              Inserir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? "default" : "ghost"}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </Button>
  );
}

function Sep() {
  return <div className="w-px bg-border mx-1 my-1" />;
}

const FONT_FAMILIES = [
  { label: "Predefinida", value: "" },
  { label: "Sans-serif", value: "Inter, Arial, Helvetica, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Monoespaçada", value: "'Courier New', Courier, monospace" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
];

function FontFamilyPicker({ editor }: { editor: any }) {
  const current = editor.getAttributes("textStyle").fontFamily || "";
  const currentLabel =
    FONT_FAMILIES.find((f) => f.value === current)?.label || "Tipo de letra";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="min-w-[8rem] justify-start"
          title="Tipo de letra"
        >
          <span
            className="truncate text-xs"
            style={{ fontFamily: current || undefined }}
          >
            {currentLabel}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 overflow-auto">
        {FONT_FAMILIES.map((f) => (
          <DropdownMenuItem
            key={f.label}
            onClick={() =>
              f.value
                ? editor.chain().focus().setFontFamily(f.value).run()
                : editor.chain().focus().unsetFontFamily().run()
            }
            style={{ fontFamily: f.value || undefined }}
          >
            {f.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const PRESET_COLORS = [
  "#000000", "#444444", "#888888", "#cccccc", "#ffffff",
  "#E31E24", "#d97706", "#ca8a04", "#16a34a", "#0ea5e9",
  "#2563eb", "#7c3aed", "#db2777",
  "#fee2e2", "#fef3c7", "#dcfce7", "#dbeafe", "#ede9fe", "#fce7f3",
];

function ColorPicker({
  icon,
  title,
  currentColor,
  onPick,
}: {
  icon: React.ReactNode;
  title: string;
  currentColor: string;
  onPick: (color: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          title={title}
          aria-label={title}
        >
          <div className="flex flex-col items-center justify-center gap-0.5">
            {icon}
            <div
              className="w-4 h-1 rounded-sm border border-border"
              style={{ backgroundColor: currentColor || "transparent" }}
            />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-2 w-auto">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onPick(c)}
              className="w-6 h-6 rounded-sm border border-border hover-elevate"
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 border-t pt-2">
          <input
            type="color"
            value={currentColor || "#000000"}
            onChange={(e) => onPick(e.target.value)}
            className="w-8 h-8 cursor-pointer rounded border border-border bg-transparent"
            aria-label="Cor personalizada"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onPick("")}
          >
            Remover
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
