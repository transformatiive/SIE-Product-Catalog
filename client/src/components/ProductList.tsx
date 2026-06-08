import { useState, useMemo, Fragment } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Layers, CopyPlus } from "lucide-react";
import { Product } from "@shared/schema";

interface ProductListProps {
  products?: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onCreateNew?: () => void;
  // Add another reference to the same model group (seeded from a representative
  // variant — reuses the clone flow so the new reference never overwrites it).
  onAddVariant?: (representative: Product) => void;
}

type SortColumn = 'productCode' | 'product' | 'model' | 'family' | 'type' | 'nominalCapacity' | 'rawMaterial' | 'isActive' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

const ITEMS_PER_PAGE = 10;
const GROUPS_PER_PAGE = 6;

export default function ProductList({
  products = [],
  loading = false,
  onEdit,
  onDelete,
  onCreateNew,
  onAddVariant,
}: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [groupByModel, setGroupByModel] = useState(false);

  // Filter products based on search query (null-safe)
  const filteredProducts = products.filter(product =>
    (product.productCode ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.product ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.model ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;

    let aValue: any = a[sortColumn];
    let bValue: any = b[sortColumn];

    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    if (sortColumn === 'createdAt') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }

    if (sortColumn === 'isActive') {
      aValue = aValue ? 1 : 0;
      bValue = bValue ? 1 : 0;
    }

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Group by model (group of origin). Each group keeps its variants together.
  const groups = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of sortedProducts) {
      const key = p.model || '—';
      const arr = map.get(key);
      if (arr) arr.push(p);
      else map.set(key, [p]);
    }
    return Array.from(map, ([model, items]) => ({ model, items })).sort((a, b) =>
      a.model.localeCompare(b.model, 'pt', { numeric: true }),
    );
  }, [sortedProducts]);

  // Pagination (by items when flat, by groups when grouped)
  const totalPages = groupByModel
    ? Math.ceil(groups.length / GROUPS_PER_PAGE)
    : Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * (groupByModel ? GROUPS_PER_PAGE : ITEMS_PER_PAGE);
  const currentProducts = sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const currentGroups = groups.slice(startIndex, startIndex + GROUPS_PER_PAGE);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
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
    setCurrentPage(1);
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-3 h-3 ml-1 text-primary" />;
    if (sortDirection === 'desc') return <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
    return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/D';
    return new Date(date).toLocaleDateString();
  };

  const renderRow = (product: Product, index: number) => (
    <TableRow
      key={product.id}
      className={`hover:bg-muted/50 transition-colors ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
    >
      <TableCell className="font-mono font-medium">
        <button
          onClick={() => onEdit?.(product)}
          className="text-primary hover:underline cursor-pointer"
          data-testid={`text-code-${product.id}`}
        >
          {product.productCode}
        </button>
      </TableCell>
      <TableCell className="font-medium">
        <span data-testid={`text-name-${product.id}`}>{product.product}</span>
      </TableCell>
      <TableCell>
        <span data-testid={`text-model-${product.id}`}>{product.model}</span>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border" data-testid={`badge-family-${product.id}`}>
          {product.family}
        </Badge>
      </TableCell>
      <TableCell>
        <span data-testid={`text-type-${product.id}`}>{product.type}</span>
      </TableCell>
      <TableCell className="text-right font-mono">
        <span data-testid={`text-capacity-${product.id}`}>{product.nominalCapacity}</span>
      </TableCell>
      <TableCell>
        <span data-testid={`text-material-${product.id}`}>{product.rawMaterial}</span>
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
      <TableCell className="text-sm text-muted-foreground">{formatDate(product.createdAt)}</TableCell>
      <TableCell className="text-right">
        <div className="flex gap-1 justify-end opacity-60 hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover-elevate" onClick={() => onEdit?.(product)} data-testid={`button-edit-${product.id}`}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover-elevate text-destructive hover:text-destructive" onClick={() => onDelete?.(product)} data-testid={`button-delete-${product.id}`}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const columnHeaders: { key: SortColumn; label: string; align?: string }[] = [
    { key: 'productCode', label: 'Código' },
    { key: 'product', label: 'Produto' },
    { key: 'model', label: 'Modelo' },
    { key: 'family', label: 'Família' },
    { key: 'type', label: 'Tipo' },
    { key: 'nominalCapacity', label: 'Capacidade', align: 'right' },
    { key: 'rawMaterial', label: 'Material' },
    { key: 'isActive', label: 'Estado' },
    { key: 'createdAt', label: 'Criado' },
  ];

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

  const hasRows = groupByModel ? currentGroups.length > 0 : currentProducts.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          {/* Search, group toggle and Create Button */}
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar produtos por código, nome ou modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-products"
              />
            </div>
            <div className="flex items-center gap-2 px-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="group-by-model" className="text-sm whitespace-nowrap">Agrupar por modelo</Label>
              <Switch
                id="group-by-model"
                checked={groupByModel}
                onCheckedChange={(v) => { setGroupByModel(v); setCurrentPage(1); }}
                data-testid="switch-group-by-model"
              />
            </div>
            <Button onClick={() => onCreateNew?.()} data-testid="button-create-new">
              <Plus className="w-4 h-4 mr-1" />
              Novo Produto
            </Button>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <p>
              {groupByModel
                ? `A mostrar ${currentGroups.length} de ${groups.length} modelos`
                : `A mostrar ${currentProducts.length} de ${sortedProducts.length} produtos`}
              {searchQuery && ` para "${searchQuery}"`}
            </p>
            <p>Total: {products.length} produtos</p>
          </div>

          {/* Products Table */}
          {hasRows ? (
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-b hover:bg-transparent">
                    {columnHeaders.map((c) => (
                      <TableHead key={c.key} className={`font-semibold ${c.align === 'right' ? 'text-right' : ''}`}>
                        <button
                          onClick={() => handleSort(c.key)}
                          className={`flex items-center hover:text-primary transition-colors ${c.align === 'right' ? 'justify-end w-full' : ''}`}
                        >
                          {c.label} {getSortIcon(c.key)}
                        </button>
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupByModel
                    ? currentGroups.map((group) => (
                        <Fragment key={`group-${group.model}`}>
                          <TableRow className="bg-muted/40 hover:bg-muted/40 border-t-2">
                            <TableCell colSpan={10} className="py-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Layers className="w-4 h-4 text-primary" />
                                  <span className="font-semibold">Modelo {group.model}</span>
                                  <Badge variant="outline">{group.items[0]?.family}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {group.items.length} referência{group.items.length === 1 ? '' : 's'}
                                  </span>
                                </div>
                                {onAddVariant && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => onAddVariant(group.items[0])}
                                    data-testid={`button-add-variant-${group.model}`}
                                  >
                                    <CopyPlus className="w-3.5 h-3.5" />
                                    Adicionar variante
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                          {group.items.map((p, i) => renderRow(p, i))}
                        </Fragment>
                      ))
                    : currentProducts.map((p, i) => renderRow(p, i))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'Nenhuns produtos encontrados na pesquisa.' : 'Nenhuns produtos encontrados.'}
              </p>
              {!searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => onCreateNew?.()}>
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
