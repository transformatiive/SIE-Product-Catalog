import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Plus, Trash2, FileText, History, Clock, Link2, Copy } from "lucide-react";
import { InsertProduct, insertProductSchema, Product, ProductVersion } from "@shared/schema";
import ImageUpload from "./ImageUpload";
import { SearchableSelect } from "./SearchableSelect";
import { ShareLinksManager } from "./ShareLinksManager";
import { queryClient } from "@/lib/queryClient";

interface ProductFormProps {
  product?: Product;
  initialData?: Partial<InsertProduct>;
  onSave?: (product: InsertProduct) => void;
  onCancel?: () => void;
  onGeneratePDF?: (product: Product) => void;
  onClone?: (product: Product) => void;
  isLoading?: boolean;
  isGeneratingPDF?: boolean;
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

interface MarkingField {
  id: string;
  value: string;
}

interface SpecialFeatureField {
  id: string;
  value: string;
}

interface PackagingData {
  unitsPerPallet: string;
  unitsPerTruck: string;
  palletDimensions: string;
  stackHeight: string;
}

export default function ProductForm({ product, initialData, onSave, onCancel, onGeneratePDF, onClone, isLoading = false, isGeneratingPDF = false }: ProductFormProps) {
  // Use initialData for cloning when no product is provided
  const sourceData = product || initialData;
  const { data: familyOptions = [], isLoading: familiesLoading } = useQuery<{id: string, code: string, description: string}[]>({
    queryKey: ['/api/admin/families'],
  });

  const { data: productTypeOptions = [], isLoading: productTypesLoading } = useQuery<{id: string, code: string, description: string}[]>({
    queryKey: ['/api/admin/productTypes'],
  });

  const { data: rawMaterialOptions = [], isLoading: rawMaterialsLoading } = useQuery<{id: string, code: string, description: string}[]>({
    queryKey: ['/api/admin/rawMaterials'],
  });

  const { data: closingSystemOptions = [], isLoading: closingSystemsLoading } = useQuery<{id: string, code: string, description: string}[]>({
    queryKey: ['/api/admin/closingSystems'],
  });

  const { data: modelOptions = [] } = useQuery<{id: string, code: string, displayCode: string, description: string}[]>({
    queryKey: ['/api/admin/models'],
  });

  const { data: specificationOptions = [] } = useQuery<{id: string, code: string, displayCode: string, description: string}[]>({
    queryKey: ['/api/admin/specifications'],
  });

  const { data: capacityOptions = [] } = useQuery<{id: string, code: string, description: string}[]>({
    queryKey: ['/api/admin/capacities'],
  });

  const { data: colorOptions = [] } = useQuery<{id: string, code: string, description: string}[]>({
    queryKey: ['/api/admin/colors'],
  });

  const { data: capSizeOptions = [] } = useQuery<{id: string, code: string, description: string}[]>({
    queryKey: ['/api/admin/capSizes'],
  });

  const { data: certificationTypeOptions = [] } = useQuery<{id: string, code: string, description: string, abbreviation?: string, shortCode?: string}[]>({
    queryKey: ['/api/admin/certificationTypes'],
  });

  const { data: packagingTypeOptions = [] } = useQuery<{id: string, code: string, description: string, abbreviation?: string, shortCode?: string}[]>({
    queryKey: ['/api/admin/packagingTypes'],
  });

  const { data: dimensionTypeOptions = [], isLoading: dimensionTypesLoading } = useQuery<{id: string, code: string, description: string}[]>({
    queryKey: ['/api/admin/dimensionTypes'],
  });

  const { data: productVersions = [] } = useQuery<ProductVersion[]>({
    queryKey: ['/api/products', product?.id, 'versions'],
    enabled: !!product?.id,
  });

  const [dimensions, setDimensions] = useState<DimensionField[]>(() => {
    const dims = product?.dimensions || initialData?.dimensions;
    if (dims) {
      try {
        const parsed = JSON.parse(dims);
        return Object.entries(parsed).map(([name, value], index) => ({
          id: `dim-${index}`,
          name,
          value: String(value),
        }));
      } catch {
        return [{ id: 'dim-1', name: 'altura', value: '' }];
      }
    }
    return [{ id: 'dim-1', name: 'altura', value: '' }];
  });

  const [certifications, setCertifications] = useState<CertificationField[]>(() => {
    const certs = product?.certifications || initialData?.certifications;
    if (certs) {
      try {
        const parsed = JSON.parse(certs);
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

  const [markings, setMarkings] = useState<MarkingField[]>(() => {
    const marks = product?.markings || initialData?.markings;
    if (marks) {
      try {
        const parsed = JSON.parse(marks);
        return parsed.map((marking: string, index: number) => ({
          id: `marking-${index}`,
          value: marking,
        }));
      } catch {
        return [{ id: 'marking-1', value: '' }];
      }
    }
    return [{ id: 'marking-1', value: '' }];
  });

  const [specialFeatures, setSpecialFeatures] = useState<SpecialFeatureField[]>(() => {
    const features = product?.specialFeatures || initialData?.specialFeatures;
    if (features) {
      try {
        const parsed = JSON.parse(features);
        return parsed.map((feature: string, index: number) => ({
          id: `feature-${index}`,
          value: feature,
        }));
      } catch {
        return [{ id: 'feature-1', value: '' }];
      }
    }
    return [{ id: 'feature-1', value: '' }];
  });

  const [packagingData, setPackagingData] = useState<PackagingData>(() => {
    const pkg = product?.packaging || initialData?.packaging;
    if (pkg) {
      try {
        const parsed = JSON.parse(pkg);
        return {
          unitsPerPallet: parsed.unitsPerPallet?.toString() || '',
          unitsPerTruck: parsed.unitsPerTruck?.toString() || '',
          palletDimensions: parsed.palletDimensions || '',
          stackHeight: parsed.stackHeight?.toString() || '',
        };
      } catch {
        return {
          unitsPerPallet: '',
          unitsPerTruck: '',
          palletDimensions: '',
          stackHeight: '',
        };
      }
    }
    return {
      unitsPerPallet: '',
      unitsPerTruck: '',
      palletDimensions: '',
      stackHeight: '',
    };
  });

  const [productImage, setProductImage] = useState<string | null>(product?.productImage || initialData?.productImage || null);
  const [technicalDrawing, setTechnicalDrawing] = useState<string | null>(product?.technicalDrawing || initialData?.technicalDrawing || null);
  const [palletizationImage, setPalletizationImage] = useState<string | null>(product?.palletizationImage || initialData?.palletizationImage || null);
  
  // Track if user has manually edited the productCode field
  const [productCodeManuallyEdited, setProductCodeManuallyEdited] = useState(false);

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      model: sourceData?.model || '',
      family: sourceData?.family || '',
      type: sourceData?.type || '',
      product: sourceData?.product || '',
      // When cloning (initialData provided), leave unique identifiers empty
      productCode: product?.productCode || '',
      designation: product?.designation || '',
      barcode: product?.barcode || '',
      nominalCapacity: sourceData?.nominalCapacity || '',
      totalCapacity: sourceData?.totalCapacity || '',
      rawMaterial: sourceData?.rawMaterial || '',
      colors: sourceData?.colors || '',
      weight: sourceData?.weight || '',
      weightWithAccessories: sourceData?.weightWithAccessories || '',
      dimensions: sourceData?.dimensions || '',
      closingSystem: sourceData?.closingSystem || '',
      capType: sourceData?.capType || '',
      capDimensions: sourceData?.capDimensions || '',
      sealingType: sourceData?.sealingType || '',
      vedantePead: sourceData?.vedantePead ?? false,
      vedanteEpdm: sourceData?.vedanteEpdm ?? false,
      vedanteOutros: sourceData?.vedanteOutros || '',
      handlingSystem: sourceData?.handlingSystem || '',
      pegasLaterais: sourceData?.pegasLaterais ?? false,
      pegaSuperior: sourceData?.pegaSuperior ?? false,
      cavidades: sourceData?.cavidades ?? false,
      manuseamentoOutros: sourceData?.manuseamentoOutros || '',
      certifications: sourceData?.certifications || '',
      markings: sourceData?.markings || '',
      datador: sourceData?.datador ?? false,
      simboloSie: sourceData?.simboloSie ?? false,
      simboloMp: sourceData?.simboloMp ?? false,
      gravacaoCliente: sourceData?.gravacaoCliente ?? false,
      visor: sourceData?.visor ?? false,
      bica: sourceData?.bica ?? false,
      coexPoliamida: sourceData?.coexPoliamida ?? false,
      adaptacao: sourceData?.adaptacao ?? false,
      autoculanteCliente: sourceData?.autoculanteCliente || '',
      especificacoesEmbFlexiveis: sourceData?.especificacoesEmbFlexiveis || '',
      foodContact: sourceData?.foodContact ?? false,
      stackable: sourceData?.stackable ?? false,
      stackingCapacity: sourceData?.stackingCapacity || '',
      packaging: sourceData?.packaging || '',
      palletDimensions: sourceData?.palletDimensions || '',
      productOnPalletDimensions: sourceData?.productOnPalletDimensions || '',
      arrangementScheme: sourceData?.arrangementScheme || '',
      totalUnits: sourceData?.totalUnits || '',
      specialFeatures: sourceData?.specialFeatures || '',
      productImage: sourceData?.productImage || '',
      technicalDrawing: sourceData?.technicalDrawing || '',
      palletizationImage: sourceData?.palletizationImage || '',
      notes: sourceData?.notes || '',
      isActive: product?.isActive ?? true,
    },
  });

  // State for additional selections needed for auto-generation (stores description value)
  // Initialize from product data if editing, otherwise use first available option after data loads
  const [selectedCertification, setSelectedCertification] = useState<string>('');
  const [selectedPackaging, setSelectedPackaging] = useState<string>('');
  const [selectedSpecification, setSelectedSpecification] = useState<string>('');
  const [initializedFromProduct, setInitializedFromProduct] = useState(false);

  // Initialize selections from saved product data or default to first option
  // Works with partially loaded or empty support tables
  useEffect(() => {
    if (initializedFromProduct) return;
    
    // Initialize certification if options available
    if (certificationTypeOptions.length > 0) {
      if (product?.selectedCertificationTypeId) {
        const saved = certificationTypeOptions.find(ct => ct.id === product.selectedCertificationTypeId);
        setSelectedCertification(saved?.description || certificationTypeOptions[0].description);
      } else if (!selectedCertification) {
        setSelectedCertification(certificationTypeOptions[0].description);
      }
    }

    // Initialize packaging if options available
    if (packagingTypeOptions.length > 0) {
      if (product?.selectedPackagingTypeId) {
        const saved = packagingTypeOptions.find(pt => pt.id === product.selectedPackagingTypeId);
        setSelectedPackaging(saved?.description || packagingTypeOptions[0].description);
      } else if (!selectedPackaging) {
        setSelectedPackaging(packagingTypeOptions[0].description);
      }
    }

    // Initialize specification if options available
    if (specificationOptions.length > 0) {
      if (product?.selectedSpecificationId) {
        const saved = specificationOptions.find(s => s.id === product.selectedSpecificationId);
        setSelectedSpecification(saved?.description || specificationOptions[0].description);
      } else if (!selectedSpecification) {
        setSelectedSpecification(specificationOptions[0].description);
      }
    }

    // Mark as initialized once we've attempted initialization (even if some options are empty)
    setInitializedFromProduct(true);
  }, [certificationTypeOptions, packagingTypeOptions, specificationOptions, initializedFromProduct, product, selectedCertification, selectedPackaging, selectedSpecification]);

  // Watch form values for auto-generation
  const watchedProductType = form.watch('type');
  const watchedCapacity = form.watch('nominalCapacity');
  const watchedModel = form.watch('model');
  const watchedColors = form.watch('colors');
  const watchedCapDimensions = form.watch('capDimensions');
  const watchedRawMaterial = form.watch('rawMaterial');
  const watchedClosingSystem = form.watch('closingSystem');
  
  // Watch auto-generated fields for display
  const watchedBarcode = form.watch('barcode');
  const watchedProductCode = form.watch('productCode');
  const watchedDesignation = form.watch('designation');

  // Auto-generate barcode, productCode (reference), and designation
  // Runs for both new and existing products based on form values
  // Now shows partial generation with placeholders for missing values
  useEffect(() => {
    // Skip until selections are initialized
    if (!initializedFromProduct) {
      console.log('Auto-generation skipped: not initialized yet');
      return;
    }
    
    console.log('Auto-generation running with:', {
      selectedCertification,
      selectedPackaging,
      selectedSpecification,
      watchedProductType,
      watchedModel,
      watchedColors
    });
    
    // Find matching options from support tables
    const productType = productTypeOptions.find(pt => pt.code === watchedProductType || pt.description === watchedProductType);
    const capacity = capacityOptions.find(c => c.code === watchedCapacity || c.description === watchedCapacity);
    const model = modelOptions.find(m => m.code === watchedModel || m.displayCode === watchedModel || m.description === watchedModel);
    const color = colorOptions.find(c => c.code === watchedColors || c.description === watchedColors);
    const capSize = capSizeOptions.find(cs => cs.code === watchedCapDimensions || cs.description === watchedCapDimensions);
    const rawMaterial = rawMaterialOptions.find(rm => rm.code === watchedRawMaterial || rm.description === watchedRawMaterial);
    const closingSystem = closingSystemOptions.find(cs => cs.code === watchedClosingSystem || cs.description === watchedClosingSystem);
    
    // Find selected certification, packaging, and specification by description (SearchableSelect stores descriptions)
    const certification = certificationTypeOptions.find(ct => ct.description === selectedCertification) || certificationTypeOptions[0];
    const packaging = packagingTypeOptions.find(pt => pt.description === selectedPackaging) || packagingTypeOptions[0];
    const specification = specificationOptions.find(s => s.description === selectedSpecification) || specificationOptions[0];
    
    console.log('Resolved options:', { certification, packaging, specification });

    // Generate Código de Barras (barcode) - show partial with XX for missing values
    // Format: PRODUTO(2) + CAPACIDADE(2) + MODELO(3) + CORANTE(2) + MEDIDA_TAMPA(2) + CERTIFICAÇÃO(1) + EMBALAMENTO(1) + ESPECIFICAÇÕES(5)
    // Always generate barcode with placeholders for missing values
    const barcode = [
      productType ? (productType.code || '').padStart(2, '0') : 'XX',      // 2 digits
      capacity ? (capacity.code || '').padStart(2, '0') : 'XX',           // 2 digits
      model ? (model.code || '').padStart(3, '0') : 'XXX',                // 3 digits
      color ? (color.code || '').padStart(2, '0') : 'XX',                 // 2 digits
      capSize ? (capSize.code || '').padStart(2, '0') : 'XX',             // 2 digits
      certification ? (certification.code || '').slice(-1) || 'X' : 'X',          // 1 digit (last char)
      packaging ? (packaging.code || '').slice(-1) || 'X' : 'X',                  // 1 digit (last char)
      specification ? (specification.code || '').padStart(5, '0') : 'XXXXX', // 5 digits
    ].join('');
    console.log('Generated barcode:', barcode);
    form.setValue('barcode', barcode, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

    // Generate Referência (productCode) - only if not manually edited
    // Format: MODELO_DISPLAY + "." + MATERIA_PRIMA_CODE + "." + CORANTE_CODE + "." + CERT_SHORT + PACK_SHORT + "." + SPEC_DISPLAY
    // Use code as fallback if shortCode not available
    if (!productCodeManuallyEdited) {
      const certShort = certification?.shortCode || certification?.code || '';
      const packShort = packaging?.shortCode || packaging?.code || '';
      const reference = [
        model?.displayCode || model?.code || '[modelo]',
        rawMaterial?.code || '[matéria]',
        color?.code || '[cor]',
        (certShort || '[C]') + (packShort || '[E]'),
        specification?.displayCode || specification?.code || '[espec]',
      ].join('.');
      console.log('Generated reference:', reference);
      form.setValue('productCode', reference, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    } else {
      console.log('Skipping productCode auto-generation: manually edited');
    }

    // Generate Designação - always generate with available parts
    // Format: PRODUTO_NAME + CAPACIDADE_DESC + MODELO_DESC + CORANTE_NAME + SISTEMA_FECHO + MEDIDA_TAMPA_DESC + CERT_ABBREV + PACK_ABBREV + SPEC_DESC
    // Extract color name from description (e.g., "PRETO" from "PRETO - 90 R/G 1162")
    // Use abbreviation, description, or code as fallbacks
    const colorName = color?.description?.split(' - ')[0] || watchedColors || '';
    const certAbbrev = certification?.abbreviation || certification?.description || '';
    const packAbbrev = packaging?.abbreviation || packaging?.description || '';
    const designationParts = [
      productType?.description || watchedProductType || '',
      capacity?.description || watchedCapacity || '',
      model?.description || watchedModel || '',
      colorName,
      closingSystem?.code || watchedClosingSystem || '',
      capSize?.description || watchedCapDimensions || '',
      certAbbrev,
      packAbbrev,
      specification?.description || '',
    ].filter(Boolean);
    
    const designation = designationParts.join(' ');
    console.log('Generated designation:', designation);
    form.setValue('designation', designation, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  }, [
    watchedProductType, watchedCapacity, watchedModel, watchedColors, 
    watchedCapDimensions, watchedRawMaterial, watchedClosingSystem,
    selectedCertification, selectedPackaging, selectedSpecification,
    productTypeOptions, capacityOptions, modelOptions, colorOptions, 
    capSizeOptions, rawMaterialOptions, closingSystemOptions,
    certificationTypeOptions, packagingTypeOptions, specificationOptions,
    form, productCodeManuallyEdited, initializedFromProduct
  ]);

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

  const addMarking = () => {
    const newId = `marking-${Date.now()}`;
    setMarkings(prev => [...prev, { id: newId, value: '' }]);
  };

  const removeMarking = (id: string) => {
    setMarkings(prev => prev.filter(marking => marking.id !== id));
  };

  const updateMarking = (id: string, value: string) => {
    setMarkings(prev => prev.map(marking => 
      marking.id === id ? { ...marking, value } : marking
    ));
  };

  const addSpecialFeature = () => {
    const newId = `feature-${Date.now()}`;
    setSpecialFeatures(prev => [...prev, { id: newId, value: '' }]);
  };

  const removeSpecialFeature = (id: string) => {
    setSpecialFeatures(prev => prev.filter(feature => feature.id !== id));
  };

  const updateSpecialFeature = (id: string, value: string) => {
    setSpecialFeatures(prev => prev.map(feature => 
      feature.id === id ? { ...feature, value } : feature
    ));
  };

  const updatePackagingData = (field: keyof PackagingData, value: string) => {
    setPackagingData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmit = (data: InsertProduct) => {
    const dimensionsObject = dimensions.reduce((acc, dim) => {
      if (dim.name && dim.value) {
        acc[dim.name] = dim.value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    const certificationsArray = certifications
      .map(cert => cert.value)
      .filter(value => value.trim() !== '');

    const markingsArray = markings
      .map(marking => marking.value)
      .filter(value => value.trim() !== '');

    const specialFeaturesArray = specialFeatures
      .map(feature => feature.value)
      .filter(value => value.trim() !== '');

    const packagingObject = {
      unitsPerPallet: packagingData.unitsPerPallet ? parseInt(packagingData.unitsPerPallet) : undefined,
      unitsPerTruck: packagingData.unitsPerTruck ? parseInt(packagingData.unitsPerTruck) : undefined,
      palletDimensions: packagingData.palletDimensions || undefined,
      stackHeight: packagingData.stackHeight ? parseInt(packagingData.stackHeight) : undefined,
    };
    
    const cleanPackagingObject = Object.fromEntries(
      Object.entries(packagingObject).filter(([_, value]) => value !== undefined)
    );

    // Get the IDs of selected certification/packaging/specification for storage
    const selectedCertType = certificationTypeOptions.find(ct => ct.description === selectedCertification);
    const selectedPackType = packagingTypeOptions.find(pt => pt.description === selectedPackaging);
    const selectedSpec = specificationOptions.find(s => s.description === selectedSpecification);

    const finalData = {
      ...data,
      dimensions: JSON.stringify(dimensionsObject),
      certifications: JSON.stringify(certificationsArray),
      markings: JSON.stringify(markingsArray),
      specialFeatures: JSON.stringify(specialFeaturesArray),
      packaging: Object.keys(cleanPackagingObject).length > 0 ? JSON.stringify(cleanPackagingObject) : '',
      productImage: productImage || '',
      technicalDrawing: technicalDrawing || '',
      palletizationImage: palletizationImage || '',
      designation: data.designation || '',
      barcode: data.barcode || '',
      selectedCertificationTypeId: selectedCertType?.id || null,
      selectedPackagingTypeId: selectedPackType?.id || null,
      selectedSpecificationId: selectedSpec?.id || null,
      capType: data.capType || '',
      capDimensions: data.capDimensions || '',
      vedantePead: data.vedantePead ?? false,
      vedanteEpdm: data.vedanteEpdm ?? false,
      vedanteOutros: data.vedanteOutros || '',
      pegasLaterais: data.pegasLaterais ?? false,
      pegaSuperior: data.pegaSuperior ?? false,
      cavidades: data.cavidades ?? false,
      manuseamentoOutros: data.manuseamentoOutros || '',
      datador: data.datador ?? false,
      simboloSie: data.simboloSie ?? false,
      simboloMp: data.simboloMp ?? false,
      gravacaoCliente: data.gravacaoCliente ?? false,
      visor: data.visor ?? false,
      bica: data.bica ?? false,
      coexPoliamida: data.coexPoliamida ?? false,
      adaptacao: data.adaptacao ?? false,
      autoculanteCliente: data.autoculanteCliente || '',
      especificacoesEmbFlexiveis: data.especificacoesEmbFlexiveis || '',
      stackable: data.stackable ?? false,
      stackingCapacity: data.stackingCapacity || '',
      palletDimensions: data.palletDimensions || '',
      productOnPalletDimensions: data.productOnPalletDimensions || '',
      arrangementScheme: data.arrangementScheme || '',
      totalUnits: data.totalUnits || '',
    };

    console.log('Form submitted with data:', finalData);
    onSave?.(finalData);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    onCancel?.();
  };

  const handleGeneratePDF = () => {
    if (product) {
      console.log('Generate PDF triggered', product.productCode);
      onGeneratePDF?.(product);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {product ? 'Editar Produto' : 'Criar Novo Produto'}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {product 
              ? 'Actualizar informações do produto e especificações técnicas' 
              : 'Inserir informações detalhadas do novo produto incluindo especificações e certificações'
            }
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className={`grid w-full ${product ? 'grid-cols-6' : 'grid-cols-4'} h-11 bg-muted/50 p-1`}>
                <TabsTrigger value="basic" className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Informação Básica</TabsTrigger>
                <TabsTrigger value="technical" className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Detalhes Técnicos</TabsTrigger>
                <TabsTrigger value="specs" className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Especificações</TabsTrigger>
                <TabsTrigger value="packaging" className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Embalagem e Notas</TabsTrigger>
                {product && (
                  <TabsTrigger value="versions" className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <History className="w-4 h-4 mr-1" />
                    Versões
                  </TabsTrigger>
                )}
                {product && (
                  <TabsTrigger value="share" className="font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                    <Link2 className="w-4 h-4 mr-1" />
                    Partilhar
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                {/* 1. Product Classification Section - FIRST (matches Excel: Modelo, Familia, Tipo, Produto) */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Classificação do Produto</h3>
                    <p className="text-sm text-muted-foreground mt-1">Identificação e classificação do produto</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="model" className="text-sm font-medium text-foreground">Modelo *</Label>
                      <Input
                        id="model"
                        {...form.register('model')}
                        data-testid="input-model"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Identificador do modelo do produto</p>
                    </div>

                    <div className="space-y-2">
                      <SearchableSelect
                        value={form.watch('family') || ''}
                        onChange={(val) => form.setValue('family', val)}
                        options={familyOptions}
                        label="Família *"
                        placeholder="Seleccionar família..."
                        apiEndpoint="/api/admin/families"
                        isLoading={familiesLoading}
                        onOptionAdded={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/families'] })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Família ou categoria do produto</p>
                    </div>

                    <div className="space-y-2">
                      <SearchableSelect
                        value={form.watch('type') || ''}
                        onChange={(val) => form.setValue('type', val)}
                        options={productTypeOptions}
                        label="Tipo *"
                        placeholder="Seleccionar tipo..."
                        apiEndpoint="/api/admin/productTypes"
                        isLoading={productTypesLoading}
                        onOptionAdded={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/productTypes'] })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Tipo específico ou variante do produto</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="product" className="text-sm font-medium text-foreground">Produto *</Label>
                      <Input
                        id="product"
                        {...form.register('product')}
                        data-testid="input-product-name"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Nome completo ou descrição do produto</p>
                    </div>
                  </div>
                </div>

                {/* 2. Capacity & Material Section (matches Excel: Capacidade, Matéria Prima, Cores) */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Capacidade e Material</h3>
                    <p className="text-sm text-muted-foreground mt-1">Especificações de volume, material e cores</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nominalCapacity" className="text-sm font-medium text-foreground">Capacidade Nominal *</Label>
                      <Input
                        id="nominalCapacity"
                        {...form.register('nominalCapacity')}
                        placeholder="ex.: 15L"
                        data-testid="input-nominal-capacity"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Capacidade nominal padrão</p>
                    </div>

                    <div className="space-y-2">
                      <SearchableSelect
                        value={form.watch('rawMaterial') || ''}
                        onChange={(val) => form.setValue('rawMaterial', val)}
                        options={rawMaterialOptions}
                        label="Matéria Prima *"
                        placeholder="Seleccionar material..."
                        apiEndpoint="/api/admin/rawMaterials"
                        isLoading={rawMaterialsLoading}
                        onOptionAdded={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/rawMaterials'] })}
                        required
                      />
                      <p className="text-xs text-muted-foreground">Composição principal do material</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="colors" className="text-sm font-medium text-foreground">Cores *</Label>
                      <Input
                        id="colors"
                        {...form.register('colors')}
                        placeholder="ex.: Branco, Azul, Verde (separados por vírgula)"
                        data-testid="input-colors"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Listar todas as opções de cor disponíveis</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalCapacity" className="text-sm font-medium text-foreground">Capacidade Total</Label>
                      <Input
                        id="totalCapacity"
                        {...form.register('totalCapacity')}
                        placeholder="ex.: 17,8L"
                        data-testid="input-total-capacity"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Capacidade máxima quando cheio até ao bordo</p>
                    </div>
                  </div>
                </div>

                {/* 3. Physical Properties Section (matches Excel: Peso, Dimensões) */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Peso e Propriedades Físicas</h3>
                    <p className="text-sm text-muted-foreground mt-1">Especificações de peso do produto</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium text-foreground">Peso (+/- 5%) *</Label>
                      <Input
                        id="weight"
                        {...form.register('weight')}
                        placeholder="ex.: 700g"
                        data-testid="input-weight"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Peso base sem acessórios</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weightWithAccessories" className="text-sm font-medium text-foreground">Peso com Acessórios</Label>
                      <Input
                        id="weightWithAccessories"
                        {...form.register('weightWithAccessories')}
                        placeholder="ex.: 750g"
                        data-testid="input-weight-accessories"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Peso total incluindo todos os acessórios</p>
                    </div>
                  </div>
                </div>

                {/* 4. Product Dimensions Section - Fixed Fields */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Dimensões do Produto</h3>
                    <p className="text-sm text-muted-foreground mt-1">Medições físicas em milímetros (mm)</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Altura (h)</Label>
                      <Input
                        placeholder="mm"
                        value={dimensions.find(d => d.name === 'Altura')?.value || ''}
                        onChange={(e) => {
                          const existing = dimensions.find(d => d.name === 'Altura');
                          if (existing) {
                            updateDimension(existing.id, 'value', e.target.value);
                          } else {
                            setDimensions(prev => [...prev, { id: `dim-altura-${Date.now()}`, name: 'Altura', value: e.target.value }]);
                          }
                        }}
                        data-testid="input-dimension-altura"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Largura (l)</Label>
                      <Input
                        placeholder="mm"
                        value={dimensions.find(d => d.name === 'Largura')?.value || ''}
                        onChange={(e) => {
                          const existing = dimensions.find(d => d.name === 'Largura');
                          if (existing) {
                            updateDimension(existing.id, 'value', e.target.value);
                          } else {
                            setDimensions(prev => [...prev, { id: `dim-largura-${Date.now()}`, name: 'Largura', value: e.target.value }]);
                          }
                        }}
                        data-testid="input-dimension-largura"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Comprimento (c)</Label>
                      <Input
                        placeholder="mm"
                        value={dimensions.find(d => d.name === 'Comprimento')?.value || ''}
                        onChange={(e) => {
                          const existing = dimensions.find(d => d.name === 'Comprimento');
                          if (existing) {
                            updateDimension(existing.id, 'value', e.target.value);
                          } else {
                            setDimensions(prev => [...prev, { id: `dim-comprimento-${Date.now()}`, name: 'Comprimento', value: e.target.value }]);
                          }
                        }}
                        data-testid="input-dimension-comprimento"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Diâmetro (Ø)</Label>
                      <Input
                        placeholder="mm"
                        value={dimensions.find(d => d.name === 'Diâmetro')?.value || ''}
                        onChange={(e) => {
                          const existing = dimensions.find(d => d.name === 'Diâmetro');
                          if (existing) {
                            updateDimension(existing.id, 'value', e.target.value);
                          } else {
                            setDimensions(prev => [...prev, { id: `dim-diametro-${Date.now()}`, name: 'Diâmetro', value: e.target.value }]);
                          }
                        }}
                        data-testid="input-dimension-diametro"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Diâmetro Superior (Ø sup)</Label>
                      <Input
                        placeholder="mm"
                        value={dimensions.find(d => d.name === 'Diâmetro Superior')?.value || ''}
                        onChange={(e) => {
                          const existing = dimensions.find(d => d.name === 'Diâmetro Superior');
                          if (existing) {
                            updateDimension(existing.id, 'value', e.target.value);
                          } else {
                            setDimensions(prev => [...prev, { id: `dim-diametro-sup-${Date.now()}`, name: 'Diâmetro Superior', value: e.target.value }]);
                          }
                        }}
                        data-testid="input-dimension-diametro-sup"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Diâmetro Inferior (Ø inf)</Label>
                      <Input
                        placeholder="mm"
                        value={dimensions.find(d => d.name === 'Diâmetro Inferior')?.value || ''}
                        onChange={(e) => {
                          const existing = dimensions.find(d => d.name === 'Diâmetro Inferior');
                          if (existing) {
                            updateDimension(existing.id, 'value', e.target.value);
                          } else {
                            setDimensions(prev => [...prev, { id: `dim-diametro-inf-${Date.now()}`, name: 'Diâmetro Inferior', value: e.target.value }]);
                          }
                        }}
                        data-testid="input-dimension-diametro-inf"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Profundidade (p)</Label>
                      <Input
                        placeholder="mm"
                        value={dimensions.find(d => d.name === 'Profundidade')?.value || ''}
                        onChange={(e) => {
                          const existing = dimensions.find(d => d.name === 'Profundidade');
                          if (existing) {
                            updateDimension(existing.id, 'value', e.target.value);
                          } else {
                            setDimensions(prev => [...prev, { id: `dim-profundidade-${Date.now()}`, name: 'Profundidade', value: e.target.value }]);
                          }
                        }}
                        data-testid="input-dimension-profundidade"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-foreground">Espessura (e)</Label>
                      <Input
                        placeholder="mm"
                        value={dimensions.find(d => d.name === 'Espessura')?.value || ''}
                        onChange={(e) => {
                          const existing = dimensions.find(d => d.name === 'Espessura');
                          if (existing) {
                            updateDimension(existing.id, 'value', e.target.value);
                          } else {
                            setDimensions(prev => [...prev, { id: `dim-espessura-${Date.now()}`, name: 'Espessura', value: e.target.value }]);
                          }
                        }}
                        data-testid="input-dimension-espessura"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Auto-generated Codes Section (derived fields at bottom) */}
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Campos calculados automaticamente com base nos dados inseridos</p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="designation" className="text-sm font-medium text-foreground">Designação</Label>
                      <Input
                        id="designation"
                        value={watchedDesignation || ''}
                        placeholder="Gerado automaticamente"
                        data-testid="input-designation"
                        className="h-9 bg-muted cursor-not-allowed"
                        disabled
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productCode" className="text-sm font-medium text-foreground">Referência *</Label>
                      <Input
                        id="productCode"
                        {...form.register('productCode', {
                          onChange: () => setProductCodeManuallyEdited(true)
                        })}
                        data-testid="input-product-code"
                        placeholder="Gerado automaticamente ou introduza manualmente"
                        className={`h-9 font-mono ${productCodeManuallyEdited ? '' : 'bg-muted'}`}
                      />
                      <p className="text-xs text-muted-foreground">
                        {productCodeManuallyEdited ? 'Modo manual - edite livremente' : 'Gerado automaticamente - clique para editar'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode" className="text-sm font-medium text-foreground">Código de Barras</Label>
                      <Input
                        id="barcode"
                        value={watchedBarcode || ''}
                        placeholder="Gerado automaticamente"
                        data-testid="input-barcode"
                        className="h-9 font-mono bg-muted cursor-not-allowed"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* 6. Additional Classification Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <SearchableSelect
                        value={selectedCertification}
                        onChange={(val) => {
                          console.log('Certification changed to:', val);
                          setSelectedCertification(val);
                        }}
                        options={certificationTypeOptions.map(ct => ({ id: ct.id, code: ct.code, description: ct.description }))}
                        label="Tipo de Certificação *"
                        placeholder="Seleccionar certificação..."
                        apiEndpoint="/api/admin/certificationTypes"
                        isLoading={false}
                        onOptionAdded={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/certificationTypes'] })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <SearchableSelect
                        value={selectedPackaging}
                        onChange={(val) => {
                          console.log('Packaging changed to:', val);
                          setSelectedPackaging(val);
                        }}
                        options={packagingTypeOptions.map(pt => ({ id: pt.id, code: pt.code, description: pt.description }))}
                        label="Tipo de Embalagem *"
                        placeholder="Seleccionar embalagem..."
                        apiEndpoint="/api/admin/packagingTypes"
                        isLoading={false}
                        onOptionAdded={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/packagingTypes'] })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <SearchableSelect
                        value={selectedSpecification}
                        onChange={(val) => setSelectedSpecification(val)}
                        options={specificationOptions.map(s => ({ id: s.id, code: s.code, description: s.description }))}
                        label="Especificação *"
                        placeholder="Seleccionar especificação..."
                        apiEndpoint="/api/admin/specifications"
                        isLoading={false}
                        onOptionAdded={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/specifications'] })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6 mt-6">
                {/* Sistema de Fecho (Closure System) Section - matches Excel order */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Sistema de Fecho</h3>
                    <p className="text-sm text-muted-foreground mt-1">Mecanismos de fecho e especificações de tampa</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <SearchableSelect
                        value={form.watch('closingSystem') || ''}
                        onChange={(val) => form.setValue('closingSystem', val)}
                        options={closingSystemOptions}
                        label="Sistema de Fecho"
                        placeholder="Seleccionar sistema..."
                        apiEndpoint="/api/admin/closingSystems"
                        isLoading={closingSystemsLoading}
                        onOptionAdded={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/closingSystems'] })}
                      />
                      <p className="text-xs text-muted-foreground">Tipo de mecanismo de fecho</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capType" className="text-sm font-medium text-foreground">Tipo de Tampa</Label>
                      <Input
                        id="capType"
                        {...form.register('capType')}
                        placeholder="ex.: Rosca, Pressão, Snap-on"
                        data-testid="input-cap-type"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Tipo de tampa utilizada</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="capDimensions" className="text-sm font-medium text-foreground">Dimensões da Tampa (mm)</Label>
                      <Input
                        id="capDimensions"
                        {...form.register('capDimensions')}
                        placeholder="ex.: Ø60mm x 25mm"
                        data-testid="input-cap-dimensions"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Dimensões da tampa em milímetros</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sealingType" className="text-sm font-medium text-foreground">Tipo de Selagem</Label>
                      <Input
                        id="sealingType"
                        {...form.register('sealingType')}
                        placeholder="ex.: PEAD, EPDM"
                        data-testid="input-sealing-type"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Material e método de selagem</p>
                    </div>
                  </div>
                </div>

                {/* Vedante (Sealing) Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Vedante</h3>
                    <p className="text-sm text-muted-foreground mt-1">Tipos de vedante disponíveis</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="vedantePead"
                        checked={form.watch('vedantePead') ?? false}
                        onCheckedChange={(checked) => form.setValue('vedantePead', checked)}
                        data-testid="switch-vedante-pead"
                      />
                      <Label htmlFor="vedantePead" className="text-sm font-medium text-foreground cursor-pointer">PEAD</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="vedanteEpdm"
                        checked={form.watch('vedanteEpdm') ?? false}
                        onCheckedChange={(checked) => form.setValue('vedanteEpdm', checked)}
                        data-testid="switch-vedante-epdm"
                      />
                      <Label htmlFor="vedanteEpdm" className="text-sm font-medium text-foreground cursor-pointer">EPDM</Label>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="vedanteOutros" className="text-sm font-medium text-foreground">Outros</Label>
                      <Input
                        id="vedanteOutros"
                        {...form.register('vedanteOutros')}
                        placeholder="ex.: Silicone, NBR"
                        data-testid="input-vedante-outros"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Sistema de Manuseamento (Handling) Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Sistema de Manuseamento</h3>
                    <p className="text-sm text-muted-foreground mt-1">Características ergonómicas de manuseamento</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="handlingSystem" className="text-sm font-medium text-foreground">Sistema de Manuseamento</Label>
                      <Input
                        id="handlingSystem"
                        {...form.register('handlingSystem')}
                        placeholder="ex.: Pegas laterais"
                        data-testid="input-handling-system"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Descrição do sistema de manuseamento</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="pegasLaterais"
                        checked={form.watch('pegasLaterais') ?? false}
                        onCheckedChange={(checked) => form.setValue('pegasLaterais', checked)}
                        data-testid="switch-pegas-laterais"
                      />
                      <Label htmlFor="pegasLaterais" className="text-sm font-medium text-foreground cursor-pointer">Pegas Laterais</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="pegaSuperior"
                        checked={form.watch('pegaSuperior') ?? false}
                        onCheckedChange={(checked) => form.setValue('pegaSuperior', checked)}
                        data-testid="switch-pega-superior"
                      />
                      <Label htmlFor="pegaSuperior" className="text-sm font-medium text-foreground cursor-pointer">Pega Superior</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="cavidades"
                        checked={form.watch('cavidades') ?? false}
                        onCheckedChange={(checked) => form.setValue('cavidades', checked)}
                        data-testid="switch-cavidades"
                      />
                      <Label htmlFor="cavidades" className="text-sm font-medium text-foreground cursor-pointer">Cavidades</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manuseamentoOutros" className="text-sm font-medium text-foreground">Outros</Label>
                      <Input
                        id="manuseamentoOutros"
                        {...form.register('manuseamentoOutros')}
                        placeholder="ex.: Alças ergonómicas"
                        data-testid="input-manuseamento-outros"
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

              </TabsContent>

              <TabsContent value="specs" className="space-y-6 mt-6">
                {/* Certifications Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Certificações e Conformidade</h3>
                        <p className="text-sm text-muted-foreground mt-1">Certificações de segurança e conformidade regulamentar</p>
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
                        Adicionar Certificação
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {certifications.map((certification, index) => (
                      <div key={certification.id} className="flex gap-3 items-center p-3 border border-border rounded-md">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs font-medium text-muted-foreground">Certificação {index + 1}</Label>
                          <Input
                            placeholder="ex.: ADR 3H1/Y1,9/150"
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

                {/* Marcações (Markings) Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Marcações</h3>
                    <p className="text-sm text-muted-foreground mt-1">Marcações e etiquetas no produto</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="datador"
                        checked={form.watch('datador') ?? false}
                        onCheckedChange={(checked) => form.setValue('datador', checked)}
                        data-testid="switch-datador"
                      />
                      <Label htmlFor="datador" className="text-sm font-medium text-foreground cursor-pointer">Datador</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="simboloSie"
                        checked={form.watch('simboloSie') ?? false}
                        onCheckedChange={(checked) => form.setValue('simboloSie', checked)}
                        data-testid="switch-simbolo-sie"
                      />
                      <Label htmlFor="simboloSie" className="text-sm font-medium text-foreground cursor-pointer">Símbolo SIE</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="simboloMp"
                        checked={form.watch('simboloMp') ?? false}
                        onCheckedChange={(checked) => form.setValue('simboloMp', checked)}
                        data-testid="switch-simbolo-mp"
                      />
                      <Label htmlFor="simboloMp" className="text-sm font-medium text-foreground cursor-pointer">Símbolo MP</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="gravacaoCliente"
                        checked={form.watch('gravacaoCliente') ?? false}
                        onCheckedChange={(checked) => form.setValue('gravacaoCliente', checked)}
                        data-testid="switch-gravacao-cliente"
                      />
                      <Label htmlFor="gravacaoCliente" className="text-sm font-medium text-foreground cursor-pointer">Gravação Cliente</Label>
                    </div>
                  </div>
                </div>

                {/* Product Markings JSON Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Marcações Adicionais</h3>
                    <p className="text-sm text-muted-foreground mt-1">Marcações e etiquetas obrigatórias no produto</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="markings" className="text-sm font-medium text-foreground">Marcações (Formato JSON Array)</Label>
                    <Textarea
                      id="markings"
                      {...form.register('markings')}
                      placeholder='["Datador", "Símbolo SIE", "Capacidade Nominal", "Logo da Empresa"]'
                      data-testid="textarea-markings"
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Inserir marcações como um array JSON. Cada marcação deve estar entre aspas e separadas por vírgulas.</p>
                  </div>
                </div>

                {/* Outras Características (Other Features) Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Outras Características</h3>
                    <p className="text-sm text-muted-foreground mt-1">Características adicionais do produto</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="visor"
                        checked={form.watch('visor') ?? false}
                        onCheckedChange={(checked) => form.setValue('visor', checked)}
                        data-testid="switch-visor"
                      />
                      <Label htmlFor="visor" className="text-sm font-medium text-foreground cursor-pointer">Visor</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="bica"
                        checked={form.watch('bica') ?? false}
                        onCheckedChange={(checked) => form.setValue('bica', checked)}
                        data-testid="switch-bica"
                      />
                      <Label htmlFor="bica" className="text-sm font-medium text-foreground cursor-pointer">Bica</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="coexPoliamida"
                        checked={form.watch('coexPoliamida') ?? false}
                        onCheckedChange={(checked) => form.setValue('coexPoliamida', checked)}
                        data-testid="switch-coex-poliamida"
                      />
                      <Label htmlFor="coexPoliamida" className="text-sm font-medium text-foreground cursor-pointer">COEX - Poliamida</Label>
                    </div>

                    <div className="flex items-center gap-3 p-3 border border-border rounded-md">
                      <Switch
                        id="adaptacao"
                        checked={form.watch('adaptacao') ?? false}
                        onCheckedChange={(checked) => form.setValue('adaptacao', checked)}
                        data-testid="switch-adaptacao"
                      />
                      <Label htmlFor="adaptacao" className="text-sm font-medium text-foreground cursor-pointer">Adaptação</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="autoculanteCliente" className="text-sm font-medium text-foreground">Autoculante Cliente</Label>
                      <Input
                        id="autoculanteCliente"
                        {...form.register('autoculanteCliente')}
                        placeholder="Especificações do autoculante do cliente"
                        data-testid="input-autoculante-cliente"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Detalhes do autoculante específico do cliente</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="especificacoesEmbFlexiveis" className="text-sm font-medium text-foreground">Especificações Emb. Flexíveis</Label>
                      <Input
                        id="especificacoesEmbFlexiveis"
                        {...form.register('especificacoesEmbFlexiveis')}
                        placeholder="Especificações de embalagens flexíveis"
                        data-testid="input-especificacoes-emb-flexiveis"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Especificações para embalagens flexíveis</p>
                    </div>
                  </div>
                </div>

                {/* Special Features Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Características Especiais</h3>
                    <p className="text-sm text-muted-foreground mt-1">Características únicas e capacidades do produto</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialFeatures" className="text-sm font-medium text-foreground">Características Especiais (Formato JSON Array)</Label>
                    <Textarea
                      id="specialFeatures"
                      {...form.register('specialFeatures')}
                      placeholder='["Empilhável", "Reciclável", "Reutilizável", "Resistente a UV"]'
                      data-testid="textarea-special-features"
                      rows={3}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Listar características especiais como um array JSON. Exemplos: empilhável, reciclável, resistente UV, etc.</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="packaging" className="space-y-6 mt-6">
                {/* Empilhamento (Stacking) Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Empilhamento</h3>
                    <p className="text-sm text-muted-foreground mt-1">Capacidade de empilhamento do produto</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-3 border border-border rounded-md">
                      <Switch
                        id="stackable"
                        checked={form.watch('stackable') ?? false}
                        onCheckedChange={(checked) => form.setValue('stackable', checked)}
                        data-testid="switch-stackable"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="stackable" className="text-sm font-medium text-foreground cursor-pointer">Empilhável</Label>
                        <p className="text-xs text-muted-foreground">Produto pode ser empilhado</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stackingCapacity" className="text-sm font-medium text-foreground">Capacidade de Empilhamento</Label>
                      <Input
                        id="stackingCapacity"
                        {...form.register('stackingCapacity')}
                        placeholder="ex.: 8 unidades"
                        data-testid="input-stacking-capacity"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Número máximo de unidades empilháveis</p>
                    </div>
                  </div>
                </div>

                {/* Packaging Details Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Detalhes de Embalagem</h3>
                    <p className="text-sm text-muted-foreground mt-1">Especificações de embalagem e paletização</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="palletDimensions" className="text-sm font-medium text-foreground">Dimensões da Palete (mm)</Label>
                      <Input
                        id="palletDimensions"
                        {...form.register('palletDimensions')}
                        placeholder="ex.: 1200 x 800 x 144"
                        data-testid="input-pallet-dimensions"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Dimensões da palete em milímetros (C x L x A)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productOnPalletDimensions" className="text-sm font-medium text-foreground">Dimensões da Mercadoria na Palete (mm)</Label>
                      <Input
                        id="productOnPalletDimensions"
                        {...form.register('productOnPalletDimensions')}
                        placeholder="ex.: 1200 x 800 x 1500"
                        data-testid="input-product-on-pallet-dimensions"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Dimensões totais da mercadoria na palete</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="arrangementScheme" className="text-sm font-medium text-foreground">Esquema de Arrumação</Label>
                      <Input
                        id="arrangementScheme"
                        {...form.register('arrangementScheme')}
                        placeholder="ex.: 5x3x4 camadas"
                        data-testid="input-arrangement-scheme"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Esquema de arrumação na palete</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalUnits" className="text-sm font-medium text-foreground">Total de Unidades</Label>
                      <Input
                        id="totalUnits"
                        {...form.register('totalUnits')}
                        placeholder="ex.: 60 unidades"
                        data-testid="input-total-units"
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">Total de unidades por palete</p>
                    </div>
                  </div>
                </div>

                {/* Packaging Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Embalagem e Logística</h3>
                    <p className="text-sm text-muted-foreground mt-1">Especificações de envio, armazenamento e embalagem</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="packaging" className="text-sm font-medium text-foreground">Detalhes de Embalagem (Formato JSON)</Label>
                    <Textarea
                      id="packaging"
                      {...form.register('packaging')}
                      placeholder='{"unitsPerPallet": 105, "unitsPerTruck": 3360, "palletDimensions": "1200x800mm", "stackHeight": 8}'
                      data-testid="textarea-packaging"
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Especificar informações de embalagem em formato JSON. Incluir unidades por palete, capacidade do camião, dimensões, etc.</p>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Informações Adicionais</h3>
                    <p className="text-sm text-muted-foreground mt-1">Notas, comentários e estado do produto</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-sm font-medium text-foreground">Notas e Comentários</Label>
                      <Textarea
                        id="notes"
                        {...form.register('notes')}
                        placeholder="Notas adicionais, instruções especiais ou informações importantes sobre este produto..."
                        data-testid="textarea-notes"
                        rows={4}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Adicionar notas relevantes, instruções especiais ou informações adicionais</p>
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
                          <Label htmlFor="isActive" className="text-sm font-medium text-foreground">Produto está Activo</Label>
                          <p className="text-xs text-muted-foreground">Activar este produto para uso no sistema</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Images Section */}
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <h3 className="text-lg font-semibold text-foreground">Imagens do Produto</h3>
                    <p className="text-sm text-muted-foreground mt-1">Imagem principal, desenho técnico e paletização</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <ImageUpload
                      label="Imagem Principal (Frente)"
                      description="Imagem do produto vista frontal (JPEG, PNG, GIF, WebP - máx. 10MB)"
                      value={productImage ?? undefined}
                      onChange={setProductImage}
                      disabled={isLoading}
                      data-testid="upload-product-image"
                    />
                    <ImageUpload
                      label="Desenho Técnico 2D (Verso)"
                      description="Desenho técnico ou blueprint 2D do produto (JPEG, PNG, GIF, WebP - máx. 10MB)"
                      value={technicalDrawing ?? undefined}
                      onChange={setTechnicalDrawing}
                      disabled={isLoading}
                      data-testid="upload-technical-drawing"
                    />
                    <ImageUpload
                      label="Paletização (Opcional)"
                      description="Imagem de paletização / acondicionamento (JPEG, PNG, GIF, WebP - máx. 10MB)"
                      value={palletizationImage ?? undefined}
                      onChange={setPalletizationImage}
                      disabled={isLoading}
                      data-testid="upload-palletization-image"
                    />
                  </div>
                </div>
              </TabsContent>

              {product && (
                <TabsContent value="versions" className="space-y-6 mt-6">
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="text-lg font-semibold text-foreground">Histórico de Versões</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Versão atual: {product.currentVersionNumber || 1} - Cada alteração cria uma nova versão
                      </p>
                    </div>
                    
                    {productVersions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum histórico de versões disponível</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {productVersions.map((version: ProductVersion, index: number) => (
                          <div 
                            key={version.id} 
                            className={`p-4 rounded-lg border ${index === 0 ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                                  v{version.versionNumber}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">
                                      Versão {version.versionNumber}
                                    </span>
                                    {index === 0 && (
                                      <span className="text-xs px-2 py-0.5 rounded bg-primary text-primary-foreground">
                                        Atual
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>
                                      {new Date(version.effectiveAt).toLocaleDateString('pt-PT', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-muted-foreground">
                                  {version.changeNotes || 'Sem notas'}
                                </div>
                                <div className="text-xs text-muted-foreground/70 mt-1">
                                  Ref: {version.productCode}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              {/* Share Links Tab - Only for existing products */}
              {product && (
                <TabsContent value="share" className="space-y-6 mt-6">
                  <ShareLinksManager productId={product.id} productCode={product.productCode} />
                </TabsContent>
              )}
            </Tabs>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-8 border-t border-border">
              <div className="text-sm text-muted-foreground">
                <span className="text-destructive">*</span> Campos obrigatórios
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
                  Cancelar
                </Button>
                {product && (
                  <>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => onClone?.(product)}
                      data-testid="button-clone"
                      className="min-w-32"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPDF}
                      data-testid="button-generate-pdf"
                      className="min-w-32"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {isGeneratingPDF ? 'A gerar...' : 'Gerar PDF'}
                    </Button>
                  </>
                )}
                <Button 
                  type="submit" 
                  data-testid="button-save"
                  className="min-w-32 font-medium"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading 
                    ? (product ? 'A actualizar...' : 'A guardar...') 
                    : (product ? 'Actualizar Produto' : 'Guardar Produto')
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
