import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Edit, FileText, ArrowLeft, Calendar, Package, Wrench, Award, Box, Tag } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductDetailProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onGeneratePDF?: (product: Product) => void;
  onBack?: () => void;
  isGeneratingPDF?: boolean;
}

export default function ProductDetail({ product, onEdit, onGeneratePDF, onBack, isGeneratingPDF = false }: ProductDetailProps) {
  const handleEdit = () => {
    console.log('Edit product triggered', product.productCode);
    onEdit?.(product);
  };

  const handleGeneratePDF = () => {
    console.log('Generate PDF triggered', product.productCode);
    onGeneratePDF?.(product);
  };

  const handleBack = () => {
    console.log('Back triggered');
    onBack?.();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseJSON = (jsonString: string | null, fallback: any = []) => {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString);
    } catch {
      return fallback;
    }
  };

  const dimensions = parseJSON(product.dimensions, {});
  const certifications = parseJSON(product.certifications, []);
  const markings = parseJSON(product.markings, []);
  const packaging = parseJSON(product.packaging, {});
  const specialFeatures = parseJSON(product.specialFeatures, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <Badge variant="secondary">{product.family}</Badge>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-product-name">
                  {product.product}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Modelo {product.model} • {product.type}
                </p>
                <p className="font-mono text-sm" data-testid="text-product-code">
                  {product.productCode}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleEdit} data-testid="button-edit">
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button 
                onClick={handleGeneratePDF} 
                disabled={isGeneratingPDF}
                data-testid="button-generate-pdf"
              >
                <FileText className="w-4 h-4 mr-1" />
                {isGeneratingPDF ? 'A gerar...' : 'Gerar PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo */}
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-5 p-1.5 bg-muted/30 rounded-lg shadow-sm border border-border/50">
          <TabsTrigger value="geral" className="rounded-md transition-all duration-200 data-[state=active]:shadow-md data-[state=inactive]:hover:bg-muted/50">Geral</TabsTrigger>
          <TabsTrigger value="tecnico" className="rounded-md transition-all duration-200 data-[state=active]:shadow-md data-[state=inactive]:hover:bg-muted/50">Técnico</TabsTrigger>
          <TabsTrigger value="especificacoes" className="rounded-md transition-all duration-200 data-[state=active]:shadow-md data-[state=inactive]:hover:bg-muted/50">Especificações</TabsTrigger>
          <TabsTrigger value="embalagem" className="rounded-md transition-all duration-200 data-[state=active]:shadow-md data-[state=inactive]:hover:bg-muted/50">Embalagem</TabsTrigger>
          <TabsTrigger value="metadata" className="rounded-md transition-all duration-200 data-[state=active]:shadow-md data-[state=inactive]:hover:bg-muted/50">Metadados</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informação Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Informação Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Modelo</p>
                    <p className="font-medium" data-testid="text-detail-model">{product.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tipo de Produto</p>
                    <p className="font-medium" data-testid="text-detail-type">{product.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacidade Nominal</p>
                    <p className="font-medium" data-testid="text-detail-capacity">{product.nominalCapacity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacidade Total</p>
                    <p className="font-medium">{product.totalCapacity || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Matéria Prima</p>
                    <p className="font-medium" data-testid="text-detail-material">{product.rawMaterial}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Peso</p>
                    <p className="font-medium" data-testid="text-detail-weight">{product.weight}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Cores Disponíveis</p>
                  <div className="flex flex-wrap gap-1">
                    {product.colors.split(',').map((color, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {color.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dimensões */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Dimensões
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(dimensions).length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(dimensions).map(([name, value]) => (
                      <div key={name} className="flex justify-between items-center">
                        <span className="capitalize text-muted-foreground">{name}</span>
                        <span className="font-medium" data-testid={`text-dimension-${name}`}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem dimensões especificadas</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Características Especiais */}
          {specialFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Características Especiais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {specialFeatures.map((feature: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tecnico" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Especificações Técnicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sistema de Fecho</span>
                    <span className="font-medium">{product.closingSystem || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo de Selagem</span>
                    <span className="font-medium">{product.sealingType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sistema de Manuseamento</span>
                    <span className="font-medium">{product.handlingSystem || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Peso c/ Acessórios</span>
                    <span className="font-medium">{product.weightWithAccessories || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contacto Alimentar</span>
                    <Badge variant={product.foodContact ? "default" : "secondary"}>
                      {product.foodContact ? 'Aprovado' : 'Não Aprovado'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {certifications.length > 0 ? (
                  <div className="space-y-2">
                    {certifications.map((cert: string, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <code className="text-sm">{cert}</code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem certificações especificadas</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="especificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Marcações e Especificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {markings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Marcações do Produto</h4>
                  <div className="flex flex-wrap gap-2">
                    {markings.map((marking: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {marking}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.notes && (
                <div>
                  <h4 className="font-medium mb-3">Observações</h4>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm" data-testid="text-notes">{product.notes}</p>
                  </div>
                </div>
              )}

              {markings.length === 0 && !product.notes && (
                <p className="text-muted-foreground">Sem marcações ou observações</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embalagem" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="w-5 h-5" />
                Informação de Embalagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(packaging).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {Object.entries(packaging).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Sem informação de embalagem especificada</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Metadados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data de Criação</span>
                  <span className="font-medium" data-testid="text-created-date">
                    {formatDate(product.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Última Atualização</span>
                  <span className="font-medium" data-testid="text-updated-date">
                    {formatDate(product.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID do Produto</span>
                  <span className="font-mono text-xs">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado</span>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
