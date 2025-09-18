import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, updateProductSchema, productSearchSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

export async function registerRoutes(app: Express): Promise<Server> {
  // Product routes
  
  // GET /api/products - Get all products with optional search/filters
  app.get("/api/products", async (req, res) => {
    try {
      const searchResult = productSearchSchema.safeParse(req.query);
      if (!searchResult.success) {
        return res.status(400).json({ 
          message: "Invalid search parameters", 
          errors: fromZodError(searchResult.error).toString()
        });
      }

      const products = await storage.getProducts(searchResult.data);
      res.json(products);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  // GET /api/products/:id - Get a specific product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error getting product:", error);
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  // GET /api/products/code/:productCode - Get a specific product by product code
  app.get("/api/products/code/:productCode", async (req, res) => {
    try {
      const { productCode } = req.params;
      const product = await storage.getProductByCode(productCode);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error getting product by code:", error);
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  // POST /api/products - Create a new product
  app.post("/api/products", async (req, res) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: fromZodError(validation.error).toString()
        });
      }

      // Check if product code already exists
      const existingProduct = await storage.getProductByCode(validation.data.productCode);
      if (existingProduct) {
        return res.status(409).json({ message: "Product code already exists" });
      }

      const product = await storage.createProduct(validation.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // PUT /api/products/:id - Update a product
  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validation = updateProductSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: fromZodError(validation.error).toString()
        });
      }

      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      // If updating product code, check for uniqueness
      if (validation.data.productCode && validation.data.productCode !== existingProduct.productCode) {
        const productWithCode = await storage.getProductByCode(validation.data.productCode);
        if (productWithCode && productWithCode.id !== id) {
          return res.status(409).json({ message: "Product code already exists" });
        }
      }

      const updatedProduct = await storage.updateProduct(id, validation.data);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // DELETE /api/products/:id - Delete a product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete product" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // GET /api/products/:id/pdf - Generate PDF datasheet for a product
  app.get("/api/products/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the product
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Import the PDF template dynamically to avoid import issues
      const { TechnicalDatasheetPDF } = await import('./pdf-template');
      
      // Create the PDF document
      const pdfDocument = React.createElement(TechnicalDatasheetPDF, { product });
      
      // Render PDF to buffer
      const pdfBuffer = await renderToBuffer(pdfDocument as React.ReactElement);
      
      // Set response headers
      const filename = `${product.productCode}-Datasheet.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the PDF
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ 
        message: "Failed to generate PDF", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // User routes (keeping existing structure for compatibility)
  
  // GET /api/users/:id - Get a user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}