import ProductCard from '../ProductCard';
import { Product } from '@shared/schema';

export default function ProductCardExample() {
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
    weightWithAccessories: null,
    dimensions: '{"height": 332, "width": 284, "depth": 230}',
    closingSystem: 'Tampa de Rosca',
    sealingType: 'PEAD',
    handlingSystem: 'Pegas laterais',
    certifications: '["ADR 3H1/Y1,9/150"]',
    markings: '["Datador", "Símbolo SIE", "Capacidade Nominal"]',
    foodContact: true,
    packaging: '{"unitsPerPallet": 105, "unitsPerTruck": 3360}',
    specialFeatures: '["Empilhável", "Reciclável", "Reutilizável"]',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
    notes: null,
    isActive: true,
  };

  return (
    <div className="max-w-sm">
      <ProductCard product={mockProduct} />
    </div>
  );
}