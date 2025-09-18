import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import SearchFilters from './SearchFilters';
import { Product, InsertProduct, ProductSearch } from '@shared/schema';

type ViewMode = 'list' | 'search' | 'detail' | 'form' | 'create';

interface DashboardProps {
  initialProducts?: Product[];
}

export default function Dashboard({ initialProducts = [] }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('search');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    console.log('Theme toggled:', !isDarkMode ? 'dark' : 'light');
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
    console.log('Delete product:', product.productCode);
    setProducts(prev => prev.filter(p => p.id !== product.id));
    // todo: remove mock functionality - implement actual delete
  };

  const handleCreateNew = () => {
    setSelectedProduct(null);
    setCurrentView('create');
  };

  const handleSaveProduct = (productData: InsertProduct) => {
    console.log('Save product:', productData);
    // todo: remove mock functionality - implement actual save
    
    if (selectedProduct) {
      // Edit existing
      const updated: Product = {
        ...selectedProduct,
        ...productData,
        totalCapacity: productData.totalCapacity || null,
        weightWithAccessories: productData.weightWithAccessories || null,
        closingSystem: productData.closingSystem || null,
        sealingType: productData.sealingType || null,
        handlingSystem: productData.handlingSystem || null,
        certifications: productData.certifications || null,
        markings: productData.markings || null,
        packaging: productData.packaging || null,
        specialFeatures: productData.specialFeatures || null,
        notes: productData.notes || null,
        foodContact: productData.foodContact ?? false,
        isActive: productData.isActive ?? true,
        updatedAt: new Date(),
      };
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updated : p));
    } else {
      // Create new
      const newProduct: Product = {
        ...productData,
        id: `product-${Date.now()}`,
        totalCapacity: productData.totalCapacity || null,
        weightWithAccessories: productData.weightWithAccessories || null,
        closingSystem: productData.closingSystem || null,
        sealingType: productData.sealingType || null,
        handlingSystem: productData.handlingSystem || null,
        certifications: productData.certifications || null,
        markings: productData.markings || null,
        packaging: productData.packaging || null,
        specialFeatures: productData.specialFeatures || null,
        notes: productData.notes || null,
        foodContact: productData.foodContact ?? false,
        isActive: productData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts(prev => [...prev, newProduct]);
    }
    
    setCurrentView('list');
  };

  const handleSearch = (filters: ProductSearch) => {
    console.log('Search with filters:', filters);
    // todo: remove mock functionality - implement actual search
    
    // For now, just switch to list view to show results
    setCurrentView('list');
  };

  const handleGeneratePDF = (product: Product) => {
    console.log('Generate PDF for product:', product.productCode);
    // todo: remove mock functionality - implement PDF generation
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedProduct(null);
  };

  const style = {
    "--sidebar-width": "16rem",
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
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onCreateNew={handleCreateNew}
            onGeneratePDF={handleGeneratePDF}
          />
        );
      
      case 'detail':
        return selectedProduct ? (
          <ProductDetail
            product={selectedProduct}
            onEdit={handleEditProduct}
            onGeneratePDF={handleGeneratePDF}
            onBack={handleBack}
          />
        ) : null;
      
      case 'form':
        return (
          <ProductForm
            product={selectedProduct || undefined}
            onSave={handleSaveProduct}
            onCancel={handleBack}
          />
        );
      
      case 'create':
        return (
          <ProductForm
            onSave={handleSaveProduct}
            onCancel={handleBack}
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
          productCount={products.length}
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
                    <h1 className="text-lg font-semibold text-foreground leading-tight">
                      Product Database
                    </h1>
                    <p className="text-xs text-muted-foreground leading-tight">
                      Industrial Management System
                    </p>
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
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}