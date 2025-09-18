import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Plus, Trash2 } from "lucide-react";
import { InsertProduct, insertProductSchema, Product } from "@shared/schema";
import ImageUpload from "./ImageUpload";

interface ProductFormProps {
  product?: Product;
  onSave?: (product: InsertProduct) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface DimensionField {
  id: string;
  name: string;
  value: string;
}

interface CertificationField {
  id: string;
  value: string;
}

interface MarkingField {
  id: string;
  value: string;
}

interface SpecialFeatureField {
  id: string;
  value: string;
}

interface PackagingData {
  unitsPerPallet: string;
  unitsPerTruck: string;
  palletDimensions: string;
  stackHeight: string;
}

export default function ProductForm({ product, onSave, onCancel, isLoading = false }: ProductFormProps) {
  const [dimensions, setDimensions] = useState<DimensionField[]>(() => {
    if (product?.dimensions) {
      try {
        const parsed = JSON.parse(product.dimensions);
        return Object.entries(parsed).map(([name, value], index) => ({
          id: `dim-${index}`,
          name,
          value: String(value),
        }));
      } catch {
        return [{ id: 'dim-1', name: 'altura', value: '' }];
      }
    }
    return [{ id: 'dim-1', name: 'altura', value: '' }];
  });

  const [certifications, setCertifications] = useState<CertificationField[]>(() => {
    if (product?.certifications) {
      try {
        const parsed = JSON.parse(product.certifications);
        return parsed.map((cert: string, index: number) => ({
          id: `cert-${index}`,
          value: cert,
        }));
      } catch {
        return [{ id: 'cert-1', value: '' }];
      }
    }
    return [{ id: 'cert-1', value: '' }];
  });

  const [markings, setMarkings] = useState<MarkingField[]>(() => {
    if (product?.markings) {
      try {
        const parsed = JSON.parse(product.markings);
        return parsed.map((marking: string, index: number) => ({
          id: `marking-${index}`,
          value: marking,
        }));
      } catch {
        return [{ id: 'marking-1', value: '' }];
      }
    }
    return [{ id: 'marking-1', value: '' }];
  });

  const [specialFeatures, setSpecialFeatures] = useState<SpecialFeatureField[]>(() => {
    if (product?.specialFeatures) {
      try {
        const parsed = JSON.parse(product.specialFeatures);
        return parsed.map((feature: string, index: number) => ({
          id: `feature-${index}`,
          value: feature,
        }));
      } catch {
        return [{ id: 'feature-1', value: '' }];
      }
    }
    return [{ id: 'feature-1', value: '' }];
  });

  const [packagingData, setPackagingData] = useState<PackagingData>(() => {
    if (product?.packaging) {
      try {
        const parsed = JSON.parse(product.packaging);
        return {
          unitsPerPallet: parsed.unitsPerPallet?.toString() || '',
          unitsPerTruck: parsed.unitsPerTruck?.toString() || '',
          palletDimensions: parsed.palletDimensions || '',
          stackHeight: parsed.stackHeight?.toString() || '',
        };
      } catch {
        return {
          unitsPerPallet: '',
          unitsPerTruck: '',
          palletDimensions: '',
          stackHeight: '',
        };
      }
    }
    return {
      unitsPerPallet: '',
      unitsPerTruck: '',
      palletDimensions: '',
      stackHeight: '',
    };
  });

  // State for image uploads
  const [productImage, setProductImage] = useState<string | null>(product?.productImage || null);
  const [technicalDrawing, setTechnicalDrawing] = useState<string | null>(product?.technicalDrawing || null);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      model: product?.model || '',
      family: product?.family || '',
      type: product?.type || '',
      product: product?.product || '',
      productCode: product?.productCode || '',
      nominalCapacity: product?.nominalCapacity || '',
      totalCapacity: product?.totalCapacity || '',
      rawMaterial: product?.rawMaterial || '',
      colors: product?.colors || '',
      weight: product?.weight || '',
      weightWithAccessories: product?.weightWithAccessories || '',
      dimensions: product?.dimensions || '',
      closingSystem: product?.closingSystem || '',
      sealingType: product?.sealingType || '',
      handlingSystem: product?.handlingSystem || '',
      certifications: product?.certifications || '',
      markings: product?.markings || '',
      foodContact: product?.foodContact ?? false,
      packaging: product?.packaging || '',
      specialFeatures: product?.specialFeatures || '',
      productImage: product?.productImage || '',
      technicalDrawing: product?.technicalDrawing || '',
      notes: product?.notes || '',
      isActive: product?.isActive ?? true,
    },
  });

  const addDimension = () => {
    const newId = `dim-${Date.now()}`;
    setDimensions(prev => [...prev, { id: newId, name: '', value: '' }]);
  };

  const removeDimension = (id: string) => {
    setDimensions(prev => prev.filter(dim => dim.id !== id));
  };

  const updateDimension = (id: string, field: 'name' | 'value', value: string) => {
    setDimensions(prev => prev.map(dim => 
      dim.id === id ? { ...dim, [field]: value } : dim
    ));
  };

  const addCertification = () => {
    const newId = `cert-${Date.now()}`;
    setCertifications(prev => [...prev, { id: newId, value: '' }]);
  };

  const removeCertification = (id: string) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id));
  };

  const updateCertification = (id: string, value: string) => {
    setCertifications(prev => prev.map(cert => 
      cert.id === id ? { ...cert, value } : cert
    ));
  };

  const addMarking = () => {
    const newId = `marking-${Date.now()}`;
    setMarkings(prev => [...prev, { id: newId, value: '' }]);
  };

  const removeMarking = (id: string) => {
    setMarkings(prev => prev.filter(marking => marking.id !== id));
  };

  const updateMarking = (id: string, value: string) => {
    setMarkings(prev => prev.map(marking => 
      marking.id === id ? { ...marking, value } : marking
    ));
  };

  const addSpecialFeature = () => {
    const newId = `feature-${Date.now()}`;
    setSpecialFeatures(prev => [...prev, { id: newId, value: '' }]);
  };

  const removeSpecialFeature = (id: string) => {
    setSpecialFeatures(prev => prev.filter(feature => feature.id !== id));
  };

  const updateSpecialFeature = (id: string, value: string) => {
    setSpecialFeatures(prev => prev.map(feature => 
      feature.id === id ? { ...feature, value } : feature
    ));
  };

  const updatePackagingData = (field: keyof PackagingData, value: string) => {
    setPackagingData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = (data: InsertProduct) => {
    // Serialize dimensions
    const dimensionsObject = dimensions.reduce((acc, dim) => {
      if (dim.name && dim.value) {
        acc[dim.name] = dim.value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    // Serialize certifications
    const certificationsArray = certifications
      .map(cert => cert.value)
      .filter(value => value.trim() !== '');

    // Serialize markings
    const markingsArray = markings
      .map(marking => marking.value)
      .filter(value => value.trim() !== '');

    // Serialize special features
    const specialFeaturesArray = specialFeatures
      .map(feature => feature.value)
      .filter(value => value.trim() !== '');

    // Serialize packaging data
    const packagingObject = {
      unitsPerPallet: packagingData.unitsPerPallet ? parseInt(packagingData.unitsPerPallet) : undefined,
      unitsPerTruck: packagingData.unitsPerTruck ? parseInt(packagingData.unitsPerTruck) : undefined,
      palletDimensions: packagingData.palletDimensions || undefined,
      stackHeight: packagingData.stackHeight ? parseInt(packagingData.stackHeight) : undefined,
    };
    
    // Remove undefined values from packaging object
    const cleanPackagingObject = Object.fromEntries(
      Object.entries(packagingObject).filter(([_, value]) => value !== undefined)
    );

    const finalData = {
      ...data,
      dimensions: JSON.stringify(dimensionsObject),
      certifications: JSON.stringify(certificationsArray),
      markings: JSON.stringify(markingsArray),
      specialFeatures: JSON.stringify(specialFeaturesArray),
      packaging: Object.keys(cleanPackagingObject).length > 0 ? JSON.stringify(cleanPackagingObject) : '',
      productImage: productImage || '',
      technicalDrawing: technicalDrawing || '',
    };

    console.log('Form submitted with data:', finalData);
    onSave?.(finalData);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    onCancel?.();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {product ? 'Editar Produto' : 'Criar Novo Produto'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {product 
              ? 'Actualizar informações do produto e especificações técnicas' 
              : 'Inserir informações detalhadas do novo produto incluindo especificações e certificações'
            }
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-11">
                <TabsTrigger value="basic" className="font-medium">Informação Básica</TabsTrigger>
                <TabsTrigger value="technical" className="font-medium">Detalhes Técnicos</TabsTrigger>
                <TabsTrigger value="specs" className="font-medium">Especificações</TabsTrigger>
                <TabsTrigger value="packaging" className="font-medium">Embalagem e Notas</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                {/* Product Identification Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Identificação do Produto</h3>
                    <p className="text-sm text-muted-foreground mt-1">Informações básicas do produto e códigos de identificação</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-sm font-medium text-foreground">Modelo *</Label>
                      <Input
                        id="model"
                        {...form.register('model')}
                        data-testid="input-model"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Identificador do modelo do produto</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productCode" className="text-sm font-medium text-foreground">Código do Produto *</Label>
                      <Input
                        id="productCode"
                        {...form.register('productCode')}
                        data-testid="input-product-code"
                        className="h-9 font-mono"
                      />
                      <p className="text-xs text-muted-foreground">Código único de identificação do produto</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product" className="text-sm font-medium text-foreground">Nome do Produto *</Label>
                      <Input
                        id="product"
                        {...form.register('product')}
                        data-testid="input-product-name"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Nome completo ou descrição do produto</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rawMaterial" className="text-sm font-medium text-foreground">Material de Base *</Label>
                      <Input
                        id="rawMaterial"
                        {...form.register('rawMaterial')}
                        placeholder="ex.: PEAD"
                        data-testid="input-raw-material"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Composição principal do material</p>
                    </div>
                  </div>
                </div>

                {/* Product Classification Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Classificação do Produto</h3>
                    <p className="text-sm text-muted-foreground mt-1">Classificação por categoria e tipo</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="family" className="text-sm font-medium text-foreground">Família *</Label>
                      <Select
                        value={form.watch('family')}
                        onValueChange={(value) => form.setValue('family', value)}
                      >
                        <SelectTrigger data-testid="select-family" className="h-9">
                          <SelectValue placeholder="Seleccionar família do produto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Embalagem">Embalagem</SelectItem>
                          <SelectItem value="Container">Container</SelectItem>
                          <SelectItem value="Bottle">Garrafa</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Família ou categoria do produto</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium text-foreground">Tipo *</Label>
                      <Select
                        value={form.watch('type')}
                        onValueChange={(value) => form.setValue('type', value)}
                      >
                        <SelectTrigger data-testid="select-type" className="h-9">
                          <SelectValue placeholder="Seleccionar tipo de produto" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boca Estreita">Boca Estreita</SelectItem>
                          <SelectItem value="Boca Larga">Boca Larga</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Tipo específico ou variante do produto</p>
                    </div>
                  </div>
                </div>

                {/* Capacity & Appearance Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Capacidade e Aparência</h3>
                    <p className="text-sm text-muted-foreground mt-1">Especificações de volume e cores disponíveis</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nominalCapacity" className="text-sm font-medium text-foreground">Capacidade Nominal *</Label>
                      <Input
                        id="nominalCapacity"
                        {...form.register('nominalCapacity')}
                        placeholder="ex.: 15L"
                        data-testid="input-nominal-capacity"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Capacidade nominal padrão</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalCapacity" className="text-sm font-medium text-foreground">Capacidade Total</Label>
                      <Input
                        id="totalCapacity"
                        {...form.register('totalCapacity')}
                        placeholder="ex.: 17,8L"
                        data-testid="input-total-capacity"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Capacidade máxima quando cheio até ao bordo</p>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="colors" className="text-sm font-medium text-foreground">Cores Disponíveis *</Label>
                      <Input
                        id="colors"
                        {...form.register('colors')}
                        placeholder="ex.: Branco, Azul, Verde (separados por vírgula)"
                        data-testid="input-colors"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Listar todas as opções de cor disponíveis, separadas por vírgulas</p>
                    </div>
                  </div>
                </div>

                {/* Product Image Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Imagem do Produto</h3>
                    <p className="text-sm text-muted-foreground mt-1">Imagem principal do produto para visualização e documentação</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <ImageUpload
                        label="Imagem do Produto"
                        description="Carregue uma imagem do produto (JPEG, PNG, GIF, WebP - máx. 10MB)"
                        value={productImage ?? undefined}
                        onChange={setProductImage}
                        disabled={isLoading}
                        data-testid="upload-product-image"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6 mt-6">
                {/* Weight & Physical Properties Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Peso e Propriedades Físicas</h3>
                    <p className="text-sm text-muted-foreground mt-1">Especificações de peso e propriedades do material</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium text-foreground">Peso *</Label>
                      <Input
                        id="weight"
                        {...form.register('weight')}
                        placeholder="ex.: 700g"
                        data-testid="input-weight"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Peso base sem acessórios</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weightWithAccessories" className="text-sm font-medium text-foreground">Peso com Acessórios</Label>
                      <Input
                        id="weightWithAccessories"
                        {...form.register('weightWithAccessories')}
                        placeholder="ex.: 750g"
                        data-testid="input-weight-accessories"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Peso total incluindo todos os acessórios</p>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <div className="flex items-center gap-4">
                        <Switch
                          id="foodContact"
                          checked={form.watch('foodContact') ?? false}
                          onCheckedChange={(checked) => form.setValue('foodContact', checked)}
                          data-testid="switch-food-contact"
                        />
                        <div className="space-y-1">
                          <Label htmlFor="foodContact" className="text-sm font-medium text-foreground">Aprovado para Contacto Alimentar</Label>
                          <p className="text-xs text-muted-foreground">Produto aprovado para contacto directo com alimentos</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Closure & Sealing Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Sistemas de Fecho e Selagem</h3>
                    <p className="text-sm text-muted-foreground mt-1">Mecanismos de fecho e especificações de selagem</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="closingSystem" className="text-sm font-medium text-foreground">Sistema de Fecho</Label>
                      <Input
                        id="closingSystem"
                        {...form.register('closingSystem')}
                        placeholder="ex.: Tampa de Rosca"
                        data-testid="input-closing-system"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Tipo de mecanismo de fecho</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sealingType" className="text-sm font-medium text-foreground">Tipo de Selagem</Label>
                      <Input
                        id="sealingType"
                        {...form.register('sealingType')}
                        placeholder="ex.: PEAD, EPDM"
                        data-testid="input-sealing-type"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Material e método de selagem</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="handlingSystem" className="text-sm font-medium text-foreground">Sistema de Manuseamento</Label>
                      <Input
                        id="handlingSystem"
                        {...form.register('handlingSystem')}
                        placeholder="ex.: Pegas laterais"
                        data-testid="input-handling-system"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Características ergonómicas de manuseamento</p>
                    </div>
                  </div>
                </div>

                {/* Product Dimensions Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Dimensões do Produto</h3>
                        <p className="text-sm text-muted-foreground mt-1">Medições físicas e especificações</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addDimension}
                        data-testid="button-add-dimension"
                        className="h-8"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Dimensão
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {dimensions.map((dimension, index) => (
                      <div key={dimension.id} className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end p-3 border border-border rounded-md">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Nome da Dimensão</Label>
                          <Input
                            placeholder="ex.: altura"
                            value={dimension.name}
                            onChange={(e) => updateDimension(dimension.id, 'name', e.target.value)}
                            data-testid={`input-dimension-name-${index}`}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Valor</Label>
                          <Input
                            placeholder="ex.: 332mm"
                            value={dimension.value}
                            onChange={(e) => updateDimension(dimension.id, 'value', e.target.value)}
                            data-testid={`input-dimension-value-${index}`}
                            className="h-8"
                          />
                        </div>
                        {dimensions.length > 1 && (
                          <div className="lg:col-start-5">
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeDimension(dimension.id)}
                              data-testid={`button-remove-dimension-${index}`}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Drawing Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Desenho Técnico / Blueprint 3D</h3>
                    <p className="text-sm text-muted-foreground mt-1">Desenho técnico ou blueprint 3D para especificações detalhadas</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <ImageUpload
                        label="Desenho Técnico / Blueprint 3D"
                        description="Carregue o desenho técnico ou blueprint 3D do produto (JPEG, PNG, GIF, WebP - máx. 10MB)"
                        value={technicalDrawing ?? undefined}
                        onChange={setTechnicalDrawing}
                        disabled={isLoading}
                        data-testid="upload-technical-drawing"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-6 mt-6">
                {/* Certifications Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Certificações e Conformidade</h3>
                        <p className="text-sm text-muted-foreground mt-1">Certificações de segurança e conformidade regulamentar</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addCertification}
                        data-testid="button-add-certification"
                        className="h-8"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar Certificação
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {certifications.map((certification, index) => (
                      <div key={certification.id} className="flex gap-3 items-center p-3 border border-border rounded-md">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Certificação {index + 1}</Label>
                          <Input
                            placeholder="ex.: ADR 3H1/Y1,9/150"
                            value={certification.value}
                            onChange={(e) => updateCertification(certification.id, e.target.value)}
                            data-testid={`input-certification-${index}`}
                            className="h-8 font-mono"
                          />
                        </div>
                        {certifications.length > 1 && (
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeCertification(certification.id)}
                            data-testid={`button-remove-certification-${index}`}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Markings Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Marcações do Produto</h3>
                    <p className="text-sm text-muted-foreground mt-1">Marcações e etiquetas obrigatórias no produto</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="markings" className="text-sm font-medium text-foreground">Marcações (Formato JSON Array)</Label>
                    <Textarea
                      id="markings"
                      {...form.register('markings')}
                      placeholder='["Datador", "Símbolo SIE", "Capacidade Nominal", "Logo da Empresa"]'
                      data-testid="textarea-markings"
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Inserir marcações como um array JSON. Cada marcação deve estar entre aspas e separadas por vírgulas.</p>
                  </div>
                </div>

                {/* Special Features Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Características Especiais</h3>
                    <p className="text-sm text-muted-foreground mt-1">Características únicas e capacidades do produto</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialFeatures" className="text-sm font-medium text-foreground">Características Especiais (Formato JSON Array)</Label>
                    <Textarea
                      id="specialFeatures"
                      {...form.register('specialFeatures')}
                      placeholder='["Empilhável", "Reciclável", "Reutilizável", "Resistente a UV"]'
                      data-testid="textarea-special-features"
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Listar características especiais como um array JSON. Exemplos: empilhável, reciclável, resistente UV, etc.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="packaging" className="space-y-6 mt-6">
                {/* Packaging Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Embalagem e Logística</h3>
                    <p className="text-sm text-muted-foreground mt-1">Especificações de envio, armazenamento e embalagem</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packaging" className="text-sm font-medium text-foreground">Detalhes de Embalagem (Formato JSON)</Label>
                    <Textarea
                      id="packaging"
                      {...form.register('packaging')}
                      placeholder='{"unitsPerPallet": 105, "unitsPerTruck": 3360, "palletDimensions": "1200x800mm", "stackHeight": 8}'
                      data-testid="textarea-packaging"
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Especificar informações de embalagem em formato JSON. Incluir unidades por palete, capacidade do camião, dimensões, etc.</p>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Informações Adicionais</h3>
                    <p className="text-sm text-muted-foreground mt-1">Notas, comentários e estado do produto</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-foreground">Notas e Comentários</Label>
                      <Textarea
                        id="notes"
                        {...form.register('notes')}
                        placeholder="Notas adicionais, instruções especiais ou informações importantes sobre este produto..."
                        data-testid="textarea-notes"
                        rows={4}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Adicionar notas relevantes, instruções especiais ou informações adicionais</p>
                    </div>

                    <div className="pt-4">
                      <div className="flex items-center gap-4">
                        <Switch
                          id="isActive"
                          checked={form.watch('isActive') ?? true}
                          onCheckedChange={(checked) => form.setValue('isActive', checked)}
                          data-testid="switch-is-active"
                        />
                        <div className="space-y-1">
                          <Label htmlFor="isActive" className="text-sm font-medium text-foreground">Produto está Activo</Label>
                          <p className="text-xs text-muted-foreground">Activar este produto para uso no sistema</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-border">
              <div className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> Campos obrigatórios
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  data-testid="button-cancel"
                  className="min-w-24"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  data-testid="button-save"
                  className="min-w-32 font-medium"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading 
                    ? (product ? 'A actualizar...' : 'A guardar...') 
                    : (product ? 'Actualizar Produto' : 'Guardar Produto')
                  }
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}