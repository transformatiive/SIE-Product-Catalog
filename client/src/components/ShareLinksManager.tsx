import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Link2, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Calendar, 
  Eye, 
  Lock,
  Download,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ShareLink } from "@shared/schema";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ShareLinksManagerProps {
  productId: string;
  productCode: string;
}

export function ShareLinksManager({ productId, productCode }: ShareLinksManagerProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [newLinkData, setNewLinkData] = useState({
    accessType: 'read_only' as 'public' | 'read_only',
    allowPdfDownload: true,
    expiresAt: '',
    notes: '',
  });

  const { data: shareLinks = [], isLoading } = useQuery<ShareLink[]>({
    queryKey: ['/api/products', productId, 'share-links'],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}/share-links`);
      if (!response.ok) throw new Error('Erro ao carregar links');
      return response.json();
    },
  });

  const createLinkMutation = useMutation({
    mutationFn: async (data: typeof newLinkData) => {
      return apiRequest('POST', `/api/products/${productId}/share-links`, {
        ...data,
        expiresAt: data.expiresAt || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'share-links'] });
      setIsDialogOpen(false);
      setNewLinkData({
        accessType: 'read_only',
        allowPdfDownload: true,
        expiresAt: '',
        notes: '',
      });
      toast({
        title: "Link criado",
        description: "O link partilhável foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o link.",
        variant: "destructive",
      });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      return apiRequest('DELETE', `/api/share-links/${linkId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products', productId, 'share-links'] });
      toast({
        title: "Link eliminado",
        description: "O link foi eliminado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o link.",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = async (token: string, linkId: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(linkId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Link copiado",
        description: "O link foi copiado para a área de transferência.",
      });
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleOpenLink = (token: string) => {
    window.open(`/share/${token}`, '_blank');
  };

  const isExpired = (expiresAt: Date | string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5 text-[#E31E24]" />
            Links Partilháveis
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1 bg-[#E31E24] hover:bg-[#c9191e]">
                <Plus className="w-4 h-4" />
                Novo Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Link Partilhável</DialogTitle>
                <DialogDescription>
                  Crie um link para partilhar a ficha técnica do produto "{productCode}" com clientes externos.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Acesso</Label>
                  <Select
                    value={newLinkData.accessType}
                    onValueChange={(val) => setNewLinkData({ ...newLinkData, accessType: val as 'public' | 'read_only' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read_only">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Apenas Leitura
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Público
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    "Apenas Leitura" mostra um badge indicando que o conteúdo não pode ser alterado.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Download PDF</Label>
                    <p className="text-xs text-muted-foreground">
                      Permite descarregar a ficha técnica em PDF
                    </p>
                  </div>
                  <Switch
                    checked={newLinkData.allowPdfDownload}
                    onCheckedChange={(checked) => setNewLinkData({ ...newLinkData, allowPdfDownload: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data de Expiração (Opcional)</Label>
                  <Input
                    type="datetime-local"
                    value={newLinkData.expiresAt}
                    onChange={(e) => setNewLinkData({ ...newLinkData, expiresAt: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para um link sem expiração.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Notas (Opcional)</Label>
                  <Input
                    placeholder="Ex: Link para cliente XYZ"
                    value={newLinkData.notes}
                    onChange={(e) => setNewLinkData({ ...newLinkData, notes: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => createLinkMutation.mutate(newLinkData)}
                  disabled={createLinkMutation.isPending}
                  className="bg-[#E31E24] hover:bg-[#c9191e]"
                >
                  {createLinkMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Criar Link
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : shareLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum link partilhável criado.</p>
            <p className="text-sm">Crie um link para partilhar a ficha técnica com clientes externos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shareLinks.map((link) => (
              <div 
                key={link.id} 
                className={`border rounded-lg p-4 ${isExpired(link.expiresAt) || !link.isActive ? 'opacity-60 bg-muted/50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {link.accessType === 'read_only' ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="w-3 h-3" />
                          Apenas Leitura
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Eye className="w-3 h-3" />
                          Público
                        </Badge>
                      )}
                      {link.allowPdfDownload && (
                        <Badge variant="outline" className="gap-1">
                          <Download className="w-3 h-3" />
                          PDF
                        </Badge>
                      )}
                      {isExpired(link.expiresAt) && (
                        <Badge variant="destructive">Expirado</Badge>
                      )}
                      {!link.isActive && (
                        <Badge variant="destructive">Desativado</Badge>
                      )}
                    </div>
                    
                    <div className="mt-2 font-mono text-xs text-muted-foreground truncate">
                      {window.location.origin}/share/{link.token}
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      {link.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expira: {format(new Date(link.expiresAt), "dd/MM/yyyy HH:mm", { locale: pt })}
                        </span>
                      )}
                      <span>Acessos: {link.accessCount}</span>
                      {link.notes && <span>- {link.notes}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyLink(link.token, link.id)}
                      title="Copiar link"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenLink(link.token)}
                      title="Abrir link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLinkMutation.mutate(link.id)}
                      disabled={deleteLinkMutation.isPending}
                      title="Eliminar link"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
