import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage, db } from "./storage";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { seedDefaultTemplates } from "./seed-templates";

async function initializeAdminUser() {
  try {
    const adminEmail = "admin@sie.pt";
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await storage.createUser({
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
      });
      log("Admin user created: admin@sie.pt");
    } else if (!existingAdmin.isActive) {
      await db.update(users)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(users.id, existingAdmin.id));
      log("Admin user reactivated: admin@sie.pt");
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust proxy for production (Replit uses reverse proxy)
app.set('trust proxy', 1);

// Session configuration with 60-day expiry
const PgStore = pgSession(session);
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds
const isProduction = process.env.NODE_ENV === 'production';

app.use(session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: SIXTY_DAYS_MS,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  },
}));

// Serve uploaded files statically
app.use('/uploads', express.static('public/uploads'));
// Serve attached assets (logos, branding images) for editor preview
app.use('/attached_assets', express.static('attached_assets'));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await initializeAdminUser();
  await seedDefaultTemplates();
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Erro interno do servidor";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
