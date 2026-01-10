import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Settings, Users } from "lucide-react";
import { UsersManagement } from "@/components/UsersManagement";
import type { DropdownOption } from "@shared/schema";

type TableName = 
  | "families"
  | "productTypes"
  | "capacities"
  | "models"
  | "rawMaterials"
  | "colors"
  | "closingSystems"
  | "capSizes"
  | "certificationTypes"
  | "packagingTypes"
  | "specifications";

interface TabConfig {
  name: TableName;
  label: string;
}

const tabConfigs: TabConfig[] = [
  { name: "families", label: "Famílias" },
  { name: "productTypes", label: "Tipos de Produto" },
  { name: "capacities", label: "Capacidades" },
  { name: "models", label: "Modelos" },
  { name: "rawMaterials", label: "Matérias Primas" },
  { name: "colors", label: "Cores" },
  { name: "closingSystems", label: "Sistemas de Fecho" },
  { name: "capSizes", label: "Medidas de Tampa" },
  { name: "certificationTypes", label: "Tipos de Certificação" },
  { name: "packagingTypes", label: "Tipos de Embalagem" },
  { name: "specifications", label: "Especificações" },
];

interface OptionFormData {
  code: string;
  description: string;
  isActive: boolean;
  displayCode?: string;
  abbreviation?: string;
  shortCode?: string;
}

// Tables that need extended fields
const tablesWithDisplayCode = ["models", "specifications"];
const tablesWithAbbreviations = ["certificationTypes", "packagingTypes"];

function AdminTable({ tableName }: { tableName: TableName }) {
  const { toast } = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption & { displayCode?: string; abbreviation?: string; shortCode?: string } | null>(null);
  const [formData, setFormData] = useState<OptionFormData>({
    code: "",
    description: "",
    isActive: true,
    displayCode: "",
    abbreviation: "",
    shortCode: "",
  });

  const needsDisplayCode = tablesWithDisplayCode.includes(tableName);
  const needsAbbreviations = tablesWithAbbreviations.includes(tableName);

  // Extended type to include optional fields for models/specifications and certification/packaging types
  type ExtendedDropdownOption = DropdownOption & { 
    displayCode?: string; 
    abbreviation?: string; 
    shortCode?: string;
  };

  const { data: options = [], isLoading } = useQuery<ExtendedDropdownOption[]>({
    queryKey: ["/api/admin", tableName, "?all=true"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<OptionFormData, "isActive">) => {
      const res = await apiRequest("POST", `/api/admin/${tableName}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin", tableName] });
      toast({
        title: "Sucesso",
        description: "Opção criada com sucesso",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao criar opção",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OptionFormData> }) => {
      const res = await apiRequest("PUT", `/api/admin/${tableName}/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin", tableName] });
      toast({
        title: "Sucesso",
        description: "Opção atualizada com sucesso",
      });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar opção",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PUT", `/api/admin/${tableName}/${id}`, { isActive: false });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin", tableName] });
      toast({
        title: "Sucesso",
        description: "Opção desactivada com sucesso",
      });
      setIsDeleteOpen(false);
      setSelectedOption(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Falha ao desactivar opção",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ code: "", description: "", isActive: true, displayCode: "", abbreviation: "", shortCode: "" });
    setSelectedOption(null);
    setIsEditOpen(false);
  };

  const handleCreate = () => {
    setSelectedOption(null);
    setFormData({ code: "", description: "", isActive: true, displayCode: "", abbreviation: "", shortCode: "" });
    setIsEditOpen(true);
  };

  const handleEdit = (option: DropdownOption & { displayCode?: string; abbreviation?: string; shortCode?: string }) => {
    setSelectedOption(option);
    setFormData({
      code: option.code,
      description: option.description,
      isActive: option.isActive,
      displayCode: option.displayCode || "",
      abbreviation: option.abbreviation || "",
      shortCode: option.shortCode || "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (option: DropdownOption) => {
    setSelectedOption(option);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = {
      code: formData.code,
      description: formData.description,
    };
    
    // Add extended fields based on table type
    if (needsDisplayCode) {
      submitData.displayCode = formData.displayCode;
    }
    if (needsAbbreviations) {
      submitData.abbreviation = formData.abbreviation;
      submitData.shortCode = formData.shortCode;
    }
    
    if (selectedOption) {
      updateMutation.mutate({
        id: selectedOption.id,
        data: { ...submitData, isActive: formData.isActive },
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedOption) {
      deleteMutation.mutate(selectedOption.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Novo
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Código</TableHead>
              <TableHead>Descrição</TableHead>
              {needsDisplayCode && <TableHead className="w-[120px]">Código Exib.</TableHead>}
              {needsAbbreviations && (
                <>
                  <TableHead className="w-[100px]">Abreviatura</TableHead>
                  <TableHead className="w-[80px]">Cód. Curto</TableHead>
                </>
              )}
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="w-[120px] text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.length === 0 ? (
              <TableRow>
                <TableCell colSpan={needsDisplayCode ? 5 : needsAbbreviations ? 6 : 4} className="text-center text-muted-foreground py-8">
                  Nenhuma opção encontrada
                </TableCell>
              </TableRow>
            ) : (
              options.map((option) => (
                <TableRow key={option.id}>
                  <TableCell className="font-medium">{option.code}</TableCell>
                  <TableCell>{option.description}</TableCell>
                  {needsDisplayCode && <TableCell className="font-mono">{option.displayCode || '-'}</TableCell>}
                  {needsAbbreviations && (
                    <>
                      <TableCell>{option.abbreviation || '-'}</TableCell>
                      <TableCell className="font-mono">{option.shortCode || '-'}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Badge variant={option.isActive ? "default" : "secondary"}>
                      {option.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(option)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(option)}
                        title="Desactivar"
                        disabled={!option.isActive}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedOption ? "Editar Opção" : "Nova Opção"}
            </DialogTitle>
            <DialogDescription>
              {selectedOption
                ? "Altere os dados da opção abaixo."
                : "Preencha os dados para criar uma nova opção."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                  placeholder="Ex: FAM01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Ex: Família de Produtos"
                  required
                />
              </div>
              {needsDisplayCode && (
                <div className="space-y-2">
                  <Label htmlFor="displayCode">Código de Exibição</Label>
                  <Input
                    id="displayCode"
                    value={formData.displayCode || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, displayCode: e.target.value }))
                    }
                    placeholder="Ex: 0541"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Código usado na referência do produto</p>
                </div>
              )}
              {needsAbbreviations && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="abbreviation">Abreviatura</Label>
                    <Input
                      id="abbreviation"
                      value={formData.abbreviation || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, abbreviation: e.target.value }))
                      }
                      placeholder="Ex: CERT ou PAL"
                    />
                    <p className="text-xs text-muted-foreground">Usado na designação do produto</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortCode">Código Curto</Label>
                    <Input
                      id="shortCode"
                      value={formData.shortCode || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, shortCode: e.target.value }))
                      }
                      placeholder="Ex: C ou P"
                      maxLength={1}
                    />
                    <p className="text-xs text-muted-foreground">Código de 1 letra para referência</p>
                  </div>
                </>
              )}
              {selectedOption && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isActive">Activo</Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "A guardar..."
                  : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desactivação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja desactivar a opção "{selectedOption?.description}"?
              Esta acção pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "A desactivar..." : "Desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Admin() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const activeTab = searchParams.get("tab");
  const isUsersTab = activeTab === "users";

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
        <AppSidebar currentView="admin" onNavigate={() => {}} productCount={products.length} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-4 p-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                {isUsersTab ? (
                  <Users className="w-4 h-4 text-primary" />
                ) : (
                  <Settings className="w-4 h-4 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold">
                  {isUsersTab ? "Utilizadores" : "Administração"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isUsersTab ? "Gestão de utilizadores do sistema" : "Gestão de tabelas de suporte"}
                </p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {isUsersTab ? (
              <UsersManagement />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Tabelas de Suporte</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="families" className="w-full">
                    <TabsList className="grid grid-cols-3 h-auto gap-1 p-1.5 bg-muted/30 mb-6 rounded-lg shadow-sm border border-border/50">
                      {tabConfigs.map((tab) => (
                        <TabsTrigger
                          key={tab.name}
                          value={tab.name}
                          className="text-xs sm:text-sm py-2.5 rounded-md transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=inactive]:hover:bg-muted/50"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {tabConfigs.map((tab) => (
                      <TabsContent key={tab.name} value={tab.name}>
                        <AdminTable tableName={tab.name} />
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
