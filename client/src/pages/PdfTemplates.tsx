import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  FileText,
  ChevronLeft,
  Eye,
} from "lucide-react";
import {
  PdfTemplateEditor,
  type MergeFieldDef,
} from "@/components/PdfTemplateEditor";
import type { PdfTemplate, Family, Product } from "@shared/schema";

const PAGE_SIZES = ["A4", "A3", "Letter", "Legal"] as const;
const ORIENTATIONS = ["portrait", "landscape"] as const;

// ============================================================================
// LIST PAGE
// ============================================================================
function TemplatesList() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PdfTemplate | null>(null);
  const [newName, setNewName] = useState("");

  const { data: templates = [], isLoading } = useQuery<PdfTemplate[]>({
    queryKey: ["/api/admin/pdf-templates"],
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/admin/pdf-templates", {
        name,
        pageSize: "A4",
        orientation: "portrait",
        content: JSON.stringify({
          type: "doc",
          content: [{ type: "paragraph" }],
        }),
        isActive: true,
        isGlobalDefault: false,
      });
      return res.json();
    },
    onSuccess: (tpl: PdfTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdf-templates"] });
      setCreateOpen(false);
      setNewName("");
      setLocation(`/admin/pdf-templates/${tpl.id}`);
    },
    onError: (e: Error) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest(
        "POST",
        `/api/admin/pdf-templates/${id}/duplicate`,
      );
      return res.json();
    },
    onSuccess: (tpl: PdfTemplate) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdf-templates"] });
      toast({ title: "Template duplicado", description: tpl.name });
    },
    onError: (e: Error) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => {
      const res = await apiRequest("PUT", `/api/admin/pdf-templates/${id}`, {
        isActive,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdf-templates"] });
    },
    onError: (e: Error) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/pdf-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdf-templates"] });
      setDeleteTarget(null);
      toast({ title: "Template eliminado" });
    },
    onError: (e: Error) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Templates de PDF
        </CardTitle>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo template
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground p-4">A carregar...</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead>Orientação</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right w-[260px]">Acções</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Sem templates. Crie um novo.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t.name}</span>
                          {t.builtInRenderer && (
                            <Badge variant="outline">Sistema</Badge>
                          )}
                          {t.isGlobalDefault && (
                            <Badge>Pré-definido global</Badge>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{t.pageSize}</TableCell>
                      <TableCell className="capitalize">
                        {t.orientation === "portrait" ? "Vertical" : "Horizontal"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.isActive ? "default" : "secondary"}>
                          {t.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 flex-wrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar"
                            onClick={() =>
                              setLocation(`/admin/pdf-templates/${t.id}`)
                            }
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Duplicar"
                            onClick={() => duplicateMutation.mutate(t.id)}
                            disabled={duplicateMutation.isPending}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t.isActive ? "Desactivar" : "Activar"}
                            onClick={() =>
                              toggleActiveMutation.mutate({
                                id: t.id,
                                isActive: !t.isActive,
                              })
                            }
                          >
                            {t.isActive ? "Desactivar" : "Activar"}
                          </Button>
                          {!t.builtInRenderer && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Eliminar"
                              onClick={() => setDeleteTarget(t)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo template</DialogTitle>
            <DialogDescription>
              Dê um nome ao template. Pode editar o conteúdo a seguir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label>Nome</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex.: Ficha simplificada"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createMutation.mutate(newName.trim())}
              disabled={!newName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "A criar..." : "Criar e editar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar template</AlertDialogTitle>
            <AlertDialogDescription>
              Eliminar "{deleteTarget?.name}"? Famílias que o usem voltam ao
              template padrão. Esta acção não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

// ============================================================================
// EDIT PAGE
// ============================================================================
function TemplateEdit({ id }: { id: string }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: template, isLoading } = useQuery<PdfTemplate>({
    queryKey: ["/api/admin/pdf-templates", id],
  });
  const { data: mergeFields = [] } = useQuery<MergeFieldDef[]>({
    queryKey: ["/api/merge-fields"],
  });
  const { data: families = [] } = useQuery<Family[]>({
    queryKey: ["/api/admin/families", "?all=true"],
  });
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pageSize, setPageSize] = useState<string>("A4");
  const [orientation, setOrientation] = useState<string>("portrait");
  const [isGlobalDefault, setIsGlobalDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [previewProductId, setPreviewProductId] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>("");

  useEffect(() => {
    if (!template) return;
    setName(template.name);
    setDescription(template.description || "");
    setPageSize(template.pageSize);
    setOrientation(template.orientation);
    setIsGlobalDefault(template.isGlobalDefault);
    setIsActive(template.isActive);
    try {
      setContent(template.content ? JSON.parse(template.content) : null);
    } catch {
      setContent(null);
    }
  }, [template]);

  const isBuiltIn = !!template?.builtInRenderer;

  const linkedFamilies = useMemo(
    () => families.filter((f) => f.defaultTemplateId === id).map((f) => f.id),
    [families, id],
  );
  const [familyAssignments, setFamilyAssignments] = useState<string[]>([]);
  useEffect(() => {
    setFamilyAssignments(linkedFamilies);
  }, [linkedFamilies]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Save template
      const body: any = {
        name,
        description,
        pageSize,
        orientation,
        isGlobalDefault,
        isActive,
      };
      if (!isBuiltIn) body.content = JSON.stringify(content || { type: "doc", content: [{ type: "paragraph" }] });
      await apiRequest("PUT", `/api/admin/pdf-templates/${id}`, body);

      // Sync family assignments
      const toAdd = familyAssignments.filter((fid) => !linkedFamilies.includes(fid));
      const toRemove = linkedFamilies.filter((fid) => !familyAssignments.includes(fid));
      for (const fid of toAdd) {
        await apiRequest("PUT", `/api/admin/families/${fid}`, {
          defaultTemplateId: id,
        });
      }
      for (const fid of toRemove) {
        await apiRequest("PUT", `/api/admin/families/${fid}`, {
          defaultTemplateId: null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pdf-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/pdf-templates", id],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/families"] });
      toast({ title: "Template guardado" });
      refreshPreview();
    },
    onError: (e: Error) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  const previewTimerRef = useRef<number | null>(null);
  const refreshPreview = () => {
    if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
    previewTimerRef.current = window.setTimeout(async () => {
      try {
        setPreviewLoading(true);
        setPreviewError("");
        const res = await fetch(
          "/api/admin/pdf-templates/preview-draft",
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              template: {
                content: isBuiltIn
                  ? null
                  : JSON.stringify(content || { type: "doc", content: [{ type: "paragraph" }] }),
                pageSize,
                orientation,
              },
              productId: previewProductId || undefined,
            }),
          },
        );
        if (!res.ok) {
          // Built-in templates can't be previewed via draft endpoint; fall back to saved preview
          if (isBuiltIn) {
            const params = new URLSearchParams();
            if (previewProductId) params.set("productId", previewProductId);
            params.set("_t", String(Date.now()));
            setPreviewUrl(
              `/api/admin/pdf-templates/${id}/preview-pdf?${params.toString()}`,
            );
            setPreviewLoading(false);
            return;
          }
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || "Falha na pré-visualização");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
      } catch (e: any) {
        setPreviewError(e.message);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);
  };

  // Auto-refresh preview when content/page settings/product change
  useEffect(() => {
    if (!template) return;
    refreshPreview();
    return () => {
      if (previewTimerRef.current) window.clearTimeout(previewTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, pageSize, orientation, previewProductId, template?.id]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading || !template) {
    return <p className="p-6 text-muted-foreground">A carregar template...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/pdf-templates">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Link>
        </Button>
        <div className="flex-1" />
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "A guardar..." : "Guardar"}
        </Button>
      </div>

      {isBuiltIn && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-3 text-sm">
            Este é o template do sistema. Pode renomear, atribuir a famílias e
            marcar como pré-definido global, mas o conteúdo gráfico não é
            editável.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="space-y-2 md:col-span-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Pré-visualizar com</Label>
            <Select
              value={previewProductId || (products[0]?.id ?? "")}
              onValueChange={setPreviewProductId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Escolher produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.productCode || p.id} — {p.product || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>Tamanho da página</Label>
            <Select value={pageSize} onValueChange={setPageSize} disabled={isBuiltIn}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Orientação</Label>
            <Select value={orientation} onValueChange={setOrientation} disabled={isBuiltIn}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORIENTATIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o === "portrait" ? "Vertical" : "Horizontal"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <div className="flex items-center gap-4 h-9">
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm">Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={isGlobalDefault}
                  onCheckedChange={setIsGlobalDefault}
                />
                <span className="text-sm">Pré-definido global</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Famílias que usam este template</Label>
            <div className="flex flex-wrap gap-1.5">
              {families.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sem famílias.</p>
              ) : (
                families.map((f) => {
                  const checked = familyAssignments.includes(f.id);
                  return (
                    <Badge
                      key={f.id}
                      variant={checked ? "default" : "outline"}
                      className="cursor-pointer hover-elevate active-elevate-2"
                      onClick={() =>
                        setFamilyAssignments((prev) =>
                          checked
                            ? prev.filter((x) => x !== f.id)
                            : [...prev, f.id],
                        )
                      }
                    >
                      {f.description}
                    </Badge>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[70vh]">
        <Card className="flex flex-col">
          <CardHeader className="py-3">
            <CardTitle className="text-base">Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {isBuiltIn ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground border rounded-md bg-muted/20 p-6 text-center">
                O template "SIE Padrão" usa o renderizador do sistema. Veja a
                pré-visualização ao lado.
              </div>
            ) : (
              <PdfTemplateEditor
                initialContent={content}
                onChange={setContent}
                mergeFields={mergeFields}
              />
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Pré-visualização
            </CardTitle>
            <Button size="sm" variant="outline" onClick={refreshPreview}>
              Actualizar
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {previewError ? (
              <p className="text-sm text-destructive p-4">{previewError}</p>
            ) : previewLoading && !previewUrl ? (
              <p className="text-sm text-muted-foreground p-4">A gerar...</p>
            ) : previewUrl ? (
              <iframe
                title="Pré-visualização"
                src={previewUrl}
                className="w-full h-full min-h-[60vh] border rounded-md bg-white"
              />
            ) : (
              <p className="text-sm text-muted-foreground p-4">
                Sem pré-visualização.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE WRAPPER
// ============================================================================
export default function PdfTemplates() {
  const [matchEdit, params] = useRoute("/admin/pdf-templates/:id");
  const editingId = matchEdit ? params?.id : null;

  const { data: products = [] } = useQuery<{ id: string }[]>({
    queryKey: ["/api/products"],
  });

  const sidebarStyle = {
    "--sidebar-width": "13rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          currentView="pdf-templates"
          onNavigate={() => {}}
          productCount={products.length}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-4 p-4 border-b border-border/50">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Templates de PDF</h1>
                <p className="text-sm text-muted-foreground">
                  Crie e atribua templates de fichas técnicas por família
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {editingId ? <TemplateEdit id={editingId} /> : <TemplatesList />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
