import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from '@/lib/queryClient';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import SearchFilters from './SearchFilters';
import { Product, InsertProduct, ProductSearch } from '@shared/schema';

type ViewMode = 'list' | 'search' | 'detail' | 'form' | 'create';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchFilters, setSearchFilters] = useState<ProductSearch>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { toast } = useToast();

  // Fetch products with search filters
  const { data: products = [], isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products', searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.query) params.append('query', searchFilters.query);
      if (searchFilters.productCode) params.append('productCode', searchFilters.productCode);
      if (searchFilters.model) params.append('model', searchFilters.model);
      if (searchFilters.family) params.append('family', searchFilters.family);
      if (searchFilters.type) params.append('type', searchFilters.type);
      if (searchFilters.purchaseDate) params.append('purchaseDate', searchFilters.purchaseDate);
      if (searchFilters.createdAfter) params.append('createdAfter', searchFilters.createdAfter);
      if (searchFilters.createdBefore) params.append('createdBefore', searchFilters.createdBefore);
      
      const url = `/api/products${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  // Product count for sidebar
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest('DELETE', `/api/products/${productId}`);
      return response;
    },
    onSuccess: () => {
      toast({ title: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setCurrentView('list');
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error deleting product", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const response = await apiRequest('POST', '/api/products', productData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Product created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setCurrentView('list');
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error creating product", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: InsertProduct }) => {
      const response = await apiRequest('PUT', `/api/products/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setCurrentView('list');
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error updating product", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('form');
  };

  const handleDeleteProduct = (product: Product) => {
    deleteProductMutation.mutate(product.id);
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setCurrentView('create');
  };

  const handleSaveProduct = (productData: InsertProduct) => {
    if (selectedProduct) {
      // Update existing product
      updateProductMutation.mutate({ id: selectedProduct.id, data: productData });
    } else {
      // Create new product
      createProductMutation.mutate(productData);
    }
  };

  const handleSearch = (filters: ProductSearch) => {
    setSearchFilters(filters);
    setCurrentView('list');
  };

  // PDF generation mutation
  const generatePDFMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}/pdf`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }
      return response.blob();
    },
    onSuccess: (pdfBlob, productId) => {
      // Find the product to get the product code for filename
      const product = products.find(p => p.id === productId) || 
                    allProducts.find(p => p.id === productId) || 
                    selectedProduct;
      
      if (product) {
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${product.productCode}-Datasheet.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({ 
          title: "PDF generated successfully", 
          description: `Datasheet for ${product.productCode} has been downloaded.`
        });
      } else {
        toast({ 
          title: "PDF generated successfully", 
          description: "Technical datasheet has been downloaded."
        });
      }
    },
    onError: (error: Error) => {
      console.error('PDF generation error:', error);
      toast({ 
        title: "Error generating PDF", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleGeneratePDF = (product: Product) => {
    generatePDFMutation.mutate(product.id);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedProduct(null);
  };

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'search':
        return (
          <div className="space-y-6">
            <SearchFilters onSearch={handleSearch} />
          </div>
        );
      
      case 'list':
        return (
          <ProductList
            products={products}
            loading={isLoadingProducts}
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onCreateNew={handleCreateNew}
            onGeneratePDF={handleGeneratePDF}
            isGeneratingPDF={generatePDFMutation.isPending}
          />
        );
      
      case 'detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onEdit={handleEditProduct}
            onGeneratePDF={handleGeneratePDF}
            onBack={handleBack}
            isGeneratingPDF={generatePDFMutation.isPending}
          />
        ) : null;
      
      case 'form':
        return (
          <ProductForm
            product={selectedProduct || undefined}
            onSave={handleSaveProduct}
            onCancel={handleBack}
            isLoading={updateProductMutation.isPending}
          />
        );
      
      case 'create':
        return (
          <ProductForm
            onSave={handleSaveProduct}
            onCancel={handleBack}
            isLoading={createProductMutation.isPending}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          productCount={allProducts.length}
        />
        
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger 
                  className="hover-elevate" 
                  data-testid="button-sidebar-toggle" 
                />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">PD</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-foreground">Base de Dados de Produtos</h1>
                    <p className="text-sm text-muted-foreground">Gerir o seu catálogo de produtos</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="hover-elevate"
                  data-testid="button-theme-toggle"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-hidden bg-background">
            <div className="h-full overflow-y-auto">
              <div className="container mx-auto px-6 py-8 max-w-7xl">
                {renderCurrentView()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}