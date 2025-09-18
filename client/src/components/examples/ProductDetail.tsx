import ProductDetail from '../ProductDetail';
import { Product } from '@shared/schema';

export default function ProductDetailExample() {
  // todo: remove mock functionality
  const mockProduct: Product = {
    id: '1',
    model: '1315',
    family: 'Embalagem',
    type: 'Boca Estreita',
    product: 'GARRAFÃO',
    productCode: 'GRF-1315',
    nominalCapacity: '15L',
    totalCapacity: '17.8L',
    rawMaterial: 'PEAD',
    colors: 'Branco, Azul',
    weight: '700g',
    weightWithAccessories: '750g',
    dimensions: '{"height": "332mm", "width": "284mm", "depth": "230mm"}',
    closingSystem: 'Tampa de Rosca',
    sealingType: 'PEAD',
    handlingSystem: 'Pegas laterais',
    certifications: '["ADR 3H1/Y1,9/150", "IATA Certified", "IMDG Approved"]',
    markings: '["Datador", "Símbolo SIE", "Capacidade Nominal", "Personalização Cliente"]',
    foodContact: true,
    packaging: '{"unitsPerPallet": 105, "unitsPerTruck": 3360, "palletDimensions": "1200x800mm", "productDimensions": "1200x810x2470mm"}',
    specialFeatures: '["Empilhável", "Reciclável", "Reutilizável", "Apto para Contacto Alimentar"]',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-29'),
    notes: 'Estático com 3 unidades para produtos com densidade menor ou igual a 1,9g/cm3. Possibilidade de produção noutra cor, mediante avaliação interna.',
    isActive: true,
  };

  return <ProductDetail product={mockProduct} />;
}