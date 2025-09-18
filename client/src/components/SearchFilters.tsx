import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, X, Filter } from "lucide-react";
import { ProductSearch } from "@shared/schema";
import { format } from "date-fns";

interface SearchFiltersProps {
  onSearch?: (filters: ProductSearch) => void;
  onReset?: () => void;
}

export default function SearchFilters({ onSearch, onReset }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<ProductSearch>({
    query: '',
    productCode: '',
    model: '',
    family: '',
    type: '',
    purchaseDate: '',
    createdAfter: '',
    createdBefore: '',
    isActive: undefined,
  });
  
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>();
  const [createdAfter, setCreatedAfter] = useState<Date | undefined>();
  const [createdBefore, setCreatedBefore] = useState<Date | undefined>();

  const handleInputChange = (field: keyof ProductSearch, value: string | boolean | undefined) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleDateChange = (field: 'purchaseDate' | 'createdAfter' | 'createdBefore', date: Date | undefined) => {
    const dateString = date ? date.toISOString().split('T')[0] : '';
    
    if (field === 'purchaseDate') {
      setPurchaseDate(date);
      handleInputChange('purchaseDate', dateString);
    } else if (field === 'createdAfter') {
      setCreatedAfter(date);
      handleInputChange('createdAfter', dateString);
    } else if (field === 'createdBefore') {
      setCreatedBefore(date);
      handleInputChange('createdBefore', dateString);
    }
  };

  const handleSearch = () => {
    console.log('Search triggered with filters:', filters);
    onSearch?.(filters);
  };

  const handleReset = () => {
    console.log('Reset filters triggered');
    const resetFilters = {
      query: '',
      productCode: '',
      model: '',
      family: '',
      type: '',
      purchaseDate: '',
      createdAfter: '',
      createdBefore: '',
      isActive: undefined,
    };
    setFilters(resetFilters);
    setPurchaseDate(undefined);
    setCreatedAfter(undefined);
    setCreatedBefore(undefined);
    onReset?.();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== undefined);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Product Search
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4 mr-1" />
            {isExpanded ? 'Simple' : 'Advanced'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Search Products</Label>
          <Input
            id="search-query"
            placeholder="Search by name, code, or description..."
            value={filters.query || ''}
            onChange={(e) => handleInputChange('query', e.target.value)}
            data-testid="input-search-query"
          />
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product-code">Product Code</Label>
                <Input
                  id="product-code"
                  placeholder="e.g., GRF-1315"
                  value={filters.productCode || ''}
                  onChange={(e) => handleInputChange('productCode', e.target.value)}
                  data-testid="input-product-code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="e.g., 1315"
                  value={filters.model || ''}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  data-testid="input-model"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family">Family</Label>
                <Select
                  value={filters.family || ''}
                  onValueChange={(value) => handleInputChange('family', value === 'all' ? '' : value)}
                >
                  <SelectTrigger data-testid="select-family">
                    <SelectValue placeholder="Select family" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Families</SelectItem>
                    <SelectItem value="Embalagem">Embalagem</SelectItem>
                    <SelectItem value="Container">Container</SelectItem>
                    <SelectItem value="Bottle">Bottle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={filters.type || ''}
                  onValueChange={(value) => handleInputChange('type', value === 'all' ? '' : value)}
                >
                  <SelectTrigger data-testid="select-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Boca Estreita">Boca Estreita</SelectItem>
                    <SelectItem value="Boca Larga">Boca Larga</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.isActive === undefined ? 'all' : filters.isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => {
                    const activeValue = value === 'all' ? undefined : value === 'active';
                    handleInputChange('isActive', activeValue);
                  }}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date (for matching)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-purchase-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {purchaseDate ? format(purchaseDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={purchaseDate}
                      onSelect={(date) => handleDateChange('purchaseDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Created After</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-created-after"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {createdAfter ? format(createdAfter, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={createdAfter}
                      onSelect={(date) => handleDateChange('createdAfter', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Created Before</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-created-before"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {createdBefore ? format(createdBefore, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={createdBefore}
                      onSelect={(date) => handleDateChange('createdBefore', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleSearch}
            data-testid="button-search"
          >
            <Search className="w-4 h-4 mr-1" />
            Search
          </Button>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              data-testid="button-reset"
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Search Help */}
        {isExpanded && (
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">Date Range Search Logic:</p>
            <p>When you specify a purchase date, the system finds the correct product version by matching it against creation dates. For products with multiple versions, the system shows the version that was active on your purchase date.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}