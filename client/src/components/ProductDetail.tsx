import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Edit, FileText, ArrowLeft, Calendar, Package, Wrench, Award } from "lucide-react";
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
    return new Date(date).toLocaleDateString('en-US', {
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
      {/* Header */}
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
                  Back
                </Button>
                <Badge variant="secondary">{product.family}</Badge>
                <Badge variant={product.isActive ? "default" : "secondary"}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-product-name">
                  {product.product}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Model {product.model} • {product.type}
                </p>
                <p className="font-mono text-sm" data-testid="text-product-code">
                  {product.productCode}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleEdit} data-testid="button-edit">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                onClick={handleGeneratePDF} 
                disabled={isGeneratingPDF}
                data-testid="button-generate-pdf"
              >
                <FileText className="w-4 h-4 mr-1" />
                {isGeneratingPDF ? 'Generating...' : 'Generate PDF'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="specifications">Specs</TabsTrigger>
          <TabsTrigger value="packaging">Packaging</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Model</p>
                    <p className="font-medium" data-testid="text-detail-model">{product.model}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium" data-testid="text-detail-type">{product.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nominal Capacity</p>
                    <p className="font-medium" data-testid="text-detail-capacity">{product.nominalCapacity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Capacity</p>
                    <p className="font-medium">{product.totalCapacity || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Raw Material</p>
                    <p className="font-medium" data-testid="text-detail-material">{product.rawMaterial}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-medium" data-testid="text-detail-weight">{product.weight}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Available Colors</p>
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

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Dimensions
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
                  <p className="text-muted-foreground">No dimensions specified</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Special Features */}
          {specialFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Special Features</CardTitle>
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

        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Closing System</span>
                    <span className="font-medium">{product.closingSystem || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sealing Type</span>
                    <span className="font-medium">{product.sealingType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Handling System</span>
                    <span className="font-medium">{product.handlingSystem || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight w/ Accessories</span>
                    <span className="font-medium">{product.weightWithAccessories || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Food Contact</span>
                    <Badge variant={product.foodContact ? "default" : "secondary"}>
                      {product.foodContact ? 'Approved' : 'Not Approved'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
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
                  <p className="text-muted-foreground">No certifications specified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Markings & Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {markings.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Product Markings</h4>
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
                  <h4 className="font-medium mb-3">Notes</h4>
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-sm" data-testid="text-notes">{product.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Packaging Information</CardTitle>
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
                <p className="text-muted-foreground">No packaging information specified</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created Date</span>
                  <span className="font-medium" data-testid="text-created-date">
                    {formatDate(product.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium" data-testid="text-updated-date">
                    {formatDate(product.updatedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Product ID</span>
                  <span className="font-mono text-xs">{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? 'Active' : 'Inactive'}
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