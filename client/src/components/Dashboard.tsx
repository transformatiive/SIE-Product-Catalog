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
import SearchFilters from './SearchFilters';
import { Product, InsertProduct, ProductSearch } from '@shared/schema';

type ViewMode = 'list' | 'search' | 'form' | 'create';

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [clonedProductData, setClonedProductData] = useState<Partial<InsertProduct> | null>(null);
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
      toast({ title: "Produto eliminado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setCurrentView('list');
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao eliminar produto", 
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
      toast({ title: "Produto criado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setCurrentView('list');
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar produto", 
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
      toast({ title: "Produto atualizado com sucesso" });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setCurrentView('list');
    },
    onError: (error: Error, variables) => {
      // The open record no longer exists (e.g. a stale edit, or it was already
      // replaced by a sibling). Don't lose the user's work or throw a confusing
      // 404 — save it as a NEW reference instead.
      if (/\b404\b|não encontrado/i.test(error.message)) {
        toast({
          title: "Registo já não existia — criada nova referência",
          description: "O produto aberto já não estava na base de dados; os dados foram guardados como uma nova referência.",
        });
        setSelectedProduct(null);
        createProductMutation.mutate(variables.data);
        return;
      }
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
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
    setClonedProductData(null);
    setCurrentView('create');
  };

  const handleCloneProduct = (product: Product) => {
    // Copy all editable fields, excluding unique identifiers
    const clonedData: Partial<InsertProduct> = {
      model: product.model,
      family: product.family,
      type: product.type,
      product: product.product,
      // Exclude: productCode, barcode, designation (unique/auto-generated)
      nominalCapacity: product.nominalCapacity,
      totalCapacity: product.totalCapacity || undefined,
      rawMaterial: product.rawMaterial,
      colors: product.colors,
      weight: product.weight,
      weightWithAccessories: product.weightWithAccessories || undefined,
      dimensions: product.dimensions,
      closingSystem: product.closingSystem || undefined,
      capType: product.capType || undefined,
      capDimensions: product.capDimensions || undefined,
      sealingType: product.sealingType || undefined,
      vedantePead: product.vedantePead || false,
      vedanteEpdm: product.vedanteEpdm || false,
      vedanteOutros: product.vedanteOutros || undefined,
      handlingSystem: product.handlingSystem || undefined,
      pegasLaterais: product.pegasLaterais || false,
      pegaSuperior: product.pegaSuperior || false,
      cavidades: product.cavidades || false,
      manuseamentoOutros: product.manuseamentoOutros || undefined,
      markings: product.markings || undefined,
      datador: product.datador || false,
      simboloSie: product.simboloSie || false,
      simboloMp: product.simboloMp || false,
      gravacaoCliente: product.gravacaoCliente || false,
      visor: product.visor || false,
      bica: product.bica || false,
      coexPoliamida: product.coexPoliamida || false,
      adaptacao: product.adaptacao || false,
      autoculanteCliente: product.autoculanteCliente || undefined,
      especificacoesEmbFlexiveis: product.especificacoesEmbFlexiveis || undefined,
      stackable: product.stackable || false,
      stackingCapacity: product.stackingCapacity || undefined,
      packaging: product.packaging || undefined,
      palletDimensions: product.palletDimensions || undefined,
      productOnPalletDimensions: product.productOnPalletDimensions || undefined,
      arrangementScheme: product.arrangementScheme || undefined,
      totalUnits: product.totalUnits || undefined,
      certifications: product.certifications || undefined,
      foodContact: product.foodContact || false,
      specialFeatures: product.specialFeatures || undefined,
      selectedCertificationTypeId: product.selectedCertificationTypeId || undefined,
      selectedPackagingTypeId: product.selectedPackagingTypeId || undefined,
      selectedSpecificationId: product.selectedSpecificationId || undefined,
      productImage: product.productImage || undefined,
      technicalDrawing: product.technicalDrawing || undefined,
      notes: product.notes || undefined,
    };
    
    setClonedProductData(clonedData);
    setSelectedProduct(null);
    setCurrentView('create');
    toast({ 
      title: "Produto duplicado", 
      description: "Preencha o código do produto e outros campos únicos." 
    });
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
        throw new Error(errorData.message || 'Falhou a gerar PDF');
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
          title: "PDF gerado com sucesso", 
          description: `Ficha técnica para ${product.productCode} foi descarregada.`
        });
      } else {
        toast({ 
          title: "PDF gerado com sucesso", 
          description: "Ficha técnica foi descarregada."
        });
      }
    },
    onError: (error: Error) => {
      console.error('PDF generation error:', error);
      toast({ 
        title: "Erro ao gerar PDF", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleGeneratePDF = (product: Product) => {
    generatePDFMutation.mutate(product.id);
  };

  // Zoho Writer datasheet generation mutation (DOCX based on per-family Zoho template)
  const generateZohoDatasheetMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}/zoho-datasheet`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Falhou a gerar datasheet via Zoho Writer');
      }
      return response.blob();
    },
    onSuccess: (docxBlob, productId) => {
      const product = products.find(p => p.id === productId) ||
                    allProducts.find(p => p.id === productId) ||
                    selectedProduct;

      const url = window.URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${product?.productCode ?? 'produto'}-Datasheet.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Datasheet Zoho gerada com sucesso",
        description: product
          ? `Documento para ${product.productCode} foi descarregado.`
          : "Documento foi descarregado.",
      });
    },
    onError: (error: Error) => {
      console.error('Zoho datasheet generation error:', error);
      toast({
        title: "Erro ao gerar datasheet Zoho",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerateZohoDatasheet = (product: Product) => {
    generateZohoDatasheetMutation.mutate(product.id);
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedProduct(null);
  };

  const style = {
    "--sidebar-width": "14rem",
    "--sidebar-width-icon": "3rem",
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
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onCreateNew={handleCreateNew}
            onAddVariant={handleCloneProduct}
          />
        );
      
      case 'form':
        return (
          <ProductForm
            key={`edit-${selectedProduct?.id}`}
            product={selectedProduct || undefined}
            onSave={handleSaveProduct}
            onSaveAsNew={(data) => createProductMutation.mutate(data)}
            onCancel={handleBack}
            onGeneratePDF={handleGeneratePDF}
            onGenerateZohoDatasheet={handleGenerateZohoDatasheet}
            onClone={handleCloneProduct}
            isLoading={updateProductMutation.isPending}
            isGeneratingPDF={generatePDFMutation.isPending}
            isGeneratingZohoDatasheet={generateZohoDatasheetMutation.isPending}
          />
        );
      
      case 'create':
        return (
          <ProductForm
            key={clonedProductData ? 'clone' : 'new'}
            initialData={clonedProductData || undefined}
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
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-foreground">Gestão Fichas Técnicas de Produtos</h1>
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
              <div className="w-full px-4 py-6">
                {renderCurrentView()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}