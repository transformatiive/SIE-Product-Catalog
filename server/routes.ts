import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import path from "path";
import multer from "multer";
import fs from "fs-extra";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { storage, db } from "./storage";
import { 
  insertProductSchema, 
  updateProductSchema, 
  productSearchSchema,
  loginSchema,
  insertUserSchema,
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
  insertSpecificationSchema
} from "@shared/schema";
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
};

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
  app.get("/api/admin/:tableName", async (req, res) => {
    try {
      const { tableName } = req.params;
      const tableConfig = tableMap[tableName as keyof typeof tableMap];
      
      if (!tableConfig) {
        return res.status(404).json({ message: "Tabela não encontrada" });
      }
      
      const showAll = req.query.all === 'true';
      const options = showAll 
        ? await db.select().from(tableConfig.table)
        : await db.select().from(tableConfig.table).where(eq(tableConfig.table.isActive, true));
      
      res.json(options);
    } catch (error) {
      console.error("Error getting admin options:", error);
      res.status(500).json({ message: "Falha ao obter opções" });
    }
  });

  // POST /api/admin/:tableName - Create a new option
  app.post("/api/admin/:tableName", async (req, res) => {
    try {
      const { tableName } = req.params;
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
  app.put("/api/admin/:tableName/:id", async (req, res) => {
    try {
      const { tableName, id } = req.params;
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
  app.delete("/api/admin/:tableName/:id", async (req, res) => {
    try {
      const { tableName, id } = req.params;
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

  const httpServer = createServer(app);

  return httpServer;
}