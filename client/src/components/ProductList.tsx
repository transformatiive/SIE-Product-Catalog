import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, FileText, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductListProps {
  products?: Product[];
  loading?: boolean;
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onCreateNew?: () => void;
  onGeneratePDF?: (product: Product) => void;
}

export default function ProductList({ 
  products = [], 
  loading = false,
  onView,
  onEdit,
  onDelete,
  onCreateNew,
  onGeneratePDF
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleView = (product: Product) => {
    console.log('View product triggered', product.productCode);
    onView?.(product);
  };

  const handleEdit = (product: Product) => {
    console.log('Edit product triggered', product.productCode);
    onEdit?.(product);
  };

  const handleDelete = (product: Product) => {
    console.log('Delete product triggered', product.productCode);
    onDelete?.(product);
  };

  const handleCreateNew = () => {
    console.log('Create new product triggered');
    onCreateNew?.();
  };

  const handleGeneratePDF = (product: Product) => {
    console.log('Generate PDF triggered', product.productCode);
    onGeneratePDF?.(product);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Product Database</CardTitle>
            <Button onClick={handleCreateNew} data-testid="button-create-new">
              <Plus className="w-4 h-4 mr-1" />
              New Product
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by code, name, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-products"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <p>
              Showing {currentProducts.length} of {filteredProducts.length} products
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <p>Total: {products.length} products</p>
          </div>

          {/* Products Table */}
          {currentProducts.length > 0 ? (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-b hover:bg-transparent">
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Product</TableHead>
                    <TableHead className="font-semibold">Model</TableHead>
                    <TableHead className="font-semibold">Family</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold text-right">Capacity</TableHead>
                    <TableHead className="font-semibold">Material</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.map((product, index) => (
                    <TableRow 
                      key={product.id} 
                      className={`hover:bg-muted/50 transition-colors ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      }`}
                    >
                      <TableCell className="font-mono font-medium">
                        <span data-testid={`text-code-${product.id}`}>
                          {product.productCode}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <span data-testid={`text-name-${product.id}`}>
                          {product.product}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span data-testid={`text-model-${product.id}`}>
                          {product.model}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="bg-muted/50 text-muted-foreground border-border"
                          data-testid={`badge-family-${product.id}`}
                        >
                          {product.family}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span data-testid={`text-type-${product.id}`}>
                          {product.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        <span data-testid={`text-capacity-${product.id}`}>
                          {product.nominalCapacity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span data-testid={`text-material-${product.id}`}>
                          {product.rawMaterial}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={product.isActive ? "default" : "secondary"}
                          className={product.isActive ? "bg-success text-success-foreground" : ""}
                          data-testid={`badge-status-${product.id}`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(product.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end opacity-60 hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover-elevate"
                            onClick={() => handleView(product)}
                            data-testid={`button-view-${product.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover-elevate"
                            onClick={() => handleEdit(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover-elevate"
                            onClick={() => handleGeneratePDF(product)}
                            data-testid={`button-pdf-${product.id}`}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 hover-elevate text-destructive hover:text-destructive"
                            onClick={() => handleDelete(product)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No products found matching your search.' : 'No products found.'}
              </p>
              {!searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreateNew}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create First Product
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}