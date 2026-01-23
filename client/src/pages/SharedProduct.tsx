import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Loader2, AlertCircle, Package, Ruler, Shield, Box, Lock } from "lucide-react";
import type { Product } from "@shared/schema";
import sieLogo from "@assets/sie-logo.svg";

interface SharedProductData {
  product: Product;
  shareLink: {
    accessType: string;
    allowPdfDownload: boolean;
  };
}

export default function SharedProduct() {
  const params = useParams();
  const token = params.token;

  const { data, isLoading, error } = useQuery<SharedProductData>({
    queryKey: ['/api/share', token],
    queryFn: async () => {
      const response = await fetch(`/api/share/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar produto');
      }
      return response.json();
    },
    enabled: !!token,
  });

  const handleDownloadPdf = () => {
    window.open(`/api/share/${token}/pdf`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#E31E24] mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar ficha técnica...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Inválido</h2>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Este link não existe, expirou ou foi desativado.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { product, shareLink } = data;
  const isReadOnly = shareLink.accessType === 'read_only';

  const parseDimensions = (dim: string | null): { altura?: string; diametro?: string; largura?: string } => {
    if (!dim) return {};
    try {
      return JSON.parse(dim);
    } catch {
      return {};
    }
  };

  const dimensions = parseDimensions(product.dimensions);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={sieLogo} alt="SIE" className="h-10" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Ficha Técnica</h1>
              <p className="text-sm text-muted-foreground">{product.productCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isReadOnly && (
              <Badge variant="secondary" className="gap-1">
                <Lock className="w-3 h-3" />
                Apenas Leitura
              </Badge>
            )}
            {shareLink.allowPdfDownload && (
              <Button onClick={handleDownloadPdf} variant="default" className="gap-2 bg-[#E31E24] hover:bg-[#c9191e]">
                <Download className="w-4 h-4" />
                Descarregar PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-[#E31E24]" />
                Informação do Produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Código</p>
                  <p className="font-semibold">{product.productCode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Código de Barras</p>
                  <p className="font-mono">{product.barcode || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Designação</p>
                  <p>{product.designation || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Família</p>
                  <p>{product.family}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Modelo</p>
                  <p>{product.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                  <p>{product.type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Ruler className="w-5 h-5 text-[#E31E24]" />
                Características Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacidade Nominal</p>
                  <p>{product.nominalCapacity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacidade Total</p>
                  <p>{product.totalCapacity || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matéria-Prima</p>
                  <p>{product.rawMaterial}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cores</p>
                  <p>{product.colors}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peso</p>
                  <p>{product.weight}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Peso c/ Acessórios</p>
                  <p>{product.weightWithAccessories || '-'}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Dimensões</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {dimensions.altura && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                      <span className="text-muted-foreground">Altura:</span> {dimensions.altura}
                    </div>
                  )}
                  {dimensions.diametro && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                      <span className="text-muted-foreground">Diâmetro:</span> {dimensions.diametro}
                    </div>
                  )}
                  {dimensions.largura && (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                      <span className="text-muted-foreground">Largura:</span> {dimensions.largura}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-[#E31E24]" />
                Sistema de Fecho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sistema de Fecho</p>
                  <p>{product.closingSystem || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Tampa</p>
                  <p>{product.capType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dimensões da Tampa</p>
                  <p>{product.capDimensions || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Vedante</p>
                  <p>{product.sealingType || '-'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.vedantePead && <Badge variant="outline">PEAD</Badge>}
                {product.vedanteEpdm && <Badge variant="outline">EPDM</Badge>}
                {product.vedanteOutros && <Badge variant="outline">{product.vedanteOutros}</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Box className="w-5 h-5 text-[#E31E24]" />
                Embalagem e Paletização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empilhável</p>
                  <p>{product.stackable ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capacidade Empilhamento</p>
                  <p>{product.stackingCapacity || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dimensões da Palete</p>
                  <p>{product.palletDimensions || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Unidades</p>
                  <p>{product.totalUnits || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(product.productImage || product.technicalDrawing) && (
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="w-5 h-5 text-[#E31E24]" />
                  Imagens do Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {product.productImage && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Imagem do Produto</p>
                      <img 
                        src={product.productImage} 
                        alt="Produto" 
                        className="max-w-full rounded-lg border shadow-sm"
                      />
                    </div>
                  )}
                  {product.technicalDrawing && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Desenho Técnico</p>
                      <img 
                        src={product.technicalDrawing} 
                        alt="Desenho Técnico" 
                        className="max-w-full rounded-lg border shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>Ficha técnica gerada por SIE - Sistema de Informação de Embalagens</p>
          <p className="mt-1">© {new Date().getFullYear()} SIE. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
