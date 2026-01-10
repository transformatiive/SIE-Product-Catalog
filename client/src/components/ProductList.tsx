import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductListProps {
  products?: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onCreateNew?: () => void;
}

type SortColumn = 'productCode' | 'product' | 'model' | 'family' | 'type' | 'nominalCapacity' | 'rawMaterial' | 'isActive' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

export default function ProductList({ 
  products = [], 
  loading = false,
  onEdit,
  onDelete,
  onCreateNew
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const itemsPerPage = 10;

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;
    
    let aValue: any = a[sortColumn];
    let bValue: any = b[sortColumn];
    
    // Handle null values
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    // Handle dates
    if (sortColumn === 'createdAt') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    
    // Handle booleans
    if (sortColumn === 'isActive') {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }
    
    // Handle strings
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3 ml-1 text-primary" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
    }
    return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
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

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/D';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">A carregar produtos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          {/* Search and Create Button */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar produtos por código, nome ou modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-products"
              />
            </div>
            <Button onClick={handleCreateNew} data-testid="button-create-new">
              <Plus className="w-4 h-4 mr-1" />
              Novo Produto
            </Button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <p>
              A mostrar {currentProducts.length} de {sortedProducts.length} produtos
              {searchQuery && ` para "${searchQuery}"`}
              {sortColumn && sortDirection && ` (ordenado por ${sortColumn === 'productCode' ? 'código' : sortColumn === 'product' ? 'produto' : sortColumn === 'model' ? 'modelo' : sortColumn === 'family' ? 'família' : sortColumn === 'type' ? 'tipo' : sortColumn === 'nominalCapacity' ? 'capacidade' : sortColumn === 'rawMaterial' ? 'material' : sortColumn === 'isActive' ? 'estado' : 'data de criação'} ${sortDirection === 'asc' ? '↑' : '↓'})`}
            </p>
            <p>Total: {products.length} produtos</p>
          </div>

          {/* Products Table */}
          {currentProducts.length > 0 ? (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-b hover:bg-transparent">
                    <TableHead className="font-semibold">
                      <button 
                        onClick={() => handleSort('productCode')} 
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Código {getSortIcon('productCode')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button 
                        onClick={() => handleSort('product')} 
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Produto {getSortIcon('product')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button 
                        onClick={() => handleSort('model')} 
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Modelo {getSortIcon('model')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button 
                        onClick={() => handleSort('family')} 
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Família {getSortIcon('family')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button 
                        onClick={() => handleSort('type')} 
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Tipo {getSortIcon('type')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      <button 
                        onClick={() => handleSort('nominalCapacity')} 
                        className="flex items-center justify-end w-full hover:text-primary transition-colors"
                      >
                        Capacidade {getSortIcon('nominalCapacity')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button 
                        onClick={() => handleSort('rawMaterial')} 
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Material {getSortIcon('rawMaterial')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button 
                        onClick={() => handleSort('isActive')} 
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Estado {getSortIcon('isActive')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold">
                      <button 
                        onClick={() => handleSort('createdAt')} 
                        className="flex items-center hover:text-primary transition-colors"
                      >
                        Criado {getSortIcon('createdAt')}
                      </button>
                    </TableHead>
                    <TableHead className="font-semibold text-right">Ações</TableHead>
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
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary hover:underline cursor-pointer"
                          data-testid={`text-code-${product.id}`}
                        >
                          {product.productCode}
                        </button>
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
                          {product.isActive ? 'Ativo' : 'Inativo'}
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
                            onClick={() => handleEdit(product)}
                            data-testid={`button-edit-${product.id}`}
                          >
                            <Edit className="w-4 h-4" />
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
                {searchQuery ? 'Nenhuns produtos encontrados na pesquisa.' : 'Nenhuns produtos encontrados.'}
              </p>
              {!searchQuery && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreateNew}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Criar Primeiro Produto
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
                Anterior
              </Button>
              
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Seguinte
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}