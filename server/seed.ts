import { storage } from "./storage";

const sampleProducts = [
  {
    model: "Container Pro",
    family: "Storage",
    type: "Food Container",
    product: "Airtight Food Storage Container 500ml",
    productCode: "STC-500-01",
    nominalCapacity: "500ml",
    totalCapacity: "520ml",
    rawMaterial: "BPA-free Plastic",
    colors: "Transparent with Blue Lid",
    weight: "250g",
    weightWithAccessories: "280g",
    dimensions: JSON.stringify({
      height: "12cm",
      width: "10cm",
      depth: "8cm"
    }),
    closingSystem: "Snap-lock lid",
    sealingType: "Silicone gasket",
    handlingSystem: "Ergonomic grip",
    certifications: JSON.stringify(["FDA Approved", "EU Food Contact", "BPA-Free"]),
    markings: JSON.stringify(["Recycling Symbol", "Capacity Mark", "Brand Logo"]),
    foodContact: true,
    packaging: JSON.stringify({
      type: "Individual box",
      material: "Cardboard",
      weight: "50g"
    }),
    specialFeatures: JSON.stringify(["Microwave Safe", "Dishwasher Safe", "Stackable"]),
    notes: "Popular choice for home kitchen storage",
    isActive: true
  },
  {
    model: "Container Max",
    family: "Storage",
    type: "Food Container",
    product: "Large Food Storage Container 1000ml",
    productCode: "STC-1000-02",
    nominalCapacity: "1000ml",
    totalCapacity: "1050ml",
    rawMaterial: "Glass",
    colors: "Clear Glass with Bamboo Lid",
    weight: "450g",
    weightWithAccessories: "500g",
    dimensions: JSON.stringify({
      height: "15cm",
      width: "12cm",
      depth: "10cm"
    }),
    closingSystem: "Bamboo lid with silicone seal",
    sealingType: "Double silicone gasket",
    handlingSystem: "Easy-grip sides",
    certifications: JSON.stringify(["Food Grade Glass", "Sustainable Bamboo", "Non-toxic"]),
    markings: JSON.stringify(["Volume Marks", "Brand Etching", "Care Instructions"]),
    foodContact: true,
    packaging: JSON.stringify({
      type: "Eco-friendly box",
      material: "Recycled cardboard",
      weight: "75g"
    }),
    specialFeatures: JSON.stringify(["Oven Safe", "Freezer Safe", "Eco-friendly"]),
    notes: "Premium glass container with sustainable bamboo lid",
    isActive: true
  },
  {
    model: "Container Mini",
    family: "Storage",
    type: "Spice Container",
    product: "Small Spice Storage Container 100ml",
    productCode: "STC-100-03",
    nominalCapacity: "100ml",
    totalCapacity: "110ml",
    rawMaterial: "Borosilicate Glass",
    colors: "Clear with Black Label Area",
    weight: "120g",
    weightWithAccessories: "130g",
    dimensions: JSON.stringify({
      height: "8cm",
      width: "6cm",
      depth: "6cm"
    }),
    closingSystem: "Screw-on cap",
    sealingType: "Rubber gasket",
    handlingSystem: "Textured grip area",
    certifications: JSON.stringify(["Heat Resistant", "Chemical Resistant"]),
    markings: JSON.stringify(["Fill Line", "Brand Mark"]),
    foodContact: true,
    packaging: JSON.stringify({
      type: "Set of 6 in display box",
      material: "Cardboard with window",
      weight: "200g"
    }),
    specialFeatures: JSON.stringify(["Airtight Seal", "Label Ready", "Compact Design"]),
    notes: "Perfect for spice and herb storage",
    isActive: true
  },
  {
    model: "Container Bulk",
    family: "Storage",
    type: "Bulk Container",
    product: "Large Bulk Storage Container 2500ml",
    productCode: "BLC-2500-04",
    nominalCapacity: "2500ml",
    totalCapacity: "2600ml",
    rawMaterial: "High-Density Polyethylene",
    colors: "White with Clear Measurement Window",
    weight: "680g",
    weightWithAccessories: "750g",
    dimensions: JSON.stringify({
      height: "20cm",
      width: "15cm",
      depth: "12cm"
    }),
    closingSystem: "Twist-lock lid with pour spout",
    sealingType: "O-ring seal",
    handlingSystem: "Dual side handles",
    certifications: JSON.stringify(["Commercial Grade", "Food Safe HDPE"]),
    markings: JSON.stringify(["Measurement Lines", "Lot Number", "Expiry Date Area"]),
    foodContact: true,
    packaging: JSON.stringify({
      type: "Individual carton",
      material: "Corrugated cardboard",
      weight: "120g"
    }),
    specialFeatures: JSON.stringify(["Pour Spout", "Measurement Window", "Commercial Grade"]),
    notes: "Designed for commercial kitchen use",
    isActive: true
  },
  {
    model: "Container Vintage",
    family: "Storage",
    type: "Decorative Container",
    product: "Vintage Style Storage Container 750ml",
    productCode: "VSC-750-05",
    nominalCapacity: "750ml",
    totalCapacity: "780ml",
    rawMaterial: "Ceramic",
    colors: "Cream with Floral Pattern",
    weight: "520g",
    weightWithAccessories: "560g",
    dimensions: JSON.stringify({
      height: "14cm",
      width: "11cm",
      depth: "11cm"
    }),
    closingSystem: "Cork lid",
    sealingType: "Natural cork seal",
    handlingSystem: "Curved handles",
    certifications: JSON.stringify(["Lead-free Glaze", "Artisan Made"]),
    markings: JSON.stringify(["Pattern Design", "Artist Signature"]),
    foodContact: true,
    packaging: JSON.stringify({
      type: "Gift box with foam padding",
      material: "Premium cardboard",
      weight: "150g"
    }),
    specialFeatures: JSON.stringify(["Decorative Design", "Cork Lid", "Handcrafted"]),
    notes: "Decorative container perfect for kitchen display",
    isActive: true
  }
];

export async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    for (const productData of sampleProducts) {
      // Check if product already exists
      const existing = await storage.getProductByCode(productData.productCode);
      if (!existing) {
        const product = await storage.createProduct(productData);
        console.log(`Created product: ${product.productCode} - ${product.product}`);
      } else {
        console.log(`Product already exists: ${productData.productCode}`);
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}