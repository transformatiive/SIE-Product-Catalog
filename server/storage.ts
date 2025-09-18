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
  products, 
  users 
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
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product methods
  getProducts(search?: ProductSearch): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByCode(productCode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
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

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    try {
      const result = await db.insert(products).values(insertProduct).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updateProduct: UpdateProduct): Promise<Product | undefined> {
    try {
      const result = await db
        .update(products)
        .set({ ...updateProduct, updatedAt: new Date() })
        .where(eq(products.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const result = await db.delete(products).where(eq(products.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();