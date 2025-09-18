import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import multer from "multer";
import fs from "fs-extra";
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
          message: "Parâmetros de pesquisa inválidos", 
          errors: fromZodError(searchResult.error).toString()
        });
      }

      const products = await storage.getProducts(searchResult.data);
      res.json(products);
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({ message: "Falha ao obter produtos" });
    }
  });

  // GET /api/products/:id - Get a specific product by ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error getting product:", error);
      res.status(500).json({ message: "Falha ao obter produto" });
    }
  });

  // GET /api/products/code/:productCode - Get a specific product by product code
  app.get("/api/products/code/:productCode", async (req, res) => {
    try {
      const { productCode } = req.params;
      const product = await storage.getProductByCode(productCode);
      
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error getting product by code:", error);
      res.status(500).json({ message: "Falha ao obter produto" });
    }
  });

  // POST /api/products - Create a new product
  app.post("/api/products", async (req, res) => {
    try {
      const validation = insertProductSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dados do produto inválidos", 
          errors: fromZodError(validation.error).toString()
        });
      }

      // Check if product code already exists
      const existingProduct = await storage.getProductByCode(validation.data.productCode);
      if (existingProduct) {
        return res.status(409).json({ message: "Código do produto já existe" });
      }

      const product = await storage.createProduct(validation.data);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Falha ao criar produto" });
    }
  });

  // PUT /api/products/:id - Update a product
  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validation = updateProductSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dados do produto inválidos", 
          errors: fromZodError(validation.error).toString()
        });
      }

      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      // If updating product code, check for uniqueness
      if (validation.data.productCode && validation.data.productCode !== existingProduct.productCode) {
        const productWithCode = await storage.getProductByCode(validation.data.productCode);
        if (productWithCode && productWithCode.id !== id) {
          return res.status(409).json({ message: "Código do produto já existe" });
        }
      }

      const updatedProduct = await storage.updateProduct(id, validation.data);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Falha ao atualizar produto" });
    }
  });

  // DELETE /api/products/:id - Delete a product
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if product exists
      const existingProduct = await storage.getProduct(id);
      if (!existingProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(500).json({ message: "Falha ao eliminar produto" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Falha ao eliminar produto" });
    }
  });

  // GET /api/products/:id/pdf - Generate PDF datasheet for a product
  app.get("/api/products/:id/pdf", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get the product
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
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
        message: "Falha ao gerar PDF", 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      });
    }
  });

  // File upload configuration
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Ensure uploads directory exists
  fs.ensureDirSync(uploadsDir);

  // Configure multer for file uploads
  const storage_config = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      // Generate unique filename with timestamp and original extension
      const timestamp = Date.now();
      const extension = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, extension);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '');
      cb(null, `${sanitizedName}-${timestamp}${extension}`);
    }
  });

  // File filter for images only
  const fileFilter = (req: any, file: any, cb: any) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    
    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, JPG, PNG, GIF, WebP)'));
    }
  };

  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: fileFilter,
  });

  // POST /api/upload - Upload image files
  app.post("/api/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo foi enviado" });
      }

      // Return the file path relative to public directory
      const filePath = `/uploads/${req.file.filename}`;
      
      res.json({
        message: "Arquivo enviado com sucesso",
        filePath: filePath,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ 
        message: "Falha ao enviar arquivo",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  // DELETE /api/upload - Delete uploaded file
  app.delete("/api/upload", async (req, res) => {
    try {
      const { filePath } = req.body;
      
      if (!filePath) {
        return res.status(400).json({ message: "Caminho do arquivo é obrigatório" });
      }

      // Security: ensure the file path is within uploads directory
      const fullPath = path.join(process.cwd(), 'public', filePath);
      const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fullPath.startsWith(uploadsPath)) {
        return res.status(400).json({ message: "Caminho de arquivo inválido" });
      }

      // Check if file exists and delete
      if (await fs.pathExists(fullPath)) {
        await fs.remove(fullPath);
        res.json({ message: "Arquivo deletado com sucesso" });
      } else {
        res.status(404).json({ message: "Arquivo não encontrado" });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ 
        message: "Falha ao deletar arquivo",
        error: error instanceof Error ? error.message : "Erro desconhecido"
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
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Falha ao obter utilizador" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}