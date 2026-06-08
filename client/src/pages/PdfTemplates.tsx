import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { CanvasTemplateEditor } from "@/components/CanvasTemplateEditor";
import type { MergeFieldDef } from "@shared/mergeFields";
import {
  createEmptyCanvasTemplate,
  parseCanvasTemplate,
  type CanvasTemplateDoc,
} from "@shared/canvasTemplate";
import type { PdfTemplate, Family, Product } from "@shared/schema";

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
        content: JSON.stringify(createEmptyCanvasTemplate("A4", "portrait")),
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
              Dê um nome ao template. Pode desenhar o conteúdo a seguir no editor
              de canvas.
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
  const [isGlobalDefault, setIsGlobalDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [doc, setDoc] = useState<CanvasTemplateDoc | null>(null);
  const [wasLegacy, setWasLegacy] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const isBuiltIn = !!template?.builtInRenderer;

  useEffect(() => {
    if (!template) return;
    if (loadedFor === template.id) return;
    setName(template.name);
    setDescription(template.description || "");
    setIsGlobalDefault(template.isGlobalDefault);
    setIsActive(template.isActive);

    if (template.builtInRenderer) {
      setDoc(null);
      setWasLegacy(false);
    } else {
      const canvas = parseCanvasTemplate(template.content);
      if (canvas) {
        setDoc(canvas);
        setWasLegacy(false);
      } else {
        setDoc(
          createEmptyCanvasTemplate(
            (template.pageSize as any) || "A4",
            (template.orientation as any) || "portrait",
          ),
        );
        setWasLegacy(!!template.content);
      }
    }
    setLoadedFor(template.id);
  }, [template, loadedFor]);

  const linkedFamilies = useMemo(
    () => families.filter((f) => f.defaultTemplateId === id).map((f) => f.id),
    [families, id],
  );
  const [familyAssignments, setFamilyAssignments] = useState<string[]>([]);
  useEffect(() => {
    setFamilyAssignments(prev => {
      const same = prev.length === linkedFamilies.length && linkedFamilies.every(id => prev.includes(id));
      return same ? prev : [...linkedFamilies];
    });
  }, [linkedFamilies]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: any = {
        name,
        description,
        isGlobalDefault,
        isActive,
      };
      if (!isBuiltIn && doc) {
        body.content = JSON.stringify(doc);
        body.pageSize = doc.page.size;
        body.orientation = doc.page.orientation;
      }
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
      setWasLegacy(false);
      toast({ title: "Template guardado" });
    },
    onError: (e: Error) =>
      toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });

  if (isLoading || !template || loadedFor !== template.id) {
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

      {wasLegacy && !isBuiltIn && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="py-3 text-sm">
            Este template foi criado no editor antigo. Ao guardar, será convertido
            para o novo editor de canvas. O conteúdo anterior continua a ser usado
            para gerar PDFs até guardar.
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
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
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

      {isBuiltIn ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">
              Template do sistema
            </p>
            <p>
              O "SIE Padrão" usa o motor de renderização interno e não tem editor
              visual. Para desenhar um template livre, crie um novo.
            </p>
          </CardContent>
        </Card>
      ) : doc ? (
        <Card className="p-2">
          <div className="h-[78vh]">
            <CanvasTemplateEditor
              key={template.id}
              doc={doc}
              onChange={setDoc}
              mergeFields={mergeFields}
              products={products}
              templateName={name}
            />
          </div>
        </Card>
      ) : null}
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
                  Desenhe e atribua templates de fichas técnicas por família
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
