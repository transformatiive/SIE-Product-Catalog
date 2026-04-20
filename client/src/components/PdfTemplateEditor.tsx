import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
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
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: false, allowBase64: true }),
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
