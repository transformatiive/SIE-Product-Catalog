import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import multer from "multer";
import fs from "fs-extra";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { storage, db } from "./storage";
import { 
  insertProductSchema, 
  updateProductSchema, 
  productSearchSchema,
  loginSchema,
  insertUserSchema,
  createShareLinkSchema,
  families,
  insertFamilySchema,
  productTypes,
  insertProductTypeSchema,
  capacities,
  insertCapacitySchema,
  rawMaterials,
  insertRawMaterialSchema,
  colors,
  insertColorSchema,
  closingSystems,
  insertClosingSystemSchema,
  capSizes,
  insertCapSizeSchema,
  certificationTypes,
  insertCertificationTypeSchema,
  packagingTypes,
  insertPackagingTypeSchema,
  models,
  insertModelSchema,
  specifications,
  insertSpecificationSchema,
  dimensionTypes,
  insertDimensionTypeSchema,
  shapes,
  insertShapeSchema,
  pdfTemplates,
  insertPdfTemplateSchema,
  updatePdfTemplateSchema,
} from "@shared/schema";
import { renderTemplateToDocument } from "./template-renderer";
import { MERGE_FIELDS } from "@shared/mergeFields";
import { fromZodError } from "zod-validation-error";
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  next();
}

const tableMap = {
  families: { table: families, insertSchema: insertFamilySchema },
  productTypes: { table: productTypes, insertSchema: insertProductTypeSchema },
  capacities: { table: capacities, insertSchema: insertCapacitySchema },
  rawMaterials: { table: rawMaterials, insertSchema: insertRawMaterialSchema },
  colors: { table: colors, insertSchema: insertColorSchema },
  closingSystems: { table: closingSystems, insertSchema: insertClosingSystemSchema },
  capSizes: { table: capSizes, insertSchema: insertCapSizeSchema },
  certificationTypes: { table: certificationTypes, insertSchema: insertCertificationTypeSchema },
  packagingTypes: { table: packagingTypes, insertSchema: insertPackagingTypeSchema },
  models: { table: models, insertSchema: insertModelSchema },
  specifications: { table: specifications, insertSchema: insertSpecificationSchema },
  dimensionTypes: { table: dimensionTypes, insertSchema: insertDimensionTypeSchema },
  shapes: { table: shapes, insertSchema: insertShapeSchema },
};

async function resolveTemplateForProduct(product: { family?: string | null }): Promise<any> {
  // 1) Family.defaultTemplateId
  if (product.family) {
    try {
      const fam = await db
        .select()
        .from(families)
        .where(eq(families.description, product.family))
        .limit(1);
      const tplId = fam[0]?.defaultTemplateId;
      if (tplId) {
        const tpl = await db
          .select()
          .from(pdfTemplates)
          .where(eq(pdfTemplates.id, tplId))
          .limit(1);
        if (tpl[0] && tpl[0].isActive) return tpl[0];
      }
    } catch (e) {
      console.warn("resolveTemplateForProduct family lookup failed", e);
    }
  }

  // 2) Global default
  try {
    const def = await db
      .select()
      .from(pdfTemplates)
      .where(eq(pdfTemplates.isGlobalDefault, true))
      .limit(1);
    if (def[0] && def[0].isActive) return def[0];
  } catch (e) {
    console.warn("resolveTemplateForProduct global default lookup failed", e);
  }

  // 3) Built-in SIE Padrão fallback
  try {
    const builtin = await db
      .select()
      .from(pdfTemplates)
      .where(eq(pdfTemplates.builtInRenderer, "sie-default"))
      .limit(1);
    if (builtin[0]) return builtin[0];
  } catch (e) {
    console.warn("resolveTemplateForProduct built-in lookup failed", e);
  }

  // Last-resort synthetic built-in (in case seed didn't run)
  return {
    id: "_fallback",
    name: "SIE Padrão",
    description: null,
    content: null,
    pageSize: "A4",
    orientation: "portrait",
    builtInRenderer: "sie-default",
    isGlobalDefault: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ================================
  // AUTHENTICATION ROUTES
  // ================================

  // POST /api/auth/login - User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Dados de login inválidos", 
          errors: fromZodError(result.error).toString()
        });
      }

      const { email, password } = result.data;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Email ou password incorretos" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Email ou password incorretos" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Conta desativada. Contacte o administrador." });
      }

      req.session.userId = user.id;
      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email,
        isActive: user.isActive 
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Falha no login" });
    }
  });

  // POST /api/auth/logout - User logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Falha ao terminar sessão" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Sessão terminada com sucesso" });
    });
  });

  // GET /api/auth/me - Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Não autenticado" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "Utilizador não encontrado" });
      }

      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email,
        isActive: user.isActive 
      });
    } catch (error) {
      console.error("Error getting current user:", error);
      res.status(500).json({ message: "Falha ao obter utilizador" });
    }
  });

  // ================================
  // USER MANAGEMENT ROUTES
  // ================================

  // GET /api/users - Get all users (protected)
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        isActive: u.isActive,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      })));
    } catch (error) {
      console.error("Error getting users:", error);
      res.status(500).json({ message: "Falha ao obter utilizadores" });
    }
  });

  // POST /api/users - Create user (protected)
  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: fromZodError(result.error).toString()
        });
      }

      const existingUser = await storage.getUserByEmail(result.data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já registado" });
      }

      const hashedPassword = await bcrypt.hash(result.data.password, 10);
      const user = await storage.createUser({
        ...result.data,
        password: hashedPassword,
      });
      res.status(201).json({ 
        id: user.id, 
        name: user.name, 
        email: user.email,
        isActive: user.isActive 
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Falha ao criar utilizador" });
    }
  });

  // PATCH /api/users/:id - Update user (protected)
  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const user = await storage.updateUser(id, updateData);
      
      if (!user) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email,
        isActive: user.isActive 
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Falha ao atualizar utilizador" });
    }
  });

  // DELETE /api/users/:id - Delete user (protected)
  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      if (id === req.session.userId) {
        return res.status(400).json({ message: "Não pode eliminar a sua própria conta" });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "Utilizador não encontrado" });
      }

      res.json({ message: "Utilizador eliminado com sucesso" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Falha ao eliminar utilizador" });
    }
  });

  // ================================
  // PRODUCT ROUTES
  // ================================
  
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

      let productCode = validation.data.productCode;
      const hasPlaceholders = /\[.*\]/.test(productCode);
      
      if (hasPlaceholders || !productCode || productCode.trim() === '') {
        productCode = `TEMP-${nanoid(8)}`;
        validation.data.productCode = productCode;
      }

      const existingProduct = await storage.getProductByCode(productCode);
      if (existingProduct) {
        validation.data.productCode = `${productCode}-${nanoid(6)}`;
      }

      const userId = req.session?.userId;
      const product = await storage.createProduct(validation.data, userId);
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

      const userId = req.session?.userId;
      const updatedProduct = await storage.updateProduct(id, validation.data, userId);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Falha ao atualizar produto" });
    }
  });

  // GET /api/products/:id/versions - Get version history for a product
  app.get("/api/products/:id/versions", async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      const versions = await storage.getProductVersions(id);
      res.json(versions);
    } catch (error) {
      console.error("Error getting product versions:", error);
      res.status(500).json({ message: "Falha ao obter histórico de versões" });
    }
  });

  // GET /api/products/:id/versions/:versionId - Get a specific version
  app.get("/api/products/:id/versions/:versionId", async (req, res) => {
    try {
      const { id, versionId } = req.params;
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      
      const version = await storage.getProductVersion(versionId);
      if (!version || version.productId !== id) {
        return res.status(404).json({ message: "Versão não encontrada" });
      }
      
      res.json(version);
    } catch (error) {
      console.error("Error getting product version:", error);
      res.status(500).json({ message: "Falha ao obter versão" });
    }
  });

  // PATCH /api/products/:id/versions/:versionId/annul - Annul a version
  app.patch("/api/products/:id/versions/:versionId/annul", async (req, res) => {
    try {
      const { id, versionId } = req.params;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      const version = await storage.getProductVersion(versionId);
      if (!version || version.productId !== id) {
        return res.status(404).json({ message: "Versão não encontrada" });
      }
      const result = await storage.annulVersion(versionId);
      res.json(result);
    } catch (error) {
      console.error("Error annulling version:", error);
      res.status(500).json({ message: "Falha ao anular versão" });
    }
  });

  // PATCH /api/products/:id/versions/:versionId/restore - Restore an annulled version
  app.patch("/api/products/:id/versions/:versionId/restore", async (req, res) => {
    try {
      const { id, versionId } = req.params;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }
      const version = await storage.getProductVersion(versionId);
      if (!version || version.productId !== id) {
        return res.status(404).json({ message: "Versão não encontrada" });
      }
      const result = await storage.restoreVersion(versionId);
      res.json(result);
    } catch (error) {
      console.error("Error restoring version:", error);
      res.status(500).json({ message: "Falha ao restaurar versão" });
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
      const { versionId } = req.query;
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      let productData: any = product;
      if (versionId && typeof versionId === 'string') {
        const version = await storage.getProductVersion(versionId);
        if (version && version.productId === id && !version.isAnnulled) {
          productData = { ...product, ...version, id: product.id };
        }
      }

      const template = await resolveTemplateForProduct(productData);
      const pdfDocument = renderTemplateToDocument(template, productData);
      const pdfBuffer = await renderToBuffer(pdfDocument as React.ReactElement);
      
      const filename = `${productData.productCode}-Datasheet.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
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
      try {
        // Generate unique filename with timestamp and original extension
        const timestamp = Date.now();
        const extension = path.extname(file.originalname).toLowerCase();
        
        // Enhanced filename sanitization
        const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
        
        // Remove dangerous characters and normalize
        let sanitizedName = nameWithoutExt
          .replace(/[^a-zA-Z0-9-_\s]/g, '') // Remove special chars except dash, underscore, spaces
          .replace(/\s+/g, '_') // Replace spaces with underscores
          .toLowerCase() // Normalize to lowercase
          .trim();
        
        // Ensure name is not empty and not too long
        if (!sanitizedName || sanitizedName.length === 0) {
          sanitizedName = 'uploaded_file';
        } else if (sanitizedName.length > 50) {
          sanitizedName = sanitizedName.substring(0, 50);
        }
        
        // Prevent reserved names
        const reservedNames = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'];
        if (reservedNames.includes(sanitizedName.toLowerCase())) {
          sanitizedName = 'uploaded_' + sanitizedName;
        }
        
        // Generate final filename with UUID-like suffix for uniqueness
        const uniqueId = Math.random().toString(36).substring(2, 15);
        const finalFilename = `${sanitizedName}_${timestamp}_${uniqueId}${extension}`;
        
        cb(null, finalFilename);
      } catch (error) {
        const fallbackFilename = `error_${Date.now()}.tmp`;
        cb(error instanceof Error ? error : new Error('Unknown error occurred'), fallbackFilename);
      }
    }
  });

  // Enhanced file filter for images only with additional security checks
  const fileFilter = (req: any, file: any, cb: any) => {
    try {
      // Validate file field name
      if (file.fieldname !== 'image') {
        return cb(new Error('Campo de arquivo inválido. Use "image" como nome do campo.'));
      }

      // Check file extension
      const allowedExtensions = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
      const extension = path.extname(file.originalname).toLowerCase().slice(1);
      const extIsValid = allowedExtensions.includes(extension);

      // Check MIME type with more specific validation
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp'
      ];
      const mimeIsValid = allowedMimeTypes.includes(file.mimetype.toLowerCase());

      // Validate original filename is not empty and not too long
      if (!file.originalname || file.originalname.trim().length === 0) {
        return cb(new Error('Nome do arquivo não pode estar vazio.'));
      }
      
      if (file.originalname.length > 255) {
        return cb(new Error('Nome do arquivo muito longo (máximo 255 caracteres).'));
      }

      // Check for potential security issues in filename
      const dangerousPatterns = [
        /\.\./,           // Directory traversal
        /[<>:"|*?]/,      // Windows forbidden chars
        /[\x00-\x1f]/,    // Control chars
        /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
      ];
      
      const isDangerous = dangerousPatterns.some(pattern => pattern.test(file.originalname));
      if (isDangerous) {
        return cb(new Error('Nome do arquivo contém caracteres não permitidos.'));
      }

      if (mimeIsValid && extIsValid) {
        return cb(null, true);
      } else {
        const error = !mimeIsValid 
          ? `Tipo MIME inválido: ${file.mimetype}. Tipos permitidos: ${allowedMimeTypes.join(', ')}`
          : `Extensão inválida: .${extension}. Extensões permitidas: ${allowedExtensions.join(', ')}`;
        return cb(new Error(error));
      }
    } catch (error) {
      return cb(new Error('Erro na validação do arquivo: ' + (error instanceof Error ? error.message : 'Erro desconhecido')));
    }
  };

  const upload = multer({
    storage: storage_config,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 1, // Maximum number of files
      fields: 1, // Maximum number of non-file fields
      fieldNameSize: 50, // Maximum field name size
      fieldSize: 1024, // Maximum field value size in bytes
    },
    fileFilter: fileFilter,
  });

  // POST /api/upload - Upload image files with enhanced error handling
  app.post("/api/upload", (req, res) => {
    upload.single('image')(req, res, (err) => {
      try {
        // Handle multer errors
        if (err) {
          console.error("Multer error:", err);
          
          // Check for specific multer error types
          if (err instanceof multer.MulterError) {
            switch (err.code) {
              case 'LIMIT_FILE_SIZE':
                return res.status(400).json({ 
                  message: "Arquivo muito grande",
                  error: "O arquivo deve ter no máximo 10MB",
                  code: 'FILE_TOO_LARGE'
                });
              case 'LIMIT_FILE_COUNT':
                return res.status(400).json({ 
                  message: "Muitos arquivos",
                  error: "Apenas um arquivo é permitido",
                  code: 'TOO_MANY_FILES'
                });
              case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({ 
                  message: "Campo de arquivo inesperado",
                  error: "Use 'image' como nome do campo",
                  code: 'INVALID_FIELD'
                });
              default:
                return res.status(400).json({ 
                  message: "Erro no upload",
                  error: err.message,
                  code: 'UPLOAD_ERROR'
                });
            }
          } else {
            // Handle custom validation errors
            return res.status(400).json({ 
              message: "Arquivo inválido",
              error: err.message,
              code: 'INVALID_FILE'
            });
          }
        }

        // Check if file was uploaded
        if (!req.file) {
          return res.status(400).json({ 
            message: "Nenhum arquivo foi enviado",
            error: "Selecione um arquivo para enviar",
            code: 'NO_FILE'
          });
        }

        // Additional security: verify the file was actually saved in the correct location
        const expectedPath = path.join(uploadsDir, req.file.filename);
        if (!fs.existsSync(expectedPath)) {
          console.error("File was not saved properly:", expectedPath);
          return res.status(500).json({ 
            message: "Erro interno do servidor",
            error: "Arquivo não foi salvo corretamente",
            code: 'SAVE_ERROR'
          });
        }

        // Return success response
        const filePath = `/uploads/${req.file.filename}`;
        
        res.status(200).json({
          message: "Arquivo enviado com sucesso",
          filePath: filePath,
          originalName: req.file.originalname,
          size: req.file.size,
          filename: req.file.filename
        });
        
      } catch (error) {
        console.error("Unexpected error in upload:", error);
        res.status(500).json({ 
          message: "Falha ao enviar arquivo",
          error: error instanceof Error ? error.message : "Erro desconhecido",
          code: 'INTERNAL_ERROR'
        });
      }
    });
  });

  // DELETE /api/upload - Delete uploaded file with enhanced security
  app.delete("/api/upload", async (req, res) => {
    try {
      const { filePath } = req.body;
      
      // Validate input
      if (!filePath || typeof filePath !== 'string') {
        return res.status(400).json({ 
          message: "Caminho do arquivo é obrigatório",
          error: "Forneça um caminho de arquivo válido",
          code: 'MISSING_FILE_PATH'
        });
      }

      if (filePath.trim().length === 0) {
        return res.status(400).json({ 
          message: "Caminho do arquivo não pode estar vazio",
          code: 'EMPTY_FILE_PATH'
        });
      }

      // Enhanced security validation
      const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
      
      // Ensure path is within uploads directory
      if (!cleanPath.startsWith('uploads/')) {
        return res.status(400).json({ 
          message: "Caminho de arquivo inválido",
          error: "O arquivo deve estar no diretório uploads",
          code: 'INVALID_PATH'
        });
      }

      // Check for path traversal attempts
      if (cleanPath.includes('../') || cleanPath.includes('..\\') || cleanPath.includes('%2e%2e')) {
        return res.status(400).json({ 
          message: "Tentativa de travessia de diretório detectada",
          error: "Caminho de arquivo contém sequências perigosas",
          code: 'PATH_TRAVERSAL'
        });
      }

      // Additional security: validate file extension
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const extension = path.extname(cleanPath).toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        return res.status(400).json({ 
          message: "Tipo de arquivo não permitido para exclusão",
          error: `Extensão '${extension}' não é permitida`,
          code: 'INVALID_FILE_TYPE'
        });
      }

      // Build and validate full path
      const fullPath = path.join(process.cwd(), 'public', cleanPath);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      // Resolve paths to handle any remaining relative components
      const resolvedFullPath = path.resolve(fullPath);
      const resolvedUploadsDir = path.resolve(uploadsDir);
      
      if (!resolvedFullPath.startsWith(resolvedUploadsDir + path.sep) && resolvedFullPath !== resolvedUploadsDir) {
        return res.status(400).json({ 
          message: "Caminho de arquivo inválido",
          error: "O arquivo deve estar no diretório uploads",
          code: 'INVALID_PATH'
        });
      }

      // Check if file exists and delete
      if (await fs.pathExists(resolvedFullPath)) {
        await fs.remove(resolvedFullPath);
        res.status(200).json({ 
          message: "Arquivo deletado com sucesso",
          filePath: filePath
        });
      } else {
        res.status(404).json({ 
          message: "Arquivo não encontrado",
          error: "O arquivo especificado não existe",
          code: 'FILE_NOT_FOUND'
        });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ 
        message: "Falha ao deletar arquivo",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        code: 'DELETE_ERROR'
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

  // ================================
  // ADMIN ROUTES FOR SUPPORT TABLES
  // ================================

  // GET /api/admin/:tableName - Get all options for a table
  app.get("/api/admin/:tableName", async (req, res, next) => {
    try {
      const { tableName } = req.params;
      if (tableName === "pdf-templates") return next();
      const tableConfig = tableMap[tableName as keyof typeof tableMap];
      
      if (!tableConfig) {
        return res.status(404).json({ message: "Tabela não encontrada" });
      }
      
      const showAll = req.query.all === 'true';
      let options;
      try {
        options = showAll 
          ? await db.select().from(tableConfig.table)
          : await db.select().from(tableConfig.table).where(eq(tableConfig.table.isActive, true));
      } catch (queryError) {
        options = [];
      }
      
      res.json(options || []);
    } catch (error) {
      console.error("Error getting admin options:", error);
      res.status(500).json({ message: "Falha ao obter opções" });
    }
  });

  // POST /api/admin/:tableName - Create a new option
  app.post("/api/admin/:tableName", async (req, res, next) => {
    try {
      const { tableName } = req.params;
      if (tableName === "pdf-templates") return next();
      const tableConfig = tableMap[tableName as keyof typeof tableMap];
      
      if (!tableConfig) {
        return res.status(404).json({ message: "Tabela não encontrada" });
      }
      
      const validation = tableConfig.insertSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: fromZodError(validation.error).toString()
        });
      }
      
      const result = await db.insert(tableConfig.table).values(validation.data as any).returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating admin option:", error);
      res.status(500).json({ message: "Falha ao criar opção" });
    }
  });

  // PUT /api/admin/:tableName/:id - Update an option
  app.put("/api/admin/:tableName/:id", async (req, res, next) => {
    try {
      const { tableName, id } = req.params;
      if (tableName === "pdf-templates") return next();
      const tableConfig = tableMap[tableName as keyof typeof tableMap];
      
      if (!tableConfig) {
        return res.status(404).json({ message: "Tabela não encontrada" });
      }
      
      const validation = tableConfig.insertSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: fromZodError(validation.error).toString()
        });
      }
      
      const result = await db
        .update(tableConfig.table)
        .set(validation.data)
        .where(eq(tableConfig.table.id, id))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Opção não encontrada" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating admin option:", error);
      res.status(500).json({ message: "Falha ao atualizar opção" });
    }
  });

  // DELETE /api/admin/:tableName/:id - Soft delete (set isActive=false)
  app.delete("/api/admin/:tableName/:id", async (req, res, next) => {
    try {
      const { tableName, id } = req.params;
      if (tableName === "pdf-templates") return next();
      const tableConfig = tableMap[tableName as keyof typeof tableMap];
      
      if (!tableConfig) {
        return res.status(404).json({ message: "Tabela não encontrada" });
      }
      
      const result = await db
        .update(tableConfig.table)
        .set({ isActive: false })
        .where(eq(tableConfig.table.id, id))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Opção não encontrada" });
      }
      
      res.json({ message: "Opção desativada com sucesso" });
    } catch (error) {
      console.error("Error deleting admin option:", error);
      res.status(500).json({ message: "Falha ao eliminar opção" });
    }
  });

  // ================================
  // SHARE LINK ROUTES
  // ================================

  // GET /api/products/:id/share-links - Get all share links for a product (protected)
  app.get("/api/products/:id/share-links", requireAuth, async (req, res) => {
    try {
      const shareLinks = await storage.getShareLinks(req.params.id);
      res.json(shareLinks);
    } catch (error) {
      console.error("Error getting share links:", error);
      res.status(500).json({ message: "Falha ao obter links partilháveis" });
    }
  });

  // POST /api/products/:id/share-links - Create a share link (protected)
  app.post("/api/products/:id/share-links", requireAuth, async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      const validation = createShareLinkSchema.safeParse({
        ...req.body,
        productId: req.params.id,
      });
      
      if (!validation.success) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: fromZodError(validation.error).toString(),
        });
      }

      const token = nanoid(32); // Generate secure random token
      const shareLink = await storage.createShareLink({
        productId: req.params.id,
        token,
        accessType: validation.data.accessType,
        allowPdfDownload: validation.data.allowPdfDownload,
        expiresAt: validation.data.expiresAt ? new Date(validation.data.expiresAt) : null,
        createdBy: req.session.userId,
        notes: validation.data.notes,
        isActive: true,
      });

      res.status(201).json(shareLink);
    } catch (error) {
      console.error("Error creating share link:", error);
      res.status(500).json({ message: "Falha ao criar link partilhável" });
    }
  });

  // DELETE /api/share-links/:id - Delete a share link (protected)
  app.delete("/api/share-links/:id", requireAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteShareLink(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Link não encontrado" });
      }
      res.json({ message: "Link eliminado com sucesso" });
    } catch (error) {
      console.error("Error deleting share link:", error);
      res.status(500).json({ message: "Falha ao eliminar link" });
    }
  });

  // ================================
  // PUBLIC SHARE ROUTES (NO AUTH)
  // ================================

  // GET /api/share/:token - Get product data via share token (PUBLIC)
  app.get("/api/share/:token", async (req, res) => {
    try {
      const shareLink = await storage.getShareLinkByToken(req.params.token);
      
      if (!shareLink) {
        return res.status(404).json({ message: "Link inválido ou expirado" });
      }

      if (!shareLink.isActive) {
        return res.status(403).json({ message: "Este link foi desativado" });
      }

      // Check expiration
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ message: "Este link expirou" });
      }

      const product = await storage.getProduct(shareLink.productId);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      let productData: any = product;
      if (shareLink.versionId) {
        const version = await storage.getProductVersion(shareLink.versionId);
        if (version && version.productId === shareLink.productId && !version.isAnnulled) {
          productData = { ...product, ...version, id: product.id };
        }
      }

      await storage.incrementShareLinkAccess(req.params.token);

      res.json({
        product: productData,
        shareLink: {
          accessType: shareLink.accessType,
          allowPdfDownload: shareLink.allowPdfDownload,
        },
      });
    } catch (error) {
      console.error("Error accessing shared product:", error);
      res.status(500).json({ message: "Falha ao aceder ao produto" });
    }
  });

  // GET /api/share/:token/pdf - Download PDF via share token (PUBLIC)
  app.get("/api/share/:token/pdf", async (req, res) => {
    try {
      const shareLink = await storage.getShareLinkByToken(req.params.token);
      
      if (!shareLink) {
        return res.status(404).json({ message: "Link inválido ou expirado" });
      }

      if (!shareLink.isActive) {
        return res.status(403).json({ message: "Este link foi desativado" });
      }

      if (!shareLink.allowPdfDownload) {
        return res.status(403).json({ message: "Download de PDF não permitido para este link" });
      }

      // Check expiration
      if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
        return res.status(403).json({ message: "Este link expirou" });
      }

      const product = await storage.getProduct(shareLink.productId);
      if (!product) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      let productData: any = product;
      if (shareLink.versionId) {
        const version = await storage.getProductVersion(shareLink.versionId);
        if (version && version.productId === shareLink.productId && !version.isAnnulled) {
          productData = { ...product, ...version, id: product.id };
        }
      }

      const template = await resolveTemplateForProduct(productData);
      const pdfDocument = renderTemplateToDocument(template, productData);
      const pdfBuffer = await renderToBuffer(pdfDocument as React.ReactElement);

      const filename = `${productData.productCode}-Datasheet.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating shared PDF:", error);
      res.status(500).json({ message: "Falha ao gerar PDF" });
    }
  });

  // ================================
  // PDF TEMPLATES
  // ================================

  // GET /api/merge-fields - Catalog of merge fields available in templates
  app.get("/api/merge-fields", requireAuth, (_req, res) => {
    res.json(MERGE_FIELDS);
  });

  // GET /api/admin/pdf-templates - List all templates
  app.get("/api/admin/pdf-templates", requireAuth, async (_req, res) => {
    try {
      const list = await db.select().from(pdfTemplates).orderBy(pdfTemplates.name);
      res.json(list);
    } catch (error) {
      console.error("Error listing PDF templates:", error);
      res.status(500).json({ message: "Falha ao obter templates" });
    }
  });

  // GET /api/admin/pdf-templates/:id - Get one template
  app.get("/api/admin/pdf-templates/:id", requireAuth, async (req, res) => {
    try {
      const result = await db
        .select()
        .from(pdfTemplates)
        .where(eq(pdfTemplates.id, req.params.id))
        .limit(1);
      if (result.length === 0) {
        return res.status(404).json({ message: "Template não encontrado" });
      }
      res.json(result[0]);
    } catch (error) {
      console.error("Error getting PDF template:", error);
      res.status(500).json({ message: "Falha ao obter template" });
    }
  });

  // POST /api/admin/pdf-templates - Create
  app.post("/api/admin/pdf-templates", requireAuth, async (req, res) => {
    try {
      const validation = insertPdfTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: fromZodError(validation.error).toString(),
        });
      }
      const data = validation.data;
      // Built-in renderer is reserved for the seeded SIE Padrão
      data.builtInRenderer = null;
      if (data.isGlobalDefault) {
        await db
          .update(pdfTemplates)
          .set({ isGlobalDefault: false })
          .where(eq(pdfTemplates.isGlobalDefault, true));
      }
      const result = await db.insert(pdfTemplates).values(data).returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error creating PDF template:", error);
      res.status(500).json({ message: "Falha ao criar template" });
    }
  });

  // PUT /api/admin/pdf-templates/:id - Update
  app.put("/api/admin/pdf-templates/:id", requireAuth, async (req, res) => {
    try {
      const existing = await db
        .select()
        .from(pdfTemplates)
        .where(eq(pdfTemplates.id, req.params.id))
        .limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Template não encontrado" });
      }

      const validation = updatePdfTemplateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: fromZodError(validation.error).toString(),
        });
      }
      const data: any = { ...validation.data, updatedAt: new Date() };
      // Lock down built-in templates: only name/description and isGlobalDefault editable
      if (existing[0].builtInRenderer) {
        delete data.content;
        delete data.builtInRenderer;
        delete data.pageSize;
        delete data.orientation;
      } else {
        delete data.builtInRenderer; // never allow promoting custom to built-in
      }

      if (data.isGlobalDefault === true) {
        await db
          .update(pdfTemplates)
          .set({ isGlobalDefault: false })
          .where(eq(pdfTemplates.isGlobalDefault, true));
      }

      const result = await db
        .update(pdfTemplates)
        .set(data)
        .where(eq(pdfTemplates.id, req.params.id))
        .returning();
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating PDF template:", error);
      res.status(500).json({ message: "Falha ao actualizar template" });
    }
  });

  // POST /api/admin/pdf-templates/:id/duplicate - Duplicate a template
  app.post("/api/admin/pdf-templates/:id/duplicate", requireAuth, async (req, res) => {
    try {
      const existing = await db
        .select()
        .from(pdfTemplates)
        .where(eq(pdfTemplates.id, req.params.id))
        .limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Template não encontrado" });
      }
      const src = existing[0];
      const result = await db
        .insert(pdfTemplates)
        .values({
          name: `${src.name} (cópia)`,
          description: src.description,
          content: src.content,
          pageSize: src.pageSize,
          orientation: src.orientation,
          builtInRenderer: null,
          isGlobalDefault: false,
          isActive: true,
        })
        .returning();
      res.status(201).json(result[0]);
    } catch (error) {
      console.error("Error duplicating PDF template:", error);
      res.status(500).json({ message: "Falha ao duplicar template" });
    }
  });

  // DELETE /api/admin/pdf-templates/:id - Delete (block built-ins)
  app.delete("/api/admin/pdf-templates/:id", requireAuth, async (req, res) => {
    try {
      const existing = await db
        .select()
        .from(pdfTemplates)
        .where(eq(pdfTemplates.id, req.params.id))
        .limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Template não encontrado" });
      }
      if (existing[0].builtInRenderer) {
        return res
          .status(400)
          .json({ message: "Templates do sistema não podem ser eliminados" });
      }
      // Clear FK references on families before deleting
      await db
        .update(families)
        .set({ defaultTemplateId: null })
        .where(eq(families.defaultTemplateId, req.params.id));
      await db.delete(pdfTemplates).where(eq(pdfTemplates.id, req.params.id));
      res.json({ ok: true });
    } catch (error) {
      console.error("Error deleting PDF template:", error);
      res.status(500).json({ message: "Falha ao eliminar template" });
    }
  });

  // GET /api/admin/pdf-templates/:id/preview-pdf?productId=...
  app.get("/api/admin/pdf-templates/:id/preview-pdf", requireAuth, async (req, res) => {
    try {
      const tpl = await db
        .select()
        .from(pdfTemplates)
        .where(eq(pdfTemplates.id, req.params.id))
        .limit(1);
      if (tpl.length === 0) {
        return res.status(404).json({ message: "Template não encontrado" });
      }

      let product;
      const productId = typeof req.query.productId === "string" ? req.query.productId : undefined;
      if (productId) {
        product = await storage.getProduct(productId);
      }
      if (!product) {
        const all = await storage.getProducts();
        product = all[0];
      }
      if (!product) {
        return res.status(400).json({
          message: "Sem produtos para pré-visualizar. Crie pelo menos um produto.",
        });
      }

      const doc = renderTemplateToDocument(tpl[0], product, { previewMode: true });
      const buf = await renderToBuffer(doc as React.ReactElement);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="preview.pdf"`);
      res.setHeader("Content-Length", buf.length);
      res.send(buf);
    } catch (error) {
      console.error("Error rendering template preview:", error);
      res.status(500).json({ message: "Falha ao gerar pré-visualização" });
    }
  });

  // POST /api/admin/pdf-templates/preview-draft - Preview unsaved draft
  app.post("/api/admin/pdf-templates/preview-draft", requireAuth, async (req, res) => {
    try {
      const validation = insertPdfTemplateSchema.partial().safeParse(req.body.template);
      if (!validation.success) {
        return res.status(400).json({
          message: "Dados inválidos",
          errors: fromZodError(validation.error).toString(),
        });
      }
      const draft: any = {
        id: "draft",
        name: "Draft",
        description: null,
        content: validation.data.content || null,
        pageSize: validation.data.pageSize || "A4",
        orientation: validation.data.orientation || "portrait",
        builtInRenderer: null,
        isGlobalDefault: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      let product;
      if (req.body.productId) {
        product = await storage.getProduct(req.body.productId);
      }
      if (!product) {
        const all = await storage.getProducts();
        product = all[0];
      }
      if (!product) {
        return res.status(400).json({
          message: "Sem produtos para pré-visualizar. Crie pelo menos um produto.",
        });
      }

      const doc = renderTemplateToDocument(draft, product, { previewMode: true });
      const buf = await renderToBuffer(doc as React.ReactElement);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="preview.pdf"`);
      res.setHeader("Content-Length", buf.length);
      res.send(buf);
    } catch (error) {
      console.error("Error rendering draft preview:", error);
      res.status(500).json({ message: "Falha ao gerar pré-visualização" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}