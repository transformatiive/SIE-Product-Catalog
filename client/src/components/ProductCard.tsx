import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onGeneratePDF?: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  onEdit, 
  onDelete, 
  onGeneratePDF 
}: ProductCardProps) {
  const handleEdit = () => {
    console.log('Edit product triggered', product.productCode);
    onEdit?.(product);
  };

  const handleDelete = () => {
    console.log('Delete product triggered', product.productCode);
    onDelete?.(product);
  };

  const handleGeneratePDF = () => {
    console.log('Generate PDF triggered', product.productCode);
    onGeneratePDF?.(product);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base truncate" data-testid={`text-product-name-${product.id}`}>
              {product.product}
            </h3>
            <p className="text-sm text-muted-foreground" data-testid={`text-model-${product.id}`}>
              Model {product.model}
            </p>
          </div>
          <Badge variant="secondary" data-testid={`badge-family-${product.id}`}>
            {product.family}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Code</p>
            <p className="font-mono font-medium" data-testid={`text-product-code-${product.id}`}>
              {product.productCode}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium" data-testid={`text-type-${product.id}`}>
              {product.type}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Capacity</p>
            <p className="font-medium" data-testid={`text-capacity-${product.id}`}>
              {product.nominalCapacity}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Material</p>
            <p className="font-medium" data-testid={`text-material-${product.id}`}>
              {product.rawMaterial}
            </p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground text-sm mb-1">Colors</p>
          <div className="flex flex-wrap gap-1">
            {product.colors.split(',').map((color, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {color.trim()}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Created: {formatDate(product.createdAt)}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleEdit}
          data-testid={`button-edit-${product.id}`}
        >
          <Edit className="w-4 h-4 mr-1" />
          Editar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGeneratePDF}
          data-testid={`button-pdf-${product.id}`}
        >
          <FileText className="w-4 h-4 mr-1" />
          PDF
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={handleDelete}
          data-testid={`button-delete-${product.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}