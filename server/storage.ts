import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, like, sql, desc, asc } from "drizzle-orm";
import { 
  type User, 
  type InsertUser, 
  type Product, 
  type InsertProduct, 
  type UpdateProduct, 
  type ProductSearch,
  type ProductVersion,
  type InsertProductVersion,
  type ShareLink,
  type InsertShareLink,
  products, 
  productVersions,
  users,
  shareLinks 
} from "@shared/schema";

// Database connection
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql_client = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql_client);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  
  // Product methods
  getProducts(search?: ProductSearch): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByCode(productCode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct, userId?: string): Promise<Product>;
  updateProduct(id: string, product: UpdateProduct, userId?: string): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Product Version methods
  getProductVersions(productId: string): Promise<ProductVersion[]>;
  getProductVersion(versionId: string): Promise<ProductVersion | undefined>;
  createProductVersion(version: InsertProductVersion): Promise<ProductVersion>;
  
  // Share Link methods
  getShareLinks(productId: string): Promise<ShareLink[]>;
  getShareLinkByToken(token: string): Promise<ShareLink | undefined>;
  createShareLink(shareLink: InsertShareLink): Promise<ShareLink>;
  updateShareLink(id: string, shareLink: Partial<InsertShareLink>): Promise<ShareLink | undefined>;
  deleteShareLink(id: string): Promise<boolean>;
  incrementShareLinkAccess(token: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const result = await db.select().from(users).orderBy(asc(users.name));
      return result;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const result = await db.update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Product methods
  async getProducts(search?: ProductSearch): Promise<Product[]> {
    try {
      const baseQuery = db.select().from(products);
      
      if (search) {
        const conditions = [];
        
        if (search.query) {
          conditions.push(
            sql`(
              ${products.productCode} ILIKE ${`%${search.query}%`} OR
              ${products.product} ILIKE ${`%${search.query}%`} OR
              ${products.model} ILIKE ${`%${search.query}%`} OR
              ${products.family} ILIKE ${`%${search.query}%`}
            )`
          );
        }
        
        if (search.productCode) {
          conditions.push(like(products.productCode, `%${search.productCode}%`));
        }
        
        if (search.model) {
          conditions.push(like(products.model, `%${search.model}%`));
        }
        
        if (search.family) {
          conditions.push(like(products.family, `%${search.family}%`));
        }
        
        if (search.type) {
          conditions.push(like(products.type, `%${search.type}%`));
        }
        
        if (search.createdAfter) {
          conditions.push(sql`${products.createdAt} >= ${new Date(search.createdAfter)}`);
        }
        
        if (search.createdBefore) {
          conditions.push(sql`${products.createdAt} <= ${new Date(search.createdBefore)}`);
        }
        
        if (search.isActive !== undefined) {
          conditions.push(eq(products.isActive, search.isActive));
        }
        
        if (conditions.length > 0) {
          const result = await baseQuery.where(and(...conditions)).orderBy(desc(products.createdAt));
          return result;
        }
      }
      
      const result = await baseQuery.orderBy(desc(products.createdAt));
      return result;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  async getProduct(id: string): Promise<Product | undefined> {
    try {
      const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting product:', error);
      return undefined;
    }
  }

  async getProductByCode(productCode: string): Promise<Product | undefined> {
    try {
      const result = await db.select().from(products).where(eq(products.productCode, productCode)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting product by code:', error);
      return undefined;
    }
  }

  async createProduct(insertProduct: InsertProduct, userId?: string): Promise<Product> {
    try {
      const result = await db.insert(products).values({
        ...insertProduct,
        currentVersionNumber: 1,
      }).returning();
      const product = result[0];
      
      const versionData = this.extractVersionData(product);
      const version = await this.createProductVersion({
        productId: product.id,
        versionNumber: 1,
        previousVersionId: null,
        createdBy: userId || null,
        changeNotes: "Versão inicial",
        ...versionData,
      });
      
      await db.update(products)
        .set({ latestVersionId: version.id })
        .where(eq(products.id, product.id));
      
      return { ...product, latestVersionId: version.id };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updateProductData: UpdateProduct, userId?: string): Promise<Product | undefined> {
    try {
      const existingProduct = await this.getProduct(id);
      if (!existingProduct) return undefined;
      
      const newVersionNumber = existingProduct.currentVersionNumber + 1;
      
      const result = await db
        .update(products)
        .set({ 
          ...updateProductData, 
          updatedAt: new Date(),
          currentVersionNumber: newVersionNumber,
        })
        .where(eq(products.id, id))
        .returning();
      
      const updatedProduct = result[0];
      if (!updatedProduct) return undefined;
      
      const versionData = this.extractVersionData(updatedProduct);
      const version = await this.createProductVersion({
        productId: id,
        versionNumber: newVersionNumber,
        previousVersionId: existingProduct.latestVersionId || null,
        createdBy: userId || null,
        changeNotes: `Versão ${newVersionNumber}`,
        ...versionData,
      });
      
      await db.update(products)
        .set({ latestVersionId: version.id })
        .where(eq(products.id, id));
      
      return { ...updatedProduct, latestVersionId: version.id };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await db.delete(productVersions).where(eq(productVersions.productId, id));
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  async getProductVersions(productId: string): Promise<ProductVersion[]> {
    try {
      const result = await db.select()
        .from(productVersions)
        .where(eq(productVersions.productId, productId))
        .orderBy(desc(productVersions.versionNumber));
      return result;
    } catch (error) {
      console.error('Error getting product versions:', error);
      return [];
    }
  }

  async getProductVersion(versionId: string): Promise<ProductVersion | undefined> {
    try {
      const result = await db.select()
        .from(productVersions)
        .where(eq(productVersions.id, versionId))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting product version:', error);
      return undefined;
    }
  }

  async createProductVersion(version: InsertProductVersion): Promise<ProductVersion> {
    try {
      const result = await db.insert(productVersions).values(version).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating product version:', error);
      throw error;
    }
  }

  private extractVersionData(product: Product) {
    return {
      model: product.model,
      family: product.family,
      type: product.type,
      product: product.product,
      productCode: product.productCode,
      designation: product.designation,
      barcode: product.barcode,
      nominalCapacity: product.nominalCapacity,
      totalCapacity: product.totalCapacity,
      rawMaterial: product.rawMaterial,
      colors: product.colors,
      weight: product.weight,
      weightWithAccessories: product.weightWithAccessories,
      dimensions: product.dimensions,
      closingSystem: product.closingSystem,
      capType: product.capType,
      capDimensions: product.capDimensions,
      sealingType: product.sealingType,
      vedantePead: product.vedantePead,
      vedanteEpdm: product.vedanteEpdm,
      vedanteOutros: product.vedanteOutros,
      handlingSystem: product.handlingSystem,
      pegasLaterais: product.pegasLaterais,
      pegaSuperior: product.pegaSuperior,
      cavidades: product.cavidades,
      manuseamentoOutros: product.manuseamentoOutros,
      markings: product.markings,
      datador: product.datador,
      simboloSie: product.simboloSie,
      simboloMp: product.simboloMp,
      gravacaoCliente: product.gravacaoCliente,
      visor: product.visor,
      bica: product.bica,
      coexPoliamida: product.coexPoliamida,
      adaptacao: product.adaptacao,
      autoculanteCliente: product.autoculanteCliente,
      especificacoesEmbFlexiveis: product.especificacoesEmbFlexiveis,
      stackable: product.stackable,
      stackingCapacity: product.stackingCapacity,
      packaging: product.packaging,
      palletDimensions: product.palletDimensions,
      productOnPalletDimensions: product.productOnPalletDimensions,
      arrangementScheme: product.arrangementScheme,
      totalUnits: product.totalUnits,
      certifications: product.certifications,
      foodContact: product.foodContact,
      specialFeatures: product.specialFeatures,
      selectedCertificationTypeId: product.selectedCertificationTypeId,
      selectedPackagingTypeId: product.selectedPackagingTypeId,
      selectedSpecificationId: product.selectedSpecificationId,
      productImage: product.productImage,
      technicalDrawing: product.technicalDrawing,
      notes: product.notes,
    };
  }
  
  // Share Link methods
  async getShareLinks(productId: string): Promise<ShareLink[]> {
    try {
      const result = await db.select()
        .from(shareLinks)
        .where(eq(shareLinks.productId, productId))
        .orderBy(desc(shareLinks.createdAt));
      return result;
    } catch (error) {
      console.error('Error getting share links:', error);
      return [];
    }
  }
  
  async getShareLinkByToken(token: string): Promise<ShareLink | undefined> {
    try {
      const result = await db.select()
        .from(shareLinks)
        .where(eq(shareLinks.token, token))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting share link by token:', error);
      return undefined;
    }
  }
  
  async createShareLink(shareLink: InsertShareLink): Promise<ShareLink> {
    const result = await db.insert(shareLinks).values(shareLink).returning();
    return result[0];
  }
  
  async updateShareLink(id: string, updates: Partial<InsertShareLink>): Promise<ShareLink | undefined> {
    try {
      const result = await db.update(shareLinks)
        .set(updates)
        .where(eq(shareLinks.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating share link:', error);
      return undefined;
    }
  }
  
  async deleteShareLink(id: string): Promise<boolean> {
    try {
      const result = await db.delete(shareLinks)
        .where(eq(shareLinks.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting share link:', error);
      return false;
    }
  }
  
  async incrementShareLinkAccess(token: string): Promise<void> {
    try {
      await db.update(shareLinks)
        .set({
          accessCount: sql`${shareLinks.accessCount} + 1`,
          lastAccessedAt: new Date(),
        })
        .where(eq(shareLinks.token, token));
    } catch (error) {
      console.error('Error incrementing share link access:', error);
    }
  }
}

export const storage = new DatabaseStorage();