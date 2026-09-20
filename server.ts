import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/database';
import { User, Portfolio } from './src/types/portfolio';

// In-memory token session map
const activeSessions = new Map<string, { user: User; portfolio?: Portfolio; createdAt: number }>();

// Pre-populate admin token for easy testability
const adminSeedUser = db.findUserById(db.getClients()[0]?.id || '') || {
  id: 'super-admin-id',
  email: 'admin@ultimatetomato.com',
  role: 'SUPER_ADMIN' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Rate limiting map for contact form (IP -> timestamps)
const contactRateLimits = new Map<string, number[]>();

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 5;
  const attempts = (contactRateLimits.get(ip) || []).filter((t) => now - t < windowMs);
  if (attempts.length >= maxAttempts) return false;
  attempts.push(now);
  contactRateLimits.set(ip, attempts);
  return true;
}

// Auth Middleware
interface AuthenticatedRequest extends Request {
  user?: User;
  portfolio?: Portfolio;
  targetPortfolioId?: string;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token.' });
  }

  const token = authHeader.substring(7);
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid.' });
  }

  req.user = session.user;
  req.portfolio = session.portfolio;

  // Resolve target portfolio ID
  // If Super Admin, allow specifying X-Portfolio-Id header or query param
  const requestedPortfolioId = (req.headers['x-portfolio-id'] as string) || (req.query.portfolioId as string);

  if (session.user.role === 'SUPER_ADMIN') {
    req.targetPortfolioId = requestedPortfolioId || session.portfolio?.id || db.getPortfolios()[0]?.id;
  } else {
    // Client is strictly isolated to their own portfolio!
    if (requestedPortfolioId && session.portfolio && requestedPortfolioId !== session.portfolio.id) {
      return res.status(403).json({ error: 'Forbidden: Tenant isolation violation. You cannot access another client portfolio.' });
    }
    req.targetPortfolioId = session.portfolio?.id;
  }

  if (!req.targetPortfolioId) {
    return res.status(404).json({ error: 'Target portfolio not found.' });
  }

  next();
}

function superAdminOnly(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Super Admin privileges required.' });
  }
  next();
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Ensure uploads directory exists and is statically served
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));

  // ==========================================
  // 1. AUTHENTICATION & ONBOARDING ROUTES
  // ==========================================

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const authResult = db.authenticate(email, password);
      if (!authResult) {
        return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
      }

      activeSessions.set(authResult.token, {
        user: authResult.user,
        portfolio: authResult.portfolio,
        createdAt: Date.now(),
      });

      return res.json({
        user: authResult.user,
        portfolio: authResult.portfolio,
        token: authResult.token,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal authentication error.' });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      activeSessions.delete(token);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    const token = authHeader.substring(7);
    const session = activeSessions.get(token);
    if (!session) {
      return res.status(401).json({ error: 'Session expired.' });
    }
    return res.json({
      user: session.user,
      portfolio: session.portfolio,
    });
  });

  app.post('/api/auth/onboard', (req: Request, res: Response) => {
    try {
      const { token, password, name, professional_title, bio } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: 'Onboarding token and password are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const result = db.completeOnboarding({ token, password, name, professional_title, bio });
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const authToken = `ut_tok_${crypto.randomBytes(32).toString('hex')}`;
      activeSessions.set(authToken, {
        user: result.user!,
        portfolio: result.portfolio,
        createdAt: Date.now(),
      });

      return res.json({
        success: true,
        user: result.user,
        portfolio: result.portfolio,
        token: authToken,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to complete onboarding.' });
    }
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    // Security best practice: don't reveal if email exists
    return res.json({
      success: true,
      message: 'If an account exists for this email, password reset instructions have been dispatched.',
    });
  });

  // ==========================================
  // 2. PUBLIC PORTFOLIO APIS
  // ==========================================

  app.get('/api/public/platform', (_req: Request, res: Response) => {
    return res.json(db.getPlatformSettings());
  });

  app.get('/api/public/portfolio/:slug?', (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const isPreview = req.query.preview === 'true';

      const bundle = db.getPublicPortfolioBundle(slug, isPreview);
      if (!bundle) {
        return res.status(404).json({ error: 'Portfolio not found or currently offline.' });
      }
      return res.json(bundle);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve portfolio.' });
    }
  });

  app.get('/api/public/portfolio/:slug/projects/:projectSlug', (req: Request, res: Response) => {
    try {
      const { slug, projectSlug } = req.params;
      const isPreview = req.query.preview === 'true';

      const portfolio = db.getPortfolioBySlug(slug, isPreview);
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found.' });
      }

      const project = db.getProjectBySlug(portfolio.id, projectSlug, isPreview);
      if (!project) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      return res.json(project);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve project details.' });
    }
  });

  app.post('/api/public/portfolio/:slug/contact', (req: Request, res: Response) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
      if (!checkContactRateLimit(ip)) {
        return res.status(429).json({ error: 'Too many messages sent. Please wait a moment before trying again.' });
      }

      const { slug } = req.params;
      const { sender, email, subject, message, honeypot } = req.body;

      // Honeypot spam defense: if hidden field is filled, silently discard bot
      if (honeypot) {
        return res.json({ success: true, message: 'Message submitted successfully.' });
      }

      if (!sender || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required fields.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      const portfolio = db.getPortfolioBySlug(slug);
      if (!portfolio) {
        return res.status(404).json({ error: 'Recipient portfolio not found.' });
      }

      const savedMessage = db.submitContactMessage(portfolio.id, { sender, email, subject, message });
      return res.json({
        success: true,
        message: 'Thank you! Your message has been received and will be reviewed shortly.',
        id: savedMessage.id,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to submit contact message.' });
    }
  });

  // ==========================================
  // 3. AUTHENTICATED ADMIN / CLIENT CMS APIS
  // ==========================================

  app.get('/api/admin/portfolios', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role === 'SUPER_ADMIN') {
      return res.json(db.getPortfolios());
    }
    const userPortfolio = db.getPortfolios().filter((p) => p.client_id === req.user?.client_id);
    return res.json(userPortfolio);
  });

  app.get('/api/admin/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getDashboardStats(req.targetPortfolioId!));
  });

  app.get('/api/admin/site-bundle', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const bundle = db.getPublicPortfolioBundle(req.targetPortfolioId!, true);
    return res.json(bundle);
  });

  // Projects CRUD
  app.get('/api/admin/projects', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const bundle = db.getPublicPortfolioBundle(req.targetPortfolioId!, true);
    return res.json(bundle?.projects || []);
  });

  app.post('/api/admin/projects', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { images, ...projectData } = req.body;
    const project = db.createProject(req.targetPortfolioId!, projectData, images, req.user?.email);
    return res.json(project);
  });

  app.put('/api/admin/projects/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { images, ...updates } = req.body;
    const project = db.updateProject(req.params.id, req.targetPortfolioId!, updates, images, req.user?.email);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    return res.json(project);
  });

  app.post('/api/admin/projects/:id/duplicate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const duplicated = db.duplicateProject(req.params.id, req.targetPortfolioId!, req.user?.email);
    if (!duplicated) return res.status(404).json({ error: 'Project not found to duplicate.' });
    return res.json(duplicated);
  });

  app.delete('/api/admin/projects/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.softDeleteProject(req.params.id, req.targetPortfolioId!, req.user?.email);
    return res.json({ success });
  });

  app.post('/api/admin/projects/:id/restore', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.restoreProject(req.params.id, req.targetPortfolioId!, req.user?.email);
    return res.json({ success });
  });

  // Categories CRUD
  app.get('/api/admin/categories', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getCategories(req.targetPortfolioId!));
  });

  app.post('/api/admin/categories', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const category = db.createCategory(req.targetPortfolioId!, req.body, req.user?.email);
    return res.json(category);
  });

  app.put('/api/admin/categories/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const updated = db.updateCategory(req.params.id, req.targetPortfolioId!, req.body);
    if (!updated) return res.status(404).json({ error: 'Category not found.' });
    return res.json(updated);
  });

  app.delete('/api/admin/categories/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.softDeleteCategory(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  app.post('/api/admin/categories/:id/restore', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.restoreCategory(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  // Skills CRUD
  app.get('/api/admin/skills', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getSkills(req.targetPortfolioId!));
  });

  app.post('/api/admin/skills', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const skill = db.saveSkill(req.targetPortfolioId!, req.body);
    return res.json(skill);
  });

  app.delete('/api/admin/skills/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.deleteSkill(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  // Experiences CRUD
  app.get('/api/admin/experiences', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getExperiences(req.targetPortfolioId!));
  });

  app.post('/api/admin/experiences', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const exp = db.saveExperience(req.targetPortfolioId!, req.body);
    return res.json(exp);
  });

  app.delete('/api/admin/experiences/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.deleteExperience(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  // Services CRUD
  app.get('/api/admin/services', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getServices(req.targetPortfolioId!));
  });

  app.post('/api/admin/services', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const srv = db.saveService(req.targetPortfolioId!, req.body);
    return res.json(srv);
  });

  app.delete('/api/admin/services/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.deleteService(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  // Testimonials CRUD
  app.get('/api/admin/testimonials', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getTestimonials(req.targetPortfolioId!));
  });

  app.post('/api/admin/testimonials', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const test = db.saveTestimonial(req.targetPortfolioId!, req.body);
    return res.json(test);
  });

  app.delete('/api/admin/testimonials/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.softDeleteTestimonial(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  app.post('/api/admin/testimonials/:id/restore', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.restoreTestimonial(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  // Social Links CRUD
  app.get('/api/admin/social-links', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getSocialLinks(req.targetPortfolioId!));
  });

  app.post('/api/admin/social-links', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const link = db.saveSocialLink(req.targetPortfolioId!, req.body);
    return res.json(link);
  });

  app.delete('/api/admin/social-links/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.deleteSocialLink(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  // Messages
  app.get('/api/admin/messages', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getMessages(req.targetPortfolioId!));
  });

  app.put('/api/admin/messages/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body;
    const success = db.updateMessageStatus(req.params.id, req.targetPortfolioId!, status);
    return res.json({ success });
  });

  app.delete('/api/admin/messages/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.deleteMessage(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  // Notifications
  app.get('/api/admin/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getNotifications(req.targetPortfolioId!));
  });

  app.put('/api/admin/notifications/:id/read', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const success = db.markNotificationAsRead(req.params.id, req.targetPortfolioId!);
    return res.json({ success });
  });

  app.post('/api/admin/notifications/read-all', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    db.markAllNotificationsAsRead(req.targetPortfolioId!);
    return res.json({ success: true });
  });

  // Site Settings & Portfolio Status
  app.get('/api/admin/settings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getSiteSettings(req.targetPortfolioId!));
  });

  app.put('/api/admin/settings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const settings = db.updateSiteSettings(req.targetPortfolioId!, req.body, req.user?.email);
    return res.json(settings);
  });

  app.post('/api/admin/portfolio/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const { status } = req.body;
    if (!['DRAFT', 'PUBLISHED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be DRAFT or PUBLISHED.' });
    }
    const updated = db.updatePortfolioStatus(req.targetPortfolioId!, status, req.user?.email);
    return res.json(updated);
  });

  // Image Upload Endpoint with Strict Validation
  app.post('/api/admin/upload', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { dataUrl, filename } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ error: 'Missing image data.' });
      }

      // Check MIME type
      const match = dataUrl.match(/^data:(image\/(png|jpeg|webp|avif|gif));base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Invalid file format. Only JPEG, PNG, WebP, AVIF, and GIF are permitted.' });
      }

      const mimeType = match[1];
      const base64Data = match[3];
      const buffer = Buffer.from(base64Data, 'base64');

      // Check size limit: max 8MB
      if (buffer.length > 8 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image exceeds maximum permitted size of 8MB.' });
      }

      const extMap: Record<string, string> = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/webp': '.webp',
        'image/avif': '.avif',
        'image/gif': '.gif',
      };
      const ext = extMap[mimeType] || '.jpg';
      const cleanName = (filename || 'upload').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
      const uniqueFilename = `${Date.now()}_${cleanName}_${crypto.randomBytes(4).toString('hex')}${ext}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${uniqueFilename}`;

      db.logAudit({
        user_email: req.user?.email,
        portfolio_id: req.targetPortfolioId,
        action: 'IMAGE_UPLOADED',
        entity_type: 'IMAGE',
        details: { filename: uniqueFilename, size: buffer.length },
      });

      return res.json({ url: publicUrl, filename: uniqueFilename });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to upload image.' });
    }
  });

  // ==========================================
  // 4. SUPER ADMIN CLIENTS & AUDIT LOG APIS
  // ==========================================

  app.get('/api/admin/clients', authMiddleware, superAdminOnly, (_req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getClients(true));
  });

  app.post('/api/admin/clients', authMiddleware, superAdminOnly, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, email, slug, portfolioName } = req.body;
      if (!name || !email || !slug) {
        return res.status(400).json({ error: 'Client name, email, and portfolio slug are required.' });
      }

      const existingSlug = db.getPortfolioBySlug(slug, true);
      if (existingSlug) {
        return res.status(400).json({ error: 'Portfolio slug is already in use.' });
      }

      const result = db.createClientWithPortfolio({
        clientName: name,
        email,
        portfolioSlug: slug,
        portfolioName,
        adminEmail: req.user?.email,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create client.' });
    }
  });

  app.delete('/api/admin/clients/:id', authMiddleware, superAdminOnly, (req: AuthenticatedRequest, res: Response) => {
    const success = db.softDeleteClient(req.params.id, req.user?.email);
    return res.json({ success });
  });

  app.post('/api/admin/clients/:id/restore', authMiddleware, superAdminOnly, (req: AuthenticatedRequest, res: Response) => {
    const success = db.restoreClient(req.params.id, req.user?.email);
    return res.json({ success });
  });

  app.get('/api/admin/audit-logs', authMiddleware, superAdminOnly, (req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getAuditLogs());
  });

  app.get('/api/admin/platform-settings', authMiddleware, superAdminOnly, (_req: AuthenticatedRequest, res: Response) => {
    return res.json(db.getPlatformSettings());
  });

  app.put('/api/admin/platform-settings', authMiddleware, superAdminOnly, (req: AuthenticatedRequest, res: Response) => {
    const updated = db.updatePlatformSettings(req.body, req.user?.email);
    return res.json(updated);
  });

  // ==========================================
  // 5. VITE & STATIC PRODUCTION SERVING
  // ==========================================

  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(process.cwd(), 'dist');

  if (!isProduction && fs.existsSync(path.join(process.cwd(), 'vite.config.ts'))) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ultimate Tomato Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup failure:', err);
});
