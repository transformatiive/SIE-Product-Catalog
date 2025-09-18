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

interface ProductFormProps {
  product?: Product;
  onSave?: (product: InsertProduct) => void;
  onCancel?: () => void;
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

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
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
        return [{ id: 'dim-1', name: 'height', value: '' }];
      }
    }
    return [{ id: 'dim-1', name: 'height', value: '' }];
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

    const finalData = {
      ...data,
      dimensions: JSON.stringify(dimensionsObject),
      certifications: JSON.stringify(certificationsArray),
    };

    console.log('Form submitted with data:', finalData);
    onSave?.(finalData);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    onCancel?.();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {product ? 'Edit Product' : 'Create New Product'}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="packaging">Packaging</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      {...form.register('model')}
                      data-testid="input-model"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productCode">Product Code *</Label>
                    <Input
                      id="productCode"
                      {...form.register('productCode')}
                      data-testid="input-product-code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="family">Family *</Label>
                    <Select
                      value={form.watch('family')}
                      onValueChange={(value) => form.setValue('family', value)}
                    >
                      <SelectTrigger data-testid="select-family">
                        <SelectValue placeholder="Select family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Embalagem">Embalagem</SelectItem>
                        <SelectItem value="Container">Container</SelectItem>
                        <SelectItem value="Bottle">Bottle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={form.watch('type')}
                      onValueChange={(value) => form.setValue('type', value)}
                    >
                      <SelectTrigger data-testid="select-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Boca Estreita">Boca Estreita</SelectItem>
                        <SelectItem value="Boca Larga">Boca Larga</SelectItem>
                        <SelectItem value="Standard">Standard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product">Product Name *</Label>
                    <Input
                      id="product"
                      {...form.register('product')}
                      data-testid="input-product-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rawMaterial">Raw Material *</Label>
                    <Input
                      id="rawMaterial"
                      {...form.register('rawMaterial')}
                      placeholder="e.g., PEAD"
                      data-testid="input-raw-material"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nominalCapacity">Nominal Capacity *</Label>
                    <Input
                      id="nominalCapacity"
                      {...form.register('nominalCapacity')}
                      placeholder="e.g., 15L"
                      data-testid="input-nominal-capacity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalCapacity">Total Capacity</Label>
                    <Input
                      id="totalCapacity"
                      {...form.register('totalCapacity')}
                      placeholder="e.g., 17.8L"
                      data-testid="input-total-capacity"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colors">Colors *</Label>
                  <Input
                    id="colors"
                    {...form.register('colors')}
                    placeholder="e.g., Branco, Azul (comma-separated)"
                    data-testid="input-colors"
                  />
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight *</Label>
                    <Input
                      id="weight"
                      {...form.register('weight')}
                      placeholder="e.g., 700g"
                      data-testid="input-weight"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weightWithAccessories">Weight with Accessories</Label>
                    <Input
                      id="weightWithAccessories"
                      {...form.register('weightWithAccessories')}
                      placeholder="e.g., 750g"
                      data-testid="input-weight-accessories"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closingSystem">Closing System</Label>
                    <Input
                      id="closingSystem"
                      {...form.register('closingSystem')}
                      placeholder="e.g., Tampa de Rosca"
                      data-testid="input-closing-system"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sealingType">Sealing Type</Label>
                    <Input
                      id="sealingType"
                      {...form.register('sealingType')}
                      placeholder="e.g., PEAD, EPDM"
                      data-testid="input-sealing-type"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="handlingSystem">Handling System</Label>
                    <Input
                      id="handlingSystem"
                      {...form.register('handlingSystem')}
                      placeholder="e.g., Pegas laterais"
                      data-testid="input-handling-system"
                    />
                  </div>

                  <div className="space-y-2 flex items-center gap-2">
                    <Switch
                      id="foodContact"
                      checked={form.watch('foodContact') ?? false}
                      onCheckedChange={(checked) => form.setValue('foodContact', checked)}
                      data-testid="switch-food-contact"
                    />
                    <Label htmlFor="foodContact">Food Contact Approved</Label>
                  </div>
                </div>

                {/* Dynamic Dimensions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Dimensions</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addDimension}
                      data-testid="button-add-dimension"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Dimension
                    </Button>
                  </div>
                  {dimensions.map((dimension, index) => (
                    <div key={dimension.id} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Name (e.g., height)"
                          value={dimension.name}
                          onChange={(e) => updateDimension(dimension.id, 'name', e.target.value)}
                          data-testid={`input-dimension-name-${index}`}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Value (e.g., 332mm)"
                          value={dimension.value}
                          onChange={(e) => updateDimension(dimension.id, 'value', e.target.value)}
                          data-testid={`input-dimension-value-${index}`}
                        />
                      </div>
                      {dimensions.length > 1 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeDimension(dimension.id)}
                          data-testid={`button-remove-dimension-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="space-y-4">
                {/* Dynamic Certifications */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Certifications</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addCertification}
                      data-testid="button-add-certification"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Certification
                    </Button>
                  </div>
                  {certifications.map((certification, index) => (
                    <div key={certification.id} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="e.g., ADR 3H1/Y1,9/150"
                          value={certification.value}
                          onChange={(e) => updateCertification(certification.id, e.target.value)}
                          data-testid={`input-certification-${index}`}
                        />
                      </div>
                      {certifications.length > 1 && (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeCertification(certification.id)}
                          data-testid={`button-remove-certification-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="markings">Markings (JSON array format)</Label>
                  <Textarea
                    id="markings"
                    {...form.register('markings')}
                    placeholder='["Datador", "Símbolo SIE", "Capacidade Nominal"]'
                    data-testid="textarea-markings"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialFeatures">Special Features (JSON array format)</Label>
                  <Textarea
                    id="specialFeatures"
                    {...form.register('specialFeatures')}
                    placeholder='["Empilhável", "Reciclável", "Reutilizável"]'
                    data-testid="textarea-special-features"
                  />
                </div>
              </TabsContent>

              <TabsContent value="packaging" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="packaging">Packaging Details (JSON format)</Label>
                  <Textarea
                    id="packaging"
                    {...form.register('packaging')}
                    placeholder='{"unitsPerPallet": 105, "unitsPerTruck": 3360, "palletDimensions": "1200x800mm"}'
                    data-testid="textarea-packaging"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...form.register('notes')}
                    placeholder="Additional notes or comments..."
                    data-testid="textarea-notes"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={form.watch('isActive') ?? true}
                    onCheckedChange={(checked) => form.setValue('isActive', checked)}
                    data-testid="switch-is-active"
                  />
                  <Label htmlFor="isActive">Product is Active</Label>
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex gap-2 pt-6">
              <Button type="submit" data-testid="button-save">
                <Save className="w-4 h-4 mr-1" />
                Save Product
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                data-testid="button-cancel"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}