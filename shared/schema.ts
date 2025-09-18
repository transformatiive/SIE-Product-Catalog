import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  model: text("model").notNull(),
  family: text("family").notNull(),
  type: text("type").notNull(),
  product: text("product").notNull(),
  productCode: text("product_code").notNull().unique(),
  nominalCapacity: text("nominal_capacity").notNull(),
  totalCapacity: text("total_capacity"),
  rawMaterial: text("raw_material").notNull(),
  colors: text("colors").notNull(),
  weight: text("weight").notNull(),
  weightWithAccessories: text("weight_with_accessories"),
  dimensions: text("dimensions").notNull(), // JSON string for multiple dimensions
  
  // Technical specifications
  closingSystem: text("closing_system"),
  sealingType: text("sealing_type"),
  handlingSystem: text("handling_system"),
  certifications: text("certifications"), // JSON array as string
  markings: text("markings"), // JSON array as string
  foodContact: boolean("food_contact").default(false),
  
  // Additional specifications
  packaging: text("packaging"), // JSON string for packaging details
  specialFeatures: text("special_features"), // JSON array as string
  
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