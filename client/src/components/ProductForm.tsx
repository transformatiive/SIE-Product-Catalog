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
    <div className="max-w-6xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {product ? 'Edit Product' : 'Create New Product'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {product 
              ? 'Update product information and technical specifications' 
              : 'Enter detailed information for the new product including specifications and certifications'
            }
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-11">
                <TabsTrigger value="basic" className="font-medium">Basic Information</TabsTrigger>
                <TabsTrigger value="technical" className="font-medium">Technical Details</TabsTrigger>
                <TabsTrigger value="specs" className="font-medium">Specifications</TabsTrigger>
                <TabsTrigger value="packaging" className="font-medium">Packaging & Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                {/* Product Identification Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Product Identification</h3>
                    <p className="text-sm text-muted-foreground mt-1">Basic product information and identification codes</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-sm font-medium text-foreground">Model *</Label>
                      <Input
                        id="model"
                        {...form.register('model')}
                        data-testid="input-model"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Product model identifier</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productCode" className="text-sm font-medium text-foreground">Product Code *</Label>
                      <Input
                        id="productCode"
                        {...form.register('productCode')}
                        data-testid="input-product-code"
                        className="h-9 font-mono"
                      />
                      <p className="text-xs text-muted-foreground">Unique product identification code</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product" className="text-sm font-medium text-foreground">Product Name *</Label>
                      <Input
                        id="product"
                        {...form.register('product')}
                        data-testid="input-product-name"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Full product name or description</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rawMaterial" className="text-sm font-medium text-foreground">Raw Material *</Label>
                      <Input
                        id="rawMaterial"
                        {...form.register('rawMaterial')}
                        placeholder="e.g., PEAD"
                        data-testid="input-raw-material"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Primary material composition</p>
                    </div>
                  </div>
                </div>

                {/* Product Classification Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Product Classification</h3>
                    <p className="text-sm text-muted-foreground mt-1">Category and type classification</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="family" className="text-sm font-medium text-foreground">Family *</Label>
                      <Select
                        value={form.watch('family')}
                        onValueChange={(value) => form.setValue('family', value)}
                      >
                        <SelectTrigger data-testid="select-family" className="h-9">
                          <SelectValue placeholder="Select product family" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Embalagem">Embalagem</SelectItem>
                          <SelectItem value="Container">Container</SelectItem>
                          <SelectItem value="Bottle">Bottle</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Product family or category</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-medium text-foreground">Type *</Label>
                      <Select
                        value={form.watch('type')}
                        onValueChange={(value) => form.setValue('type', value)}
                      >
                        <SelectTrigger data-testid="select-type" className="h-9">
                          <SelectValue placeholder="Select product type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Boca Estreita">Boca Estreita</SelectItem>
                          <SelectItem value="Boca Larga">Boca Larga</SelectItem>
                          <SelectItem value="Standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Specific product type or variant</p>
                    </div>
                  </div>
                </div>

                {/* Capacity & Appearance Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Capacity & Appearance</h3>
                    <p className="text-sm text-muted-foreground mt-1">Volume specifications and available colors</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nominalCapacity" className="text-sm font-medium text-foreground">Nominal Capacity *</Label>
                      <Input
                        id="nominalCapacity"
                        {...form.register('nominalCapacity')}
                        placeholder="e.g., 15L"
                        data-testid="input-nominal-capacity"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Standard capacity rating</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalCapacity" className="text-sm font-medium text-foreground">Total Capacity</Label>
                      <Input
                        id="totalCapacity"
                        {...form.register('totalCapacity')}
                        placeholder="e.g., 17.8L"
                        data-testid="input-total-capacity"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Maximum capacity when filled to the brim</p>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="colors" className="text-sm font-medium text-foreground">Available Colors *</Label>
                      <Input
                        id="colors"
                        {...form.register('colors')}
                        placeholder="e.g., Branco, Azul, Verde (comma-separated)"
                        data-testid="input-colors"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">List all available color options, separated by commas</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6 mt-6">
                {/* Weight & Physical Properties Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Weight & Physical Properties</h3>
                    <p className="text-sm text-muted-foreground mt-1">Weight specifications and material properties</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium text-foreground">Weight *</Label>
                      <Input
                        id="weight"
                        {...form.register('weight')}
                        placeholder="e.g., 700g"
                        data-testid="input-weight"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Base weight without accessories</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weightWithAccessories" className="text-sm font-medium text-foreground">Weight with Accessories</Label>
                      <Input
                        id="weightWithAccessories"
                        {...form.register('weightWithAccessories')}
                        placeholder="e.g., 750g"
                        data-testid="input-weight-accessories"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Total weight including all accessories</p>
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
                          <Label htmlFor="foodContact" className="text-sm font-medium text-foreground">Food Contact Approved</Label>
                          <p className="text-xs text-muted-foreground">Product is approved for direct food contact</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Closure & Sealing Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Closure & Sealing Systems</h3>
                    <p className="text-sm text-muted-foreground mt-1">Closure mechanisms and sealing specifications</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="closingSystem" className="text-sm font-medium text-foreground">Closing System</Label>
                      <Input
                        id="closingSystem"
                        {...form.register('closingSystem')}
                        placeholder="e.g., Tampa de Rosca"
                        data-testid="input-closing-system"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Type of closure mechanism</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sealingType" className="text-sm font-medium text-foreground">Sealing Type</Label>
                      <Input
                        id="sealingType"
                        {...form.register('sealingType')}
                        placeholder="e.g., PEAD, EPDM"
                        data-testid="input-sealing-type"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Sealing material and method</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="handlingSystem" className="text-sm font-medium text-foreground">Handling System</Label>
                      <Input
                        id="handlingSystem"
                        {...form.register('handlingSystem')}
                        placeholder="e.g., Pegas laterais"
                        data-testid="input-handling-system"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Ergonomic handling features</p>
                    </div>
                  </div>
                </div>

                {/* Product Dimensions Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Product Dimensions</h3>
                        <p className="text-sm text-muted-foreground mt-1">Physical measurements and specifications</p>
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
                        Add Dimension
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {dimensions.map((dimension, index) => (
                      <div key={dimension.id} className="grid grid-cols-2 lg:grid-cols-5 gap-3 items-end p-3 border border-border rounded-md">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Dimension Name</Label>
                          <Input
                            placeholder="e.g., height"
                            value={dimension.name}
                            onChange={(e) => updateDimension(dimension.id, 'name', e.target.value)}
                            data-testid={`input-dimension-name-${index}`}
                            className="h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Value</Label>
                          <Input
                            placeholder="e.g., 332mm"
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
              </TabsContent>

              <TabsContent value="specs" className="space-y-6 mt-6">
                {/* Certifications Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Certifications & Compliance</h3>
                        <p className="text-sm text-muted-foreground mt-1">Safety certifications and regulatory compliance</p>
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
                        Add Certification
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {certifications.map((certification, index) => (
                      <div key={certification.id} className="flex gap-3 items-center p-3 border border-border rounded-md">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Certification {index + 1}</Label>
                          <Input
                            placeholder="e.g., ADR 3H1/Y1,9/150"
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
                    <h3 className="text-lg font-semibold text-foreground">Product Markings</h3>
                    <p className="text-sm text-muted-foreground mt-1">Required markings and labels on the product</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="markings" className="text-sm font-medium text-foreground">Markings (JSON Array Format)</Label>
                    <Textarea
                      id="markings"
                      {...form.register('markings')}
                      placeholder='["Datador", "Símbolo SIE", "Capacidade Nominal", "Logo da Empresa"]'
                      data-testid="textarea-markings"
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Enter markings as a JSON array. Each marking should be in quotes and separated by commas.</p>
                  </div>
                </div>

                {/* Special Features Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Special Features</h3>
                    <p className="text-sm text-muted-foreground mt-1">Unique product features and capabilities</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialFeatures" className="text-sm font-medium text-foreground">Special Features (JSON Array Format)</Label>
                    <Textarea
                      id="specialFeatures"
                      {...form.register('specialFeatures')}
                      placeholder='["Empilhável", "Reciclável", "Reutilizável", "Resistente a UV"]'
                      data-testid="textarea-special-features"
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">List special features as a JSON array. Examples: stackable, recyclable, UV-resistant, etc.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="packaging" className="space-y-6 mt-6">
                {/* Packaging Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Packaging & Logistics</h3>
                    <p className="text-sm text-muted-foreground mt-1">Shipping, storage, and packaging specifications</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packaging" className="text-sm font-medium text-foreground">Packaging Details (JSON Format)</Label>
                    <Textarea
                      id="packaging"
                      {...form.register('packaging')}
                      placeholder='{"unitsPerPallet": 105, "unitsPerTruck": 3360, "palletDimensions": "1200x800mm", "stackHeight": 8}'
                      data-testid="textarea-packaging"
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Specify packaging information in JSON format. Include units per pallet, truck capacity, dimensions, etc.</p>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                    <p className="text-sm text-muted-foreground mt-1">Notes, comments, and product status</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-foreground">Notes & Comments</Label>
                      <Textarea
                        id="notes"
                        {...form.register('notes')}
                        placeholder="Additional notes, special instructions, or important information about this product..."
                        data-testid="textarea-notes"
                        rows={4}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Add any relevant notes, special instructions, or additional information</p>
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
                          <Label htmlFor="isActive" className="text-sm font-medium text-foreground">Product is Active</Label>
                          <p className="text-xs text-muted-foreground">Enable this product for use in the system</p>
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
                <span className="text-destructive">*</span> Required fields
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
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  data-testid="button-save"
                  className="min-w-32 font-medium"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading 
                    ? (product ? 'Updating...' : 'Saving...') 
                    : (product ? 'Update Product' : 'Save Product')
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