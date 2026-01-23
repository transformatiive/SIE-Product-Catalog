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
  
  // Code generation selections (for auto-generating barcode, reference, designation)
  selectedCertificationTypeId: varchar("selected_certification_type_id"), // FK to certification_types
  selectedPackagingTypeId: varchar("selected_packaging_type_id"), // FK to packaging_types
  selectedSpecificationId: varchar("selected_specification_id"), // FK to specifications
  
  // Image fields
  productImage: text("product_image"), // File path to product image
  technicalDrawing: text("technical_drawing"), // File path to technical drawing/3D blueprint
  
  // Version tracking - current version info is denormalized for efficient queries
  currentVersionNumber: integer("current_version_number").default(1).notNull(),
  latestVersionId: varchar("latest_version_id"), // FK to product_versions
  
  // Date tracking for versioning
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  
  // Metadata
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
});

// Product Versions table - stores immutable snapshots of product data
export const productVersions = pgTable("product_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(), // FK to products
  
  // Version metadata
  versionNumber: integer("version_number").notNull(),
  previousVersionId: varchar("previous_version_id"), // FK to previous version (self-referential)
  effectiveAt: timestamp("effective_at").defaultNow().notNull(), // When this version became effective
  createdBy: varchar("created_by"), // User who created this version (FK to users)
  changeNotes: text("change_notes"), // Optional notes about what changed
  
  // Snapshot of all product data at this version
  model: text("model").notNull(),
  family: text("family").notNull(),
  type: text("type").notNull(),
  product: text("product").notNull(),
  productCode: text("product_code").notNull(),
  designation: text("designation"),
  barcode: text("barcode"),
  nominalCapacity: text("nominal_capacity").notNull(),
  totalCapacity: text("total_capacity"),
  rawMaterial: text("raw_material").notNull(),
  colors: text("colors").notNull(),
  weight: text("weight").notNull(),
  weightWithAccessories: text("weight_with_accessories"),
  dimensions: text("dimensions").notNull(),
  closingSystem: text("closing_system"),
  capType: text("cap_type"),
  capDimensions: text("cap_dimensions"),
  sealingType: text("sealing_type"),
  vedantePead: boolean("vedante_pead").default(false),
  vedanteEpdm: boolean("vedante_epdm").default(false),
  vedanteOutros: text("vedante_outros"),
  handlingSystem: text("handling_system"),
  pegasLaterais: boolean("pegas_laterais").default(false),
  pegaSuperior: boolean("pega_superior").default(false),
  cavidades: boolean("cavidades").default(false),
  manuseamentoOutros: text("manuseamento_outros"),
  markings: text("markings"),
  datador: boolean("datador").default(false),
  simboloSie: boolean("simbolo_sie").default(false),
  simboloMp: boolean("simbolo_mp").default(false),
  gravacaoCliente: boolean("gravacao_cliente").default(false),
  visor: boolean("visor").default(false),
  bica: boolean("bica").default(false),
  coexPoliamida: boolean("coex_poliamida").default(false),
  adaptacao: boolean("adaptacao").default(false),
  autoculanteCliente: text("autoculante_cliente"),
  especificacoesEmbFlexiveis: text("especificacoes_emb_flexiveis"),
  stackable: boolean("stackable").default(false),
  stackingCapacity: text("stacking_capacity"),
  packaging: text("packaging"),
  palletDimensions: text("pallet_dimensions"),
  productOnPalletDimensions: text("product_on_pallet_dimensions"),
  arrangementScheme: text("arrangement_scheme"),
  totalUnits: text("total_units"),
  certifications: text("certifications"),
  foodContact: boolean("food_contact").default(false),
  specialFeatures: text("special_features"),
  selectedCertificationTypeId: varchar("selected_certification_type_id"),
  selectedPackagingTypeId: varchar("selected_packaging_type_id"),
  selectedSpecificationId: varchar("selected_specification_id"),
  productImage: text("product_image"),
  technicalDrawing: text("technical_drawing"),
  notes: text("notes"),
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

// Product Version types
export const insertProductVersionSchema = createInsertSchema(productVersions).omit({
  id: true,
  effectiveAt: true,
});
export type InsertProductVersion = z.infer<typeof insertProductVersionSchema>;
export type ProductVersion = typeof productVersions.$inferSelect;

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Session storage table for connect-pg-simple
export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

// ================================
// SHARE LINKS FOR EXTERNAL ACCESS
// ================================

export const shareLinks = pgTable("share_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(), // FK to products
  token: varchar("token").notNull().unique(), // Unique random token for URL
  
  // Access configuration
  accessType: text("access_type").notNull().default("read_only"), // "public", "read_only"
  allowPdfDownload: boolean("allow_pdf_download").default(true).notNull(),
  
  // Expiration settings
  expiresAt: timestamp("expires_at"), // null = never expires
  
  // Usage tracking
  accessCount: integer("access_count").default(0).notNull(),
  lastAccessedAt: timestamp("last_accessed_at"),
  
  // Metadata
  createdBy: varchar("created_by"), // FK to users who created the link
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"), // Optional notes about who this link is for
});

export const insertShareLinkSchema = createInsertSchema(shareLinks).omit({
  id: true,
  accessCount: true,
  lastAccessedAt: true,
  createdAt: true,
});

export const createShareLinkSchema = z.object({
  productId: z.string(),
  accessType: z.enum(["public", "read_only"]).default("read_only"),
  allowPdfDownload: z.boolean().default(true),
  expiresAt: z.string().nullable().optional().refine((val) => {
    if (!val) return true; // null/empty is valid (no expiration)
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Data de expiração inválida" }),
  notes: z.string().optional(),
});

export type InsertShareLink = z.infer<typeof insertShareLinkSchema>;
export type ShareLink = typeof shareLinks.$inferSelect;
export type CreateShareLinkData = z.infer<typeof createShareLinkSchema>;

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
  abbreviation: text("abbreviation"), // e.g., "CERT"
  shortCode: text("short_code"), // e.g., "C"
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
  abbreviation: text("abbreviation"), // e.g., "PAL"
  shortCode: text("short_code"), // e.g., "P"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPackagingTypeSchema = createInsertSchema(packagingTypes).omit({
  id: true,
  createdAt: true,
});
export type InsertPackagingType = z.infer<typeof insertPackagingTypeSchema>;
export type PackagingType = typeof packagingTypes.$inferSelect;

// Models (3_Modelo)
export const models = pgTable("models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // e.g., "437"
  displayCode: text("display_code").notNull(), // e.g., "0541" - used in Reference
  description: text("description").notNull(), // e.g., "SPOUT FLEXIVEL"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertModelSchema = createInsertSchema(models).omit({
  id: true,
  createdAt: true,
});
export type InsertModel = z.infer<typeof insertModelSchema>;
export type Model = typeof models.$inferSelect;

// Specifications (10_Especificações)
export const specifications = pgTable("specifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(), // e.g., "00127" - used in barcode
  displayCode: text("display_code").notNull(), // e.g., "A127" - used in Reference
  description: text("description"), // e.g., "400G" or other specification details
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSpecificationSchema = createInsertSchema(specifications).omit({
  id: true,
  createdAt: true,
});
export type InsertSpecification = z.infer<typeof insertSpecificationSchema>;
export type Specification = typeof specifications.$inferSelect;

// Generic dropdown option type for API responses
export type DropdownOption = {
  id: string;
  code: string;
  description: string;
  isActive: boolean;
};

// Extended dropdown option type with abbreviations
export type ExtendedDropdownOption = DropdownOption & {
  abbreviation?: string;
  shortCode?: string;
  displayCode?: string;
};