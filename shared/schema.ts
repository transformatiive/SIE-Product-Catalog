import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Basic product information
  model: text("model").notNull(),
  family: text("family").notNull(),
  type: text("type").notNull(),
  product: text("product").notNull(),
  productCode: text("product_code").notNull().unique(),
  
  // Product Identification
  designation: text("designation"), // Product designation/full name
  barcode: text("barcode"), // Código de Barras
  
  // Capacity and dimensions
  nominalCapacity: text("nominal_capacity").notNull(),
  totalCapacity: text("total_capacity"),
  rawMaterial: text("raw_material").notNull(),
  colors: text("colors").notNull(),
  weight: text("weight").notNull(),
  weightWithAccessories: text("weight_with_accessories"),
  dimensions: text("dimensions").notNull(), // JSON string for multiple dimensions
  
  // Closure System (Sistema de Fecho)
  closingSystem: text("closing_system"),
  capType: text("cap_type"), // Tipo de Tampa
  capDimensions: text("cap_dimensions"), // Dimensões de Tampa (mm)
  
  // Sealing (Vedante)
  sealingType: text("sealing_type"),
  vedantePead: boolean("vedante_pead").default(false), // PEAD sealing
  vedanteEpdm: boolean("vedante_epdm").default(false), // EPDM sealing
  vedanteOutros: text("vedante_outros"), // Other sealing materials
  
  // Handling System (Sistema de Manuseamento)
  handlingSystem: text("handling_system"),
  pegasLaterais: boolean("pegas_laterais").default(false), // Side handles
  pegaSuperior: boolean("pega_superior").default(false), // Top handle
  cavidades: boolean("cavidades").default(false), // Cavities
  manuseamentoOutros: text("manuseamento_outros"), // Other handling options
  
  // Markings (Marcações)
  markings: text("markings"), // JSON array as string
  datador: boolean("datador").default(false), // Date marking
  simboloSie: boolean("simbolo_sie").default(false), // SIE symbol
  simboloMp: boolean("simbolo_mp").default(false), // MP symbol
  gravacaoCliente: boolean("gravacao_cliente").default(false), // Customer engraving
  
  // Other Features (Outras)
  visor: boolean("visor").default(false), // Viewer
  bica: boolean("bica").default(false), // Spout
  coexPoliamida: boolean("coex_poliamida").default(false), // COEX Polyamide
  adaptacao: boolean("adaptacao").default(false), // Adaptation
  autoculanteCliente: text("autoculante_cliente"), // Customer self-adhesive specs
  especificacoesEmbFlexiveis: text("especificacoes_emb_flexiveis"), // Flexible packaging specs
  
  // Stacking
  stackable: boolean("stackable").default(false), // Empilhável
  stackingCapacity: text("stacking_capacity"), // Capacidade de Empilhamento
  
  // Packaging Details
  packaging: text("packaging"), // JSON string for packaging details
  palletDimensions: text("pallet_dimensions"), // Dimensões da Palete (mm)
  productOnPalletDimensions: text("product_on_pallet_dimensions"), // Dimensões mercadoria na palete (mm)
  arrangementScheme: text("arrangement_scheme"), // Esquema de arrumação
  totalUnits: text("total_units"), // Total (unid)
  
  // Certifications and compliance
  certifications: text("certifications"), // JSON array as string
  foodContact: boolean("food_contact").default(false),
  specialFeatures: text("special_features"), // JSON array as string
  
  // Image fields
  productImage: text("product_image"), // File path to product image
  technicalDrawing: text("technical_drawing"), // File path to technical drawing/3D blueprint
  
  // Date tracking for versioning
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Metadata
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = insertProductSchema.partial();

export const productSearchSchema = z.object({
  query: z.string().optional(),
  productCode: z.string().optional(),
  model: z.string().optional(),
  family: z.string().optional(),
  type: z.string().optional(),
  purchaseDate: z.string().optional(), // For date range search
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof products.$inferSelect;
export type ProductSearch = z.infer<typeof productSearchSchema>;

// Users table (keeping existing structure)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ================================
// SUPPORT TABLES FOR DROPDOWNS
// ================================

// Families (0_Familia)
export const families = pgTable("families", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFamilySchema = createInsertSchema(families).omit({
  id: true,
  createdAt: true,
});
export type InsertFamily = z.infer<typeof insertFamilySchema>;
export type Family = typeof families.$inferSelect;

// Product Types (1_Produto)
export const productTypes = pgTable("product_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductTypeSchema = createInsertSchema(productTypes).omit({
  id: true,
  createdAt: true,
});
export type InsertProductType = z.infer<typeof insertProductTypeSchema>;
export type ProductType = typeof productTypes.$inferSelect;

// Capacities (2_Capacidade)
export const capacities = pgTable("capacities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCapacitySchema = createInsertSchema(capacities).omit({
  id: true,
  createdAt: true,
});
export type InsertCapacity = z.infer<typeof insertCapacitySchema>;
export type Capacity = typeof capacities.$inferSelect;

// Raw Materials (4_Materia Prima)
export const rawMaterials = pgTable("raw_materials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRawMaterialSchema = createInsertSchema(rawMaterials).omit({
  id: true,
  createdAt: true,
});
export type InsertRawMaterial = z.infer<typeof insertRawMaterialSchema>;
export type RawMaterial = typeof rawMaterials.$inferSelect;

// Colors (5_Corante)
export const colors = pgTable("colors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertColorSchema = createInsertSchema(colors).omit({
  id: true,
  createdAt: true,
});
export type InsertColor = z.infer<typeof insertColorSchema>;
export type Color = typeof colors.$inferSelect;

// Closing Systems (6_Sistema de Fecho)
export const closingSystems = pgTable("closing_systems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClosingSystemSchema = createInsertSchema(closingSystems).omit({
  id: true,
  createdAt: true,
});
export type InsertClosingSystem = z.infer<typeof insertClosingSystemSchema>;
export type ClosingSystem = typeof closingSystems.$inferSelect;

// Cap Sizes (7_Medida da Tampa)
export const capSizes = pgTable("cap_sizes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCapSizeSchema = createInsertSchema(capSizes).omit({
  id: true,
  createdAt: true,
});
export type InsertCapSize = z.infer<typeof insertCapSizeSchema>;
export type CapSize = typeof capSizes.$inferSelect;

// Certification Types (8_Certificação)
export const certificationTypes = pgTable("certification_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCertificationTypeSchema = createInsertSchema(certificationTypes).omit({
  id: true,
  createdAt: true,
});
export type InsertCertificationType = z.infer<typeof insertCertificationTypeSchema>;
export type CertificationType = typeof certificationTypes.$inferSelect;

// Packaging Types (9_Embalamento)
export const packagingTypes = pgTable("packaging_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPackagingTypeSchema = createInsertSchema(packagingTypes).omit({
  id: true,
  createdAt: true,
});
export type InsertPackagingType = z.infer<typeof insertPackagingTypeSchema>;
export type PackagingType = typeof packagingTypes.$inferSelect;

// Generic dropdown option type for API responses
export type DropdownOption = {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
};